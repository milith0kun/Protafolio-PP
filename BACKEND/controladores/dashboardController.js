const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const ResponseHandler = require('./utils/responseHandler');

/**
 * Obtiene las métricas del dashboard con datos reales de la base de datos
 */
const obtenerMetricas = async (req, res) => {
  console.log('=== INICIO DE OBTENCIÓN DE MÉTRICAS ===');
  
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Obtener modelos después de verificar la conexión
    const { Usuario, UsuarioRol } = require('../modelos');
    
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
    
    // Estructura de respuesta
    const metricas = {
      sistema: {
        estado: 'activo',
        version: '1.0.0',
        modo: 'produccion',
        mensaje: 'Datos en tiempo real desde la base de datos'
      },
      usuarios: {
        total: totalUsuarios,
        activos: usuariosActivos,
        pendientes: totalUsuarios - usuariosActivos
      },
      roles: distribucionRoles,
      documentos: {
        // Estos valores se actualizarán cuando se implemente el módulo de documentos
        total: 0,
        aprobados: 0,
        pendientes: 0,
        observados: 0
      },
      // No incluimos cicloActual ya que el modelo no está disponible
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
    // Por ahora devolvemos datos de ejemplo
    const actividades = [
      {
        id: 1,
        tipo: 'usuario',
        titulo: 'Nuevo usuario registrado',
        descripcion: 'Juan Pérez (Docente) se ha registrado en el sistema',
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
        icono: 'fas fa-user-plus'
      },
      {
        id: 2,
        tipo: 'documento',
        titulo: 'Documentos subidos',
        descripcion: '15 nuevos documentos subidos en las últimas 24 horas',
        fecha: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Hace 5 horas
        icono: 'fas fa-file-upload'
      },
      {
        id: 3,
        tipo: 'sistema',
        titulo: 'Configuración actualizada',
        descripcion: 'Se actualizaron los plazos de entrega para el ciclo 2025-I',
        fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
        icono: 'fas fa-cog'
      }
    ];

    return res.status(200).json({
      success: true,
      message: 'Actividades obtenidas correctamente',
      data: actividades
    });
    
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener actividades recientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene las notificaciones del sistema
 */
const obtenerNotificaciones = async (req, res) => {
  try {
    // Por ahora devolvemos datos de ejemplo
    const notificaciones = [
      {
        id: 1,
        tipo: 'info',
        titulo: 'Sistema actualizado',
        mensaje: 'El sistema ha sido actualizado a la versión 1.0.0',
        fecha: new Date().toISOString(),
        leida: false
      },
      {
        id: 2,
        tipo: 'advertencia',
        titulo: 'Mantenimiento programado',
        mensaje: 'Se realizará mantenimiento el próximo domingo de 2:00 AM a 4:00 AM',
        fecha: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        leida: false
      }
    ];

    return res.status(200).json({
      success: true,
      message: 'Notificaciones obtenidas correctamente',
      data: notificaciones
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
