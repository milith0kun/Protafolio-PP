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
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ciclo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ciclos_academicos',
      key: 'id'
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'semestres',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['nombre', 'ciclo_id'],
      name: 'unique_nombre_ciclo'
    },
    {
      fields: ['ciclo_id', 'activo'],
      name: 'idx_ciclo_activo'
    }
  ]
});

module.exports = Semestre;
