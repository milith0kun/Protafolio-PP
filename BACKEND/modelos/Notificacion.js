/**
 * Modelo Notificacion
 * Representa una notificación enviada a un usuario
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    tipo: {
        type: DataTypes.ENUM('sistema', 'documento', 'observacion', 'ciclo', 'asignacion', 'info','exito','advertencia','error'),
        defaultValue: 'sistema'
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    enlace: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    datos_adicionales: {
        type: DataTypes.JSON,
        allowNull: true
    },
    leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    visto: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    archivada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    prioridad: {
        type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
        defaultValue: 'media'
    },
    fecha_expiracion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_lectura: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'notificaciones',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
        {
            fields: ['usuario_id', 'leida'],
            name: 'idx_usuario_leida'
        },
        {
            fields: ['usuario_id'],
            name: 'idx_usuario'
        },
        {
            fields: ['visto'],
            name: 'idx_visto'
        },
        {
            fields: ['tipo'],
            name: 'idx_tipo'
        }
    ]
});

module.exports = Notificacion;
