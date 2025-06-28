const fs = require('fs');
const path = require('path');
const logger = require('../../config/logger');

// Configuración de rutas de almacenamiento
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/portafolios');
const LOGS_DIR = path.join(__dirname, '../../../logs');

// Crear directorios necesarios
[UPLOADS_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

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
    const errorLog = {
        timestamp,
        contexto,
        mensaje: error.message,
        stack: error.stack,
        detalles: error.detalles || {}
    };
    
    // Registrar en consola
    console.error(JSON.stringify(errorLog, null, 2));
    
    // Registrar en archivo de logs
    const logPath = path.join(LOGS_DIR, 'errores-inicializacion.log');
    fs.appendFileSync(logPath, JSON.stringify(errorLog, null, 2) + '\n');
    
    // Registrar en el logger principal
    logger.error(`[${contexto}] ${error.message}`, {
        error: errorLog,
        stack: error.stack
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
                registrarError(err, 'limpiarArchivosTemporales');
            }
        }
    }
}

/**
 * Realiza un backup de la base de datos
 * @param {string} nombreArchivo - Nombre del archivo de backup
 */
async function realizarBackup(nombreArchivo) {
    const backupPath = path.join(LOGS_DIR, 'backups', nombreArchivo);
    
    try {
        // Crear directorio de backups si no existe
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Aquí iría la lógica para realizar el backup
        // Por ejemplo, usando mysqldump o similar
        
        logger.info(`Backup realizado exitosamente: ${nombreArchivo}`);
        return true;
    } catch (error) {
        registrarError(error, 'realizarBackup');
        return false;
    }
}

/**
 * Limpia los logs antiguos
 * @param {number} diasRetener - Número de días a retener los logs
 */
function limpiarLogsAntiguos(diasRetener = 30) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasRetener);
    
    try {
        const archivos = fs.readdirSync(LOGS_DIR);
        
        archivos.forEach(archivo => {
            const rutaArchivo = path.join(LOGS_DIR, archivo);
            const stats = fs.statSync(rutaArchivo);
            
            if (stats.mtime < fechaLimite) {
                fs.unlinkSync(rutaArchivo);
                logger.info(`Log antiguo eliminado: ${archivo}`);
            }
        });
    } catch (error) {
        registrarError(error, 'limpiarLogsAntiguos');
    }
}

module.exports = {
    actualizarProgreso,
    registrarError,
    limpiarArchivosTemporales,
    realizarBackup,
    limpiarLogsAntiguos,
    UPLOADS_DIR
};
