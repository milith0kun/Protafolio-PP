const { UsuarioRol } = require('../modelos');

/**
 * Middleware para verificar los roles de usuario
 * @param {Array} roles - Array de roles permitidos
 * @returns {Function} - Middleware de Express
 */
const verificarRol = (roles = []) => {
  return async (req, res, next) => {
    console.log('=== VERIFICANDO ROL ===');
    console.log('Roles permitidos:', roles);
    console.log('Usuario:', req.usuario);

    // Si no se especifican roles, cualquier usuario autenticado puede acceder
    if (!roles || roles.length === 0) {
      return next();
    }

    // Obtener el usuario del request (debería estar establecido por el middleware de autenticación)
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Se requiere autenticación para acceder a este recurso',
      });
    }

    // Si el usuario tiene un rol específico en el token, verificarlo directamente
    if (usuario.rol && usuario.rol !== null) {
      console.log('🔍 Verificando rol del token:', usuario.rol);
      const tieneRol = roles.includes(usuario.rol);
      if (tieneRol) {
        console.log(`✅ Usuario tiene rol permitido directamente: ${usuario.rol}`);
        return next();
      } else {
        console.log(`❌ Usuario no tiene rol permitido. Rol actual: ${usuario.rol}`);
        return res.status(403).json({
          error: 'Acceso denegado',
          mensaje: 'No tienes permisos suficientes para acceder a este recurso',
        });
      }
    }

    // Si el token no tiene rol específico (rol: null), verificar en la base de datos
    console.log('🔍 Token sin rol específico, consultando BD para usuario ID:', usuario.id);
    try {
      const rolesUsuario = await UsuarioRol.findAll({
        where: {
          usuario_id: usuario.id,
          activo: true
        },
        attributes: ['rol']
      });

      const rolesDelUsuario = rolesUsuario.map(r => r.rol);
      console.log('Roles del usuario en BD:', rolesDelUsuario);

      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const tieneRol = roles.some(rol => rolesDelUsuario.includes(rol));
      console.log(`🔍 Verificando roles: requeridos=[${roles.join(', ')}], usuario=[${rolesDelUsuario.join(', ')}], tieneRol=${tieneRol}`);

      if (!tieneRol) {
        console.log(`❌ Usuario no tiene ningún rol permitido. Roles del usuario: ${rolesDelUsuario.join(', ')}`);
        return res.status(403).json({
          error: 'Acceso denegado',
          mensaje: 'No tienes permisos suficientes para acceder a este recurso',
        });
      }

      console.log('✅ Usuario tiene rol permitido - continuando');
      // Si todo está bien, continuar con la siguiente función de middleware
      next();

    } catch (error) {
      console.error('Error verificando roles:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        mensaje: 'Error al verificar permisos',
      });
    }
  };
};

module.exports = verificarRol;
