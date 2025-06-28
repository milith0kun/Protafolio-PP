/**
 * Archivo puente para mantener compatibilidad con importaciones existentes
 * Re-exporta la instancia de Sequelize desde database.js
 */

// Re-exportar la instancia de Sequelize directamente
const { sequelize } = require('./database.js');

// Exportar la instancia de Sequelize directamente
module.exports = sequelize;
