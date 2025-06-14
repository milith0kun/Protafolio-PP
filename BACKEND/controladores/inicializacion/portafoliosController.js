const { Portafolio, Asignatura, Usuario, Asignacion, Estructura, CicloAcademico, Notificacion, UsuarioRol } = require('../../modelos');
const { Op } = require('sequelize');
const logger = require('../../config/logger');
const { registrarError } = require('./utils');

/**
 * Crea o actualiza portafolios basados en las asignaciones docente-asignatura
 * @param {Array} asignaciones - Lista de asignaciones procesadas
 * @param {Object} transaction - Transacción de la base de datos
 * @returns {Object} Resultados del procesamiento
 */
const crearPortafolios = async (asignaciones, transaction) => {
    try {
        const resultados = {
            total: 0,
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

        // Obtener todas las asignaciones activas
        const asignacionesActivas = await Asignacion.findAll({
            where: { activo: 1 },
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura',
                    include: [
                        {
                            model: CicloAcademico,
                            as: 'ciclo'
                        }
                    ]
                },
                {
                    model: Usuario,
                    as: 'docente'
                }
            ],
            transaction
        });

        resultados.total = asignacionesActivas.length;

        // Procesar cada asignación
        for (const asignacion of asignacionesActivas) {
            try {
                const { asignatura, docente } = asignacion;
                const ciclo = asignatura.ciclo;

                // Verificar que la asignatura y el docente existan
                if (!asignatura || !docente || !ciclo) {
                    throw new Error(`Datos incompletos para la asignación ID ${asignacion.id}`);
                }

                // Buscar si ya existe un portafolio para esta asignación
                const [portafolio, created] = await Portafolio.findOrCreate({
                    where: {
                        asignatura_id: asignatura.id,
                        docente_id: docente.id,
                        grupo: asignacion.grupo,
                        ciclo_id: ciclo.id
                    },
                    defaults: {
                        asignatura_id: asignatura.id,
                        docente_id: docente.id,
                        grupo: asignacion.grupo,
                        ciclo_id: ciclo.id,
                        estado: 'pendiente',
                        creado_por: adminId
                    },
                    transaction
                });

                if (created) {
                    resultados.creados++;
                    logger.info(`Portafolio creado para asignatura ${asignatura.codigo} - ${asignatura.nombre}, docente ${docente.correo}, grupo ${asignacion.grupo}`);
                } else {
                    // Actualizar el portafolio existente si es necesario
                    if (portafolio.estado === 'eliminado') {
                        await portafolio.update({
                            estado: 'pendiente',
                            actualizado_por: adminId
                        }, { transaction });
                        resultados.actualizados++;
                        logger.info(`Portafolio reactivado para asignatura ${asignatura.codigo} - ${asignatura.nombre}, docente ${docente.correo}, grupo ${asignacion.grupo}`);
                    }
                }
            } catch (error) {
                logger.error(`Error al crear portafolio para asignación ID ${asignacion.id}:`, error);
                resultados.errores.push({
                    asignacion_id: asignacion.id,
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de portafolios completado: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'crearPortafolios');
        throw new Error(`Error al crear portafolios: ${error.message}`);
    }
};

/**
 * Crea la estructura de carpetas para los portafolios
 * @param {Array} portafolios - Lista de portafolios
 * @param {Object} transaction - Transacción de la base de datos
 * @returns {Object} Resultados del procesamiento
 */
const crearEstructuraPortafolios = async (portafolios, transaction) => {
    try {
        const resultados = {
            total: 0,
            procesados: 0,
            errores: []
        };

        // Obtener todos los portafolios activos si no se proporciona una lista
        const portafoliosActivos = portafolios || await Portafolio.findAll({
            where: { 
                estado: {
                    [Op.in]: ['pendiente', 'en_progreso', 'completo']
                }
            },
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura',
                    include: [
                        {
                            model: CicloAcademico,
                            as: 'ciclo'
                        }
                    ]
                }
            ],
            transaction
        });

        resultados.total = portafoliosActivos.length;

        // Procesar cada portafolio
        for (const portafolio of portafoliosActivos) {
            try {
                const { asignatura } = portafolio;
                const ciclo = asignatura.ciclo;

                // Obtener la estructura base para el ciclo académico
                const estructuras = await Estructura.findAll({
                    where: {
                        ciclo_id: ciclo.id,
                        activo: 1
                    },
                    order: [
                        ['nivel', 'ASC'],
                        ['orden', 'ASC']
                    ],
                    transaction
                });

                if (estructuras.length === 0) {
                    throw new Error(`No se encontró estructura definida para el ciclo ${ciclo.nombre}`);
                }

                // Crear la estructura de carpetas en el sistema de archivos
                const fs = require('fs');
                const path = require('path');
                const UPLOADS_DIR = path.join(__dirname, '../../../uploads/portafolios');
                
                // Crear directorio base para el portafolio
                const portafolioDir = path.join(UPLOADS_DIR, `${ciclo.nombre}`, `${asignatura.codigo}_${asignatura.nombre}`, `grupo_${portafolio.grupo}`);
                
                if (!fs.existsSync(portafolioDir)) {
                    fs.mkdirSync(portafolioDir, { recursive: true });
                }
                
                // Crear estructura jerárquica de carpetas según la estructura definida
                for (const estructura of estructuras) {
                    try {
                        // Determinar la ruta de la carpeta según el nivel y padre
                        let carpetaPath = portafolioDir;
                        
                        if (estructura.nivel === 1) {
                            // Carpeta de primer nivel
                            carpetaPath = path.join(portafolioDir, estructura.nombre);
                        } else {
                            // Buscar la ruta completa basada en la jerarquía de padres
                            const padres = [];
                            let padre = estructura;
                            
                            // Construir la cadena de padres hasta llegar al nivel 1
                            while (padre.padre_id) {
                                const padreObj = estructuras.find(e => e.id === padre.padre_id);
                                if (!padreObj) break;
                                padres.unshift(padreObj.nombre);
                                padre = padreObj;
                            }
                            
                            // Construir la ruta completa
                            let rutaRelativa = '';
                            for (const nombrePadre of padres) {
                                rutaRelativa = path.join(rutaRelativa, nombrePadre);
                            }
                            
                            carpetaPath = path.join(portafolioDir, rutaRelativa, estructura.nombre);
                        }
                        
                        // Crear la carpeta si no existe
                        if (!fs.existsSync(carpetaPath)) {
                            fs.mkdirSync(carpetaPath, { recursive: true });
                        }
                        
                        // Crear archivo README.md con información sobre créditos mínimos si aplica
                        if (estructura.creditos_minimos > 0) {
                            const readmePath = path.join(carpetaPath, 'README.md');
                            const readmeContent = `# ${estructura.nombre}\n\nEsta carpeta requiere un mínimo de ${estructura.creditos_minimos} créditos para ser considerada completa.\n\nTipo: ${estructura.tipo}\nDescripción: ${estructura.descripcion || 'No disponible'}\n`;
                            
                            fs.writeFileSync(readmePath, readmeContent);
                        }
                    } catch (error) {
                        logger.error(`Error al crear carpeta para estructura ${estructura.nombre}:`, error);
                    }
                }
                
                logger.info(`Estructura creada para portafolio ID ${portafolio.id} (${asignatura.codigo} - ${asignatura.nombre})`);
                resultados.procesados++;
            } catch (error) {
                logger.error(`Error al crear estructura para portafolio ID ${portafolio.id}:`, error);
                resultados.errores.push({
                    portafolio_id: portafolio.id,
                    error: error.message
                });
            }
        }

        logger.info(`Procesamiento de estructuras de portafolios completado: ${resultados.procesados} procesados, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'crearEstructuraPortafolios');
        throw new Error(`Error al crear estructuras de portafolios: ${error.message}`);
    }
};

/**
 * Asigna verificadores a los portafolios
 * @param {Array} portafolios - Lista de portafolios
 * @param {Object} transaction - Transacción de la base de datos
 * @returns {Object} Resultados del procesamiento
 */
const asignarVerificadores = async (portafolios, transaction) => {
    try {
        const resultados = {
            total: 0,
            asignados: 0,
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

        // Obtener todos los portafolios activos si no se proporciona una lista
        const portafoliosActivos = portafolios || await Portafolio.findAll({
            where: { 
                estado: {
                    [Op.in]: ['pendiente', 'en_progreso', 'completo']
                },
                verificador_id: null
            },
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura'
                }
            ],
            transaction
        });

        resultados.total = portafoliosActivos.length;

        // Obtener todos los verificadores activos
        const verificadores = await Usuario.findAll({
            include: [
                {
                    model: UsuarioRol,
                    as: 'roles',
                    where: {
                        nombre: 'verificador',
                        activo: true
                    }
                }
            ],
            where: {
                estado: 'activo'
            },
            transaction
        });

        if (verificadores.length === 0) {
            throw new Error('No se encontraron verificadores activos en el sistema');
        }

        // Distribuir los portafolios entre los verificadores de manera equitativa
        // Primero, contar cuántos portafolios tiene asignado cada verificador
        const cargaVerificadores = {};
        for (const verificador of verificadores) {
            const count = await Portafolio.count({
                where: { verificador_id: verificador.id },
                transaction
            });
            cargaVerificadores[verificador.id] = count;
        }

        // Asignar verificadores a los portafolios
        for (const portafolio of portafoliosActivos) {
            try {
                // Encontrar el verificador con menos carga
                let verificadorMenosCarga = null;
                let cargaMinima = Infinity;

                for (const verificador of verificadores) {
                    const carga = cargaVerificadores[verificador.id] || 0;
                    if (carga < cargaMinima) {
                        cargaMinima = carga;
                        verificadorMenosCarga = verificador;
                    }
                }

                if (!verificadorMenosCarga) {
                    throw new Error('No se pudo determinar un verificador para asignar');
                }

                // Asignar el verificador al portafolio
                await portafolio.update({
                    verificador_id: verificadorMenosCarga.id,
                    actualizado_por: adminId
                }, { transaction });

                // Incrementar la carga del verificador asignado
                cargaVerificadores[verificadorMenosCarga.id] = (cargaVerificadores[verificadorMenosCarga.id] || 0) + 1;

                resultados.asignados++;
                logger.info(`Verificador ${verificadorMenosCarga.correo} asignado al portafolio ID ${portafolio.id}`);
            } catch (error) {
                logger.error(`Error al asignar verificador para portafolio ID ${portafolio.id}:`, error);
                resultados.errores.push({
                    portafolio_id: portafolio.id,
                    error: error.message
                });
            }
        }

        logger.info(`Asignación de verificadores completada: ${resultados.asignados} asignados, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'asignarVerificadores');
        throw new Error(`Error al asignar verificadores: ${error.message}`);
    }
};

