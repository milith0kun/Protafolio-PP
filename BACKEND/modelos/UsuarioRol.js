const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');

/**
 * Modelo de UsuarioRol adaptado al esquema SQL definitivo
 * Tabla: usuarios_roles
 */
const UsuarioRol = sequelize.define('UsuarioRol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  rol: {
    type: DataTypes.ENUM('docente', 'verificador', 'administrador'),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: 1
  },
  asignado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_revocacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuarios_roles',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'rol', 'activo'],
      name: 'unique_usuario_rol_activo'
    },
    {
      fields: ['usuario_id', 'rol'],
      name: 'idx_usuario_rol'
    }
  ]
});

// Las relaciones se definen en el archivo asociaciones.js
// Esto evita referencias circulares y mantiene la consistencia

module.exports = UsuarioRol;