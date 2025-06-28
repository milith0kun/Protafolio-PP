const { CodigoInstitucional, Usuario } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../../config/logger');
const { registrarError } = require('./utils');

/**
 * Procesa el archivo Excel de códigos institucionales
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

        // Obtener el ID del administrador para el campo creado_por
        const admin = await Usuario.findOne({
            where: { correo: 'admin@unsaac.edu.pe' },
            transaction
        });

        const adminEmail = admin ? admin.correo : 'admin@unsaac.edu.pe';

        for (let i = 0; i < data.length; i++) {
            try {
                const fila = data[i];
                const { 
                    codigo,
                    descripcion,
                    tipo,
                    estado = 'ACTIVO',
                    creado_por = adminEmail,
                    actualizado_por
                } = fila;

                // Validar campos requeridos
                if (!codigo || !descripcion || !tipo) {
                    throw new Error('Faltan campos requeridos (codigo, descripcion, tipo)');
                }

                // Validar tipo
                const tiposValidos = ['REGULACION', 'CONVENIO', 'ACTA', 'OFICIO', 'MEMORANDUM', 'CIRCULAR', 'RESOLUCION', 'MANUAL'];
                if (!tiposValidos.includes(tipo.toUpperCase())) {
                    throw new Error(`Tipo inválido: ${tipo}. Debe ser uno de: ${tiposValidos.join(', ')}`);
                }

                // Buscar si el código institucional ya existe
                const [codigoInstitucional, created] = await CodigoInstitucional.findOrCreate({
                    where: { codigo },
                    defaults: {
                        codigo,
                        descripcion,
                        tipo: tipo.toUpperCase(),
                        estado: estado.toUpperCase(),
                        creado_por: creado_por || adminEmail,
                        actualizado_por: actualizado_por || adminEmail
                    },
                    transaction
                });

                // Si ya existe, actualizarlo
                if (!created) {
                    await codigoInstitucional.update({
                        descripcion,
                        tipo: tipo.toUpperCase(),
                        estado: estado.toUpperCase(),
                        actualizado_por: actualizado_por || adminEmail
                    }, { transaction });

                    resultados.actualizados++;
                    logger.info(`Código institucional actualizado: ${codigo} - ${descripcion}`);
                } else {
                    resultados.creados++;
                    logger.info(`Código institucional creado: ${codigo} - ${descripcion}`);
                }
            } catch (error) {
                const mensajeError = `Error en fila ${i + 1}: ${error.message}`;
                resultados.errores.push({
                    fila: i + 1,
                    mensaje: error.message,
                    data: data[i]
                });
                logger.error(mensajeError);
                registrarError(error, 'procesarCodigosInstitucionales');
            }
        }

        return resultados;
    } catch (error) {
        logger.error(`Error al procesar archivo de códigos institucionales: ${error.message}`, { error });
        throw error;
    }
};

module.exports = {
    procesar
};
