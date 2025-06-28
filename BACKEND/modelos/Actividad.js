const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Actividad
 * Registra las actividades del sistema para el historial y auditoría
 */
const Actividad = sequelize.define('Actividad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM(
      'login', 'logout', 'creacion', 'actualizacion', 'eliminacion',
      'carga_masiva', 'descarga', 'cambio_estado', 'error'
    ),
    allowNull: false
  },
  modulo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Módulo del sistema donde ocurrió la actividad (ej: usuarios, ciclos, asignaciones)'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  datos_adicionales: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales en formato JSON para auditoría'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  ip_origen: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Dirección IP del usuario que realizó la acción'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User-Agent del navegador del usuario'
  }
}, {
  tableName: 'actividades',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      fields: ['tipo']
    },
    {
      fields: ['modulo']
    },
    {
      fields: ['usuario_id']
    },
    {
      fields: ['fecha_creacion']
    }
  ]
});

module.exports = Actividad;