/**
 * Crea portafolios automáticamente basados en las asignaciones
 * @param {Object} transaction - Transacción de la base de datos
 * @returns {Object} Resultados del procesamiento
 */
const crearPortafoliosAutomaticos = async (transaction) => {
    try {
        // 1. Crear portafolios basados en asignaciones
        const resultadosPortafolios = await crearPortafolios(null, transaction);
        
        // 2. Crear estructura de carpetas para los portafolios
        const resultadosEstructura = await crearEstructuraPortafolios(null, transaction);
        
        // 3. Asignar verificadores a los portafolios
        const resultadosVerificadores = await asignarVerificadores(null, transaction);
        
        // 4. Validar créditos mínimos
        const resultadosCreditos = await validarCreditosMinimos(transaction);
        
        return {
            totalCreados: resultadosPortafolios.creados + resultadosPortafolios.actualizados,
            totalEstructuras: resultadosEstructura.procesados,
            totalVerificadoresAsignados: resultadosVerificadores.asignados,
            creditosValidados: resultadosCreditos.total,
            creditosAdvertencias: resultadosCreditos.noCumplen,
            errores: [
                ...resultadosPortafolios.errores,
                ...resultadosEstructura.errores,
                ...resultadosVerificadores.errores
            ]
        };
    } catch (error) {
        registrarError(error, 'crearPortafoliosAutomaticos');
        throw new Error(`Error al crear portafolios automáticamente: ${error.message}`);
    }
};

