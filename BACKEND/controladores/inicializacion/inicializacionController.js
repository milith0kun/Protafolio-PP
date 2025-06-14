const { sequelize } = require('../../config/database');
const logger = require('../../config/logger');
const { 
    actualizarProgreso, 
    registrarError, 
    limpiarArchivosTemporales 
} = require('./utils');

// Importar controladores específicos
const ciclosController = require('./ciclosController');
const usuariosController = require('./usuariosController');
const asignaturasController = require('./asignaturasController');
const docentesController = require('./docentesController');
const verificadoresController = require('./verificadoresController');
const estructuraController = require('./estructuraController');
const asignacionesController = require('./asignacionesController');
const parametrosController = require('./parametrosController');
const portafoliosController = require('./portafoliosController');

/**
 * Inicializa el sistema con los 8 archivos Excel requeridos
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const inicializarSistema = async (req, res) => {
    // Verificar que se hayan subido archivos
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No se han subido archivos',
            error: 'No se han subido archivos para procesar'
        });
    }

    // Organizar archivos por tipo
    const archivos = {};
    req.files.forEach(archivo => {
        const tipo = archivo.fieldname.replace('archivo_', '');
        archivos[tipo] = archivo;
    });

    // Inicializar resultados
    const resultados = {
        totalArchivos: 8,
        procesados: 0,
        detalles: {},
        notificacionesEnviadas: 0,
        portafoliosCreados: 0,
        errores: []
    };

    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
        // 1. Procesar ciclos académicos
        if (archivos.ciclos) {
            try {
                actualizarProgreso('Procesando ciclos académicos');
                const resultado = await ciclosController.procesar(archivos.ciclos, transaction);
                resultados.detalles.ciclos = resultado;
                resultados.procesados++;
                logger.info(`Ciclos procesados: ${resultado.creados} creados, ${resultado.actualizados} actualizados, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar ciclos académicos: ${error.message}`;
                registrarError(error, 'procesarCiclos');
                throw new Error(mensajeError);
            }
        }

        // 2. Procesar usuarios
        if (archivos.usuarios) {
            try {
                actualizarProgreso('Procesando usuarios');
                const resultado = await usuariosController.procesar(archivos.usuarios, transaction);
                resultados.detalles.usuarios = resultado;
                resultados.procesados++;
                logger.info(`Usuarios procesados: ${resultado.creados} creados, ${resultado.actualizados} actualizados, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar usuarios: ${error.message}`;
                registrarError(error, 'procesarUsuarios');
                throw new Error(mensajeError);
            }
        }

        // 3. Procesar asignaturas
        if (archivos.asignaturas) {
            try {
                actualizarProgreso('Procesando asignaturas');
                const resultado = await asignaturasController.procesar(archivos.asignaturas, transaction);
                resultados.detalles.asignaturas = resultado;
                resultados.procesados++;
                logger.info(`Asignaturas procesadas: ${resultado.creadas} creadas, ${resultado.actualizadas} actualizadas, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar asignaturas: ${error.message}`;
                registrarError(error, 'procesarAsignaturas');
                throw new Error(mensajeError);
            }
        }

        // 4. Procesar docentes
        if (archivos.docentes) {
            try {
                actualizarProgreso('Procesando docentes');
                const resultado = await docentesController.procesar(archivos.docentes, transaction);
                resultados.detalles.docentes = resultado;
                resultados.procesados++;
                logger.info(`Docentes procesados: ${resultado.procesados} procesados, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar docentes: ${error.message}`;
                registrarError(error, 'procesarDocentes');
                throw new Error(mensajeError);
            }
        }

        // 5. Procesar verificadores
        if (archivos.verificadores) {
            try {
                actualizarProgreso('Procesando verificadores');
                const resultado = await verificadoresController.procesar(archivos.verificadores, transaction);
                resultados.detalles.verificadores = resultado;
                resultados.procesados++;
                logger.info(`Verificadores procesados: ${resultado.procesados} procesados, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar verificadores: ${error.message}`;
                registrarError(error, 'procesarVerificadores');
                throw new Error(mensajeError);
            }
        }

        // 6. Procesar estructura de portafolios
        if (archivos.estructura_portafolio) {
            try {
                actualizarProgreso('Procesando estructura de portafolios');
                const resultado = await estructuraController.procesar(archivos.estructura_portafolio, transaction);
                resultados.detalles.estructura_portafolio = resultado;
                resultados.procesados++;
                logger.info(`Estructura de portafolios procesada: ${resultado.creadas} creadas, ${resultado.actualizadas} actualizadas, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar estructura de portafolios: ${error.message}`;
                registrarError(error, 'procesarEstructuraPortafolio');
                throw new Error(mensajeError);
            }
        }

        // 7. Procesar asignaciones
        if (archivos.asignaciones) {
            try {
                actualizarProgreso('Procesando asignaciones de docentes');
                const resultado = await asignacionesController.procesar(archivos.asignaciones, transaction);
                resultados.detalles.asignaciones = resultado;
                resultados.procesados++;
                logger.info(`Asignaciones procesadas: ${resultado.creadas} creadas, ${resultado.actualizadas} actualizadas, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar asignaciones: ${error.message}`;
                registrarError(error, 'procesarAsignaciones');
                throw new Error(mensajeError);
            }
        }

        // 8. Procesar parámetros
        if (archivos.parametros) {
            try {
                actualizarProgreso('Procesando parámetros del sistema');
                const resultado = await parametrosController.procesar(archivos.parametros, transaction);
                resultados.detalles.parametros = resultado;
                resultados.procesados++;
                logger.info(`Parámetros procesados: ${resultado.creados} creados, ${resultado.actualizados} actualizados, ${resultado.errores.length} errores`);
            } catch (error) {
                const mensajeError = `Error al procesar parámetros: ${error.message}`;
                registrarError(error, 'procesarParametros');
                throw new Error(mensajeError);
            }
        }

        // 9. Crear portafolios automáticamente
        try {
            actualizarProgreso('Creando portafolios automáticamente');
            const resultado = await portafoliosController.crearPortafoliosAutomaticos(transaction);
            resultados.portafoliosCreados = resultado.totalCreados;
            logger.info(`Portafolios creados automáticamente: ${resultado.totalCreados} creados, ${resultado.errores.length} errores`);
        } catch (error) {
            const mensajeError = `Error al crear portafolios automáticamente: ${error.message}`;
            registrarError(error, 'crearPortafoliosAutomaticos');
            throw new Error(mensajeError);
        }

        // 10. Enviar notificaciones
        try {
            actualizarProgreso('Enviando notificaciones');
            const resultado = await portafoliosController.enviarNotificacionesInicializacion(transaction);
            resultados.notificacionesEnviadas = resultado.totalEnviadas;
            logger.info(`Notificaciones enviadas: ${resultado.totalEnviadas} enviadas, ${resultado.errores.length} errores`);
        } catch (error) {
            const mensajeError = `Error al enviar notificaciones: ${error.message}`;
            registrarError(error, 'enviarNotificacionesInicializacion');
            logger.warn('Continuando a pesar del error en notificaciones');
        }

        // Confirmar transacción
        await transaction.commit();

        // Generar reporte
        const reporte = generarReporteInicializacion(resultados);

        // Actualizar progreso
        actualizarProgreso('Inicialización completada', { finalizado: true });

        // Enviar respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Inicialización del sistema completada exitosamente',
            data: {
                resultados,
                reporte: reporte.reportePath
            }
        });

    } catch (error) {
        // Revertir transacción en caso de error
        if (transaction && typeof transaction.rollback === 'function') {
            try {
                await transaction.rollback();
                logger.error('Transacción revertida debido a un error', { error });
            } catch (rollbackError) {
                logger.error('Error al realizar rollback de la transacción:', rollbackError);
            }
        }

        // Limpiar archivos temporales
        await limpiarArchivosTemporales(archivos);

        // Registrar error
        const mensajeError = `Error en la inicialización del sistema: ${error.message}`;
        registrarError(error, 'inicializarSistema');

        // Actualizar progreso con error
        actualizarProgreso('Error en inicialización', { 
            error: mensajeError,
            finalizado: true 
        });

        // Enviar respuesta de error
        return res.status(500).json({
            success: false,
            message: 'Error durante la inicialización del sistema',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
            detalles: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                resultados: resultados.detalles,
                errores: resultados.errores
            } : null
        });
    }
};

/**
 * Genera un reporte de la inicialización
 * @param {Object} resultados - Resultados de la inicialización
 * @returns {Object} Datos del reporte generado
 */
const generarReporteInicializacion = (resultados) => {
    try {
        // Aquí iría la lógica para generar un reporte en PDF, Excel o HTML
        // Por ahora, solo devolvemos un objeto con información básica
        
        const fechaHora = new Date().toISOString().replace(/[:.]/g, '-');
        const reportePath = `reportes/inicializacion_${fechaHora}.json`;
        
        // En una implementación real, aquí se generaría y guardaría el archivo
        
        return {
            reportePath,
            fecha: new Date(),
            resumen: {
                archivos: resultados.totalArchivos,
                procesados: resultados.procesados,
                portafolios: resultados.portafoliosCreados,
                notificaciones: resultados.notificacionesEnviadas,
                errores: resultados.errores.length
            }
        };
    } catch (error) {
        logger.error('Error al generar reporte de inicialización:', error);
        return {
            reportePath: null,
            error: error.message
        };
    }
};

module.exports = {
    inicializarSistema
};
