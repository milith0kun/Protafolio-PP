-- =============================================================
-- 🚀 MIGRACIÓN: Tabla de Archivos de Carga Masiva
-- Fecha: 2025-06-20
-- Propósito: Implementar persistencia de archivos por ciclo académico
-- =============================================================

USE portafolio_docente_carga_academica;

-- =======================================
-- 1. CREAR TABLA ARCHIVOS_CARGA_MASIVA
-- =======================================

CREATE TABLE IF NOT EXISTS archivos_carga_masiva (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ciclo_id INT NOT NULL COMMENT 'ID del ciclo académico al que pertenece',
    tipo_archivo VARCHAR(50) NOT NULL COMMENT 'Tipo: usuarios, carreras, asignaturas, carga_academica, verificaciones, codigos_institucionales',
    nombre_original VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo subido',
    nombre_sistema VARCHAR(255) NOT NULL COMMENT 'Nombre único generado por el sistema',
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta donde se almacena el archivo',
    tamanio_bytes BIGINT NOT NULL COMMENT 'Tamaño del archivo en bytes',
    registros_procesados INT DEFAULT 0 COMMENT 'Número de registros procesados exitosamente',
    registros_errores INT DEFAULT 0 COMMENT 'Número de registros con errores',
    estado ENUM('procesado', 'error', 'activo', 'archivado') DEFAULT 'procesado' COMMENT 'Estado del archivo',
    detalles_procesamiento JSON NULL COMMENT 'Detalles del procesamiento en formato JSON',
    hash_archivo VARCHAR(64) NULL COMMENT 'Hash SHA-256 del archivo para verificación',
    subido_por INT NOT NULL COMMENT 'ID del administrador que subió el archivo',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de subida',
    fecha_procesamiento TIMESTAMP NULL COMMENT 'Fecha y hora de procesamiento',
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (ciclo_id) REFERENCES ciclos_academicos(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Índices para optimización
    INDEX idx_ciclo_tipo (ciclo_id, tipo_archivo),
    INDEX idx_estado (estado),
    INDEX idx_subido_por (subido_por),
    INDEX idx_fecha_subida (fecha_subida),
    INDEX idx_hash (hash_archivo),
    
    -- Constraint único: solo un archivo por tipo por ciclo
    UNIQUE KEY uk_ciclo_tipo_activo (ciclo_id, tipo_archivo, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Almacena archivos de carga masiva asociados a ciclos académicos';

-- =======================================
-- 2. AGREGAR CAMPO FALTANTE EN ARCHIVOS_SUBIDOS
-- =======================================

-- Verificar y agregar campo verificado_por si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'portafolio_docente_carga_academica' 
    AND TABLE_NAME = 'archivos_subidos' 
    AND COLUMN_NAME = 'verificado_por'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE archivos_subidos ADD COLUMN verificado_por INT NULL COMMENT "Usuario que verificó el archivo" AFTER estado',
    'SELECT "Campo verificado_por ya existe" as mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar clave foránea para verificado_por si no existe
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'portafolio_docente_carga_academica' 
    AND TABLE_NAME = 'archivos_subidos' 
    AND COLUMN_NAME = 'verificado_por'
    AND REFERENCED_TABLE_NAME IS NOT NULL
);

SET @sql_fk = IF(@fk_exists = 0, 
    'ALTER TABLE archivos_subidos ADD FOREIGN KEY fk_verificado_por (verificado_por) REFERENCES usuarios(id) ON DELETE SET NULL',
    'SELECT "Foreign key para verificado_por ya existe" as mensaje'
);

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- =======================================
-- 3. CREAR PROCEDIMIENTO PARA GESTIONAR ARCHIVOS
-- =======================================

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS RegistrarArchivoCargaMasiva(
    IN p_ciclo_id INT,
    IN p_tipo_archivo VARCHAR(50),
    IN p_nombre_original VARCHAR(255),
    IN p_nombre_sistema VARCHAR(255),
    IN p_ruta_archivo VARCHAR(500),
    IN p_tamanio_bytes BIGINT,
    IN p_registros_procesados INT,
    IN p_registros_errores INT,
    IN p_detalles_procesamiento JSON,
    IN p_hash_archivo VARCHAR(64),
    IN p_subido_por INT,
    OUT p_archivo_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Archivar archivo anterior del mismo tipo si existe
    UPDATE archivos_carga_masiva 
    SET estado = 'archivado'
    WHERE ciclo_id = p_ciclo_id 
      AND tipo_archivo = p_tipo_archivo 
      AND estado = 'activo';
    
    -- Insertar nuevo archivo
    INSERT INTO archivos_carga_masiva (
        ciclo_id, tipo_archivo, nombre_original, nombre_sistema, 
        ruta_archivo, tamanio_bytes, registros_procesados, registros_errores,
        detalles_procesamiento, hash_archivo, subido_por, estado,
        fecha_procesamiento
    ) VALUES (
        p_ciclo_id, p_tipo_archivo, p_nombre_original, p_nombre_sistema,
        p_ruta_archivo, p_tamanio_bytes, p_registros_procesados, p_registros_errores,
        p_detalles_procesamiento, p_hash_archivo, p_subido_por, 'activo',
        NOW()
    );
    
    SET p_archivo_id = LAST_INSERT_ID();
    
    COMMIT;
END//

DELIMITER ;

-- =======================================
-- 4. CREAR VISTA PARA CONSULTAS RÁPIDAS
-- =======================================

CREATE OR REPLACE VIEW vista_archivos_por_ciclo AS
SELECT 
    acm.id,
    acm.ciclo_id,
    ca.nombre as ciclo_nombre,
    ca.estado as ciclo_estado,
    acm.tipo_archivo,
    acm.nombre_original,
    acm.tamanio_bytes,
    acm.registros_procesados,
    acm.registros_errores,
    acm.estado,
    acm.fecha_subida,
    acm.fecha_procesamiento,
    u.nombres as subido_por_nombre,
    u.apellidos as subido_por_apellido,
    u.correo as subido_por_correo
FROM archivos_carga_masiva acm
INNER JOIN ciclos_academicos ca ON acm.ciclo_id = ca.id
INNER JOIN usuarios u ON acm.subido_por = u.id
ORDER BY acm.ciclo_id DESC, acm.fecha_subida DESC;

-- =======================================
-- 5. INSERTAR DATOS DE MIGRACIÓN
-- =======================================

INSERT INTO migraciones (nombre, descripcion, aplicada_en, estado) 
VALUES (
    'archivos_carga_masiva_2025_06_20', 
    'Agregada tabla archivos_carga_masiva para persistencia de archivos por ciclo académico',
    NOW(), 
    'aplicada'
);

-- =======================================
-- 6. VERIFICACIÓN FINAL
-- =======================================

SELECT 'Migración completada exitosamente' as mensaje;
SELECT COUNT(*) as total_tablas FROM information_schema.tables WHERE table_schema = 'portafolio_docente_carga_academica';
SELECT 'archivos_carga_masiva' as tabla_nueva, COUNT(*) as registros FROM archivos_carga_masiva;

-- =======================================
-- COMENTARIOS FINALES
-- =======================================

/*
FUNCIONALIDADES AGREGADAS:

1. ✅ TABLA archivos_carga_masiva:
   - Almacena archivos por ciclo académico
   - Control de versiones (archiva anteriores)
   - Detalles de procesamiento en JSON
   - Hash para verificación de integridad

2. ✅ PROCEDIMIENTO RegistrarArchivoCargaMasiva:
   - Registra archivos de manera segura
   - Archiva versiones anteriores automáticamente
   - Manejo de transacciones

3. ✅ VISTA vista_archivos_por_ciclo:
   - Consultas optimizadas
   - Join con datos de ciclo y usuario

4. ✅ CORRECCIONES:
   - Campo verificado_por en archivos_subidos
   - Constraints mejorados

PRÓXIMOS PASOS:
1. Ejecutar esta migración
2. Actualizar controladores backend
3. Modificar frontend para persistencia real
*/ 