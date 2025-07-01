/**
 * Controlador de Portafolios
 * Maneja todas las operaciones relacionadas con portafolios docentes
 */

const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const ResponseHandler = require('./utils/responseHandler');

/**
 * Obtener todos los portafolios (administrador)
 * Ahora con soporte para filtrado por ciclo académico
 */
const obtenerPortafolios = async (req, res) => {
  try {
    console.log('=== OBTENIENDO TODOS LOS PORTAFOLIOS ===');
    
    // Obtener parámetros de filtrado
    const cicloId = req.query.ciclo || req.query.cicloId;
    const estado = req.query.estado;
    const docenteId = req.query.docente || req.query.docenteId;
    
    console.log('🔍 Filtros aplicados:', { cicloId, estado, docenteId });
    
    await sequelize.authenticate();
    
    const { Portafolio, Usuario, Asignatura, CicloAcademico, DocenteAsignatura } = require('../modelos');
    
    // Construir condiciones WHERE dinámicamente
    const whereConditions = { activo: true };
    
    if (cicloId) {
      whereConditions.ciclo_id = cicloId;
    }
    
    if (estado) {
      whereConditions.estado = estado;
    }
    
    if (docenteId) {
      whereConditions.docente_id = docenteId;
    }
    
    const portafolios = await Portafolio.findAll({
      include: [
        {
          model: Usuario,
          as: 'docente',
          attributes: ['id', 'nombres', 'apellidos', 'correo']
        },
        {
          model: Asignatura,
          as: 'asignatura',
          attributes: ['id', 'codigo', 'nombre', 'carrera']
        },
        {
          model: CicloAcademico,
          as: 'ciclo',
          attributes: ['id', 'nombre', 'estado', 'fecha_inicio', 'fecha_fin']
        }
      ],
      where: whereConditions,
      order: [['actualizado_en', 'DESC']]
    });

    console.log(`✅ ${portafolios.length} portafolios encontrados con filtros aplicados`);

    // Agregar información adicional en la respuesta
    const responseData = {
      portafolios,
      filtros: {
        cicloId,
        estado,
        docenteId,
        totalEncontrados: portafolios.length
      },
      resumen: {
        porEstado: {},
        porCiclo: {}
      }
    };

    // Calcular resumen por estado
    portafolios.forEach(p => {
      const estadoPortafolio = p.estado || 'sin_estado';
      responseData.resumen.porEstado[estadoPortafolio] = (responseData.resumen.porEstado[estadoPortafolio] || 0) + 1;
    });

    // Calcular resumen por ciclo
    portafolios.forEach(p => {
      const cicloNombre = p.ciclo?.nombre || 'Sin ciclo';
      responseData.resumen.porCiclo[cicloNombre] = (responseData.resumen.porCiclo[cicloNombre] || 0) + 1;
    });

    return ResponseHandler.success(res, responseData, `${portafolios.length} portafolios obtenidos correctamente`);
    
  } catch (error) {
    console.error('❌ Error al obtener portafolios:', error);
    return ResponseHandler.error(res, error.message, 500);
  }
};

/**
 * Obtener portafolios de un docente específico
 */
const obtenerMisPortafolios = async (req, res) => {
  try {
    console.log('=== OBTENIENDO PORTAFOLIOS DEL DOCENTE ===');
    
    const usuarioId = req.usuario.id;
    
    await sequelize.authenticate();
    
    const { Portafolio, Usuario, Asignatura, CicloAcademico, DocenteAsignatura, Semestre } = require('../modelos');
    
    const portafolios = await Portafolio.findAll({
      include: [
        {
          model: Usuario,
          as: 'docente',
          attributes: ['id', 'nombres', 'apellidos', 'correo']
        },
        {
          model: Asignatura,
          as: 'asignatura',
          attributes: ['id', 'codigo', 'nombre', 'carrera']
        },
        {
          model: CicloAcademico,
          as: 'ciclo',
          attributes: ['id', 'nombre', 'estado']
        },
        {
          model: Semestre,
          as: 'semestre',
          attributes: ['id', 'nombre']
        }
      ],
      where: { 
        docente_id: usuarioId,
        activo: true 
      },
      order: [['actualizado_en', 'DESC']]
    });

    console.log(`✅ ${portafolios.length} portafolios encontrados para el docente ${usuarioId}`);

    return ResponseHandler.success(res, portafolios, 'Portafolios del docente obtenidos correctamente');
    
  } catch (error) {
    console.error('❌ Error al obtener portafolios del docente:', error);
    return ResponseHandler.error(res, error.message, 500);
  }
};

