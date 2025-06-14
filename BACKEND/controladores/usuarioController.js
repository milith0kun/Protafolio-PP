const { Usuario, UsuarioRol } = require('../modelos');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (solo administradores)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '' } = req.query;
    const offset = (pagina - 1) * limite;

    const where = {};
    
    // Búsqueda por nombres, apellidos o correo
    if (busqueda) {
      where[Op.or] = [
        { nombres: { [Op.like]: `%${busqueda}%` } },
        { apellidos: { [Op.like]: `%${busqueda}%` } },
        { correo: { [Op.like]: `%${busqueda}%` } }
      ];
    }

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      attributes: { exclude: ['contrasena'] },
      include: [
        {
          model: UsuarioRol,
          as: 'rolesAsignados',
          where: { activo: true },
          required: false
        }
      ],
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['apellidos', 'ASC']]
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
      attributes: { exclude: ['contrasena'] },
      include: [
        {
          model: UsuarioRol,
          as: 'rolesAsignados',
          where: { activo: true },
          required: false
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
    const { nombres, apellidos, correo, contrasena, rol, activo = true } = req.body;

    // Validar que el correo no esté en uso
    const existeUsuario = await Usuario.findOne({ where: { correo } });
    if (existeUsuario) {
      return res.status(400).json({
        mensaje: 'El correo electrónico ya está en uso',
        error: true
      });
    }

    // Verificar que el rol sea válido
    const rolesValidos = ['docente', 'verificador', 'administrador'];
    if (rol && !rolesValidos.includes(rol)) {
      return res.status(400).json({
        mensaje: 'El rol especificado no es válido',
        error: true
      });
    }

    // Crear el usuario
    const usuario = await Usuario.create({
      nombres,
      apellidos,
      correo,
      contrasena, // El hash se maneja en el hook beforeCreate del modelo
      activo
    });
    
    // Crear el rol del usuario
    if (rol) {
      await UsuarioRol.create({
        usuario_id: usuario.id,
        rol,
        activo: true,
        asignado_por: req.usuario.id // ID del administrador que crea el usuario
      });
    }

    // No devolver la contraseña en la respuesta
    const usuarioCreado = usuario.get({ plain: true });
    delete usuarioCreado.contrasena;

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
    const { nombres, apellidos, correo, contrasena, rol, activo } = req.body;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado',
        error: true
      });
    }

    // Verificar si el correo ya está en uso por otro usuario
    if (correo && correo !== usuario.correo) {
      const existeEmail = await Usuario.findOne({
        where: {
          correo,
          id: { [Op.ne]: id }
        }
      });

      if (existeEmail) {
        return res.status(400).json({
          mensaje: 'El correo electrónico ya está en uso por otro usuario',
          error: true
        });
      }
    }

    // Verificar si el rol es válido
    if (rol) {
      const rolesValidos = ['docente', 'verificador', 'administrador'];
      if (!rolesValidos.includes(rol)) {
        return res.status(400).json({
          mensaje: 'El rol especificado no es válido',
          error: true
        });
      }
    }

    // Actualizar los campos del usuario
    const datosActualizacion = {};
    
    if (nombres) datosActualizacion.nombres = nombres;
    if (apellidos) datosActualizacion.apellidos = apellidos;
    if (correo) datosActualizacion.correo = correo;
    if (contrasena) datosActualizacion.contrasena = contrasena; // El hash se maneja en el hook beforeUpdate
    if (activo !== undefined) datosActualizacion.activo = activo;

    await usuario.update(datosActualizacion);

    // Actualizar el rol si se ha especificado
    if (rol) {
      // Buscar si ya tiene este rol asignado y activo
      const rolExistente = await UsuarioRol.findOne({
        where: {
          usuario_id: id,
          rol,
          activo: true
        }
      });
      
      // Si no tiene este rol, crear una nueva asignación
      if (!rolExistente) {
        // Desactivar roles anteriores si es necesario
        await UsuarioRol.update(
          { activo: false },
          { where: { usuario_id: id, activo: true } }
        );
        
        // Crear el nuevo rol
        await UsuarioRol.create({
          usuario_id: id,
          rol,
          activo: true,
          asignado_por: req.usuario.id
        });
      }
    }

    // Obtener el usuario actualizado sin la contraseña
    const usuarioActualizado = await Usuario.findByPk(usuario.id, {
      attributes: { exclude: ['contrasena'] },
      include: [
        {
          model: UsuarioRol,
          as: 'rolesAsignados',
          where: { activo: true },
          required: false
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
          model: UsuarioRol,
          as: 'rolesAsignados',
          attributes: ['id', 'rol']
        }
      ]
    });

    // Extraer solo la información de los roles
    const roles = rolesUsuario.map(ur => ur.rolesAsignados);

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
    const { nombres, apellidos, correo, contrasena, nuevaPassword } = req.body;
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
      const esValida = await usuario.validarPassword(contrasena);
      if (!esValida) {
        return res.status(400).json({
          mensaje: 'La contraseña actual es incorrecta',
          error: true
        });
      }
    }

    // Verificar si el correo ya está en uso por otro usuario
    if (correo && correo !== usuario.correo) {
      const existeEmail = await Usuario.findOne({
        where: {
          correo,
          id: { [Op.ne]: usuarioId }
        }
      });

      if (existeEmail) {
        return res.status(400).json({
          mensaje: 'El correo electrónico ya está en uso por otro usuario',
          error: true
        });
      }
    }

    // Actualizar los campos
    const datosActualizacion = {};
    if (nombres) datosActualizacion.nombres = nombres;
    if (apellidos) datosActualizacion.apellidos = apellidos;
    if (correo) datosActualizacion.correo = correo;
    if (nuevaPassword) datosActualizacion.contrasena = nuevaPassword; // El hash se maneja en el hook beforeUpdate

    await usuario.update(datosActualizacion);

    // Obtener el usuario actualizado sin la contraseña
    const usuarioActualizado = await Usuario.findByPk(usuario.id, {
      attributes: { exclude: ['contrasena'] },
      include: [
        {
          model: UsuarioRol,
          as: 'rolesAsignados',
          where: { activo: true },
          required: false
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
