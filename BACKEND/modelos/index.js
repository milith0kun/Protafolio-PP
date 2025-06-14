/**
 * Archivo de exportación de modelos
 * Centraliza la exportación de todos los modelos de la aplicación
 * Simplificado para la Etapa 1 del proyecto
 */

// Modelos base para la Etapa 1
const Usuario = require('./Usuario');
const UsuarioRol = require('./UsuarioRol');

// Exportar solo los modelos necesarios para la Etapa 1
module.exports = {
  Usuario,
  UsuarioRol
};
