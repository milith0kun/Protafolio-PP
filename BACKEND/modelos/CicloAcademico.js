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
    type: DataTypes.ENUM('preparacion', 'inicializacion', 'activo', 'verificacion', 'finalizacion', 'archivado'),
    defaultValue: 'preparacion',
    comment: 'Estados del ciclo: preparacion->inicializacion->activo->verificacion->finalizacion->archivado'
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

/**
 * Métodos de instancia para manejar estados del ciclo
 */
CicloAcademico.prototype.puedeRecibirArchivos = function() {
  return ['preparacion', 'inicializacion'].includes(this.estado);
};

CicloAcademico.prototype.estaEnVerificacion = function() {
  return this.estado === 'verificacion';
};

CicloAcademico.prototype.puedeSerActivado = function() {
  return this.estado === 'preparacion';
};

CicloAcademico.prototype.puedeSerFinalizado = function() {
  return this.estado === 'verificacion';
};

/**
 * Métodos de clase para consultas específicas
 */
CicloAcademico.obtenerCicloActivo = async function() {
  return await this.findOne({
    where: { estado: 'activo' }
  });
};

CicloAcademico.obtenerCicloEnVerificacion = async function() {
  return await this.findOne({
    where: { estado: 'verificacion' }
  });
};

CicloAcademico.obtenerCiclosEnPreparacion = async function() {
  return await this.findAll({
    where: { estado: 'preparacion' },
    order: [['fecha_inicio', 'ASC']]
  });
};

CicloAcademico.obtenerCiclosFinalizados = async function() {
  return await this.findAll({
    where: { estado: 'finalizacion' },
    order: [['fecha_fin', 'DESC']]
  });
};

/**
 * Transiciones de estado
 */
CicloAcademico.prototype.iniciarInicializacion = async function() {
  if (this.estado !== 'preparacion') {
    throw new Error('Solo se puede inicializar un ciclo en preparación');
  }
  this.estado = 'inicializacion';
  return await this.save();
};

CicloAcademico.prototype.activar = async function() {
  if (this.estado !== 'inicializacion') {
    throw new Error('Solo se puede activar un ciclo después de la inicialización');
  }
  this.estado = 'activo';
  return await this.save();
};

CicloAcademico.prototype.iniciarVerificacion = async function() {
  if (this.estado !== 'activo') {
    throw new Error('Solo se puede iniciar verificación de un ciclo activo');
  }
  
  // Verificar que no haya otro ciclo en verificación
  const cicloEnVerificacion = await CicloAcademico.obtenerCicloEnVerificacion();
  if (cicloEnVerificacion && cicloEnVerificacion.id !== this.id) {
    throw new Error('Solo puede haber un ciclo en verificación a la vez');
  }
  
  this.estado = 'verificacion';
  return await this.save();
};

CicloAcademico.prototype.finalizar = async function() {
  if (this.estado !== 'verificacion') {
    throw new Error('Solo se puede finalizar un ciclo en verificación');
  }
  this.estado = 'finalizacion';
  this.fecha_cierre_real = new Date();
  return await this.save();
};

module.exports = CicloAcademico;
