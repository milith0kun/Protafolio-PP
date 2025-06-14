const fs = require('fs');
const path = require('path');
const logger = require('../../config/logger');

// Configuración de rutas de almacenamiento
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/portafolios');

// Crear directorio de portafolios si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Estado global de inicialización
global.inicializacionProgress = {
    enProgreso: false,
    pasoActual: '',
    progreso: 0,
    totalPasos: 8, // Total de archivos a procesar
    error: null,
    inicio: null,
    finalizado: null
};

/**
 * Actualiza el progreso de la inicialización
 * @param {string} paso - Descripción del paso actual
 * @param {Object} detalles - Detalles adicionales del progreso
 */
function actualizarProgreso(paso, detalles = {}) {
    if (!global.inicializacionProgress) {
        global.inicializacionProgress = {
            enProgreso: true,
            pasoActual: paso,
            progreso: 0,
            totalPasos: 8,
            inicio: new Date().toISOString(),
            finalizado: null,
            error: null,
            ...detalles
        };
    } else {
        global.inicializacionProgress = {
            ...global.inicializacionProgress,
            pasoActual: paso,
            progreso: Math.min(
                global.inicializacionProgress.progreso + (100 / global.inicializacionProgress.totalPasos),
                100
            ),
            ...detalles
        };
    }
    logger.info(`[Inicialización] ${paso} - Progreso: ${global.inicializacionProgress.progreso.toFixed(2)}%`);
}

/**
 * Registra un error en el sistema
 * @param {Error} error - Objeto de error
 * @param {string} contexto - Contexto donde ocurrió el error
 */
function registrarError(error, contexto = '') {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] Error${contexto ? ` en ${contexto}` : ''}: ${error.message}\n${error.stack}\n\n`;
    
    // Registrar en consola
    console.error(errorMessage);
    
    // Registrar en archivo de logs
    fs.appendFile('errores-inicializacion.log', errorMessage, (err) => {
        if (err) console.error('Error al escribir en el archivo de logs:', err);
    });
}

/**
 * Elimina archivos temporales
 * @param {Array} archivos - Lista de archivos a eliminar
 */
async function limpiarArchivosTemporales(archivos) {
    if (!archivos) return;
    
    for (const archivo of Object.values(archivos)) {
        if (archivo && archivo.path && fs.existsSync(archivo.path)) {
            try {
                fs.unlinkSync(archivo.path);
                logger.info(`Archivo temporal eliminado: ${archivo.originalname}`);
            } catch (err) {
                logger.error(`Error al eliminar archivo temporal ${archivo.originalname}:`, err);
            }
        }
    }
}

module.exports = {
    actualizarProgreso,
    registrarError,
    limpiarArchivosTemporales,
    UPLOADS_DIR
};
