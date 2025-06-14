const { Asignatura, CicloAcademico, Usuario } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../../config/logger');
const { registrarError } = require('./utils');

/**
 * Procesa el archivo Excel de asignaturas
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

        // Obtener todos los ciclos académicos para referencia
        const ciclos = await CicloAcademico.findAll({
            attributes: ['id', 'nombre'],
            transaction
        });

        const ciclosPorNombre = {};
        ciclos.forEach(ciclo => {
            ciclosPorNombre[ciclo.nombre] = ciclo.id;
        });

        for (let i = 0; i < data.length; i++) {
            try {
                const fila = data[i];
                const { 
                    codigo,
                    nombre,
                    carrera,
                    semestre,
                    anio,
                    creditos,
                    tipo = 'obligatorio',
                    ciclo_academico,
                    prerequisitos = '',
                    estado = 'activo'
                } = fila;

                // Validar campos requeridos
                if (!codigo || !nombre || !creditos || !ciclo_academico) {
                    throw new Error('Faltan campos requeridos (codigo, nombre, creditos, ciclo_academico)');
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

                // Validar valores numéricos
                if (isNaN(parseInt(creditos))) {
                    throw new Error('El campo creditos debe ser un valor numérico');
                }

                // Buscar asignatura existente por código y ciclo
                const [asignatura, created] = await Asignatura.findOrCreate({
                    where: { 
                        codigo,
                        ciclo_id: cicloId
                    },
                    defaults: {
                        nombre,
                        codigo,
                        carrera: carrera || '',
                        semestre: semestre || 0,
                        anio: anio || new Date().getFullYear(),
                        creditos: parseInt(creditos),
                        tipo,
                        ciclo_id: cicloId,
                        prerequisitos,
                        activo: estado === 'activo' ? 1 : 0,
                        creado_por: adminId
                    },
                    transaction
                });

                // Si la asignatura ya existe, actualizarla
                if (!created) {
                    await asignatura.update({
                        nombre,
                        carrera: carrera || asignatura.carrera,
                        semestre: semestre || asignatura.semestre,
                        anio: anio || asignatura.anio,
                        creditos: parseInt(creditos),
                        tipo: tipo || asignatura.tipo,
                        prerequisitos: prerequisitos || asignatura.prerequisitos,
                        activo: estado === 'activo' ? 1 : 0,
                        actualizado_por: adminId
                    }, { transaction });
                    resultados.actualizadas++;
                } else {
                    resultados.creadas++;
                }
            } catch (error) {
                logger.error(`Error en fila ${i + 2} de asignaturas:`, error);
                resultados.errores.push({
                    fila: i + 2,
                    valores: data[i],
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de asignaturas completado: ${resultados.creadas} creadas, ${resultados.actualizadas} actualizadas, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'procesarAsignaturas');
        throw new Error(`Error al procesar el archivo de asignaturas: ${error.message}`);
    }
};

module.exports = {
    procesar
};