/**
 * Envía notificaciones a docentes y verificadores sobre la inicialización
 * @param {Object} transaction - Transacción de la base de datos
 * @returns {Object} Resultados del procesamiento
 */
const enviarNotificacionesInicializacion = async (transaction) => {
    try {
        const resultados = {
            totalEnviadas: 0,
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

        // 1. Notificar a docentes sobre sus portafolios
        const portafolios = await Portafolio.findAll({
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura'
                },
                {
                    model: Usuario,
                    as: 'docente'
                },
                {
                    model: CicloAcademico,
                    as: 'ciclo'
                }
            ],
            transaction
        });

        // Agrupar portafolios por docente
        const portafoliosPorDocente = {};
        portafolios.forEach(portafolio => {
            const docenteId = portafolio.docente_id;
            if (!portafoliosPorDocente[docenteId]) {
                portafoliosPorDocente[docenteId] = [];
            }
            portafoliosPorDocente[docenteId].push(portafolio);
        });

        // Enviar notificación a cada docente
        for (const docenteId in portafoliosPorDocente) {
            try {
                const portafoliosDocente = portafoliosPorDocente[docenteId];
                const docente = portafoliosDocente[0].docente;
                const ciclo = portafoliosDocente[0].ciclo;
                
                // Crear mensaje con lista de asignaturas
                const asignaturas = portafoliosDocente.map(p => 
                    `${p.asignatura.codigo} - ${p.asignatura.nombre} (Grupo ${p.grupo})`
                ).join(', ');
                
                const mensaje = `Se han creado ${portafoliosDocente.length} portafolios para usted en el ciclo ${ciclo.nombre}. Asignaturas: ${asignaturas}`;
                
                // Crear notificación
                await Notificacion.create({
                    usuario_id: docenteId,
                    titulo: 'Portafolios creados',
                    mensaje,
                    tipo: 'sistema',
                    leido: false,
                    creado_por: adminId
                }, { transaction });
                
                resultados.totalEnviadas++;
                logger.info(`Notificación enviada al docente ${docente.correo} sobre ${portafoliosDocente.length} portafolios`);
            } catch (error) {
                logger.error(`Error al enviar notificación al docente ID ${docenteId}:`, error);
                resultados.errores.push({
                    docente_id: docenteId,
                    error: error.message
                });
            }
        }

        // 2. Notificar a verificadores sobre portafolios asignados
        const portafoliosPorVerificador = {};
        portafolios.filter(p => p.verificador_id).forEach(portafolio => {
            const verificadorId = portafolio.verificador_id;
            if (!portafoliosPorVerificador[verificadorId]) {
                portafoliosPorVerificador[verificadorId] = [];
            }
            portafoliosPorVerificador[verificadorId].push(portafolio);
        });

        // Enviar notificación a cada verificador
        for (const verificadorId in portafoliosPorVerificador) {
            try {
                const portafoliosVerificador = portafoliosPorVerificador[verificadorId];
                
                // Obtener verificador
                const verificador = await Usuario.findByPk(verificadorId, { transaction });
                if (!verificador) continue;
                
                const ciclo = portafoliosVerificador[0].ciclo;
                
                // Crear mensaje con cantidad de portafolios
                const mensaje = `Se le han asignado ${portafoliosVerificador.length} portafolios para verificar en el ciclo ${ciclo.nombre}.`;
                
                // Crear notificación
                await Notificacion.create({
                    usuario_id: verificadorId,
                    titulo: 'Portafolios asignados para verificación',
                    mensaje,
                    tipo: 'sistema',
                    leido: false,
                    creado_por: adminId
                }, { transaction });
                
                resultados.totalEnviadas++;
                logger.info(`Notificación enviada al verificador ${verificador.correo} sobre ${portafoliosVerificador.length} portafolios`);
            } catch (error) {
                logger.error(`Error al enviar notificación al verificador ID ${verificadorId}:`, error);
                resultados.errores.push({
                    verificador_id: verificadorId,
                    error: error.message
                });
            }
        }

        logger.info(`Envío de notificaciones completado: ${resultados.totalEnviadas} enviadas, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'enviarNotificacionesInicializacion');
        throw new Error(`Error al enviar notificaciones de inicialización: ${error.message}`);
    }
};

/**
 * Valida si las asignaturas cumplen con los requisitos de créditos mínimos establecidos en la estructura
 * @param {Object} transaction - Transacción de la base de datos
 * @returns {Object} Resultados de la validación
 */
const validarCreditosMinimos = async (transaction) => {
    try {
        const resultados = {
            total: 0,
            cumplen: 0,
            noCumplen: 0,
            advertencias: []
        };

        // Obtener todos los portafolios activos
        const portafolios = await Portafolio.findAll({
            where: { 
                estado: {
                    [Op.in]: ['pendiente', 'en_progreso', 'completo']
                }
            },
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura'
                },
                {
                    model: CicloAcademico,
                    as: 'ciclo'
                }
            ],
            transaction
        });

        resultados.total = portafolios.length;

        // Procesar cada portafolio
        for (const portafolio of portafolios) {
            try {
                const { asignatura, ciclo } = portafolio;

                // Obtener la estructura para el ciclo académico
                const estructuras = await Estructura.findAll({
                    where: {
                        ciclo_id: ciclo.id,
                        activo: 1,
                        creditos_minimos: {
                            [Op.gt]: 0 // Solo estructuras con créditos mínimos > 0
                        }
                    },
                    transaction
                });

                // Verificar si la asignatura cumple con los créditos mínimos requeridos
                let cumpleTodos = true;
                const advertenciasAsignatura = [];

                for (const estructura of estructuras) {
                    if (asignatura.creditos < estructura.creditos_minimos) {
                        cumpleTodos = false;
                        advertenciasAsignatura.push({
                            estructura: estructura.nombre,
                            creditos_requeridos: estructura.creditos_minimos,
                            creditos_asignatura: asignatura.creditos
                        });
                    }
                }

                if (cumpleTodos) {
                    resultados.cumplen++;
                } else {
                    resultados.noCumplen++;
                    resultados.advertencias.push({
                        portafolio_id: portafolio.id,
                        asignatura_codigo: asignatura.codigo,
                        asignatura_nombre: asignatura.nombre,
                        creditos: asignatura.creditos,
                        advertencias: advertenciasAsignatura
                    });

                    // Crear notificación para el docente sobre los créditos insuficientes
                    await Notificacion.create({
                        usuario_id: portafolio.docente_id,
                        titulo: 'Advertencia de créditos insuficientes',
                        mensaje: `La asignatura ${asignatura.codigo} - ${asignatura.nombre} no cumple con los requisitos mínimos de créditos para algunas secciones del portafolio.`,
                        tipo: 'advertencia',
                        leido: false,
                        creado_por: 1 // Admin
                    }, { transaction });
                }
            } catch (error) {
                logger.error(`Error al validar créditos para portafolio ID ${portafolio.id}:`, error);
            }
        }

        logger.info(`Validación de créditos completada: ${resultados.cumplen} cumplen, ${resultados.noCumplen} no cumplen`);
        return resultados;
    } catch (error) {
        registrarError(error, 'validarCreditosMinimos');
        throw new Error(`Error al validar créditos mínimos: ${error.message}`);
    }
};

module.exports = {
    crearPortafolios,
    crearEstructuraPortafolios,
    asignarVerificadores,
    crearPortafoliosAutomaticos,
    enviarNotificacionesInicializacion,
    validarCreditosMinimos
};
