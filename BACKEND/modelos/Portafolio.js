/**
 * Modelo Portafolio
 * Representa un portafolio docente asociado a una asignatura, docente y ciclo académico
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Portafolio = sequelize.define('Portafolio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    docente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    asignatura_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'asignaturas',
            key: 'id'
        }
    },
    grupo: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Grupo al que pertenece el portafolio (ej: A, B, C, etc.)'
    },
    asignacion_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'docentes_asignaturas',
            key: 'id'
        },
        comment: 'ID de la relación docente-asignatura'
    },
    semestre_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'semestres',
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
    estructura_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'estructura_portafolio_base',
            key: 'id'
        }
    },
    carpeta_padre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'portafolios',
            key: 'id'
        }
    },
    nivel: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ruta: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('activo','bloqueado','archivado'),
        defaultValue: 'activo'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    progreso_completado: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },
    creado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'Usuario que creó el portafolio'
    },
    actualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'Último usuario que actualizó el portafolio'
    }
}, {
    tableName: 'portafolios',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
    indexes: [
        {
            fields: ['docente_id', 'ciclo_id'],
            name: 'idx_docente_ciclo'
        },
        {
            fields: ['asignatura_id', 'ciclo_id'],
            name: 'idx_asignatura_ciclo'
        },
        {
            fields: ['asignacion_id'],
            name: 'idx_asignacion'
        },
        {
            fields: ['estructura_id'],
            name: 'idx_estructura'
        },
        {
            fields: ['estado'],
            name: 'idx_estado'
        },
        {
            fields: ['activo'],
            name: 'idx_activo'
        }
    ]
});

module.exports = Portafolio;
