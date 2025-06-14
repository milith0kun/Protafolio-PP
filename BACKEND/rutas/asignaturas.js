const express = require('express');
const router = express.Router();
const asignaturasController = require('../controladores/asignaturasController');
const { verificarToken, verificarRol } = require('../middleware/verificar-jwt');

/**
 * @route   GET /api/asignaturas/ciclo/:ciclo_id
 * @desc    Obtener todas las asignaturas de un ciclo académico específico
 * @access  Privado (Admin, Docente, Verificador)
 */
router.get('/ciclo/:ciclo_id', verificarToken, asignaturasController.obtenerAsignaturas);

/**
 * @route   GET /api/asignaturas/:id
 * @desc    Obtener una asignatura por su ID
 * @access  Privado (Admin, Docente, Verificador)
 */
router.get('/:id', verificarToken, asignaturasController.obtenerAsignaturaPorId);

/**
 * @route   POST /api/asignaturas
 * @desc    Crear una nueva asignatura
 * @access  Privado (Admin)
 */
router.post('/', verificarToken, verificarRol(['administrador']), asignaturasController.crearAsignatura);

/**
 * @route   PUT /api/asignaturas/:id
 * @desc    Actualizar una asignatura existente
 * @access  Privado (Admin)
 */
router.put('/:id', verificarToken, verificarRol(['administrador']), asignaturasController.actualizarAsignatura);

/**
 * @route   DELETE /api/asignaturas/:id
 * @desc    Eliminar una asignatura (desactivación lógica)
 * @access  Privado (Admin)
 */
router.delete('/:id', verificarToken, verificarRol(['administrador']), asignaturasController.eliminarAsignatura);

/**
 * @route   POST /api/asignaturas/:asignatura_id/asignar-docente
 * @desc    Asignar una asignatura a un docente
 * @access  Privado (Admin)
 */
router.post('/:asignatura_id/asignar-docente', verificarToken, verificarRol(['administrador']), asignaturasController.asignarDocenteAsignatura);

/**
 * @route   GET /api/asignaturas/docente/:docente_id/ciclo/:ciclo_id
 * @desc    Obtener todas las asignaturas asignadas a un docente en un ciclo específico
 * @access  Privado (Admin, Docente)
 */
router.get('/docente/:docente_id/ciclo/:ciclo_id', verificarToken, verificarRol(['administrador', 'docente']), asignaturasController.obtenerAsignaturasDocente);

module.exports = router;
