const { CicloAcademico, EstadoSistema, Semestre } = require('../modelos');
const { Op } = require('sequelize');

/**
 * Obtiene todos los ciclos académicos
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.obtenerCiclos = async (req, res) => {
    try {
        const ciclos = await CicloAcademico.findAll({
            order: [['creado_en', 'DESC']]
        });
        
        return res.status(200).json({
            success: true,
            data: ciclos
        });
    } catch (error) {
        console.error('Error al obtener ciclos académicos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener ciclos académicos',
            error: error.message
        });
    }
};

/**
 * Obtiene un ciclo académico por su ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.obtenerCicloPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const ciclo = await CicloAcademico.findByPk(id, {
            include: [
                { model: EstadoSistema, as: 'estados' },
                { model: Semestre, as: 'semestres' }
            ]
        });
        
        if (!ciclo) {
            return res.status(404).json({
                success: false,
                message: 'Ciclo académico no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: ciclo
        });
    } catch (error) {
        console.error('Error al obtener ciclo académico:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener ciclo académico',
            error: error.message
        });
    }
};

/**
 * Crea un nuevo ciclo académico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.crearCiclo = async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            fecha_inicio, 
            fecha_fin, 
            semestre_actual, 
            anio_actual,
            configuracion 
        } = req.body;
        
        // Validar que no exista un ciclo con el mismo nombre
        const cicloExistente = await CicloAcademico.findOne({
            where: { nombre }
        });
        
        if (cicloExistente) {
            return res.status(400).json({
                success: false,
                message: `Ya existe un ciclo académico con el nombre ${nombre}`
            });
        }
        
        // Crear el ciclo académico
        const nuevoCiclo = await CicloAcademico.create({
            nombre,
            descripcion,
            estado: 'preparacion',
            fecha_inicio,
            fecha_fin,
            semestre_actual,
            anio_actual,
            creado_por: req.usuario.id,
            configuracion
        });
        
        // Crear los estados del sistema para este ciclo
        const modulos = ['carga_datos', 'gestion_documentos', 'verificacion', 'reportes'];
        
        for (const modulo of modulos) {
            await EstadoSistema.create({
                ciclo_id: nuevoCiclo.id,
                modulo,
                habilitado: modulo === 'carga_datos' ? 1 : 0, // Solo habilitar carga_datos inicialmente
                actualizado_por: req.usuario.id
            });
        }
        
        // Crear el semestre asociado al ciclo
        await Semestre.create({
            nombre: semestre_actual,
            ciclo_id: nuevoCiclo.id
        });
        
        return res.status(201).json({
            success: true,
            message: 'Ciclo académico creado exitosamente',
            data: nuevoCiclo
        });
    } catch (error) {
        console.error('Error al crear ciclo académico:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear ciclo académico',
            error: error.message
        });
    }
};

/**
 * Actualiza un ciclo académico existente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.actualizarCiclo = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre, 
            descripcion, 
            estado, 
            fecha_inicio, 
            fecha_fin,
            configuracion 
        } = req.body;
        
        // Verificar que el ciclo exista
        const ciclo = await CicloAcademico.findByPk(id);
        
        if (!ciclo) {
            return res.status(404).json({
                success: false,
                message: 'Ciclo académico no encontrado'
            });
        }
        
        // Verificar que no exista otro ciclo con el mismo nombre (excepto el actual)
        if (nombre && nombre !== ciclo.nombre) {
            const cicloExistente = await CicloAcademico.findOne({
                where: {
                    nombre,
                    id: { [Op.ne]: id }
                }
            });
            
            if (cicloExistente) {
                return res.status(400).json({
                    success: false,
                    message: `Ya existe un ciclo académico con el nombre ${nombre}`
                });
            }
        }
        
        // Si se está cerrando el ciclo, registrar la fecha de cierre
        let fecha_cierre_real = ciclo.fecha_cierre_real;
        let cerrado_por = ciclo.cerrado_por;
        
        if (estado === 'cerrado' && ciclo.estado !== 'cerrado') {
            fecha_cierre_real = new Date();
            cerrado_por = req.usuario.id;
        }
        
        // Actualizar el ciclo
        await ciclo.update({
            nombre: nombre || ciclo.nombre,
            descripcion: descripcion || ciclo.descripcion,
            estado: estado || ciclo.estado,
            fecha_inicio: fecha_inicio || ciclo.fecha_inicio,
            fecha_fin: fecha_fin || ciclo.fecha_fin,
            fecha_cierre_real,
            cerrado_por,
            configuracion: configuracion || ciclo.configuracion
        });
        
        return res.status(200).json({
            success: true,
            message: 'Ciclo académico actualizado exitosamente',
            data: ciclo
        });
    } catch (error) {
        console.error('Error al actualizar ciclo académico:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar ciclo académico',
            error: error.message
        });
    }
};

/**
 * Actualiza el estado de un módulo del sistema para un ciclo específico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.actualizarEstadoModulo = async (req, res) => {
    try {
        const { ciclo_id, modulo } = req.params;
        const { habilitado, observaciones } = req.body;
        
        // Verificar que el ciclo exista
        const ciclo = await CicloAcademico.findByPk(ciclo_id);
        
        if (!ciclo) {
            return res.status(404).json({
                success: false,
                message: 'Ciclo académico no encontrado'
            });
        }
        
        // Buscar el estado del módulo
        let estadoModulo = await EstadoSistema.findOne({
            where: {
                ciclo_id,
                modulo
            }
        });
        
        if (!estadoModulo) {
            return res.status(404).json({
                success: false,
                message: `Módulo ${modulo} no encontrado para este ciclo`
            });
        }
        
        // Actualizar el estado del módulo
        const fechaActual = new Date();
        
        await estadoModulo.update({
            habilitado: habilitado ? 1 : 0,
            fecha_habilitacion: habilitado ? fechaActual : estadoModulo.fecha_habilitacion,
            fecha_deshabilitacion: !habilitado ? fechaActual : estadoModulo.fecha_deshabilitacion,
            observaciones: observaciones || estadoModulo.observaciones,
            actualizado_por: req.usuario.id
        });
        
        return res.status(200).json({
            success: true,
            message: `Estado del módulo ${modulo} actualizado exitosamente`,
            data: estadoModulo
        });
    } catch (error) {
        console.error('Error al actualizar estado del módulo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar estado del módulo',
            error: error.message
        });
    }
};

/**
 * Obtiene el ciclo académico activo actual
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.obtenerCicloActivo = async (req, res) => {
    try {
        const cicloActivo = await CicloAcademico.findOne({
            where: {
                estado: 'activo'
            },
            include: [
                { model: EstadoSistema, as: 'estados' },
                { model: Semestre, as: 'semestres' }
            ]
        });
        
        if (!cicloActivo) {
            return res.status(404).json({
                success: false,
                message: 'No hay ciclo académico activo actualmente'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: cicloActivo
        });
    } catch (error) {
        console.error('Error al obtener ciclo académico activo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener ciclo académico activo',
            error: error.message
        });
    }
};

/**
 * Elimina un ciclo académico (solo si está en estado de preparación)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.eliminarCiclo = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que el ciclo exista
        const ciclo = await CicloAcademico.findByPk(id);
        
        if (!ciclo) {
            return res.status(404).json({
                success: false,
                message: 'Ciclo académico no encontrado'
            });
        }
        
        // Solo permitir eliminar ciclos en estado de preparación
        if (ciclo.estado !== 'preparacion') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden eliminar ciclos académicos en estado de preparación'
            });
        }
        
        // Eliminar el ciclo (esto también eliminará los estados del sistema y semestres asociados por CASCADE)
        await ciclo.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'Ciclo académico eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar ciclo académico:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar ciclo académico',
            error: error.message
        });
    }
};
