/**
 * Archivo de asociaciones entre modelos
 * Define todas las relaciones entre los modelos de la aplicación
 * Actualizado para reflejar exactamente el esquema SQL
 */

const Usuario = require('./Usuario');
const UsuarioRol = require('./UsuarioRol');

// En el esquema SQL, no hay una relación directa entre Usuario y Rol
// La relación es a través de la tabla usuarios_roles (modelo UsuarioRol)

// Un usuario puede tener múltiples roles a través de UsuarioRol
Usuario.hasMany(UsuarioRol, {
  foreignKey: 'usuario_id',
  as: 'rolesAsignados'
});

UsuarioRol.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// También necesitamos asociar UsuarioRol con el usuario que asignó el rol
UsuarioRol.belongsTo(Usuario, {
  foreignKey: 'asignado_por',
  as: 'asignadoPor'
});

// En el modelo UsuarioRol, el campo rol es un ENUM, no una clave foránea
// Por lo tanto, no hay una asociación directa con la tabla roles
// La asociación se maneja a través del campo rol que es un ENUM con los valores de los roles

// Estas asociaciones reflejan exactamente las relaciones en el esquema SQL
// donde usuarios_roles tiene referencias a usuarios(id) tanto para usuario_id como para asignado_por

module.exports = {
  Usuario,
  UsuarioRol
};
