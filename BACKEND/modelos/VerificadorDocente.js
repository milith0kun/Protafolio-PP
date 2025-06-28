/**
 * Modelo VerificadorDocente
 * Representa la asignación de un verificador a un docente en un ciclo académico
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificadorDocente = sequelize.define('VerificadorDocente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    verificador_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    docente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
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
    asignado_por: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'verificadores_docentes',
    timestamps: true,
    createdAt: 'fecha_asignacion',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['verificador_id', 'docente_id', 'ciclo_id'],
            name: 'unique_verificador_docente_ciclo'
        },
        {
            fields: ['verificador_id', 'ciclo_id'],
            name: 'idx_verificador_ciclo'
        },
        {
            fields: ['docente_id', 'ciclo_id'],
            name: 'idx_docente_ciclo'
        }
    ]
});

module.exports = VerificadorDocente;
