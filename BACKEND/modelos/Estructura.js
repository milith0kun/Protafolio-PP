/**
 * Modelo Estructura
 * Representa la estructura jerárquica de carpetas para los portafolios
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Estructura = sequelize.define('Estructura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    nivel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    requiere_credito: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    carpeta_padre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'estructura_portafolio_base',
            key: 'id'
        }
    },
    pertenece_presentacion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    icono: {
        type: DataTypes.STRING(50),
        defaultValue: 'folder'
    },
    color: {
        type: DataTypes.STRING(20),
        defaultValue: '#007bff'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'estructura_portafolio_base',
    timestamps: false,
    indexes: [
        {
            fields: ['nivel', 'orden'],
            name: 'idx_nivel_orden'
        },
        {
            fields: ['carpeta_padre_id', 'orden'],
            name: 'idx_padre_orden'
        }
    ]
});

module.exports = Estructura;