/**
 * Generar portafolios automáticamente para asignaciones docente-asignatura
 * Esta función se ejecuta desde el panel de administrador y utiliza
 * la lógica del controlador de carga académica
 */
const generarPortafoliosAutomaticos = async (req, res) => {
  try {
    console.log('=== GENERANDO PORTAFOLIOS AUTOMÁTICAMENTE ===');
    
    await sequelize.authenticate();
    
    const { 
      DocenteAsignatura, 
      Portafolio, 
      Usuario, 
      Asignatura, 
      CicloAcademico,
      EstadoSistema
    } = require('../modelos');

    // Obtener ciclo académico activo
    const cicloActivo = await CicloAcademico.findOne({
      where: { estado: 'activo' }
    });

    if (!cicloActivo) {
      return ResponseHandler.error(res, 'No hay ciclo académico activo', 400);
    }

    console.log(`📅 Ciclo académico activo: ${cicloActivo.nombre}`);

    // Obtener asignaciones que no tienen portafolio
    const asignacionesSinPortafolio = await DocenteAsignatura.findAll({
      where: { 
        ciclo_id: cicloActivo.id,
        activo: true 
      },
      include: [
        {
          model: Usuario,
          as: 'docente',
          attributes: ['id', 'nombres', 'apellidos']
        },
        {
          model: Asignatura,
          as: 'asignatura',
          attributes: ['id', 'codigo', 'nombre']
        },
        {
          model: Portafolio,
          as: 'portafolios',
          required: false,
          where: { nivel: 0 }
        }
      ]
    });

    // Filtrar solo las que realmente no tienen portafolio
    const sinPortafolio = asignacionesSinPortafolio.filter(asignacion => 
      !asignacion.portafolios || asignacion.portafolios.length === 0
    );

    console.log(`📚 ${sinPortafolio.length} asignaciones sin portafolio encontradas`);

    if (sinPortafolio.length === 0) {
      return ResponseHandler.success(res, {
        portafoliosCreados: 0,
        errores: 0,
        mensaje: 'Todos los portafolios ya han sido generados'
      }, 'No hay nuevos portafolios para generar');
    }

    // Inicializar contadores
    let portafoliosCreados = 0;
    let errores = 0;
    const detallesErrores = [];

    // Crear estructura base si no existe
    await crearEstructuraBase();

    // Usar transacción para todas las operaciones
    const transaction = await sequelize.transaction();

    try {
      // Usar la lógica local para crear portafolios
      const generarPortafolioFunc = async (asignacion, asignatura, cicloId, userId, transaction) => {
        const resultado = await crearPortafolioParaAsignacion(asignacion, asignatura, cicloId, userId, transaction);
        return { creado: resultado.creado };
      };

      // Generar portafolios para cada asignación
      for (const asignacion of sinPortafolio) {
        try {
          const resultado = await generarPortafolioFunc(
            asignacion,
            asignacion.asignatura,
            cicloActivo.id,
            req.usuario ? req.usuario.id : 1,
            transaction
          );

          if (resultado.creado) {
            portafoliosCreados++;
            console.log(`✅ Portafolio generado para ${asignacion.asignatura.nombre} - ${asignacion.docente.nombres} ${asignacion.docente.apellidos}`);
          }
        } catch (error) {
          errores++;
          detallesErrores.push({
            asignacion: asignacion.id,
            docente: `${asignacion.docente.nombres} ${asignacion.docente.apellidos}`,
            asignatura: asignacion.asignatura.nombre,
            error: error.message
          });
          console.error(`❌ Error al crear portafolio para asignación ${asignacion.id}:`, error.message);
        }
      }

      // Si se crearon portafolios, actualizar estado del sistema
      if (portafoliosCreados > 0) {
        await actualizarEstadoSistemaTrasGeneracion(cicloActivo.id, req.usuario ? req.usuario.id : 1, transaction);
      }

      await transaction.commit();

      console.log(`🎉 Generación completada:`);
      console.log(`  - Portafolios creados: ${portafoliosCreados}`);
      console.log(`  - Errores: ${errores}`);

      return ResponseHandler.success(res, {
        portafoliosCreados,
        errores,
        totalAsignaciones: sinPortafolio.length,
        detallesErrores: detallesErrores.length > 0 ? detallesErrores : undefined
      }, 'Portafolios generados correctamente');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error en generación automática de portafolios:', error);
    return ResponseHandler.error(res, error.message, 500);
  }
};

/**
 * Actualiza el estado del sistema tras la generación de portafolios
 */
async function actualizarEstadoSistemaTrasGeneracion(cicloId, userId, transaction) {
  const { EstadoSistema } = require('../modelos');
  
  try {
    // Habilitar módulo de gestión de documentos si no está habilitado
    await EstadoSistema.upsert({
      ciclo_id: cicloId,
      modulo: 'gestion_documentos',
      habilitado: true,
      fecha_habilitacion: new Date(),
      observaciones: 'Módulo habilitado tras generación manual de portafolios.',
      actualizado_por: userId,
      actualizado_en: new Date()
    }, { transaction });

    // Habilitar módulo de verificación si no está habilitado
    await EstadoSistema.upsert({
      ciclo_id: cicloId,
      modulo: 'verificacion',
      habilitado: true,
      fecha_habilitacion: new Date(),
      observaciones: 'Módulo habilitado para verificación de portafolios.',
      actualizado_por: userId,
      actualizado_en: new Date()
    }, { transaction });

    console.log(`✅ Estado del sistema actualizado para ciclo ${cicloId}`);
  } catch (error) {
    console.error(`❌ Error al actualizar estado del sistema: ${error.message}`);
    throw error;
  }
}

/**
 * Crea un portafolio para una asignación específica usando la lógica local
 */
async function crearPortafolioParaAsignacion(asignacion, asignatura, cicloId, userId, transaction) {
  const { Portafolio, Semestre } = require('../modelos');
  
  try {
    console.log(`🔍 Procesando asignación ${asignacion.id}: docente ${asignacion.docente_id}, asignatura ${asignatura?.id || 'N/A'}`);
    
    // Validar datos necesarios
    if (!asignacion || !asignatura) {
      throw new Error('Datos de asignación o asignatura incompletos');
    }

    // Obtener o crear semestre por defecto
    let semestre = await Semestre.findOne({
      where: { nombre: 'I' },
      transaction
    });

    if (!semestre) {
      semestre = await Semestre.create({
        nombre: 'I',
        descripcion: 'Primer Semestre',
        activo: true
      }, { transaction });
      console.log(`✅ Semestre creado: ${semestre.nombre}`);
    }

    // Verificar si ya existe
    const existente = await Portafolio.findOne({
      where: {
        docente_id: asignacion.docente_id,
        asignatura_id: asignatura.id,
        ciclo_id: cicloId,
        nivel: 0
      },
      transaction
    });

    if (existente) {
      console.log(`⚠️ Portafolio ya existe para docente ${asignacion.docente_id}, asignatura ${asignatura.id}`);
      return { creado: false, portafolio: existente };
    }

    // Preparar datos del portafolio
    const grupo = asignacion.grupo || 'A';
    const nombrePortafolio = `${asignatura.nombre} - Grupo ${grupo}`;
    
    console.log(`📝 Creando portafolio: ${nombrePortafolio}`);

    const portafolioRaiz = await Portafolio.create({
      nombre: nombrePortafolio,
      docente_id: asignacion.docente_id,
      asignatura_id: asignatura.id,
      grupo: grupo,
      asignacion_id: asignacion.id,
      semestre_id: semestre.id,
      ciclo_id: cicloId,
      estructura_id: null,
      carpeta_padre_id: null,
      nivel: 0,
      ruta: `/${asignacion.docente_id}/${asignatura.codigo}`,
      estado: 'activo',
      activo: true,
      progreso_completado: 0.00,
      creado_por: userId,
      actualizado_por: userId
    }, { transaction });

    console.log(`✅ Portafolio creado con ID: ${portafolioRaiz.id}`);

    // Crear estructura de carpetas (temporalmente deshabilitada para debug)
    // await crearEstructuraPortafolio(portafolioRaiz.id, cicloId, semestre.id, transaction);
    console.log(`⚠️ Creación de estructura deshabilitada temporalmente para debug`);

    return { creado: true, portafolio: portafolioRaiz };
  } catch (error) {
    console.error(`❌ Error detallado al crear portafolio:`, {
      asignacionId: asignacion?.id,
      docenteId: asignacion?.docente_id,
      asignaturaId: asignatura?.id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Crear estructura base de portafolio si no existe
 */
async function crearEstructuraBase() {
  const { Estructura } = require('../modelos');
  
  const estructuraBase = [
    {
      nombre: 'I. DATOS GENERALES',
      descripcion: 'Información general del docente y la asignatura',
      nivel: 1,
      orden: 1,
      requiere_credito: 0,
      pertenece_presentacion: true,
      icono: 'fas fa-info-circle',
      color: '#007bff'
    },
    {
      nombre: 'II. PLANIFICACIÓN ACADÉMICA',
      descripcion: 'Documentos de planificación curricular',
      nivel: 1,
      orden: 2,
      requiere_credito: 1,
      pertenece_presentacion: false,
      icono: 'fas fa-calendar-alt',
      color: '#28a745'
    },
    {
      nombre: 'III. DESARROLLO DE SESIONES',
      descripcion: 'Materiales y evidencias de clases',
      nivel: 1,
      orden: 3,
      requiere_credito: 2,
      pertenece_presentacion: false,
      icono: 'fas fa-chalkboard-teacher',
      color: '#ffc107'
    },
    {
      nombre: 'IV. EVALUACIÓN',
      descripcion: 'Instrumentos y evidencias de evaluación',
      nivel: 1,
      orden: 4,
      requiere_credito: 2,
      pertenece_presentacion: false,
      icono: 'fas fa-clipboard-check',
      color: '#dc3545'
    },
    {
      nombre: 'V. INVESTIGACIÓN E INNOVACIÓN',
      descripcion: 'Proyectos y actividades de investigación',
      nivel: 1,
      orden: 5,
      requiere_credito: 1,
      pertenece_presentacion: false,
      icono: 'fas fa-search',
      color: '#6f42c1'
    }
  ];

  for (const estructura of estructuraBase) {
    const existente = await Estructura.findOne({
      where: { nombre: estructura.nombre, nivel: estructura.nivel }
    });

    if (!existente) {
      await Estructura.create(estructura);
      console.log(`📁 Estructura creada: ${estructura.nombre}`);
    }
  }
}

/**
 * Crear estructura jerárquica de portafolio según especificación UNSAAC
 */
async function crearEstructuraPortafolio(portafolioId, cicloId, semestreId, transaction = null) {
  try {
    console.log(`📁 Creando estructura jerárquica para portafolio ${portafolioId}`);
    
    const { Portafolio } = require('../modelos');
    
    // Estructura específica UNSAAC con niveles jerárquicos
    const estructuraUNSAAC = {
      // Nivel 0: Presentación del Portafolio (Global para todos los cursos)
      presentacion: {
        nombre: '0. PRESENTACIÓN DEL PORTAFOLIO',
        nivel: 1,
        subcarpetas: {
          '0.1': { nombre: '0.1 CARÁTULA', nivel: 2 },
          '0.2': { nombre: '0.2 CARGA ACADÉMICA', nivel: 2 },
          '0.3': { nombre: '0.3 FILOSOFÍA DOCENTE', nivel: 2 },
          '0.4': { nombre: '0.4 CURRÍCULUM VITAE', nivel: 2 }
        }
      },
      
      // Nivel 1: Secciones principales del curso
      silabos: {
        nombre: '1. SILABOS',
        nivel: 1,
        subcarpetas: {
          '1.1': { nombre: '1.1 SILABO UNSAAC', nivel: 2 },
          '1.2': { nombre: '1.2 SILABO ICACIT', nivel: 2 },
          '1.3': { nombre: '1.3 REGISTRO DE ENTREGA DE SILABO', nivel: 2 }
        }
      },
      
      avance_academico: {
        nombre: '2. AVANCE ACADÉMICO POR SESIONES',
        nivel: 1
      },
      
      material_ensenanza: {
        nombre: '3. MATERIAL DE ENSEÑANZA',
        nivel: 1,
        subcarpetas: {
          '3.1': { nombre: '3.1 PRIMERA UNIDAD', nivel: 2 },
          '3.2': { nombre: '3.2 SEGUNDA UNIDAD', nivel: 2 },
          '3.3': { nombre: '3.3 TERCERA UNIDAD', nivel: 2, condicional: true } // Solo para 4-5 créditos
        }
      },
      
      asignaciones: {
        nombre: '4. ASIGNACIONES',
        nivel: 1
      },
      
      examenes: {
        nombre: '5. ENUNCIADO DE EXÁMENES Y SOLUCIÓN',
        nivel: 1,
        subcarpetas: {
          '5.1': {
            nombre: '5.1 EXAMEN DE ENTRADA',
            nivel: 2,
            subcarpetas: {
              '5.1.1': { nombre: '5.1.1 ENUNCIADO DE EXAMEN Y RESOLUCIÓN', nivel: 3 },
              '5.1.2': { nombre: '5.1.2 ASISTENCIA AL EXAMEN', nivel: 3 },
              '5.1.3': { nombre: '5.1.3 INFORME DE RESULTADOS', nivel: 3 }
            }
          },
          '5.2': {
            nombre: '5.2 PRIMER EXAMEN',
            nivel: 2,
            subcarpetas: {
              '5.2.1': { nombre: '5.2.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', nivel: 3 },
              '5.2.2': { nombre: '5.2.2 ASISTENCIA AL EXAMEN', nivel: 3 },
              '5.2.3': { nombre: '5.2.3 INFORME DE RESULTADOS', nivel: 3 }
            }
          },
          '5.3': {
            nombre: '5.3 SEGUNDO EXAMEN',
            nivel: 2,
            subcarpetas: {
              '5.3.1': { nombre: '5.3.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', nivel: 3 },
              '5.3.2': { nombre: '5.3.2 ASISTENCIA AL EXAMEN', nivel: 3 },
              '5.3.3': { nombre: '5.3.3 INFORME DE RESULTADOS', nivel: 3 }
            }
          },
          '5.4': {
            nombre: '5.4 TERCER EXAMEN',
            nivel: 2,
            condicional: true, // Solo para 4-5 créditos
            subcarpetas: {
              '5.4.1': { nombre: '5.4.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', nivel: 3 },
              '5.4.2': { nombre: '5.4.2 ASISTENCIA AL EXAMEN', nivel: 3 },
              '5.4.3': { nombre: '5.4.3 INFORME DE RESULTADOS', nivel: 3 }
            }
          }
        }
      },
      
      trabajos_estudiantiles: {
        nombre: '6. TRABAJOS ESTUDIANTILES',
        nivel: 1,
        subcarpetas: {
          '6.1': { nombre: '6.1 EXCELENTE (19–20)', nivel: 2 },
          '6.2': { nombre: '6.2 BUENO (16–18)', nivel: 2 },
          '6.3': { nombre: '6.3 REGULAR (14–15)', nivel: 2 },
          '6.4': { nombre: '6.4 MALO (10–13)', nivel: 2 },
          '6.5': { nombre: '6.5 POBRE (0–07)', nivel: 2 }
        }
      },
      
      archivos_portafolio: {
        nombre: '7. ARCHIVOS PORTAFOLIO DOCENTE',
        nivel: 1,
        subcarpetas: {
          '7.1': { nombre: '7.1 ASISTENCIA DE ALUMNOS', nivel: 2 },
          '7.2': { nombre: '7.2 REGISTRO DE NOTAS DEL CENTRO DE CÓMPUTO', nivel: 2 },
          '7.3': { nombre: '7.3 CIERRE DE PORTAFOLIO', nivel: 2 }
        }
      }
    };
    
    // Obtener información del portafolio raíz para determinar créditos
    const portafolioRaiz = await Portafolio.findByPk(portafolioId, {
      include: [
        {
          model: require('../modelos').Asignatura,
          as: 'asignatura',
          attributes: ['creditos', 'codigo', 'nombre']
        }
      ],
      transaction
    });
    
    const creditosCurso = portafolioRaiz?.asignatura?.creditos || 3;
    const carpetasCreadas = [];
    const mapaCarpetas = {}; // Para mapear claves -> portafolio_id
    
    // Crear estructura jerárquica recursivamente
    for (const [clave, seccion] of Object.entries(estructuraUNSAAC)) {
      // Verificar si la sección es condicional (solo para 4-5 créditos)
      if (seccion.condicional && creditosCurso < 4) {
        console.log(`⏭️ Omitiendo sección condicional ${seccion.nombre} (curso de ${creditosCurso} créditos)`);
        continue;
      }
      
      // Crear carpeta principal de nivel 1
      const carpetaPrincipal = await Portafolio.create({
        nombre: seccion.nombre,
        docente_id: portafolioRaiz.docente_id,
        asignatura_id: portafolioRaiz.asignatura_id,
        grupo: portafolioRaiz.grupo,
        asignacion_id: portafolioRaiz.asignacion_id,
        semestre_id: semestreId,
        ciclo_id: cicloId,
        estructura_id: null,
        carpeta_padre_id: portafolioId,
        nivel: seccion.nivel,
        ruta: `/${portafolioRaiz.docente_id}/${portafolioRaiz.asignatura?.codigo}/${clave}`,
        estado: 'activo',
        activo: true,
        progreso_completado: 0.00,
        metadatos: {
          seccion_principal: clave,
          es_condicional: seccion.condicional || false,
          creditos_requeridos: seccion.condicional ? 4 : null
        },
        creado_por: portafolioRaiz.creado_por,
        actualizado_por: portafolioRaiz.actualizado_por
      }, { transaction });
      
      carpetasCreadas.push(carpetaPrincipal);
      mapaCarpetas[clave] = carpetaPrincipal.id;
      
      // Crear subcarpetas si existen
      if (seccion.subcarpetas) {
        await crearSubcarpetasRecursivamente(
          seccion.subcarpetas,
          carpetaPrincipal.id,
          portafolioRaiz,
          `${carpetaPrincipal.ruta}`,
          creditosCurso,
          transaction,
          carpetasCreadas,
          mapaCarpetas
        );
      }
    }
    
    console.log(`✅ Estructura creada: ${carpetasCreadas.length} carpetas para portafolio ${portafolioId}`);
    
    return {
      carpetas_creadas: carpetasCreadas.length,
      estructura_completa: mapaCarpetas,
      creditos_curso: creditosCurso
    };
    
  } catch (error) {
    console.error(`❌ Error al crear estructura de portafolio ${portafolioId}:`, error);
    throw error;
  }
}

/**
 * Crear subcarpetas recursivamente
 */
async function crearSubcarpetasRecursivamente(subcarpetas, padreId, portafolioRaiz, rutaBase, creditosCurso, transaction, carpetasCreadas, mapaCarpetas) {
  for (const [subClave, subcarpeta] of Object.entries(subcarpetas)) {
    // Verificar condiciones para subcarpetas
    if (subcarpeta.condicional && creditosCurso < 4) {
      console.log(`⏭️ Omitiendo subcarpeta condicional ${subcarpeta.nombre}`);
      continue;
    }
    
    const nuevaSubcarpeta = await Portafolio.create({
      nombre: subcarpeta.nombre,
      docente_id: portafolioRaiz.docente_id,
      asignatura_id: portafolioRaiz.asignatura_id,
      grupo: portafolioRaiz.grupo,
      asignacion_id: portafolioRaiz.asignacion_id,
      semestre_id: portafolioRaiz.semestre_id,
      ciclo_id: portafolioRaiz.ciclo_id,
      estructura_id: null,
      carpeta_padre_id: padreId,
      nivel: subcarpeta.nivel,
      ruta: `${rutaBase}/${subClave}`,
      estado: 'activo',
      activo: true,
      progreso_completado: 0.00,
      metadatos: {
        subcarpeta_de: subClave,
        es_condicional: subcarpeta.condicional || false,
        descripcion: subcarpeta.descripcion || ''
      },
      creado_por: portafolioRaiz.creado_por,
      actualizado_por: portafolioRaiz.actualizado_por
    }, { transaction });
    
    carpetasCreadas.push(nuevaSubcarpeta);
    mapaCarpetas[`${rutaBase}/${subClave}`] = nuevaSubcarpeta.id;
    
    // Crear subcarpetas de nivel 3 si existen
    if (subcarpeta.subcarpetas) {
      await crearSubcarpetasRecursivamente(
        subcarpeta.subcarpetas,
        nuevaSubcarpeta.id,
        portafolioRaiz,
        `${rutaBase}/${subClave}`,
        creditosCurso,
        transaction,
        carpetasCreadas,
        mapaCarpetas
      );
    }
  }
}

/**
 * Obtener estructura de un portafolio específico
 */
const obtenerEstructuraPortafolio = async (req, res) => {
  try {
    const { id } = req.params;
    
    await sequelize.authenticate();
    
    const { Portafolio } = require('../modelos');
    
    const estructura = await Portafolio.findAll({
      where: { 
        carpeta_padre_id: id,
        activo: true 
      },
      order: [['nivel', 'ASC'], ['nombre', 'ASC']]
    });

    return ResponseHandler.success(res, estructura, 'Estructura del portafolio obtenida correctamente');
    
  } catch (error) {
    console.error('❌ Error al obtener estructura del portafolio:', error);
    return ResponseHandler.error(res, error.message, 500);
  }
};

/**
 * Inicializar sistema de portafolios
 */
const inicializarSistemaPortafolios = async (req, res) => {
  try {
    console.log('=== INICIALIZANDO SISTEMA DE PORTAFOLIOS ===');
    
    // Crear estructura base
    await crearEstructuraBase();
    
    // Generar portafolios automáticamente
    await generarPortafoliosAutomaticos(req, res);
    
  } catch (error) {
    console.error('❌ Error al inicializar sistema de portafolios:', error);
    return ResponseHandler.error(res, error.message, 500);
  }
};

module.exports = {
  obtenerPortafolios,
  obtenerMisPortafolios,
  generarPortafoliosAutomaticos,
  obtenerEstructuraPortafolio,
  inicializarSistemaPortafolios
}; 