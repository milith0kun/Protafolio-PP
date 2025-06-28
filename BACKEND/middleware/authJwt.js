const jwt = require('jsonwebtoken');
const { Usuario } = require('../modelos');
const config = require('../config/env');

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  console.log('=== VERIFICANDO TOKEN ===');
  console.log('Headers:', req.headers);
  
  // Obtener el token del encabezado de autorización
  let token = req.headers['authorization'];

  // Verificar si el token existe
  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(403).json({
      mensaje: 'No se proporcionó un token de autenticación',
      error: true
    });
  }

  // Extraer el token si viene como 'Bearer token'
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  console.log('Token recibido:', token.substring(0, 20) + '...');

  try {
    // Verificar y decodificar el token
    const decodificado = jwt.verify(token, config.JWT_SECRET);
    console.log('Token decodificado:', decodificado);
    
    // Añadir el ID del usuario decodificado a la solicitud
    req.usuario = {
      id: decodificado.id,
      email: decodificado.correo || decodificado.email, // Usar 'correo' como clave principal
      rol: decodificado.rol,
      rolId: decodificado.rolId
    };
    
    console.log('✅ Token válido, usuario:', req.usuario);
    next();
  } catch (error) {
    console.error('❌ Error al verificar el token:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.',
        error: true,
        codigo: 'TOKEN_EXPIRADO'
      });
    }
    
    return res.status(401).json({
      mensaje: 'Token inválido o expirado',
      error: true,
      codigo: 'TOKEN_INVALIDO'
    });
  }
};

// Middleware para verificar roles específicos
const verificarRol = (rolesPermitidos = []) => {
  return async (req, res, next) => {
    console.log('=== VERIFICANDO ROL ===');
    console.log('Roles permitidos:', rolesPermitidos);
    console.log('Usuario:', req.usuario);
    
    // Si no se especifican roles, cualquier usuario autenticado puede acceder
    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      console.log('✅ Sin restricción de roles');
      return next();
    }

    // Verificar si el usuario tiene un rol específico en el token
    if (req.usuario && req.usuario.rol && req.usuario.rol !== null) {
      console.log('🔍 Verificando rol del token:', req.usuario.rol);
      if (rolesPermitidos.includes(req.usuario.rol)) {
        console.log('✅ Usuario tiene rol permitido:', req.usuario.rol);
        return next();
      } else {
        console.log('❌ Usuario no tiene rol permitido. Rol actual:', req.usuario.rol);
        return res.status(403).json({
          mensaje: 'No tiene permisos para realizar esta acción',
          error: true,
          codigo: 'SIN_PERMISOS'
        });
      }
    }

    // Si el token no tiene rol específico (rol: null), verificar en la base de datos
    console.log('🔍 Token sin rol específico, consultando BD para usuario ID:', req.usuario.id);
    try {
      const { UsuarioRol } = require('../modelos');
      
      const rolesUsuario = await UsuarioRol.findAll({
        where: {
          usuario_id: req.usuario.id,
          activo: true
        },
        attributes: ['rol']
      });

      const rolesDelUsuario = rolesUsuario.map(r => r.rol);
      console.log('Roles del usuario en BD:', rolesDelUsuario);

      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const tieneRol = rolesPermitidos.some(rol => rolesDelUsuario.includes(rol));
      console.log(`🔍 Verificando roles: requeridos=[${rolesPermitidos.join(', ')}], usuario=[${rolesDelUsuario.join(', ')}], tieneRol=${tieneRol}`);

      if (!tieneRol) {
        console.log(`❌ Usuario no tiene ningún rol permitido. Roles del usuario: ${rolesDelUsuario.join(', ')}`);
        return res.status(403).json({
          mensaje: 'No tiene permisos para realizar esta acción',
          error: true,
          codigo: 'SIN_PERMISOS'
        });
      }

      console.log('✅ Usuario tiene rol permitido - continuando');
      next();

    } catch (error) {
      console.error('Error verificando roles:', error);
      return res.status(500).json({
        mensaje: 'Error al verificar permisos',
        error: true,
        codigo: 'ERROR_VERIFICACION'
      });
    }
  };
};

// Middleware para verificar si el usuario está autenticado
const estaAutenticado = (req, res, next) => {
  // Verificar si el usuario está en la solicitud (ya autenticado por verificarToken)
  if (req.usuario && req.usuario.id) {
    return next();
  }
  
  res.status(401).json({
    mensaje: 'Debe iniciar sesión para acceder a este recurso',
    error: true,
    codigo: 'NO_AUTENTICADO'
  });
};

