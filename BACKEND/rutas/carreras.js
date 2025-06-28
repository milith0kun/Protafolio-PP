const express = require('express');
const router = express.Router();
const { Carrera } = require('../modelos');
const { verificarToken } = require('../middleware/authJwt');

/**
 * Obtener todas las carreras
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    console.log('📚 Obteniendo lista de carreras...');
    
    const carreras = await Carrera.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });

    console.log(`✅ Se encontraron ${carreras.length} carreras`);

    res.json({
      exito: true,
      datos: carreras,
      total: carreras.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo carreras:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error obteniendo lista de carreras',
      error: error.message
    });
  }
});

/**
 * Obtener carrera por ID
 */
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const carrera = await Carrera.findByPk(id);

    if (!carrera) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Carrera no encontrada'
      });
    }

    res.json({
      exito: true,
      datos: carrera
    });

  } catch (error) {
    console.error('❌ Error obteniendo carrera:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error obteniendo carrera',
      error: error.message
    });
  }
});

/**
 * Crear nueva carrera
 */
router.post('/', verificarToken, async (req, res) => {
  try {
    const { codigo, nombre, facultad, duracion_semestres, grado_otorgado } = req.body;

    // Validar campos requeridos
    if (!codigo || !nombre || !facultad) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Campos requeridos: codigo, nombre, facultad'
      });
    }

    // Verificar si ya existe una carrera con el mismo código
    const carreraExistente = await Carrera.findOne({
      where: { codigo }
    });

    if (carreraExistente) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Ya existe una carrera con este código'
      });
    }

    const nuevaCarrera = await Carrera.create({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      facultad: facultad.trim(),
      duracion_semestres: duracion_semestres || 10,
      grado_otorgado: grado_otorgado || 'Licenciado',
      activo: true
    });

    console.log(`✅ Carrera creada: ${nuevaCarrera.nombre}`);

    res.status(201).json({
      exito: true,
      mensaje: 'Carrera creada exitosamente',
      datos: nuevaCarrera
    });

  } catch (error) {
    console.error('❌ Error creando carrera:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error creando carrera',
      error: error.message
    });
  }
});

/**
 * Actualizar carrera
 */
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, facultad, duracion_semestres, grado_otorgado, activo } = req.body;

    const carrera = await Carrera.findByPk(id);

    if (!carrera) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Carrera no encontrada'
      });
    }

    await carrera.update({
      codigo: codigo?.trim() || carrera.codigo,
      nombre: nombre?.trim() || carrera.nombre,
      facultad: facultad?.trim() || carrera.facultad,
      duracion_semestres: duracion_semestres || carrera.duracion_semestres,
      grado_otorgado: grado_otorgado || carrera.grado_otorgado,
      activo: activo !== undefined ? activo : carrera.activo,
      actualizado_en: new Date()
    });

    console.log(`✅ Carrera actualizada: ${carrera.nombre}`);

    res.json({
      exito: true,
      mensaje: 'Carrera actualizada exitosamente',
      datos: carrera
    });

  } catch (error) {
    console.error('❌ Error actualizando carrera:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error actualizando carrera',
      error: error.message
    });
  }
});

/**
 * Eliminar carrera (cambiar estado a inactivo)
 */
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const carrera = await Carrera.findByPk(id);

    if (!carrera) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Carrera no encontrada'
      });
    }

    await carrera.update({
      activo: false,
      actualizado_en: new Date()
    });

    console.log(`✅ Carrera desactivada: ${carrera.nombre}`);

    res.json({
      exito: true,
      mensaje: 'Carrera desactivada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error desactivando carrera:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error desactivando carrera',
      error: error.message
    });
  }
});

module.exports = router; 