const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario, UsuarioRol } = require('../modelos');
const { Op } = require('sequelize');

// Añadir logs para depuración
console.log('Módulos cargados correctamente');

/**
 * Genera un token JWT con la información del usuario y su rol actual
 * @param {Object} usuario - Objeto usuario con sus datos
 * @param {String} rolActual - Rol actual seleccionado por el usuario
 * @returns {String} Token JWT
 */
const generarToken = (usuario, rolActual) => {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: rolActual,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Controlador para el inicio de sesión
 * Adaptado al nuevo esquema de base de datos
 */
exports.login = async (req, res) => {
  try {
    console.log('Intento de login recibido:', req.body);
    console.log('Tipo de req.body:', typeof req.body);
    console.log('Claves en req.body:', Object.keys(req.body));
    
    // Extraer email y password del cuerpo de la solicitud
    // Asegurarnos de que estamos extrayendo correctamente los campos
    const email = req.body.email || req.body.correo;
    const password = req.body.password || req.body.contrasena;
    
    console.log('Email extraído:', email);
    console.log('Password recibido (longitud):', password ? password.length : 0);

    // Validar que se proporcionen email y contraseña
    if (!email || !password) {
      console.log('Error: Falta email o password');
      return res.status(400).json({
        mensaje: 'Por favor, proporcione email y contraseña',
        error: true
      });
    }

    // Buscar usuario por correo electrónico
    console.log(`Buscando usuario con correo: ${email}`);
    const usuario = await Usuario.findOne({
      where: { correo: email }
    });
    
    console.log(`Usuario encontrado: ${usuario ? 'Sí' : 'No'}`);
    if (usuario) {
      console.log(`ID: ${usuario.id}, Nombre: ${usuario.nombres} ${usuario.apellidos}`);
    }

    // Verificar si el usuario existe
    if (!usuario) {
      console.log(`Usuario con correo ${email} no encontrado`);
      return res.status(401).json({
        mensaje: 'Credenciales inválidas',
        error: true
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      console.log(`Usuario ${email} está desactivado`);
      return res.status(403).json({
        mensaje: 'Cuenta desactivada. Contacte al administrador.',
        error: true
      });
    }

    // Verificar contraseña usando el método del modelo
    const esPasswordValido = await usuario.validarPassword(password);
    console.log(`Validación de contraseña para ${email}: ${esPasswordValido ? 'Exitosa' : 'Fallida'}`);
    
    if (!esPasswordValido) {
      console.log(`Contraseña inválida para usuario ${email}`);
      return res.status(401).json({
        mensaje: 'Credenciales inválidas',
        error: true
      });
    }

    console.log(`Verificando roles para usuario ${email} (ID: ${usuario.id})`);
    
    // Obtener los roles del usuario
    const rolesUsuario = await UsuarioRol.findAll({
      where: { 
        usuario_id: usuario.id,
        activo: true
      }
    });
    
    console.log(`Roles encontrados para usuario ${email}:`, JSON.stringify(rolesUsuario));

    // Verificar si el usuario tiene al menos un rol asignado
    if (!rolesUsuario || rolesUsuario.length === 0) {
      console.log(`Usuario ${email} no tiene roles asignados o activos`);
      return res.status(403).json({
        mensaje: 'No tiene permisos para acceder al sistema',
        error: true
      });
    }
    
    console.log(`Usuario ${email} tiene ${rolesUsuario.length} roles asignados`);

    // Actualizar último acceso
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    // Mapear los roles para la respuesta (simplificado para evitar errores)
    const roles = [];
    for (const ur of rolesUsuario) {
      console.log('Procesando rol:', ur.id, ur.rol);
      roles.push({
        id: ur.id,
        rol: ur.rol,
        asignado_por: ur.asignado_por
      });
    }
    
    console.log('Roles mapeados:', JSON.stringify(roles));

    // Si solo hay un rol, lo seleccionamos automáticamente
    const rolActual = roles.length === 1 ? roles[0].rol : null;
    console.log('Rol actual seleccionado:', rolActual);
    
    // Generar token JWT con el rol actual (si solo hay uno)
    const token = generarToken(usuario, rolActual);
    
    // Preparar objeto de usuario para la respuesta
    const usuarioRespuesta = {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      roles: roles,
      rolActual: rolActual
    };

    // Enviar respuesta exitosa
    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      error: false,
      token,
      usuario: usuarioRespuesta,
      tieneMultiplesRoles: roles.length > 1
    });
  } catch (error) {
    console.error('Error en el controlador de login:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor al iniciar sesión',
      error: true,
      detalles: error.message
    });
  }
};

// Controlador para cerrar sesión (manejo en el frontend)
exports.logout = (req, res) => {
  // En JWT, el cierre de sesión se maneja en el cliente eliminando el token
  res.status(200).json({
    mensaje: 'Sesión cerrada correctamente',
    error: false
  });
};

// Obtener información del usuario autenticado
exports.getUsuarioActual = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre', 'nivel']
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado',
        error: true
      });
    }

    res.status(200).json({
      usuario,
      error: false
    });

  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({
      mensaje: 'Error al obtener información del usuario',
      error: true,
      error: error.message
    });
  }
};

// Cambiar de rol (para usuarios con múltiples roles)
exports.cambiarRol = async (req, res) => {
  try {
    const { rolId } = req.body;
    const usuarioId = req.usuario.id;

    // Verificar que se proporcione un ID de rol
    if (!rolId) {
      return res.status(400).json({
        mensaje: 'Se requiere un ID de rol',
        error: true
      });
    }

    // Buscar el rol solicitado
    const rol = await Rol.findByPk(rolId);
    if (!rol) {
      return res.status(404).json({
        mensaje: 'Rol no encontrado',
        error: true
      });
    }

    // Actualizar el rol del usuario
    await Usuario.update(
      { rol_id: rolId },
      { where: { id: usuarioId } }
    );

    // Obtener el usuario actualizado con el nuevo rol
    const usuarioActualizado = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre', 'nivel']
        }
      ]
    });

    // Generar nuevo token con el rol actualizado
    const token = generarToken(usuarioActualizado);

    res.status(200).json({
      mensaje: 'Rol cambiado exitosamente',
      token,
      usuario: usuarioActualizado,
      error: false
    });

  } catch (error) {
    console.error('Error al cambiar de rol:', error);
    res.status(500).json({
      mensaje: 'Error al cambiar de rol',
      error: true,
      error: error.message
    });
  }
};
