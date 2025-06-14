const { Parametro, CicloAcademico } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../../config/logger');
const { registrarError } = require('./utils');

/**
 * Procesa el archivo Excel de parámetros del sistema
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
            creados: 0,
            actualizados: 0,
            errores: []
        };

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
                    clave,
                    valor,
                    descripcion,
                    ciclo_academico = null,
                    tipo = 'texto',
                    estado = 'activo'
                } = fila;

                // Validar campos requeridos
                if (!clave || !valor) {
                    throw new Error('Faltan campos requeridos (clave, valor)');
                }

                // Validar que el ciclo académico exista si se proporciona
                let cicloId = null;
                
                if (ciclo_academico) {
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
                }

                // Buscar parámetro existente
                const [parametro, created] = await Parametro.findOrCreate({
                    where: { 
                        clave,
                        ciclo_id: cicloId
                    },
                    defaults: {
                        clave,
                        valor,
                        descripcion: descripcion || '',
                        ciclo_id: cicloId,
                        tipo,
                        activo: estado === 'activo' ? 1 : 0
                    },
                    transaction
                });

                // Si el parámetro ya existe, actualizarlo
                if (!created) {
                    await parametro.update({
                        valor,
                        descripcion: descripcion || parametro.descripcion,
                        tipo: tipo || parametro.tipo,
                        activo: estado === 'activo' ? 1 : 0
                    }, { transaction });
                    resultados.actualizados++;
                } else {
                    resultados.creados++;
                }
            } catch (error) {
                logger.error(`Error en fila ${i + 2} de parámetros:`, error);
                resultados.errores.push({
                    fila: i + 2,
                    valores: data[i],
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de parámetros completado: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'procesarParametros');
        throw new Error(`Error al procesar el archivo de parámetros: ${error.message}`);
    }
};

module.exports = {
    procesar
};
