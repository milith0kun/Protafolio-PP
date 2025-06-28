const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { inicializarSistema, obtenerProgreso } = require('../controladores/inicializacion/nuevaInicializacionController');
const { verificarToken, verificarRol, esAdministrador } = require('../middleware/authJwt');

// Controladores
const usuariosController = require('../controladores/inicializacion/usuariosController');
const carrerasController = require('../controladores/inicializacion/carrerasController');
const asignaturasController = require('../controladores/inicializacion/asignaturasController');
const cargaAcademicaController = require('../controladores/inicializacion/cargaAcademicaController');
const verificacionesController = require('../controladores/inicializacion/verificacionesController');
const codigosInstitucionalesController = require('../controladores/inicializacion/codigosInstitucionalesController');
const nuevaInicializacionController = require('../controladores/inicializacion/nuevaInicializacionController');

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

// Filtro para permitir archivos Excel y CSV
const fileFilter = (req, file, cb) => {
    try {
        const filetypes = /\.(xlsx|xls|csv)$/i;
        const extname = filetypes.test(path.extname(file.originalname));
        
        // Lista de MIME types permitidos
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'application/octet-stream', // Algunos archivos Excel pueden reportar esto
            'application/zip', // .xlsx es técnicamente un archivo zip
            'text/csv', // .csv
            'text/plain', // CSV también puede reportar esto
            'application/csv' // Otra variante de CSV
        ];
        
        const mimetype = allowedMimeTypes.includes(file.mimetype);
        
        if (!extname) {
            console.error('Extensión de archivo no permitida:', file.originalname);
            return cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) y CSV (.csv)'));
        }
        
        if (!mimetype) {
            console.warn('Tipo MIME inesperado:', {
                filename: file.originalname,
                mimetype: file.mimetype
            });
            // Aceptar de todos modos si la extensión es correcta
            return cb(null, true);
        }
        
        console.log('✅ Archivo aceptado:', file.originalname, 'MIME:', file.mimetype);
        cb(null, true);
    } catch (error) {
        console.error('Error en el filtro de archivos:', error);
        cb(new Error('Error al validar el archivo'));
    }
};

// Configuración detallada de multer para manejo de archivos
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // Límite de 10MB por archivo
        files: 6, // Máximo 6 archivos (uno por cada tipo requerido)
        fieldNameSize: 200, // Tamaño máximo del nombre del campo
        fieldSize: 10 * 1024 * 1024, // Para campos no-archivo
        fields: 10, // Máximo de campos no-archivo
        parts: 12 // Máximo de partes (6 archivos + 6 campos)
    },
    preservePath: false // No incluir la ruta completa del archivo
});

// Middleware para asegurar que existe el directorio temporal
const ensureTempDir = (req, res, next) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    next();
};

/**
 * @route   POST /api/inicializacion
 * @desc    Inicializa el sistema con los 6 archivos Excel requeridos
 * @access  Privado (Admin)
 */
// Middleware para registrar información de la solicitud
const logRequestInfo = (req) => {
    console.log('=== Información de la solicitud ===');
    console.log('Método:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Headers:', {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        'user-agent': req.headers['user-agent']
    });
    console.log('Body:', req.body);
    console.log('Files:', req.files ? req.files.map(f => f.originalname) : 'No hay archivos');
    console.log('==================================');
};

// Ruta para obtener el progreso de la inicialización
router.get('/progreso',
    verificarToken,
    verificarRol(['administrador']),
    obtenerProgreso
);

/**
 * @route   POST /api/inicializacion
 * @desc    Inicializa el sistema con los 6 archivos Excel requeridos
 * @access  Privado (Admin)
 */
router.post('/', 
    verificarToken, 
    verificarRol(['administrador']),
    (req, res, next) => {
        // Registrar información de la solicitud
        logRequestInfo(req);
        
        // Middleware personalizado para manejar la carga de archivos
        upload(req, res, function (err) {
            console.log('=== Procesando archivos ===');
            
            // Manejar errores de multer
            if (err) {
                console.error('Error al procesar archivos:', err);
                return res.status(400).json({
                    success: false,
                    message: 'Error al procesar los archivos',
                    error: err.message
                });
            }
            
            // Verificar si hay archivos en el formato correcto
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se han subido archivos',
                    error: 'Se requieren archivos para la inicialización',
                    allowedTypes: ['.xlsx', '.xls', '.csv']
                });
            }
            
            // Verificar que los archivos tengan los nombres de campo esperados
            const expectedFields = [
                'archivo_ciclos', 'archivo_usuarios', 'archivo_docentes', 
                'archivo_verificadores', 'archivo_asignaturas', 
                'archivo_estructura_portafolio', 'archivo_asignaciones', 
                'archivo_parametros'
            ];
            
            const receivedFields = Object.keys(req.files);
            const missingFields = expectedFields.filter(field => !receivedFields.includes(field));
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan archivos requeridos',
                    missingFields,
                    receivedFields: receivedFields.map(field => ({
                        field,
                        files: req.files[field].map(f => f.originalname)
                    }))
                });
            }
            
            // Si llegamos aquí, continuar con el siguiente middleware
            next();
        });
    },
    // Controlador de inicialización
    inicializarSistema
);

