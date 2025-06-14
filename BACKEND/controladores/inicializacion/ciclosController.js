const { CicloAcademico } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../../config/logger');

/**
 * Procesa el archivo Excel de ciclos académicos
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
        const admin = await require('../../modelos').Usuario.findOne({
            where: { correo: 'admin@unsaac.edu.pe' },
            transaction
        });

        if (!admin) {
            throw new Error('No se encontró un usuario administrador para registrar los cambios');
        }

        const adminId = admin.id;

        for (let i = 0; i < data.length; i++) {
            try {
                const fila = data[i];
                const { 
                    nombre, 
                    descripcion = '', 
                    estado = 'preparacion', 
                    fecha_inicio, 
                    fecha_fin, 
                    semestre_actual, 
                    anio_actual 
                } = fila;

                // Validaciones de campos requeridos
                if (!nombre || !fecha_inicio || !fecha_fin || !semestre_actual || !anio_actual) {
                    throw new Error('Faltan campos requeridos (nombre, fecha_inicio, fecha_fin, semestre_actual, anio_actual)');
                }

                // Validar fechas
                const fechaInicio = new Date(fecha_inicio);
                const fechaFin = new Date(fecha_fin);

                if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
                    throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
                }

                // Verificar si el ciclo ya existe
                const [ciclo, created] = await CicloAcademico.findOrCreate({
                    where: { nombre },
                    defaults: {
                        descripcion,
                        estado,
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        semestre_actual,
                        anio_actual,
                        creado_por: adminId
                    },
                    transaction
                });

                // Si ya existe, actualizarlo
                if (!created) {
                    await ciclo.update({
                        descripcion,
                        estado,
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        semestre_actual,
                        anio_actual,
                        actualizado_por: adminId
                    }, { transaction });
                    resultados.actualizados++;
                } else {
                    resultados.creados++;
                }
            } catch (error) {
                logger.error(`Error en fila ${i + 2}:`, error);
                resultados.errores.push({
                    fila: i + 2, // +2 porque Excel empieza en 1 y la primera fila es el encabezado
                    valores: data[i],
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de ciclos completado: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        logger.error('Error en procesarCiclos:', error);
        throw new Error(`Error al procesar el archivo de ciclos: ${error.message}`);
    }
};

module.exports = {
    procesar
};
