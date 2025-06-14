const { Usuario, Rol, UsuarioRol } = require('../modelos');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (solo administradores)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '' } = req.query;
    const offset = (pagina - 1) * limite;

    const where = {};
    
    // Búsqueda por nombre, apellido o email
    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { email: { [Op.like]: `%${busqueda}%` } }
      ];
    }

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ],
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['apellido', 'ASC']]
    });

    res.status(200).json({
      usuarios: rows,
      total: count,
      totalPaginas: Math.ceil(count / limite),
      paginaActual: parseInt(pagina)
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      mensaje: 'Error al obtener la lista de usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
exports.obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado',
        error: true
      });
    }

    res.status(200).json(usuario);

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      mensaje: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

// Crear un nuevo usuario (solo administradores)
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol_id, activo = true } = req.body;

    // Validar que el email no esté en uso
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({
        mensaje: 'El correo electrónico ya está en uso',
        error: true
      });
    }

    // Verificar que el rol exista
    const rol = await Rol.findByPk(rol_id);
    if (!rol) {
      return res.status(400).json({
        mensaje: 'El rol especificado no existe',
        error: true
      });
    }

    // Crear el usuario
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password, // El hash se maneja en el hook beforeCreate del modelo
      rol_id,
      activo
    });

    // No devolver la contraseña en la respuesta
    const usuarioCreado = usuario.get({ plain: true });
    delete usuarioCreado.password;

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: usuarioCreado,
      error: false
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      mensaje: 'Error al crear el usuario',
      error: error.message
    });
  }
};

// Actualizar un usuario existente
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol_id, activo } = req.body;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado',
        error: true
      });
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== usuario.email) {
      const existeEmail = await Usuario.findOne({ where: { email } });
      if (existeEmail) {
        return res.status(400).json({
          mensaje: 'El correo electrónico ya está en uso',
          error: true
        });
      }
    }

    // Verificar que el rol exista si se está actualizando
    if (rol_id) {
      const rol = await Rol.findByPk(rol_id);
      if (!rol) {
        return res.status(400).json({
          mensaje: 'El rol especificado no existe',
          error: true
        });
      }
    }

    // Actualizar los campos
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre;
    if (apellido) datosActualizacion.apellido = apellido;
    if (email) datosActualizacion.email = email;
    if (password) datosActualizacion.password = password; // El hash se maneja en el hook beforeUpdate
    if (rol_id) datosActualizacion.rol_id = rol_id;
    if (activo !== undefined) datosActualizacion.activo = activo;

    await usuario.update(datosActualizacion);

    // Obtener el usuario actualizado sin la contraseña
    const usuarioActualizado = await Usuario.findByPk(usuario.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    res.status(200).json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado,
      error: false
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      mensaje: 'Error al actualizar el usuario',
      error: error.message
    });
  }
};

// Obtener roles disponibles para el usuario actual
exports.obtenerRolesUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Buscar todos los roles asignados al usuario
    const rolesUsuario = await UsuarioRol.findAll({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Rol,
          as: 'rolInfo', // Actualizado para usar el nuevo alias
          attributes: ['id', 'nombre', 'nivel']
        }
      ]
    });

    // Extraer solo la información de los roles
    const roles = rolesUsuario.map(ur => ur.rolInfo);

    res.status(200).json({
      roles,
      error: false
    });

  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    res.status(500).json({
      mensaje: 'Error al obtener los roles del usuario',
      error: error.message
    });
  }
};

// Eliminar un usuario (solo administradores)
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar al propio usuario
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({
        mensaje: 'No puedes eliminar tu propia cuenta',
        error: true
      });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado',
        error: true
      });
    }

    await usuario.destroy();

    res.status(200).json({
      mensaje: 'Usuario eliminado exitosamente',
      error: false
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      mensaje: 'Error al eliminar el usuario',
      error: error.message
    });
  }
};

// Actualizar perfil del usuario actual
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, email, passwordActual, nuevaPassword } = req.body;
    const usuarioId = req.usuario.id;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado',
        error: true
      });
    }

    // Verificar contraseña actual si se está cambiando la contraseña
    if (nuevaPassword) {
      const esValida = await usuario.validarPassword(passwordActual);
      if (!esValida) {
        return res.status(400).json({
          mensaje: 'La contraseña actual es incorrecta',
          error: true
        });
      }
    }

    // Actualizar los campos
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre;
    if (apellido) datosActualizacion.apellido = apellido;
    if (email && email !== usuario.email) {
      // Verificar si el email ya está en uso
      const existeEmail = await Usuario.findOne({ where: { email } });
      if (existeEmail) {
        return res.status(400).json({
          mensaje: 'El correo electrónico ya está en uso',
          error: true
        });
      }
      datosActualizacion.email = email;
    }
    if (nuevaPassword) datosActualizacion.password = nuevaPassword; // El hash se maneja en el hook beforeUpdate

    await usuario.update(datosActualizacion);

    // Obtener el usuario actualizado sin la contraseña
    const usuarioActualizado = await Usuario.findByPk(usuario.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre']
        }
      ]
    });

    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario: usuarioActualizado,
      error: false
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      mensaje: 'Error al actualizar el perfil',
      error: error.message
    });
  }
};
