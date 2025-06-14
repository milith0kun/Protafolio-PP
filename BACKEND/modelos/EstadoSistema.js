const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Estado del Sistema según el esquema SQL
 * Tabla: estados_sistema
 */
const EstadoSistema = sequelize.define('EstadoSistema', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ciclo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ciclos_academicos',
      key: 'id'
    }
  },
  modulo: {
    type: DataTypes.ENUM('carga_datos', 'gestion_documentos', 'verificacion', 'reportes'),
    allowNull: false
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: 1
  },
  fecha_habilitacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_deshabilitacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actualizado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'estados_sistema',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['ciclo_id', 'modulo'],
      name: 'unique_ciclo_modulo'
    },
    {
      fields: ['ciclo_id', 'modulo'],
      name: 'idx_ciclo_modulo'
    }
  ]
});

module.exports = EstadoSistema;
