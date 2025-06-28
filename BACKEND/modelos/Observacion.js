/**
 * Modelo Observacion
 * Representa una observación realizada por un verificador a un archivo subido
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Observacion = sequelize.define('Observacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la observación'
    },
    archivo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'archivos_subidos',
            key: 'id'
        },
        comment: 'ID del archivo sobre el que se realiza la observación'
    },
    verificador_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'ID del usuario verificador que realiza la observación'
    },
    tipo: {
        type: DataTypes.ENUM('general', 'correccion', 'aprobacion', 'rechazo'),
        defaultValue: 'general',
        comment: 'Tipo de observación: general, corrección, aprobación o rechazo'
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Contenido detallado de la observación'
    },
    estado: {
        type: DataTypes.ENUM('activa','resuelta','archivada'),
        defaultValue: 'activa'
    },
    prioridad: {
        type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
        defaultValue: 'media',
        comment: 'Nivel de prioridad de la observación'
    },
    es_publica: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Indica si la observación es visible para todos los usuarios con acceso al archivo'
    },
    requiere_respuesta: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si la observación requiere una respuesta obligatoria'
    },
    respondida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si la observación ya ha sido respondida'
    },
    fecha_resolucion: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora en que se resolvió la observación (si aplica)'
    },
    resuelto_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'ID del usuario que marcó como resuelta la observación'
    }
}, {
    tableName: 'observaciones',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    comment: 'Almacena las observaciones realizadas sobre archivos subidos al sistema',
    indexes: [
        {
            fields: ['archivo_id', 'tipo'],
            name: 'idx_archivo_tipo'
        },
        {
            fields: ['verificador_id'],
            name: 'idx_verificador'
        },
        {
            fields: ['estado'],
            name: 'idx_estado'
        },
        {
            fields: ['prioridad'],
            name: 'idx_prioridad'
        },
        {
            fields: ['respondida'],
            name: 'idx_respondida'
        }
    ]
});

module.exports = Observacion;
