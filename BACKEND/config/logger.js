const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { format: _format } = require('util');
const { inspect } = require('util');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configuración de formatos
const { format } = winston;

// Función para formatear objetos de error
const errorFormat = format((info) => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            stack: info.stack,
            message: info.message
        });
    }
    
    if (typeof info.message === 'object') {
        info.message = inspect(info.message, { depth: null, colors: true });
    }
    
    return info;
});

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errorFormat(),
    format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
        
        // Si hay stack trace, incluirlo
        if (stack) {
            log += '\n' + stack;
        }
        
        // Si hay metadatos adicionales, incluirlos
        if (Object.keys(meta).length > 0) {
            log += '\n' + inspect(meta, { depth: null, colors: true });
        }
        
        return log;
    })
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

// Si no estamos en producción, mostrar logs detallados en consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: format.combine(
            format.colorize({ all: true }),
            logFormat
        )
    }));
} else {
    // En producción, solo registrar errores en consola
    logger.add(new winston.transports.Console({
        level: 'error',
        format: format.combine(
            format.colorize({ all: true }),
            format.errors({ stack: true }),
            format.simple()
        )
    }));
}

// Métodos de conveniencia mejorados
const info = (message, meta = {}) => {
    if (message instanceof Error) {
        return logger.info(message.message, { ...meta, stack: message.stack });
    }
    return logger.info(message, meta);
};

const error = (message, meta = {}) => {
    if (message instanceof Error) {
        return logger.error(message.message, { 
            ...meta, 
            stack: message.stack,
            name: message.name,
            ...(message.errors && { errors: message.errors })
        });
    }
    return logger.error(message, meta);
};

const warn = (message, meta = {}) => {
    if (message instanceof Error) {
        return logger.warn(message.message, { ...meta, stack: message.stack });
    }
    return logger.warn(message, meta);
};

const debug = (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {  // Solo registrar debug en desarrollo
        if (message instanceof Error) {
            return logger.debug(message.message, { ...meta, stack: message.stack });
        }
        return logger.debug(message, meta);
    }
};

module.exports = {
    logger,
    info,
    error,
    warn,
    debug
};
