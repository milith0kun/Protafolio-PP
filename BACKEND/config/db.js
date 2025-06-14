/**
 * Archivo puente para mantener compatibilidad con importaciones existentes
 * Re-exporta la configuración de la base de datos desde database.js
 */

// Re-exportar la configuración de la base de datos
const dbConfig = require('./database.js');

// Exportar la configuración
module.exports = dbConfig;
