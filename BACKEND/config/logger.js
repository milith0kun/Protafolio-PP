const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configuración de formatos
const { format } = winston;
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Crear logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'portafolio-service' },
    transports: [
        // Escribir logs de error en archivo
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Escribir todos los logs en archivo
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Si no estamos en producción, también mostrar logs en consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            logFormat
        )
    }));
}

// Métodos de conveniencia
const info = (message, meta = {}) => logger.info(message, meta);
const error = (message, meta = {}) => logger.error(message, meta);
const warn = (message, meta = {}) => logger.warn(message, meta);
const debug = (message, meta = {}) => logger.debug(message, meta);

module.exports = {
    logger,
    info,
    error,
    warn,
    debug
};