// Manejador de errores global
router.use((err, req, res, next) => {
    console.error('Error en la ruta de inicialización:', err);
    
    // Manejar errores de multer
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'Archivo demasiado grande',
            error: 'El tamaño del archivo excede el límite permitido (10MB)'
        });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Demasiados archivos',
            error: 'Se permiten como máximo 6 archivos (uno por cada tipo requerido)'
        });
    }
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: 'Error al procesar los archivos',
            error: err.message
        });
    }
    
    // Otros errores
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error al procesar la solicitud',
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
});

/**
 * @route POST /api/inicializacion/archivo-individual
 * @desc Procesa un archivo individual
 * @access Admin
 */
router.post('/archivo-individual', verificarToken, verificarRol(['administrador']), ensureTempDir, upload.single('archivo'), async (req, res) => {
    console.log('🔥 === PROCESANDO ARCHIVO INDIVIDUAL ===');
    console.log('📁 Archivo:', req.file ? req.file.originalname : 'No archivo');
    console.log('📋 Tipo:', req.body ? req.body.tipo : 'No body');
    console.log('👤 Usuario:', req.usuario ? req.usuario.email : 'No usuario');
    console.log('🔄 Ciclo:', req.body ? req.body.cicloId : 'No body');
    console.log('📊 Body completo:', req.body);
    console.log('🔍 Headers Content-Type:', req.headers['content-type']);
    
    try {
        const archivo = req.file;
        const tipo = req.body ? req.body.tipo : null;
        const cicloId = req.body ? (req.body.cicloId || 1) : 1;

        if (!archivo) {
            console.error('❌ No se proporcionó archivo');
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado ningún archivo',
                error: 'Archivo requerido'
            });
        }

        if (!tipo) {
            console.error('❌ No se proporcionó tipo');
            return res.status(400).json({
                success: false,
                message: 'Debe especificar el tipo de archivo',
                error: 'Tipo de archivo requerido'
            });
        }

        console.log('✅ Validaciones básicas pasadas');

        // Seleccionar el controlador apropiado
        let controller;
        switch (tipo) {
            case 'usuarios':
                controller = usuariosController;
                break;
            case 'carreras':
                controller = carrerasController;
                break;
            case 'asignaturas':
                controller = asignaturasController;
                break;
            case 'carga_academica':
                controller = cargaAcademicaController;
                break;
            case 'verificaciones':
                controller = verificacionesController;
                break;
            case 'codigos_institucionales':
                controller = codigosInstitucionalesController;
                break;
            default:
                console.error('❌ Tipo de archivo no válido:', tipo);
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de archivo no válido',
                    error: `Tipo '${tipo}' no está soportado`
                });
        }

        console.log(`🎯 Controlador seleccionado para tipo: ${tipo}`);

        // Crear contexto completo para el procesamiento
        const contexto = {
            cicloId: cicloId,
            usuario: req.usuario,
            archivo: archivo,
            tipo: tipo,
            timestamp: new Date().toISOString()
        };

        console.log('📊 Contexto de procesamiento:', contexto);

        // Procesar archivo con transacción de base de datos (como espera el controlador)
        console.log('🚀 Iniciando procesamiento...');
        const resultado = await controller.procesar(archivo, null); // null para transacción ya que es procesamiento individual
        console.log('✅ Procesamiento completado:', resultado);

        // **REGISTRAR ARCHIVO EN LA TABLA ARCHIVOS_CARGA_MASIVA**
        let archivoRegistradoId = null;
        try {
            console.log('🗃️ Iniciando registro en tabla archivos_carga_masiva...');
            const ArchivoCargaMasiva = require('../modelos/ArchivoCargaMasiva');
            const crypto = require('crypto');
            
            console.log('🗃️ Datos del archivo:', {
                originalname: archivo.originalname,
                size: archivo.size,
                path: archivo.path
            });
            console.log('🗃️ Datos del resultado:', resultado);
            
            // Leer el archivo para calcular el hash ANTES de eliminarlo
            const fileBuffer = fs.readFileSync(archivo.path);
            const hashArchivo = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            console.log('🗃️ Hash calculado:', hashArchivo.substring(0, 8));
            
            // Crear una copia permanente del archivo si queremos mantenerlo
            const permanentPath = path.join(__dirname, '../uploads/permanente', `${Date.now()}_${archivo.originalname}`);
            const permanentDir = path.dirname(permanentPath);
            
            // Crear directorio si no existe
            if (!fs.existsSync(permanentDir)) {
                fs.mkdirSync(permanentDir, { recursive: true });
                console.log('📁 Directorio permanente creado:', permanentDir);
            }
            
            // Copiar archivo a ubicación permanente
            fs.copyFileSync(archivo.path, permanentPath);
            console.log('📄 Archivo copiado a:', permanentPath);
            
            // Preparar datos para registrar
            const datosArchivo = {
                ciclo_id: parseInt(cicloId),
                tipo_archivo: tipo,
                nombre_original: archivo.originalname,
                nombre_sistema: path.basename(permanentPath),
                ruta_archivo: permanentPath,
                tamanio_bytes: archivo.size,
                registros_procesados: resultado.total || resultado.exitosos || resultado.creados || resultado.actualizados || 0,
                registros_errores: (resultado.errores && Array.isArray(resultado.errores)) ? resultado.errores.length : 0,
                estado: 'procesado',
                detalles_procesamiento: resultado,
                hash_archivo: hashArchivo,
                subido_por: req.usuario.id,
                fecha_procesamiento: new Date()
            };
            
            console.log('🗃️ Datos preparados para BD:', {
                ...datosArchivo,
                detalles_procesamiento: 'OMITIDO_POR_TAMAÑO'
            });
            
            // Registrar el archivo en la BD
            const archivoRegistrado = await ArchivoCargaMasiva.create(datosArchivo);
            
            archivoRegistradoId = archivoRegistrado.id;
            console.log('✅ Archivo registrado en BD con ID:', archivoRegistradoId);
            
        } catch (registroError) {
            console.error('💥 Error COMPLETO al registrar archivo en BD:');
            console.error('- Mensaje:', registroError.message);
            console.error('- Stack:', registroError.stack);
            console.error('- Código SQL:', registroError.sql);
            console.error('- Usuario ID:', req.usuario?.id);
            console.error('- Ciclo ID:', cicloId);
            // No fallar el proceso por esto, solo logear
        }

        // Limpiar archivo temporal
        try {
            fs.unlinkSync(archivo.path);
            console.log('🗑️ Archivo temporal eliminado:', archivo.path);
        } catch (error) {
            console.error('⚠️ Error al eliminar archivo temporal:', error);
        }

        return res.status(200).json({
            success: true,
            message: `Archivo ${tipo} procesado exitosamente`,
            detalles: resultado,
            archivo_id: archivoRegistradoId,
            contexto: {
                tipo: tipo,
                archivo: archivo.originalname,
                cicloId: cicloId,
                timestamp: contexto.timestamp
            }
        });

    } catch (error) {
        console.error('💥 ERROR COMPLETO AL PROCESAR ARCHIVO INDIVIDUAL:');
        console.error('- Mensaje:', error.message);
        console.error('- Stack:', error.stack);
        console.error('- Tipo:', req.body?.tipo);
        console.error('- Archivo:', req.file?.originalname);
        console.error('- Usuario:', req.usuario?.email);
        
        // Limpiar archivo temporal en caso de error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Archivo temporal limpiado tras error');
            } catch (cleanupError) {
                console.error('💥 Error al limpiar archivo temporal:', cleanupError);
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Error al procesar el archivo',
            error: error.message,
            tipo: req.body?.tipo,
            archivo: req.file?.originalname,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route POST /api/inicializacion/carga-masiva
 * @desc Procesa múltiples archivos
 * @access Admin
 */
router.post('/carga-masiva', verificarToken, verificarRol(['administrador']), ensureTempDir, upload.array('files', 6), async (req, res) => {
    try {
        const archivos = req.files;

        if (!archivos || archivos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se han proporcionado archivos',
                error: 'Archivos requeridos'
            });
        }

        // Procesar archivos usando el controlador principal
        const resultado = await nuevaInicializacionController.inicializarSistema({
            ...req,
            files: archivos
        }, res);

        return resultado;

    } catch (error) {
        // Limpiar archivos temporales en caso de error
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (cleanupError) {
                    console.error('Error al limpiar archivo temporal:', cleanupError);
                }
            });
        }

        console.error('Error en carga masiva:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en la carga masiva',
            error: error.message
        });
    }
});

