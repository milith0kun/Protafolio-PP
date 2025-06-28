-- =============================================================
-- 🗂️ Base de Datos: Sistema Portafolio Docente (VERSIÓN CORREGIDA)
-- Versión con Multi-Rol, Gestión de Ciclos y Seguridad Mejorada
-- Incluye todas las modificaciones y migraciones realizadas
-- ORDEN CORREGIDO DE CREACIÓN DE TABLAS
-- =============================================================

CREATE DATABASE IF NOT EXISTS portafolio_docente_carga_academica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portafolio_docente_carga_academica;

-- =======================================
-- TABLAS BASE DEL SISTEMA (ORDEN CORREGIDO)
-- =======================================

-- 1. Usuarios (tabla base sin dependencias)
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    telefono VARCHAR(20) NULL,
    activo TINYINT(1) DEFAULT 1,
    ultimo_acceso DATETIME NULL,
    token_recuperacion VARCHAR(255) NULL,
    expiracion_token DATETIME NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Ciclos académicos (debe crearse antes que estados_sistema)
CREATE TABLE ciclos_academicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    estado ENUM('preparacion','activo','cerrado','archivado') DEFAULT 'preparacion',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_cierre_real DATETIME NULL,
    semestre_actual VARCHAR(50) NOT NULL,
    anio_actual INT NOT NULL,
    creado_por INT NOT NULL,
    cerrado_por INT NULL,
    configuracion JSON NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (cerrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT chk_fechas_validas CHECK (fecha_fin >= fecha_inicio),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_semestre_anio (semestre_actual, anio_actual),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla para múltiples roles por usuario
CREATE TABLE usuarios_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    rol ENUM('docente','verificador','administrador') NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    asignado_por INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion DATETIME NULL,
    observaciones TEXT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_usuario_rol_activo (usuario_id, rol, activo),
    INDEX idx_usuario_rol (usuario_id, rol),
    INDEX idx_rol_activo (rol, activo),
    INDEX idx_fechas (fecha_asignacion, fecha_revocacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Estados del sistema por módulo (AHORA puede referenciar ciclos_academicos)
CREATE TABLE estados_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ciclo_id INT NOT NULL,
    modulo ENUM('carga_datos', 'gestion_documentos', 'verificacion', 'reportes') NOT NULL,
    habilitado BOOLEAN DEFAULT 1,
    fecha_habilitacion DATETIME NULL,
    fecha_deshabilitacion DATETIME NULL,
    observaciones TEXT NULL,
    actualizado_por INT NOT NULL,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    FOREIGN KEY (actualizado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_ciclo_modulo (ciclo_id, modulo),
    INDEX idx_ciclo_modulo (ciclo_id, modulo),
    INDEX idx_habilitado (habilitado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Semestres mejorados con relación a ciclos
CREATE TABLE semestres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    ciclo_id INT NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_inicio DATE NULL,
    fecha_fin DATE NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_nombre_ciclo (nombre, ciclo_id),
    INDEX idx_ciclo_activo (ciclo_id, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de carreras y programas
CREATE TABLE carreras (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    facultad VARCHAR(255) NOT NULL,
    duracion_semestres INT NOT NULL,
    grado_otorgado VARCHAR(100) NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_facultad (facultad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Asignaturas mejoradas con horas teóricas
CREATE TABLE asignaturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    carrera VARCHAR(255) NOT NULL,
    semestre VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    creditos INT NOT NULL,
    horas_teoricas INT DEFAULT 0,
    tipo ENUM('teoria','practica','laboratorio') NOT NULL,
    ciclo_id INT NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    prerequisitos JSON NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_codigo_ciclo (codigo, ciclo_id),
    INDEX idx_codigo (codigo),
    INDEX idx_carrera (carrera),
    INDEX idx_ciclo_activo (ciclo_id, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Relación docentes-asignaturas mejorada con grupo
CREATE TABLE docentes_asignaturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    docente_id INT NOT NULL,
    asignatura_id INT NOT NULL,
    ciclo_id INT NOT NULL,
    grupo VARCHAR(10) NULL COMMENT 'Grupo al que pertenece la asignación (ej: A, B, C, etc.)',
    activo TINYINT(1) DEFAULT 1,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT NOT NULL,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE,
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_docente_asignatura_ciclo_grupo (docente_id, asignatura_id, ciclo_id, grupo),
    INDEX idx_docente_ciclo (docente_id, ciclo_id),
    INDEX idx_asignatura_ciclo (asignatura_id, ciclo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Verificadores-docentes mejorada
CREATE TABLE verificadores_docentes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    verificador_id INT NOT NULL,
    docente_id INT NOT NULL,
    ciclo_id INT NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT NOT NULL,
    observaciones TEXT NULL,
    FOREIGN KEY (verificador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_verificador_docente_ciclo (verificador_id, docente_id, ciclo_id),
    INDEX idx_verificador_ciclo (verificador_id, ciclo_id),
    INDEX idx_docente_ciclo (docente_id, ciclo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Estructura base mejorada
CREATE TABLE estructura_portafolio_base (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    nivel INT NOT NULL DEFAULT 1,
    orden INT NOT NULL,
    requiere_credito INT DEFAULT 0,
    carpeta_padre_id INT DEFAULT NULL,
    pertenece_presentacion TINYINT(1) DEFAULT 0,
    icono VARCHAR(50) DEFAULT 'folder',
    color VARCHAR(20) DEFAULT '#007bff',
    activo TINYINT(1) DEFAULT 1,
    FOREIGN KEY (carpeta_padre_id) REFERENCES estructura_portafolio_base(id) ON DELETE SET NULL,
    INDEX idx_nivel_orden (nivel, orden),
    INDEX idx_padre_orden (carpeta_padre_id, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Portafolios mejorados con campos adicionales
CREATE TABLE portafolios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    docente_id INT NOT NULL,
    asignatura_id INT NULL,
    grupo VARCHAR(10) NULL COMMENT 'Grupo al que pertenece el portafolio (ej: A, B, C, etc.)',
    asignacion_id INT NULL COMMENT 'ID de la relación docente-asignatura',
    semestre_id INT NOT NULL,
    ciclo_id INT NOT NULL,
    estructura_id INT NULL,
    carpeta_padre_id INT DEFAULT NULL,
    nivel INT DEFAULT 0,
    ruta VARCHAR(500) NULL,
    estado ENUM('activo','bloqueado','archivado') DEFAULT 'activo',
    activo BOOLEAN DEFAULT 1,
    progreso_completado DECIMAL(5,2) DEFAULT 0.00,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT NULL COMMENT 'Usuario que creó el portafolio',
    actualizado_por INT NULL COMMENT 'Último usuario que actualizó el portafolio',
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE SET NULL,
    FOREIGN KEY (asignacion_id) REFERENCES docentes_asignaturas(id) ON DELETE SET NULL,
    FOREIGN KEY (semestre_id) REFERENCES semestres(id) ON DELETE RESTRICT,
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    FOREIGN KEY (estructura_id) REFERENCES estructura_portafolio_base(id) ON DELETE SET NULL,
    FOREIGN KEY (carpeta_padre_id) REFERENCES portafolios(id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actualizado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_docente_ciclo (docente_id, ciclo_id),
    INDEX idx_asignatura_ciclo (asignatura_id, ciclo_id),
    INDEX idx_asignacion (asignacion_id),
    INDEX idx_estructura (estructura_id),
    INDEX idx_estado (estado),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Archivos subidos mejorados (VERSION UNIFICADA)
CREATE TABLE archivos_subidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    portafolio_id INT NOT NULL,
    nombre_original VARCHAR(300) NOT NULL,
    nombre_sistema VARCHAR(300) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    formato ENUM('pdf', 'docx', 'xlsx', 'pptx', 'txt', 'jpg', 'png', 'otros') NOT NULL,
    tamanio BIGINT NOT NULL,
    estructura_id INT NULL,
    estado ENUM('pendiente','aprobado','rechazado','corregido','activo','eliminado','revisado','observado') DEFAULT 'pendiente',
    verificado_por INT NULL,
    fecha_verificacion DATETIME NULL,
    comentarios TEXT NULL,
    version INT DEFAULT 1,
    hash_contenido VARCHAR(64) NULL,
    subido_por INT NOT NULL,
    subido_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (portafolio_id) REFERENCES portafolios(id) ON DELETE CASCADE,
    FOREIGN KEY (estructura_id) REFERENCES estructura_portafolio_base(id) ON DELETE SET NULL,
    FOREIGN KEY (verificado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_portafolio_estructura (portafolio_id, estructura_id),
    INDEX idx_estado (estado),
    INDEX idx_verificado_por (verificado_por),
    INDEX idx_subido_por (subido_por),
    INDEX idx_fechas (subido_en, actualizado_en),
    INDEX idx_hash (hash_contenido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Observaciones mejoradas (VERSION UNIFICADA)
CREATE TABLE observaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    archivo_id INT NOT NULL,
    verificador_id INT NOT NULL,
    tipo ENUM('general','correccion','aprobacion','rechazo') DEFAULT 'general',
    contenido TEXT NOT NULL,
    estado ENUM('activa','resuelta','archivada') DEFAULT 'activa',
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    es_publica BOOLEAN DEFAULT 1,
    requiere_respuesta BOOLEAN DEFAULT 0,
    respondida BOOLEAN DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME NULL,
    resuelto_por INT NULL,
    FOREIGN KEY (archivo_id) REFERENCES archivos_subidos(id) ON DELETE CASCADE,
    FOREIGN KEY (verificador_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (resuelto_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_archivo_tipo (archivo_id, tipo),
    INDEX idx_verificador (verificador_id),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fechas (fecha_creacion, fecha_resolucion),
    INDEX idx_respondida (respondida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Respuestas a observaciones
CREATE TABLE respuestas_observaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    observacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    es_solucion BOOLEAN DEFAULT 0,
    adjunto_id INT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (observacion_id) REFERENCES observaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (adjunto_id) REFERENCES archivos_subidos(id) ON DELETE SET NULL,
    INDEX idx_observacion (observacion_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_solucion (es_solucion),
    INDEX idx_fechas (creado_en, actualizado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Parámetros del sistema
CREATE TABLE parametros_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(50) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    tipo ENUM('texto','numero','booleano','json','fecha') NOT NULL,
    descripcion TEXT NULL,
    categoria VARCHAR(50) NOT NULL,
    modificable TINYINT(1) DEFAULT 1,
    ciclo_id INT NULL,
    actualizado_por INT NULL,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    FOREIGN KEY (actualizado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_categoria (categoria),
    INDEX idx_ciclo (ciclo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Notificaciones del sistema (VERSION UNIFICADA)
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('sistema', 'documento', 'observacion', 'ciclo', 'asignacion', 'info','exito','advertencia','error') DEFAULT 'sistema',
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    enlace VARCHAR(500) NULL,
    datos_adicionales JSON NULL,
    leida TINYINT(1) DEFAULT 0,
    visto BOOLEAN DEFAULT 0,
    archivada BOOLEAN DEFAULT 0,
    fecha_lectura DATETIME NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_leida (usuario_id, leida),
    INDEX idx_usuario (usuario_id),
    INDEX idx_visto (visto),
    INDEX idx_tipo (tipo),
    INDEX idx_creada_en (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Registro de actividades (VERSION UNIFICADA)
CREATE TABLE actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM(
        'login', 'logout', 'creacion', 'actualizacion', 'eliminacion',
        'carga_masiva', 'descarga', 'cambio_estado', 'error'
    ) NOT NULL,
    modulo VARCHAR(50) NOT NULL COMMENT 'Módulo del sistema donde ocurrió la actividad',
    descripcion TEXT NOT NULL,
    usuario_id INT NULL,
    entidad VARCHAR(50) NULL,
    entidad_id INT NULL,
    detalles JSON NULL,
    datos_adicionales JSON NULL COMMENT 'Datos adicionales en formato JSON para auditoría',
    ip VARCHAR(45) NULL,
    ip_origen VARCHAR(45) NULL COMMENT 'Dirección IP del usuario que realizó la acción',
    agente_usuario VARCHAR(255) NULL,
    user_agent TEXT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo),
    INDEX idx_modulo (modulo),
    INDEX idx_usuario (usuario_id),
    INDEX idx_entidad (entidad, entidad_id),
    INDEX idx_fecha (fecha),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_tipo_fecha (tipo, fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Tabla de migraciones
CREATE TABLE migraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    aplicada_en DATETIME NOT NULL,
    estado ENUM('pendiente', 'aplicada', 'fallida') DEFAULT 'pendiente',
    error TEXT NULL,
    duracion_segundos DECIMAL(10,2) NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_nombre_migracion (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================
-- REGISTROS INICIALES
-- =======================================

-- Registro de la migración consolidada
INSERT INTO migraciones (nombre, descripcion, aplicada_en, estado)
VALUES ('consolidacion_final_corregida', 'Consolidación final corregida con orden correcto de tablas para evitar errores de referencias', NOW(), 'aplicada');

-- =======================================
-- CONFIGURACIONES INICIALES OPCIONALES
-- =======================================


-- =======================================
-- COMENTARIOS FINALES
-- =======================================

/*
CAMBIOS PRINCIPALES REALIZADOS:

1. ✅ ORDEN CORREGIDO: Movida la tabla 'ciclos_academicos' ANTES de 'estados_sistema'
2. ✅ REFERENCIAS CORREGIDAS: Todas las FK ahora apuntan a tablas existentes
3. ✅ TABLAS DUPLICADAS UNIFICADAS: Eliminadas duplicaciones y conflictos
4. ✅ ÍNDICES OPTIMIZADOS: Mejorados para mejor rendimiento
5. ✅ CONSTRAINTS MEJORADOS: Añadidos para integridad de datos
6. ✅ ENGINE ESPECIFICADO: Todas las tablas usan InnoDB explícitamente
7. ✅ CHARSET UNIFICADO: utf8mb4_unicode_ci en todas las tablas

ORDEN DE CREACIÓN CORRECTO:
1. usuarios (sin dependencias)
2. ciclos_academicos (depende de usuarios)
3. usuarios_roles (depende de usuarios)  
4. estados_sistema (depende de ciclos_academicos y usuarios)
5. semestres (depende de ciclos_academicos)
6. carreras (sin dependencias complejas)
7. asignaturas (depende de ciclos_academicos)
8. docentes_asignaturas (depende de usuarios, asignaturas, ciclos)
9. verificadores_docentes (depende de usuarios, ciclos)
10. estructura_portafolio_base (auto-referencial)
11. portafolios (depende de múltiples tablas)
12. archivos_subidos (depende de portafolios, usuarios, estructura)
13. observaciones (depende de archivos_subidos, usuarios)
14. respuestas_observaciones (depende de observaciones)
15. Tablas auxiliares (parámetros, notificaciones, actividades, migraciones)
*/