const jwt = require('jsonwebtoken');
const { Usuario } = require('../modelos');

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  // Obtener el token del encabezado de autorización
  let token = req.headers['authorization'];

  // Verificar si el token existe
  if (!token) {
    return res.status(403).json({
      mensaje: 'No se proporcionó un token de autenticación',
      error: true
    });
  }

  // Extraer el token si viene como 'Bearer token'
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  try {
    // Verificar y decodificar el token
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // Añadir el ID del usuario decodificado a la solicitud
    req.usuario = {
      id: decodificado.id,
      email: decodificado.email,
      rol: decodificado.rol,
      rolId: decodificado.rolId
    };
    
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    
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
  return (req, res, next) => {
    // Si no se especifican roles, cualquier usuario autenticado puede acceder
    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return next();
    }

    // Verificar si el usuario tiene un rol permitido
    if (req.usuario && req.usuario.rol && rolesPermitidos.includes(req.usuario.rol)) {
      return next();
    }

    // Si el usuario no tiene un rol permitido
    res.status(403).json({
      mensaje: 'No tiene permisos para realizar esta acción',
      error: true,
      codigo: 'SIN_PERMISOS'
    });
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
const esAdministrador = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'Administrador') {
    return next();
  }
  
  res.status(403).json({
    mensaje: 'Se requieren privilegios de administrador',
    error: true,
    codigo: 'NO_ES_ADMIN'
  });
};

// Middleware para verificar si el usuario es verificador
const esVerificador = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'Verificador') {
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
  if (req.usuario && req.usuario.rol === 'Docente') {
    return next();
  }
  
  res.status(403).json({
    mensaje: 'Se requieren privilegios de docente',
    error: true,
    codigo: 'NO_ES_DOCENTE'
  });
};

// Middleware para verificar si el usuario es administrador o verificador
const esAdminOVerificador = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'Administrador' || req.usuario.rol === 'Verificador')) {
    return next();
  }
  
  res.status(403).json({
    mensaje: 'Se requieren privilegios de administrador o verificador',
    error: true,
    codigo: 'NO_TIENE_PERMISOS'
  });
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
