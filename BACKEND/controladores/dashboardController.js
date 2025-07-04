const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const ResponseHandler = require('./utils/responseHandler');
const { Actividad, Usuario, Notificacion } = require('../modelos');

/**
 * Obtiene las métricas del dashboard con datos reales de la base de datos
 * Ahora con soporte para filtrado por ciclo académico
 */
const obtenerMetricas = async (req, res) => {
  console.log('=== INICIO DE OBTENCIÓN DE MÉTRICAS ===');
  
  try {
    // Obtener ciclo desde parámetros de consulta
    const cicloId = req.query.ciclo || req.query.cicloId;
    console.log('📅 Ciclo solicitado:', cicloId);
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Obtener modelos después de verificar la conexión
    const { Usuario, UsuarioRol, Portafolio, DocenteAsignatura, CicloAcademico, Carrera, Asignatura } = require('../modelos');
    
    // Obtener información del ciclo académico
    let cicloInfo = null;
    if (cicloId) {
      try {
        cicloInfo = await CicloAcademico.findByPk(cicloId);
        console.log('📅 Información del ciclo:', cicloInfo?.nombre || 'No encontrado');
      } catch (error) {
        console.warn('⚠️ Error obteniendo información del ciclo:', error.message);
      }
    }
    
    // Obtener total de usuarios
    const totalUsuarios = await Usuario.count();
    
    // Obtener usuarios activos
    const usuariosActivos = await Usuario.count({
      where: { activo: true }
    });
    
    // Obtener distribución de roles
    let distribucionRoles = { docentes: 0, verificadores: 0, administradores: 0 };
    
    try {
      const roles = await UsuarioRol.findAll({
        attributes: [
          'rol',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        where: { activo: true },
        group: ['rol'],
        raw: true
      });
      
      // Convertir el array de roles a un objeto con los totales por rol
      distribucionRoles = roles.reduce((acc, { rol, total }) => {
        const clave = rol.endsWith('s') ? rol : `${rol}s`; // Asegurar plural
        return { ...acc, [clave]: parseInt(total) };
      }, { ...distribucionRoles });
    } catch (error) {
      console.error('Error al obtener distribución de roles:', error);
    }
    
    // Obtener métricas de carreras
    let carrerasMetricas = { total: 0, activas: 0 };
    try {
      const totalCarreras = await Carrera.count({
        where: { activo: true }
      });
      
      carrerasMetricas = {
        total: totalCarreras,
        activas: totalCarreras
      };
      
      console.log('📊 Métricas de carreras:', carrerasMetricas);
    } catch (error) {
      console.error('Error al obtener métricas de carreras:', error);
    }
    
    // Obtener métricas de asignaturas (filtradas por ciclo si se especifica)
    let asignaturasMetricas = { total: 0, activas: 0 };
    if (cicloId) {
      try {
        // Contar asignaturas que tienen asignaciones en el ciclo específico
        const asignaturasEnCiclo = await Asignatura.count({
          include: [{
            model: DocenteAsignatura,
            as: 'asignaciones_docente',
            where: { 
              ciclo_id: cicloId,
              activo: true 
            },
            required: true
          }],
          where: { activo: true }
        });
        
        asignaturasMetricas = {
          total: asignaturasEnCiclo,
          activas: asignaturasEnCiclo
        };
        
        console.log('📊 Métricas de asignaturas por ciclo:', asignaturasMetricas);
      } catch (error) {
        console.error('Error al obtener métricas de asignaturas:', error);
        // Fallback: contar todas las asignaturas activas
        try {
          const totalAsignaturas = await Asignatura.count({ where: { activo: true } });
          asignaturasMetricas = { total: totalAsignaturas, activas: totalAsignaturas };
        } catch (fallbackError) {
          console.error('Error en fallback de asignaturas:', fallbackError);
        }
      }
    } else {
      // Si no hay ciclo específico, contar todas las asignaturas
      try {
        const totalAsignaturas = await Asignatura.count({ where: { activo: true } });
        asignaturasMetricas = { total: totalAsignaturas, activas: totalAsignaturas };
      } catch (error) {
        console.error('Error al obtener total de asignaturas:', error);
      }
    }
    
    // Obtener métricas de portafolios (filtradas por ciclo si se especifica)
    let portafoliosMetricas = { total: 0, activos: 0, completados: 0, progresoPromedio: 0 };
    if (cicloId) {
      try {
        const totalPortafoliosCiclo = await Portafolio.count({
          where: { 
            ciclo_id: cicloId,
            activo: true 
          }
        });
        
        const portafoliosActivos = await Portafolio.count({
          where: { 
            ciclo_id: cicloId,
            activo: true,
            estado: 'activo'
          }
        });
        
        const portafoliosCompletados = await Portafolio.count({
          where: { 
            ciclo_id: cicloId,
            activo: true,
            estado: 'completado'
          }
        });
        
        // Calcular progreso promedio
        const portafoliosConProgreso = await Portafolio.findAll({
          where: { 
            ciclo_id: cicloId,
            activo: true 
          },
          attributes: ['progreso'],
          raw: true
        });
        
        const progresoPromedio = portafoliosConProgreso.length > 0 
          ? Math.round(portafoliosConProgreso.reduce((sum, p) => sum + (p.progreso || 0), 0) / portafoliosConProgreso.length)
          : 0;
        
        portafoliosMetricas = {
          total: totalPortafoliosCiclo,
          activos: portafoliosActivos,
          completados: portafoliosCompletados,
          progresoPromedio
        };
        
        console.log('📊 Métricas de portafolios por ciclo:', portafoliosMetricas);
      } catch (error) {
        console.error('Error al obtener métricas de portafolios:', error);
      }
    }
    
    // Obtener métricas de asignaciones (filtradas por ciclo si se especifica)
    let asignacionesMetricas = { total: 0, activas: 0 };
    if (cicloId) {
      try {
        const totalAsignaciones = await DocenteAsignatura.count({
          where: { 
            ciclo_id: cicloId,
            activo: true 
          }
        });
        
        asignacionesMetricas = {
          total: totalAsignaciones,
          activas: totalAsignaciones
        };
        
        console.log('📊 Métricas de asignaciones por ciclo:', asignacionesMetricas);
      } catch (error) {
        console.error('Error al obtener métricas de asignaciones:', error);
      }
    }
    
    // Estructura de respuesta
    const metricas = {
      sistema: {
        estado: 'activo',
        version: '1.0.0',
        modo: 'produccion',
        mensaje: cicloId ? `Datos del ciclo: ${cicloInfo?.nombre || 'Desconocido'}` : 'Datos generales del sistema'
      },
      ciclo: cicloInfo ? {
        id: cicloInfo.id,
        nombre: cicloInfo.nombre,
        estado: cicloInfo.estado,
        fechaInicio: cicloInfo.fecha_inicio,
        fechaFin: cicloInfo.fecha_fin
      } : null,
      usuarios: {
        total: totalUsuarios,
        activos: usuariosActivos,
        pendientes: totalUsuarios - usuariosActivos
      },
      roles: distribucionRoles,
      carreras: carrerasMetricas,
      asignaturas: asignaturasMetricas,
      portafolios: portafoliosMetricas,
      asignaciones: asignacionesMetricas,
      documentos: {
        // Estos valores se actualizarán cuando se implemente el módulo de documentos
        total: 0,
        aprobados: 0,
        pendientes: 0,
        observados: 0
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Métricas generadas exitosamente');
    
    // Devolver respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Métricas obtenidas correctamente',
      data: metricas
    });
    
  } catch (error) {
    console.error('❌ Error al obtener métricas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener métricas del dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene las actividades recientes del sistema
 */
const obtenerActividades = async (req, res) => {
  try {
    console.log('📊 Obteniendo actividades del sistema...');
    
    // Obtener actividades con información de usuario usando las asociaciones
    const actividades = await Actividad.findAll({
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombres', 'apellidos'],
        required: false
      }],
      order: [['fecha_creacion', 'DESC']],
      limit: 10
    });

    console.log(`📋 ${actividades.length} actividades encontradas`);

    const actividadesFormateadas = actividades.map(actividad => ({
      id: actividad.id,
      tipo: actividad.tipo,
      titulo: actividad.modulo, // Usar módulo como título
      descripcion: actividad.descripcion,
      fecha: actividad.fecha_creacion,
      icono: obtenerIconoActividad(actividad.tipo),
      usuario: actividad.usuario ? `${actividad.usuario.nombres} ${actividad.usuario.apellidos}` : null
    }));

    return res.status(200).json({
      success: true,
      message: 'Actividades obtenidas correctamente',
      data: actividadesFormateadas
    });
    
  } catch (error) {
    console.error('❌ Error al obtener actividades:', error);
    // Retornar array vacío en lugar de error 500
    return res.status(200).json({
      success: true,
      message: 'No hay actividades disponibles',
      data: []
    });
  }
};

// Función auxiliar para obtener iconos según el tipo de actividad
const obtenerIconoActividad = (tipo) => {
  const iconos = {
    'login': 'fas fa-sign-in-alt',
    'logout': 'fas fa-sign-out-alt',
    'creacion': 'fas fa-plus-circle',
    'actualizacion': 'fas fa-edit',
    'eliminacion': 'fas fa-trash-alt',
    'carga_masiva': 'fas fa-upload',
    'descarga': 'fas fa-download',
    'cambio_estado': 'fas fa-exchange-alt',
    'error': 'fas fa-exclamation-triangle'
  };
  return iconos[tipo] || 'fas fa-info-circle';
};

/**
 * Obtiene las notificaciones del sistema
 */
const obtenerNotificaciones = async (req, res) => {
  try {
    // Obtener notificaciones reales de la base de datos
    const { Notificacion } = require('../modelos');
    
    const notificaciones = await Notificacion.findAll({
      where: { 
        usuario_id: req.usuario.id,
        leida: false 
      },
      order: [['fecha_creacion', 'DESC']],
      limit: 10
    });

    const notificacionesFormateadas = notificaciones.map(notif => ({
      id: notif.id,
      tipo: notif.tipo,
      titulo: notif.titulo,
      mensaje: notif.mensaje,
      fecha: notif.fecha_creacion,
      leida: notif.leida
    }));

    return res.status(200).json({
      success: true,
      message: 'Notificaciones obtenidas correctamente',
      data: notificacionesFormateadas
    });
    
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene el ciclo académico actual
 */
const obtenerCicloActual = async (req, res) => {
  try {
    // Obtener el ciclo activo real de la base de datos
    const { CicloAcademico, EstadoSistema } = require('../modelos');
    
    const cicloActivo = await CicloAcademico.findOne({
      where: { estado: 'activo' },
      include: [{
        model: EstadoSistema,
        as: 'estados_sistema'
      }]
    });

    if (!cicloActivo) {
      return res.status(404).json({
        success: false,
        message: 'No hay ningún ciclo académico activo en el sistema',
        data: null
      });
    }

    // Calcular progreso basado en estados de módulos
    const estadosModulos = cicloActivo.estados_sistema || [];
    const modulosHabilitados = estadosModulos.filter(e => e.habilitado).length;
    const totalModulos = estadosModulos.length;
    const progreso = totalModulos > 0 ? Math.round((modulosHabilitados / totalModulos) * 100) : 0;

    const cicloActual = {
      id: cicloActivo.id,
      nombre: cicloActivo.nombre,
      descripcion: cicloActivo.descripcion,
      fechaInicio: cicloActivo.fecha_inicio,
      fechaFin: cicloActivo.fecha_fin,
      estado: cicloActivo.estado,
      progreso: progreso,
      semestre: cicloActivo.semestre_actual,
      anio: cicloActivo.anio_actual,
      estadosModulos: estadosModulos.reduce((acc, estado) => {
        acc[estado.modulo] = estado.habilitado;
        return acc;
      }, {})
    };

    return res.status(200).json({
      success: true,
      message: 'Ciclo actual obtenido correctamente',
      data: cicloActual
    });
    
  } catch (error) {
    console.error('Error al obtener ciclo actual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener ciclo académico actual',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene estadísticas generales del sistema
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    console.log('=== OBTENIENDO ESTADÍSTICAS DEL SISTEMA ===');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos verificada');
    
    // Obtener modelos
    const { 
      Usuario, 
      UsuarioRol, 
      Asignatura, 
      DocenteAsignatura, 
      VerificadorDocente, 
      Portafolio,
      Carrera, 
      CicloAcademico,
      ArchivoSubido,
      Observacion
    } = require('../modelos');
    
    // Obtener ciclo académico activo
    const cicloActivo = await CicloAcademico.findOne({
      where: { estado: 'activo' }
    });

    // Filtros por ciclo activo
    const filtrosCiclo = cicloActivo ? { ciclo_id: cicloActivo.id } : {};
    
    // Obtener estadísticas de usuarios y roles
    const [
      totalUsuarios,
      usuariosActivos,
      distribucionRoles,
      totalCarreras,
      totalAsignaturas,
      totalAsignaciones,
      totalVerificaciones,
      totalPortafolios,
      portafoliosActivos,
      portafoliosCompletados,
      portafoliosEnVerificacion,
      totalDocumentos,
      documentosAprobados,
      documentosPendientes,
      documentosObservados
    ] = await Promise.all([
      Usuario.count(),
      Usuario.count({ where: { activo: true } }),
      UsuarioRol.findAll({
        attributes: [
          'rol',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        where: { activo: true },
        group: ['rol'],
        raw: true
      }),
      Carrera.count(),
      Asignatura.count(cicloActivo ? { where: filtrosCiclo } : {}),
      DocenteAsignatura.count(cicloActivo ? { where: filtrosCiclo } : {}),
      VerificadorDocente.count(),
      Portafolio.count(cicloActivo ? { where: filtrosCiclo } : {}),
      Portafolio.count(cicloActivo ? { 
        where: { ...filtrosCiclo, estado: 'activo' } 
      } : { where: { estado: 'activo' } }),
      Portafolio.count(cicloActivo ? { 
        where: { ...filtrosCiclo, estado: 'completado' } 
      } : { where: { estado: 'completado' } }),
      Portafolio.count(cicloActivo ? { 
        where: { ...filtrosCiclo, estado: 'en_verificacion' } 
      } : { where: { estado: 'en_verificacion' } }),
      ArchivoSubido.count(),
      ArchivoSubido.count({ where: { estado: 'aprobado' } }),
      ArchivoSubido.count({ where: { estado: 'pendiente' } }),
      Observacion.count()
    ]);

    // Procesar distribución de roles
    const roles = distribucionRoles.reduce((acc, { rol, total }) => {
      acc[rol.toLowerCase() + 's'] = parseInt(total);
      return acc;
    }, { docentes: 0, verificadores: 0, administradores: 0 });

    // Estructura de respuesta completa
    const estadisticas = {
      sistema: {
        estado: 'activo',
        version: '1.0.0',
        modo: process.env.NODE_ENV || 'development'
      },
      cicloActivo: cicloActivo ? {
        id: cicloActivo.id,
        nombre: cicloActivo.nombre,
        estado: cicloActivo.estado,
        fechaInicio: cicloActivo.fecha_inicio,
        fechaFin: cicloActivo.fecha_fin
      } : null,
      usuarios: totalUsuarios,
      usuariosActivos,
      roles,
      carreras: totalCarreras,
      asignaturas: totalAsignaturas,
      asignaciones: totalAsignaciones,
      verificaciones: totalVerificaciones,
      portafolios: totalPortafolios,
      portafoliosActivos,
      portafoliosCompletados,
      portafoliosEnVerificacion,
      documentos: {
        total: totalDocumentos,
        aprobados: documentosAprobados,
        pendientes: documentosPendientes,
        observados: documentosObservados
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Estadísticas calculadas:', estadisticas);
    return res.status(200).json(estadisticas);
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del sistema',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene asignaciones docente-asignatura
 */
const obtenerAsignaciones = async (req, res) => {
  try {
    console.log('=== OBTENIENDO ASIGNACIONES DOCENTE-ASIGNATURA ===');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    
    // Obtener modelos
    const { DocenteAsignatura, Usuario, Asignatura, Carrera } = require('../modelos');
    
    let asignaciones = [];
    
    if (DocenteAsignatura) {
      asignaciones = await DocenteAsignatura.findAll({
        include: [
          {
            model: Usuario,
            as: 'docente',
            attributes: ['id', 'nombres', 'apellidos', 'correo']
          },
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'codigo', 'nombre', 'creditos'],
            include: Carrera ? [{
              model: Carrera,
              as: 'carrera',
              attributes: ['id', 'nombre', 'codigo']
            }] : []
          }
        ]
      });
    }

    console.log(`✅ ${asignaciones.length} asignaciones encontradas`);

    return res.status(200).json({
      success: true,
      message: 'Asignaciones obtenidas correctamente',
      data: asignaciones
    });
    
  } catch (error) {
    console.error('❌ Error al obtener asignaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener asignaciones docente-asignatura',
      data: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene verificaciones asignadas
 */
const obtenerVerificaciones = async (req, res) => {
  try {
    console.log('=== OBTENIENDO VERIFICACIONES ===');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    
    // Obtener modelos
    const { VerificadorDocente, Usuario } = require('../modelos');
    
    let verificaciones = [];
    
    if (VerificadorDocente) {
      verificaciones = await VerificadorDocente.findAll({
        include: [
          {
            model: Usuario,
            as: 'verificador',
            attributes: ['id', 'nombres', 'apellidos', 'correo']
          },
          {
            model: Usuario,
            as: 'docente',
            attributes: ['id', 'nombres', 'apellidos', 'correo']
          }
        ]
      });
    }

    console.log(`✅ ${verificaciones.length} verificaciones encontradas`);

    return res.status(200).json({
      success: true,
      message: 'Verificaciones obtenidas correctamente',
      data: verificaciones
    });
    
  } catch (error) {
    console.error('❌ Error al obtener verificaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener verificaciones',
      data: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene portafolios del sistema
 */
const obtenerPortafolios = async (req, res) => {
  try {
    console.log('=== OBTENIENDO PORTAFOLIOS ===');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    
    // Obtener modelos
    const { Portafolio, Usuario, Asignatura, CicloAcademico } = require('../modelos');
    
    let portafolios = [];
    
    if (Portafolio) {
      portafolios = await Portafolio.findAll({
        include: [
          {
            model: Usuario,
            as: 'docente',
            attributes: ['id', 'nombres', 'apellidos', 'correo']
          },
          {
            model: Asignatura,
            as: 'asignatura',
            attributes: ['id', 'codigo', 'nombre']
          },
          CicloAcademico ? {
            model: CicloAcademico,
            as: 'ciclo',
            attributes: ['id', 'nombre', 'estado']
          } : null
        ].filter(Boolean)
      });
    }

    console.log(`✅ ${portafolios.length} portafolios encontrados`);

    return res.status(200).json({
      success: true,
      message: 'Portafolios obtenidos correctamente',
      data: portafolios
    });
    
  } catch (error) {
    console.error('❌ Error al obtener portafolios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener portafolios',
      data: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  obtenerMetricas,
  obtenerActividades,
  obtenerNotificaciones,
  obtenerCicloActual,
  obtenerEstadisticas,
  obtenerAsignaciones,
  obtenerVerificaciones,
  obtenerPortafolios
};
