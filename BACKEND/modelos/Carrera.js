const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Carrera = sequelize.define('Carrera', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [1, 20]
        }
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    facultad: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    duracion_semestres: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            min: 1,
            max: 20
        }
    },
    grado_otorgado: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'carreras',
    timestamps: true,
    paranoid: false,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
    indexes: [
        {
            name: 'idx_codigo',
            fields: ['codigo']
        },
        {
            name: 'idx_facultad',
            fields: ['facultad']
        },
        {
            name: 'idx_activo',
            fields: ['activo']
        }
    ]
});

module.exports = Carrera; 