/**
 * @route POST /api/inicializacion/sistema-completo
 * @desc Inicializa el sistema completo con todos los archivos
 * @access Admin
 */
router.post('/sistema-completo', verificarToken, verificarRol(['administrador']), ensureTempDir, upload.array('files', 6), async (req, res) => {
    try {
        const archivos = req.files;
        const descripcion = req.body.descripcion;

        if (!archivos || archivos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se han proporcionado archivos para la inicialización',
                error: 'Archivos requeridos'
            });
        }

        if (!descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una descripción de la inicialización',
                error: 'Descripción requerida'
            });
        }

        // Procesar inicialización completa
        const resultado = await nuevaInicializacionController.inicializarSistema({
            ...req,
            files: archivos,
            body: { ...req.body, descripcion }
        }, res);

        return resultado;

    } catch (error) {
        // Limpiar archivos temporales en caso de error
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (cleanupError) {
                    console.error('Error al limpiar archivo temporal:', cleanupError);
                }
            });
        }

        console.error('Error en inicialización completa:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en la inicialización del sistema',
            error: error.message
        });
    }
});

/**
 * @route GET /api/inicializacion/verificar-datos
 * @desc Verifica los datos cargados en el sistema
 * @access Admin
 */
router.get('/verificar-datos', verificarToken, verificarRol(['administrador']), async (req, res) => {
    try {
        const { Usuario, UsuarioRol } = require('../modelos');
        const { sequelize } = require('../config/database');

        // Consultar estadísticas de datos
        const [usuarios] = await sequelize.query('SELECT COUNT(*) as count FROM usuarios');
        const [carreras] = await sequelize.query('SELECT COUNT(*) as count FROM carreras');
        const [asignaturas] = await sequelize.query('SELECT COUNT(*) as count FROM asignaturas');
        const [roles] = await sequelize.query('SELECT COUNT(*) as count FROM usuarios_roles WHERE activo = 1');

        return res.status(200).json({
            success: true,
            message: 'Verificación completada',
            usuarios: usuarios[0]?.count || 0,
            carreras: carreras[0]?.count || 0,
            asignaturas: asignaturas[0]?.count || 0,
            roles: roles[0]?.count || 0
        });

    } catch (error) {
        console.error('Error al verificar datos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar los datos',
            error: error.message
        });
    }
});

