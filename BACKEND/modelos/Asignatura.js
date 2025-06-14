const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Asignatura según el esquema SQL
 * Tabla: asignaturas
 */
const Asignatura = sequelize.define('Asignatura', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  creditos: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  horas_teoricas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  horas_practicas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ciclo_malla: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  departamento_academico: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  escuela_profesional: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  facultad: {
    type: DataTypes.STRING(255),
    allowNull: true
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
  tableName: 'asignaturas',
  timestamps: false,
  indexes: [
    {
      fields: ['codigo'],
      name: 'idx_codigo'
    },
    {
      fields: ['departamento_academico'],
      name: 'idx_departamento'
    },
    {
      fields: ['escuela_profesional'],
      name: 'idx_escuela'
    },
    {
      fields: ['facultad'],
      name: 'idx_facultad'
    }
  ]
});

module.exports = Asignatura;
