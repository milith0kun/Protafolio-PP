const express = require('express');
const router = express.Router();
const usuarioController = require('../controladores/usuarioController');
const { verificarToken, esAdministrador, esAdminOVerificador } = require('../middleware/authJwt');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Ruta para obtener roles del usuario actual
router.get('/roles', usuarioController.obtenerRolesUsuario);

// Ruta para actualizar perfil del usuario actual
router.put('/perfil/actualizar', usuarioController.actualizarPerfil);

// Rutas accesibles por administradores y verificadores
router.get('/', esAdminOVerificador, usuarioController.obtenerUsuarios);

// Rutas solo para administradores
router.post('/', esAdministrador, usuarioController.crearUsuario);

// Estas rutas deben ir al final para evitar conflictos con rutas específicas
router.get('/:id', esAdminOVerificador, usuarioController.obtenerUsuario);
router.put('/:id', esAdministrador, usuarioController.actualizarUsuario);
router.delete('/:id', esAdministrador, usuarioController.eliminarUsuario);

module.exports = router;