// Middleware para verificar si el usuario es administrador
const esAdministrador = async (req, res, next) => {
  console.log('=== VERIFICANDO ADMINISTRADOR ===');
  console.log('Usuario:', req.usuario);
  
  // Verificar si el usuario tiene un rol específico en el token
  if (req.usuario && req.usuario.rol && req.usuario.rol !== null) {
    console.log('🔍 Verificando rol del token:', req.usuario.rol);
    if (req.usuario.rol === 'administrador') {
      console.log('✅ Usuario es administrador');
      return next();
    } else {
      console.log('❌ Usuario no es administrador. Rol actual:', req.usuario.rol);
      return res.status(403).json({
        mensaje: 'Se requieren privilegios de administrador',
        error: true,
        codigo: 'NO_ES_ADMIN'
      });
    }
  }

  // Si el token no tiene rol específico (rol: null), verificar en la base de datos
  console.log('🔍 Token sin rol específico, consultando BD para usuario ID:', req.usuario.id);
  try {
    const { UsuarioRol } = require('../modelos');
    
    const rolesUsuario = await UsuarioRol.findAll({
      where: {
        usuario_id: req.usuario.id,
        activo: true
      },
      attributes: ['rol']
    });

    const rolesDelUsuario = rolesUsuario.map(r => r.rol);
    console.log('Roles del usuario en BD:', rolesDelUsuario);

    // Verificar si el usuario tiene rol de administrador
    const esAdmin = rolesDelUsuario.includes('administrador');
    console.log(`🔍 Verificando rol administrador: usuario=[${rolesDelUsuario.join(', ')}], esAdmin=${esAdmin}`);

    if (!esAdmin) {
      console.log(`❌ Usuario no es administrador. Roles del usuario: ${rolesDelUsuario.join(', ')}`);
      return res.status(403).json({
        mensaje: 'Se requieren privilegios de administrador',
        error: true,
        codigo: 'NO_ES_ADMIN'
      });
    }

    console.log('✅ Usuario es administrador - continuando');
    next();

  } catch (error) {
    console.error('Error verificando rol administrador:', error);
    return res.status(500).json({
      mensaje: 'Error al verificar permisos',
      error: true,
      codigo: 'ERROR_VERIFICACION'
    });
  }
};

// Middleware para verificar si el usuario es verificador
const esVerificador = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'verificador') {
    return next();
  }
  
  res.status(403).json({
    mensaje: 'Se requieren privilegios de verificador',
    error: true,
    codigo: 'NO_ES_VERIFICADOR'
  });
};

// Middleware para verificar si el usuario es docente
const esDocente = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'docente') {
    return next();
  }
  
  res.status(403).json({
    mensaje: 'Se requieren privilegios de docente',
    error: true,
    codigo: 'NO_ES_DOCENTE'
  });
};

// Middleware para verificar si el usuario es administrador o verificador
const esAdminOVerificador = async (req, res, next) => {
  console.log('=== VERIFICANDO ADMIN O VERIFICADOR ===');
  console.log('Usuario:', req.usuario);
  
  // Verificar si el usuario tiene un rol específico en el token
  if (req.usuario && req.usuario.rol && req.usuario.rol !== null) {
    console.log('🔍 Verificando rol del token:', req.usuario.rol);
    if (req.usuario.rol === 'administrador' || req.usuario.rol === 'verificador') {
      console.log('✅ Usuario tiene rol permitido:', req.usuario.rol);
      return next();
    } else {
      console.log('❌ Usuario no tiene rol permitido. Rol actual:', req.usuario.rol);
      return res.status(403).json({
        mensaje: 'Se requieren privilegios de administrador o verificador',
        error: true,
        codigo: 'NO_TIENE_PERMISOS'
      });
    }
  }

  // Si el token no tiene rol específico (rol: null), verificar en la base de datos
  console.log('🔍 Token sin rol específico, consultando BD para usuario ID:', req.usuario.id);
  try {
    const { UsuarioRol } = require('../modelos');
    
    const rolesUsuario = await UsuarioRol.findAll({
      where: {
        usuario_id: req.usuario.id,
        activo: true
      },
      attributes: ['rol']
    });

    const rolesDelUsuario = rolesUsuario.map(r => r.rol);
    console.log('Roles del usuario en BD:', rolesDelUsuario);

    // Verificar si el usuario tiene rol de administrador o verificador
    const tieneRol = rolesDelUsuario.includes('administrador') || rolesDelUsuario.includes('verificador');
    console.log(`🔍 Verificando roles admin/verificador: usuario=[${rolesDelUsuario.join(', ')}], tieneRol=${tieneRol}`);

    if (!tieneRol) {
      console.log(`❌ Usuario no tiene rol de administrador o verificador. Roles del usuario: ${rolesDelUsuario.join(', ')}`);
      return res.status(403).json({
        mensaje: 'Se requieren privilegios de administrador o verificador',
        error: true,
        codigo: 'NO_TIENE_PERMISOS'
      });
    }

    console.log('✅ Usuario tiene rol permitido (admin/verificador) - continuando');
    next();

  } catch (error) {
    console.error('Error verificando roles admin/verificador:', error);
    return res.status(500).json({
      mensaje: 'Error al verificar permisos',
      error: true,
      codigo: 'ERROR_VERIFICACION'
    });
  }
};

module.exports = {
  verificarToken,
  verificarRol,
  estaAutenticado,
  esAdministrador,
  esVerificador,
  esDocente,
  esAdminOVerificador
};
