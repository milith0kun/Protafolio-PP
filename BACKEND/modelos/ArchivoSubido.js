/**
 * Modelo ArchivoSubido
 * Representa un archivo subido por un usuario al sistema
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo ArchivoSubido
 * Representa un archivo subido al sistema
 */
const ArchivoSubido = sequelize.define('ArchivoSubido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    portafolio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'portafolios',
            key: 'id'
        }
    },
    nombre_original: {
        type: DataTypes.STRING(300),
        allowNull: false,
        comment: 'Nombre original del archivo subido por el usuario'
    },
    nombre_sistema: {
        type: DataTypes.STRING(300),
        allowNull: false,
        comment: 'Nombre único generado por el sistema para el archivo'
    },
    ruta: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Ruta relativa donde se almacena el archivo en el sistema de archivos'
    },
    tipo_mime: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tipo MIME del archivo (ej: application/pdf, image/jpeg, etc.)'
    },
    formato: {
        type: DataTypes.ENUM('pdf', 'docx', 'xlsx', 'pptx', 'txt', 'jpg', 'png', 'otros'),
        allowNull: false
    },
    tamanio: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Tamaño del archivo en bytes'
    },
    estructura_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'estructura_portafolio_base',
            key: 'id'
        }
    },
    estado: {
        type: DataTypes.ENUM('pendiente','aprobado','rechazado','corregido','activo','eliminado','revisado','observado'),
        defaultValue: 'pendiente',
        comment: 'Estado actual del archivo en el sistema'
    },
    verificado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    fecha_verificacion: {
        type: DataTypes.DATE,
        allowNull: true
        },
    comentarios: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Número de versión del archivo (para control de versiones)'
    },
    hash_contenido: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'Hash SHA-256 del contenido del archivo para verificación de integridad'
    },
    subido_por: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'Usuario que subió el archivo'
    }
}, {
    tableName: 'archivos_subidos',
    timestamps: true,
    createdAt: 'subido_en',
    updatedAt: 'actualizado_en',
    comment: 'Almacena los archivos subidos al sistema',
    indexes: [
        {
            fields: ['portafolio_id', 'estructura_id'],
            name: 'idx_portafolio_estructura'
        },
        {
            fields: ['estado'],
            name: 'idx_estado'
        },
        {
            fields: ['verificado_por'],
            name: 'idx_verificado_por'
        },
        {
            fields: ['subido_por'],
            name: 'idx_subido_por'
        },
        {
            fields: ['hash_contenido'],
            name: 'idx_hash'
        }
    ]
});

module.exports = ArchivoSubido;
