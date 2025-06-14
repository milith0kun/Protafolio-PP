const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Ciclo Académico según el esquema SQL
 * Tabla: ciclos_academicos
 */
const CicloAcademico = sequelize.define('CicloAcademico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('preparacion', 'activo', 'cerrado', 'archivado'),
    defaultValue: 'preparacion'
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_cierre_real: {
    type: DataTypes.DATE,
    allowNull: true
  },
  semestre_actual: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  anio_actual: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  cerrado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  configuracion: {
    type: DataTypes.JSON,
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
  tableName: 'ciclos_academicos',
  timestamps: false,
  indexes: [
    {
      fields: ['estado'],
      name: 'idx_estado'
    },
    {
      fields: ['fecha_inicio'],
      name: 'idx_fecha_inicio'
    },
    {
      fields: ['semestre_actual', 'anio_actual'],
      name: 'idx_semestre_anio'
    }
  ]
});

module.exports = CicloAcademico;
