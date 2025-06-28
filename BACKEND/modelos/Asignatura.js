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
    type: DataTypes.STRING(50),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  carrera: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  semestre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  creditos: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  horas_teoricas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tipo: {
    type: DataTypes.ENUM('teoria', 'practica', 'laboratorio'),
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
  prerequisitos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    field: 'actualizado_en'
  }
}, {
  tableName: 'asignaturas',
  timestamps: false,
  indexes: [
    {
      fields: ['codigo'],
      name: 'idx_codigo'
    },
    // Se eliminó el índice idx_departamento porque la columna 'departamento_academico' no existe en la tabla real
    // Se eliminó el índice idx_escuela porque la columna 'escuela_profesional' no existe en la tabla real
    // Se eliminó el índice idx_facultad porque la columna 'facultad' no existe en la tabla real
  ]
});

module.exports = Asignatura;
