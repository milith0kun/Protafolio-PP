const { Usuario, UsuarioRol } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../../config/logger');
const { registrarError } = require('./utils');

/**
 * Procesa el archivo Excel de verificadores
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
            procesados: 0,
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

        // Obtener el ID del rol de verificador
        const rolVerificador = await UsuarioRol.findOne({
            where: { 
                nombre: 'verificador',
                activo: true
            },
            transaction
        });

        if (!rolVerificador) {
            throw new Error('No se encontró el rol de verificador en el sistema');
        }

        const rolVerificadorId = rolVerificador.id;

        for (let i = 0; i < data.length; i++) {
            try {
                const fila = data[i];
                const { 
                    correo,
                    dni,
                    nombres,
                    apellidos,
                    departamento,
                    categoria,
                    especialidad,
                    area_verificacion
                } = fila;

                // Validar campos requeridos
                if (!correo || !nombres || !apellidos) {
                    throw new Error('Faltan campos requeridos (correo, nombres, apellidos)');
                }

                // Validar formato de correo
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                    throw new Error('Formato de correo electrónico inválido');
                }

                // Buscar si el usuario ya existe
                let usuario = await Usuario.findOne({
                    where: { 
                        [Op.or]: [
                            { correo },
                            { dni: dni || null }
                        ]
                    },
                    transaction
                });

                // Si no existe, crearlo
                if (!usuario) {
                    // Generar contraseña por defecto (primeras 4 letras del apellido + últimos 4 dígitos del DNI)
                    let contrasenaDefault = 'Verificador123';
                    if (apellidos && dni) {
                        const prefijo = apellidos.substring(0, 4).toLowerCase();
                        const sufijo = dni.substring(dni.length - 4);
                        contrasenaDefault = `${prefijo}${sufijo}`;
                    }

                    usuario = await Usuario.create({
                        nombres,
                        apellidos,
                        correo,
                        dni: dni || null,
                        contrasena: contrasenaDefault, // En producción, esto debería encriptarse
                        departamento: departamento || null,
                        categoria: categoria || null,
                        especialidad: especialidad || null,
                        area_verificacion: area_verificacion || null,
                        estado: 'activo',
                        creado_por: adminId
                    }, { transaction });

                    logger.info(`Usuario verificador creado: ${correo}`);
                } else {
                    // Actualizar información del verificador
                    await usuario.update({
                        nombres: nombres || usuario.nombres,
                        apellidos: apellidos || usuario.apellidos,
                        departamento: departamento || usuario.departamento,
                        categoria: categoria || usuario.categoria,
                        especialidad: especialidad || usuario.especialidad,
                        area_verificacion: area_verificacion || usuario.area_verificacion,
                        actualizado_por: adminId
                    }, { transaction });

                    logger.info(`Usuario verificador actualizado: ${correo}`);
                }

                // Asignar rol de verificador si no lo tiene
                const tieneRolVerificador = await usuario.hasRol(rolVerificadorId, { transaction });
                
                if (!tieneRolVerificador) {
                    await usuario.addRol(rolVerificadorId, { 
                        through: { 
                            activo: true,
                            creado_por: adminId
                        },
                        transaction 
                    });
                    logger.info(`Rol de verificador asignado a: ${correo}`);
                }

                resultados.procesados++;
            } catch (error) {
                logger.error(`Error en fila ${i + 2} de verificadores:`, error);
                resultados.errores.push({
                    fila: i + 2,
                    valores: data[i],
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de verificadores completado: ${resultados.procesados} procesados, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'procesarVerificadores');
        throw new Error(`Error al procesar el archivo de verificadores: ${error.message}`);
    }
};

module.exports = {
    procesar
};
