/**
 * Modelo RespuestaObservacion
 * Representa una respuesta a una observación realizada por un usuario
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RespuestaObservacion = sequelize.define('RespuestaObservacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la respuesta'
    },
    observacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'observaciones',
            key: 'id'
        },
        comment: 'ID de la observación a la que se responde'
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'ID del usuario que realiza la respuesta'
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Contenido de la respuesta a la observación'
    },
    es_solucion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si esta respuesta resuelve la observación'
    },
    adjunto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'archivos_subidos',
            key: 'id'
        },
        comment: 'ID del archivo adjunto a la respuesta (opcional)'
    }
}, {
    tableName: 'respuestas_observaciones',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
    comment: 'Almacena las respuestas a las observaciones realizadas en el sistema',
    indexes: [
        {
            fields: ['observacion_id'],
            name: 'idx_observacion'
        },
        {
            fields: ['usuario_id'],
            name: 'idx_usuario'
        },
        {
            fields: ['es_solucion'],
            name: 'idx_solucion'
        }
    ]
});

module.exports = RespuestaObservacion;
