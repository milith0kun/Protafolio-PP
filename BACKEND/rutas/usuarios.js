const express = require('express');
const router = express.Router();
const usuarioController = require('../controladores/usuarioController');
const { verificarToken, esAdministrador, esAdminOVerificador } = require('../middleware/authJwt');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// ================================
// RUTAS ESPECÍFICAS (DEBEN IR PRIMERO)
// ================================

// Ruta para obtener roles del usuario actual
router.get('/roles', usuarioController.obtenerRolesUsuario);

// Ruta para obtener estadísticas de usuarios (ESPECÍFICA)
router.get('/estadisticas', esAdminOVerificador, usuarioController.obtenerEstadisticasUsuarios);

// Ruta para obtener asignaciones de verificadores (ESPECÍFICA)
router.get('/asignaciones-verificadores', esAdminOVerificador, usuarioController.obtenerAsignacionesVerificadores);

// ================================
// RUTAS GENERALES
// ================================

// Ruta para obtener todos los usuarios
router.get('/', esAdminOVerificador, usuarioController.obtenerUsuarios);

// ================================
// RUTAS CON PARÁMETROS ESPECÍFICOS
// ================================

// Ruta para obtener usuarios por rol (verificadores)
router.get('/rol/:rol', esAdminOVerificador, usuarioController.obtenerUsuariosPorRol);

// ================================
// RUTAS PUT/POST/DELETE
// ================================

// Rutas solo para administradores
router.post('/', esAdministrador, usuarioController.crearUsuario);

// Ruta para actualizar perfil del usuario actual
router.put('/perfil/actualizar', usuarioController.actualizarPerfil);

// Ruta para asignar verificador a docente
router.post('/docente/:docenteId/verificador/:verificadorId', esAdministrador, usuarioController.asignarVerificador);

// ================================
// RUTAS CON PARÁMETROS GENÉRICOS (DEBEN IR AL FINAL)
// ================================

// Estas rutas deben ir al final para evitar conflictos con rutas específicas
router.get('/:id', esAdminOVerificador, usuarioController.obtenerUsuario);
router.put('/:id', esAdministrador, usuarioController.actualizarUsuario);
router.delete('/:id', esAdministrador, usuarioController.eliminarUsuario);

module.exports = router;
