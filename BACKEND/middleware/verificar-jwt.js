/**
 * Archivo puente para mantener compatibilidad con las rutas existentes
 * Re-exporta las funciones de autenticación y autorización del middleware authJwt.js
 */

// Importar todas las funciones del middleware authJwt.js
const {
    verificarToken,
    verificarRol,
    estaAutenticado,
    esAdministrador,
    esVerificador,
    esDocente,
    esAdminOVerificador
} = require('./authJwt');

// Re-exportar todas las funciones para mantener compatibilidad
module.exports = {
    verificarToken,
    verificarRol,
    estaAutenticado,
    esAdministrador,
    esVerificador,
    esDocente,
    esAdminOVerificador
};
