/**
 * Modelo ArchivoCargaMasiva
 * Representa un archivo de carga masiva asociado a un ciclo académico
 * Utilizado para persistir archivos de inicialización del sistema
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo ArchivoCargaMasiva
 * Almacena archivos de carga masiva por ciclo académico
 */
const ArchivoCargaMasiva = sequelize.define('ArchivoCargaMasiva', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ciclo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ciclos_academicos',
            key: 'id'
        },
        comment: 'ID del ciclo académico al que pertenece'
    },
    tipo_archivo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Tipo: usuarios, carreras, asignaturas, carga_academica, verificaciones, codigos_institucionales'
    },
    nombre_original: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre original del archivo subido por el usuario'
    },
    nombre_sistema: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre único generado por el sistema para el archivo'
    },
    ruta_archivo: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Ruta donde se almacena el archivo en el sistema de archivos'
    },
    tamanio_bytes: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Tamaño del archivo en bytes'
    },
    registros_procesados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Número de registros procesados exitosamente'
    },
    registros_errores: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Número de registros con errores durante el procesamiento'
    },
    estado: {
        type: DataTypes.ENUM('procesado', 'error', 'activo', 'archivado'),
        defaultValue: 'procesado',
        comment: 'Estado actual del archivo en el sistema'
    },
    detalles_procesamiento: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Detalles del procesamiento en formato JSON'
    },
    hash_archivo: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'Hash SHA-256 del archivo para verificación de integridad'
    },
    subido_por: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'ID del administrador que subió el archivo'
    },
    fecha_subida: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha y hora de subida del archivo'
    },
    fecha_procesamiento: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora de procesamiento del archivo'
    }
}, {
    tableName: 'archivos_carga_masiva',
    timestamps: true,
    createdAt: 'fecha_subida',
    updatedAt: 'actualizado_en',
    comment: 'Almacena archivos de carga masiva asociados a ciclos académicos',
    indexes: [
        {
            fields: ['ciclo_id', 'tipo_archivo'],
            name: 'idx_ciclo_tipo'
        },
        {
            fields: ['estado'],
            name: 'idx_estado'
        },
        {
            fields: ['subido_por'],
            name: 'idx_subido_por'
        },
        {
            fields: ['fecha_subida'],
            name: 'idx_fecha_subida'
        },
        {
            fields: ['hash_archivo'],
            name: 'idx_hash'
        }
    ]
});

/**
 * Métodos de instancia
 */
ArchivoCargaMasiva.prototype.formatearTamano = function() {
    const bytes = this.tamanio_bytes;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

ArchivoCargaMasiva.prototype.obtenerResumenProcesamiento = function() {
    const total = this.registros_procesados + this.registros_errores;
    const porcentajeExito = total > 0 ? ((this.registros_procesados / total) * 100).toFixed(1) : 0;
    
    return {
        total: total,
        procesados: this.registros_procesados,
        errores: this.registros_errores,
        porcentaje_exito: porcentajeExito,
        estado: this.estado
    };
};

/**
 * Métodos estáticos
 */
ArchivoCargaMasiva.obtenerPorCiclo = async function(cicloId) {
    return await this.findAll({
        where: {
            ciclo_id: cicloId,
            estado: ['activo', 'procesado']
        },
        order: [['fecha_subida', 'DESC']],
        include: [
            {
                model: sequelize.models.Usuario,
                as: 'subidoPor',
                attributes: ['id', 'nombres', 'apellidos', 'correo']
            },
            {
                model: sequelize.models.CicloAcademico,
                as: 'ciclo',
                attributes: ['id', 'nombre', 'estado']
            }
        ]
    });
};

ArchivoCargaMasiva.obtenerArchivoActivo = async function(cicloId, tipoArchivo) {
    return await this.findOne({
        where: {
            ciclo_id: cicloId,
            tipo_archivo: tipoArchivo,
            estado: 'activo'
        },
        order: [['fecha_subida', 'DESC']]
    });
};

ArchivoCargaMasiva.archivarAnteriores = async function(cicloId, tipoArchivo, transaction = null) {
    return await this.update(
        { estado: 'archivado' },
        {
            where: {
                ciclo_id: cicloId,
                tipo_archivo: tipoArchivo,
                estado: 'activo'
            },
            transaction
        }
    );
};

module.exports = ArchivoCargaMasiva; 