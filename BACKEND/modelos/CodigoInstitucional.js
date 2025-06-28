const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CodigoInstitucional = sequelize.define('CodigoInstitucional', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [1, 50]
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tipo: {
        type: DataTypes.ENUM('REGULACION', 'CONVENIO', 'ACTA', 'OFICIO', 'MEMORANDUM', 'CIRCULAR', 'RESOLUCION', 'MANUAL'),
        allowNull: false,
        validate: {
            isIn: [['REGULACION', 'CONVENIO', 'ACTA', 'OFICIO', 'MEMORANDUM', 'CIRCULAR', 'RESOLUCION', 'MANUAL']]
        }
    },
    estado: {
        type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
        defaultValue: 'ACTIVO',
        allowNull: false
    },
    creado_por: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    actualizado_por: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'codigos_institucionales',
    timestamps: true,
    paranoid: false,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
        {
            name: 'idx_codigo',
            fields: ['codigo']
        },
        {
            name: 'idx_tipo',
            fields: ['tipo']
        },
        {
            name: 'idx_estado',
            fields: ['estado']
        }
    ]
});

module.exports = CodigoInstitucional; 