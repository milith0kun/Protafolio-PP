const express = require('express');
const router = express.Router();
const ciclosController = require('../controladores/ciclosController');
const { verificarToken, verificarRol } = require('../middleware/verificar-jwt');

/**
 * @route   GET /api/ciclos
 * @desc    Obtener todos los ciclos académicos
 * @access  Privado (Admin)
 */
router.get('/', verificarToken, verificarRol(['administrador']), ciclosController.obtenerCiclos);

/**
 * @route   GET /api/ciclos/activo
 * @desc    Obtener el ciclo académico activo
 * @access  Privado (Todos los roles)
 */
router.get('/activo', verificarToken, ciclosController.obtenerCicloActivo);

/**
 * @route   GET /api/ciclos/:id
 * @desc    Obtener un ciclo académico por su ID
 * @access  Privado (Admin)
 */
router.get('/:id', verificarToken, verificarRol(['administrador']), ciclosController.obtenerCicloPorId);

/**
 * @route   POST /api/ciclos
 * @desc    Crear un nuevo ciclo académico
 * @access  Privado (Admin)
 */
router.post('/', verificarToken, verificarRol(['administrador']), ciclosController.crearCiclo);

/**
 * @route   PUT /api/ciclos/:id
 * @desc    Actualizar un ciclo académico existente
 * @access  Privado (Admin)
 */
router.put('/:id', verificarToken, verificarRol(['administrador']), ciclosController.actualizarCiclo);

/**
 * @route   PUT /api/ciclos/:ciclo_id/modulos/:modulo
 * @desc    Actualizar el estado de un módulo del sistema para un ciclo específico
 * @access  Privado (Admin)
 */
router.put('/:ciclo_id/modulos/:modulo', verificarToken, verificarRol(['administrador']), ciclosController.actualizarEstadoModulo);

/**
 * @route   DELETE /api/ciclos/:id
 * @desc    Eliminar un ciclo académico (solo si está en estado de preparación)
 * @access  Privado (Admin)
 */
router.delete('/:id', verificarToken, verificarRol(['administrador']), ciclosController.eliminarCiclo);

module.exports = router;
