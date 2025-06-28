const express = require('express');
const router = express.Router();
const authController = require('../controladores/authController');
const { verificarToken, estaAutenticado } = require('../middleware/authJwt');

// Ruta para iniciar sesión (pública)
router.post('/login', authController.login);

// Ruta para cerrar sesión (requiere autenticación)
router.post('/logout', [verificarToken], authController.logout);

// Ruta para obtener información del usuario actual (requiere autenticación)
router.get('/usuario-actual', [verificarToken], authController.getUsuarioActual);

// Ruta para obtener perfil del usuario (alias de usuario-actual)
router.get('/perfil', [verificarToken], authController.getUsuarioActual);

// Ruta para cambiar de rol (para usuarios con múltiples roles)
router.post('/cambiar-rol', [verificarToken], authController.cambiarRol);

// Ruta para verificar el token y estado de sesión
router.get('/verificar', [verificarToken], authController.verificarToken);

// Ruta para renovar token
router.post('/renovar', [verificarToken], authController.renovarToken);

// Ruta protegida de ejemplo
router.get('/protegida', [verificarToken], (req, res) => {
  res.json({
    mensaje: '¡Ruta protegida accesible solo con token válido!',
    usuario: req.usuario
  });
});

// Ruta para verificar si el token es válido (usada para verificar sesión en frontend)
router.get('/verificar-sesion', [verificarToken], (req, res) => {
  res.status(200).json({
    autenticado: true,
    usuario: {
      id: req.usuario.id,
              email: req.usuario.correo || req.usuario.email,
      rol: req.usuario.rol,
      rolId: req.usuario.rolId
    }
  });
});

module.exports = router;
