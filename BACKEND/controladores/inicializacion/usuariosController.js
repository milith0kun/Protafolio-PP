const { Usuario } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const logger = require('../../config/logger');

/**
 * Procesa el archivo Excel de usuarios
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

        if (!admin) {
            throw new Error('No se encontró un usuario administrador para registrar los cambios');
        }

        const adminId = admin.id;

        for (let i = 0; i < data.length; i++) {
            try {
                const fila = data[i];
                const { 
                    nombres, 
                    apellidos, 
                    correo, 
                    contrasena = 'defaultPassword123', // Contraseña por defecto que el usuario deberá cambiar
                    estado = 'activo',
                    dni,
                    telefono = ''
                } = fila;

                // Validar campos requeridos
                if (!nombres || !apellidos || !correo) {
                    throw new Error('Faltan campos requeridos (nombres, apellidos, correo)');
                }

                // Validar formato de correo
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                    throw new Error('Formato de correo electrónico inválido');
                }

                // Validar DNI si está presente
                if (dni && (isNaN(dni) || dni.length !== 8)) {
                    throw new Error('DNI debe tener 8 dígitos numéricos');
                }

                // Encriptar contraseña
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(contrasena, salt);

                // Buscar usuario existente por correo o DNI
                const whereClause = { [Op.or]: [] };
                if (correo) whereClause[Op.or].push({ correo });
                if (dni) whereClause[Op.or].push({ dni });

                const [usuario, created] = await Usuario.findOrCreate({
                    where: whereClause[Op.or].length ? whereClause : { correo },
                    defaults: {
                        nombres,
                        apellidos,
                        correo,
                        dni: dni || null,
                        telefono,
                        contrasena: hashedPassword,
                        estado,
                        creado_por: adminId
                    },
                    transaction
                });

                // Si el usuario ya existe, actualizarlo
                if (!created) {
                    // No actualizamos la contraseña a menos que se proporcione una nueva
                    const updateData = {
                        nombres,
                        apellidos,
                        dni: dni || usuario.dni,
                        telefono: telefono || usuario.telefono,
                        estado: estado || usuario.estado,
                        actualizado_por: adminId
                    };

                    // Solo actualizar la contraseña si se proporciona una nueva
                    if (contrasena && contrasena !== 'defaultPassword123') {
                        updateData.contrasena = hashedPassword;
                    }

                    await usuario.update(updateData, { transaction });
                    resultados.actualizados++;
                } else {
                    resultados.creados++;
                }
            } catch (error) {
                logger.error(`Error en fila ${i + 2}:`, error);
                resultados.errores.push({
                    fila: i + 2,
                    valores: data[i],
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de usuarios completado: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        logger.error('Error en procesarUsuarios:', error);
        throw new Error(`Error al procesar el archivo de usuarios: ${error.message}`);
    }
};

module.exports = {
    procesar
};
