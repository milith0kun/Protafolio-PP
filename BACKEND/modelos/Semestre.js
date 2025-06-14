const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Semestre según el esquema SQL
 * Tabla: semestres
 */
const Semestre = sequelize.define('Semestre', {
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
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
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
  tableName: 'semestres',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['ciclo_id', 'codigo'],
      name: 'unique_ciclo_codigo'
    },
    {
      fields: ['ciclo_id'],
      name: 'idx_ciclo_id'
    },
    {
      fields: ['activo'],
      name: 'idx_activo'
    }
  ]
});

module.exports = Semestre;
