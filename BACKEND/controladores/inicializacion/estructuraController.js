const { Estructura, CicloAcademico } = require('../../modelos');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../../config/logger');
const { registrarError } = require('./utils');

/**
 * Procesa el archivo Excel de estructura de portafolios
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

        // Obtener todos los ciclos académicos para referencia
        const ciclos = await CicloAcademico.findAll({
            attributes: ['id', 'nombre'],
            transaction
        });

        const ciclosPorNombre = {};
        ciclos.forEach(ciclo => {
            ciclosPorNombre[ciclo.nombre] = ciclo.id;
        });

        // Mapa para almacenar las estructuras por nivel y mantener las relaciones padre-hijo
        const estructurasPorNivel = {};
        
        // Primera pasada: crear todas las estructuras de nivel 1 (sin padre)
        for (let i = 0; i < data.length; i++) {
            try {
                const fila = data[i];
                const { 
                    nombre,
                    descripcion,
                    nivel = 1,
                    padre = null,
                    ciclo_academico,
                    creditos_minimos = 0,
                    tipo = 'carpeta',
                    orden = i + 1,
                    estado = 'activo'
                } = fila;

                // Validar campos requeridos
                if (!nombre || !ciclo_academico) {
                    throw new Error('Faltan campos requeridos (nombre, ciclo_academico)');
                }

                // Solo procesar nivel 1 en esta pasada
                if (nivel !== 1) continue;

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

                // Buscar estructura existente por nombre y ciclo
                const [estructura, created] = await Estructura.findOrCreate({
                    where: { 
                        nombre,
                        ciclo_id: cicloId,
                        nivel: 1
                    },
                    defaults: {
                        nombre,
                        descripcion: descripcion || '',
                        nivel: 1,
                        padre_id: null,
                        ciclo_id: cicloId,
                        creditos_minimos: parseInt(creditos_minimos) || 0,
                        tipo,
                        orden,
                        activo: estado === 'activo' ? 1 : 0
                    },
                    transaction
                });

                // Si la estructura ya existe, actualizarla
                if (!created) {
                    await estructura.update({
                        descripcion: descripcion || estructura.descripcion,
                        creditos_minimos: parseInt(creditos_minimos) || estructura.creditos_minimos,
                        tipo: tipo || estructura.tipo,
                        orden: orden || estructura.orden,
                        activo: estado === 'activo' ? 1 : 0
                    }, { transaction });
                    resultados.actualizadas++;
                } else {
                    resultados.creadas++;
                }

                // Guardar la estructura en el mapa por nivel
                if (!estructurasPorNivel[1]) {
                    estructurasPorNivel[1] = [];
                }
                estructurasPorNivel[1].push({
                    id: estructura.id,
                    nombre: estructura.nombre,
                    ciclo_id: estructura.ciclo_id
                });
            } catch (error) {
                logger.error(`Error en fila ${i + 2} de estructura (nivel 1):`, error);
                resultados.errores.push({
                    fila: i + 2,
                    valores: data[i],
                    error: error.message
                });
            }
        }

        // Segunda pasada: crear estructuras de nivel 2 y superiores
        // Procesar por niveles para asegurar que los padres existan
        let nivelActual = 2;
        let continuar = true;

        while (continuar) {
            continuar = false; // Asumimos que no hay más niveles
            
            for (let i = 0; i < data.length; i++) {
                const fila = data[i];
                const nivel = fila.nivel || 1;
                
                // Solo procesar el nivel actual
                if (nivel !== nivelActual) continue;
                
                continuar = true; // Hay al menos un elemento en este nivel
                
                try {
                    const { 
                        nombre,
                        descripcion,
                        padre,
                        ciclo_academico,
                        creditos_minimos = 0,
                        tipo = 'carpeta',
                        orden = i + 1,
                        estado = 'activo'
                    } = fila;

                    // Validar campos requeridos
                    if (!nombre || !ciclo_academico || !padre) {
                        throw new Error(`Faltan campos requeridos (nombre, ciclo_academico, padre) para nivel ${nivelActual}`);
                    }

                    // Validar que el ciclo académico exista
                    let cicloId = null;
                    
                    if (typeof ciclo_academico === 'number') {
                        const ciclo = ciclos.find(c => c.id === ciclo_academico);
                        if (ciclo) cicloId = ciclo.id;
                    } else if (typeof ciclo_academico === 'string') {
                        cicloId = ciclosPorNombre[ciclo_academico];
                    }

                    if (!cicloId) {
                        throw new Error(`No se encontró el ciclo académico: ${ciclo_academico}`);
                    }

                    // Buscar el padre en el nivel anterior
                    const padresNivelAnterior = estructurasPorNivel[nivelActual - 1] || [];
                    const padreEncontrado = padresNivelAnterior.find(p => 
                        p.nombre === padre && p.ciclo_id === cicloId
                    );

                    if (!padreEncontrado) {
                        throw new Error(`No se encontró la estructura padre "${padre}" en el nivel ${nivelActual - 1}`);
                    }

                    // Buscar estructura existente por nombre, ciclo y padre
                    const [estructura, created] = await Estructura.findOrCreate({
                        where: { 
                            nombre,
                            ciclo_id: cicloId,
                            padre_id: padreEncontrado.id
                        },
                        defaults: {
                            nombre,
                            descripcion: descripcion || '',
                            nivel: nivelActual,
                            padre_id: padreEncontrado.id,
                            ciclo_id: cicloId,
                            creditos_minimos: parseInt(creditos_minimos) || 0,
                            tipo,
                            orden,
                            activo: estado === 'activo' ? 1 : 0
                        },
                        transaction
                    });

                    // Si la estructura ya existe, actualizarla
                    if (!created) {
                        await estructura.update({
                            descripcion: descripcion || estructura.descripcion,
                            creditos_minimos: parseInt(creditos_minimos) || estructura.creditos_minimos,
                            tipo: tipo || estructura.tipo,
                            orden: orden || estructura.orden,
                            activo: estado === 'activo' ? 1 : 0
                        }, { transaction });
                        resultados.actualizadas++;
                    } else {
                        resultados.creadas++;
                    }

                    // Guardar la estructura en el mapa por nivel
                    if (!estructurasPorNivel[nivelActual]) {
                        estructurasPorNivel[nivelActual] = [];
                    }
                    estructurasPorNivel[nivelActual].push({
                        id: estructura.id,
                        nombre: estructura.nombre,
                        ciclo_id: estructura.ciclo_id
                    });
                } catch (error) {
                    logger.error(`Error en fila ${i + 2} de estructura (nivel ${nivelActual}):`, error);
                    resultados.errores.push({
                        fila: i + 2,
                        valores: data[i],
                        error: error.message
                    });
                }
            }
            
            // Pasar al siguiente nivel
            if (continuar) {
                nivelActual++;
            }
        }

        logger.info(`Procesamiento de estructura completado: ${resultados.creadas} creadas, ${resultados.actualizadas} actualizadas, ${resultados.errores.length} errores`);
        return resultados;
    } catch (error) {
        registrarError(error, 'procesarEstructura');
        throw new Error(`Error al procesar el archivo de estructura: ${error.message}`);
    }
};

module.exports = {
    procesar
};
