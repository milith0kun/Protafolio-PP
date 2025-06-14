const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const inicializacionController = require('../controladores/inicializacion/inicializacionController');
const { verificarToken, verificarRol } = require('../middleware/verificar-jwt');

// Configuración de multer para múltiples archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads');
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Mantener el nombre original del archivo
        cb(null, file.originalname);
    }
});

// Filtro para permitir solo archivos Excel
const fileFilter = (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // Límite de 10MB por archivo
        files: 8 // Máximo 8 archivos
    }
}).array('archivos', 8); // 'archivos' es el nombre del campo en el formulario

/**
 * @route   POST /api/inicializacion
 * @desc    Inicializa el sistema con los 8 archivos Excel requeridos
 * @access  Privado (Admin)
 */
router.post('/', 
    verificarToken, 
    verificarRol(['administrador']),
    (req, res, next) => {
        // Middleware personalizado para manejar la carga de archivos
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // Error de Multer (ej. tamaño de archivo excedido)
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                // Error del filtro de archivo
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            // Si todo está bien, continuar al controlador
            next();
        });
    },
    inicializacionController.inicializarSistema
);

module.exports = router;