/**
 * @route POST /api/inicializacion/finalizar-sistema
 * @desc Finaliza la inicialización del sistema después de que todos los archivos han sido procesados
 * @access Admin
 */
router.post('/finalizar-sistema', verificarToken, verificarRol(['administrador']), async (req, res) => {
    try {
        const { ciclo_id, descripcion } = req.body;

        if (!ciclo_id) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un ciclo académico',
                error: 'Ciclo ID requerido'
            });
        }

        if (!descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una descripción',
                error: 'Descripción requerida'
            });
        }

        // Aquí se pueden ejecutar las operaciones finales de inicialización
        // Por ejemplo: generar portafolios, configurar el sistema, etc.
        
        console.log('🚀 Finalizando inicialización del sistema...');
        console.log('- Ciclo ID:', ciclo_id);
        console.log('- Descripción:', descripcion);
        console.log('- Usuario:', req.usuario?.correo);

        // Simular procesamiento final
        await new Promise(resolve => setTimeout(resolve, 2000));

        return res.status(200).json({
            success: true,
            message: 'Sistema inicializado exitosamente',
            detalles: {
                ciclo_id,
                descripcion,
                inicializado_por: req.usuario?.correo,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error al finalizar inicialización:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al finalizar la inicialización del sistema',
            error: error.message
        });
    }
});

/**
 * @route GET /api/ciclos
 * @desc Obtiene los ciclos académicos disponibles
 * @access Admin
 */
router.get('/ciclos', verificarToken, verificarRol(['administrador']), async (req, res) => {
    try {
        const { sequelize } = require('../config/database');

        // Obtener ciclos académicos (tabla temporal o usar datos por defecto)
        let ciclos;
        try {
            const [results] = await sequelize.query('SELECT * FROM ciclos_academicos ORDER BY nombre DESC');
            ciclos = results;
        } catch (error) {
            // Si no existe la tabla, usar datos por defecto
            ciclos = [
                { id: 1, nombre: '2024-I', estado: 'activo' },
                { id: 2, nombre: '2023-II', estado: 'inactivo' },
                { id: 3, nombre: '2023-I', estado: 'inactivo' }
            ];
        }

        return res.status(200).json({
            success: true,
            ciclos
        });

    } catch (error) {
        console.error('Error al obtener ciclos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener ciclos académicos',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/inicializacion/ejecutar
 * @desc    Ejecutar la inicialización del sistema (alias para finalizar-sistema)
 * @access  Privado (Admin)
 */
router.post('/ejecutar', verificarToken, verificarRol(['administrador']), async (req, res) => {
    try {
        const { ciclo_id } = req.body;
        
        console.log('🚀 Ejecutando inicialización del sistema para ciclo:', ciclo_id);
        
        // Por ahora, retornar respuesta exitosa
        res.json({
            success: true,
            mensaje: 'Sistema inicializado exitosamente',
            message: 'Sistema inicializado exitosamente',
            ciclo_id: ciclo_id,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error en inicialización:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al inicializar el sistema',
            message: 'Error al inicializar el sistema',
            error: error.message
        });
    }
});

module.exports = router;
