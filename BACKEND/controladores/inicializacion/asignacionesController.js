const { Asignatura, Usuario, UsuarioRol, Asignacion, CicloAcademico } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../../config/logger');
const { registrarError } = require('./utils');

/**
 * Procesa el archivo Excel de asignaciones docente-asignatura
 * @param {Object} archivo - Archivo Excel subido
 * @param {Object} transaction - Transacción de la base de datos
 * @returns {Object} Resultados del procesamiento
 */
const procesar = async (archivo, transaction) => {
    try {
        const workbook = XLSX.readFile(archivo.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const resultados = {
            total: data.length,
            creadas: 0,
            actualizadas: 0,
            errores: []
        };

        // Obtener el ID del administrador para el campo creado_por
        const admin = await Usuario.findOne({
            where: { correo: 'admin@unsaac.edu.pe' },
            transaction
        });

        if (!admin) {
            throw new Error('No se encontró un usuario administrador para registrar los cambios');
        }

        const adminId = admin.id;

        // Obtener el ID del rol de docente
        const rolDocente = await UsuarioRol.findOne({
            where: { 
                nombre: 'docente',
                activo: true
            },
            transaction
        });

        if (!rolDocente) {
            throw new Error('No se encontró el rol de docente en el sistema');
        }

        const rolDocenteId = rolDocente.id;

        // Obtener todos los ciclos académicos para referencia
        const ciclos = await CicloAcademico.findAll({
            attributes: ['id', 'nombre'],
            transaction
        });

        const ciclosPorNombre = {};
        ciclos.forEach(ciclo => {
            ciclosPorNombre[ciclo.nombre] = ciclo.id;
        });

        // Obtener todas las asignaturas para referencia
        const asignaturas = await Asignatura.findAll({
            attributes: ['id', 'codigo', 'nombre', 'ciclo_id'],
            transaction
        });

        // Crear un mapa para buscar asignaturas por código y ciclo
        const asignaturasPorCodigoYCiclo = {};
        asignaturas.forEach(asignatura => {
            const key = `${asignatura.codigo}_${asignatura.ciclo_id}`;
            asignaturasPorCodigoYCiclo[key] = asignatura.id;
        });

        for (let i = 0; i < data.length; i++) {
            try {
                const fila = data[i];
                const { 
                    codigo_asignatura,
                    ciclo_academico,
                    correo_docente,
                    grupo = 'A',
                    estado = 'activo'
                } = fila;

                // Validar campos requeridos
                if (!codigo_asignatura || !ciclo_academico || !correo_docente) {
                    throw new Error('Faltan campos requeridos (codigo_asignatura, ciclo_academico, correo_docente)');
                }

                // Validar que el ciclo académico exista
                let cicloId = null;
                
                if (typeof ciclo_academico === 'number') {
                    // Si es un ID numérico
                    const ciclo = ciclos.find(c => c.id === ciclo_academico);
                    if (ciclo) cicloId = ciclo.id;
                } else if (typeof ciclo_academico === 'string') {
                    // Si es un nombre de ciclo
                    cicloId = ciclosPorNombre[ciclo_academico];
                }

                if (!cicloId) {
                    throw new Error(`No se encontró el ciclo académico: ${ciclo_academico}`);
                }

                // Buscar la asignatura por código y ciclo
                const asignaturaKey = `${codigo_asignatura}_${cicloId}`;
                const asignaturaId = asignaturasPorCodigoYCiclo[asignaturaKey];

                if (!asignaturaId) {
                    throw new Error(`No se encontró la asignatura con código ${codigo_asignatura} en el ciclo ${ciclo_academico}`);
                }

                // Buscar el docente por correo
                const docente = await Usuario.findOne({
                    where: { 
                        correo: correo_docente,
                        estado: 'activo'
                    },
                    transaction
                });

                if (!docente) {
                    throw new Error(`No se encontró el docente con correo ${correo_docente}`);
                }

                // Verificar que el usuario tenga rol de docente
                const tieneRolDocente = await docente.hasRol(rolDocenteId, { transaction });
                
                if (!tieneRolDocente) {
                    // Asignar rol de docente si no lo tiene
                    await docente.addRol(rolDocenteId, { 
                        through: { 
                            activo: true,
                            creado_por: adminId
                        },
                        transaction 
                    });
                    logger.info(`Rol de docente asignado a: ${correo_docente}`);
                }

                // Buscar asignación existente
                const [asignacion, created] = await Asignacion.findOrCreate({
                    where: { 
                        asignatura_id: asignaturaId,
                        docente_id: docente.id,
                        grupo
                    },
                    defaults: {
                        asignatura_id: asignaturaId,
                        docente_id: docente.id,
                        grupo,
                        activo: estado === 'activo' ? 1 : 0,
                        creado_por: adminId
                    },
                    transaction
                });

                // Si la asignación ya existe, actualizarla
                if (!created) {
                    await asignacion.update({
                        activo: estado === 'activo' ? 1 : 0,
                        actualizado_por: adminId
                    }, { transaction });
                    resultados.actualizadas++;
                } else {
                    resultados.creadas++;
                }
            } catch (error) {
                logger.error(`Error en fila ${i + 2} de asignaciones:`, error);
                resultados.errores.push({
                    fila: i + 2,
                    valores: data[i],
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de asignaciones completado: ${resultados.creadas} creadas, ${resultados.actualizadas} actualizadas, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'procesarAsignaciones');
        throw new Error(`Error al procesar el archivo de asignaciones: ${error.message}`);
    }
};

module.exports = {
    procesar
};
