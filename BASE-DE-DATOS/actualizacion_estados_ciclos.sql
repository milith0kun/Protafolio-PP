-- =============================================
-- Script de Actualización: Estados de Ciclos Académicos
-- Descripción: Agregar nuevos estados de ciclo para mejorar el flujo de trabajo
-- Fecha: 2025-01-20
-- =============================================

-- Paso 1: Alterar la tabla para incluir los nuevos estados
ALTER TABLE ciclos_academicos 
MODIFY COLUMN estado ENUM(
    'preparacion', 
    'inicializacion', 
    'activo', 
    'verificacion', 
    'finalizacion', 
    'archivado'
) DEFAULT 'preparacion' 
COMMENT 'Estados del ciclo: preparacion->inicializacion->activo->verificacion->finalizacion->archivado';

-- Paso 2: Actualizar ciclos existentes que tengan estados antiguos
-- Mapear estados antiguos a nuevos estados
UPDATE ciclos_academicos 
SET estado = 'finalizacion' 
WHERE estado = 'cerrado';

-- Paso 3: Agregar columnas adicionales si no existen
ALTER TABLE ciclos_academicos 
ADD COLUMN IF NOT EXISTS fecha_inicializacion DATETIME NULL COMMENT 'Fecha cuando se inició la inicialización',
ADD COLUMN IF NOT EXISTS fecha_activacion DATETIME NULL COMMENT 'Fecha cuando se activó el ciclo',
ADD COLUMN IF NOT EXISTS fecha_inicio_verificacion DATETIME NULL COMMENT 'Fecha cuando se inició la verificación',
ADD COLUMN IF NOT EXISTS configuracion_estados JSON NULL COMMENT 'Configuración específica de cada estado';

-- Paso 4: Crear índices para optimizar consultas por estado
CREATE INDEX IF NOT EXISTS idx_ciclos_estado_fecha ON ciclos_academicos(estado, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_ciclos_verificacion ON ciclos_academicos(estado) WHERE estado = 'verificacion';

-- Paso 5: Crear triggers para mantener fechas automáticamente
DELIMITER //

CREATE TRIGGER IF NOT EXISTS tr_ciclo_estado_fechas
BEFORE UPDATE ON ciclos_academicos
FOR EACH ROW
BEGIN
    -- Registrar fecha de inicialización
    IF OLD.estado = 'preparacion' AND NEW.estado = 'inicializacion' THEN
        SET NEW.fecha_inicializacion = NOW();
    END IF;
    
    -- Registrar fecha de activación
    IF OLD.estado = 'inicializacion' AND NEW.estado = 'activo' THEN
        SET NEW.fecha_activacion = NOW();
    END IF;
    
    -- Registrar fecha de inicio de verificación
    IF OLD.estado = 'activo' AND NEW.estado = 'verificacion' THEN
        SET NEW.fecha_inicio_verificacion = NOW();
    END IF;
    
    -- Actualizar fecha de actualización
    SET NEW.actualizado_en = NOW();
END//

DELIMITER ;

-- Paso 6: Insertar configuraciones por defecto para los estados
UPDATE ciclos_academicos 
SET configuracion_estados = JSON_OBJECT(
    'preparacion', JSON_OBJECT(
        'puede_recibir_archivos', true,
        'permite_edicion', true,
        'descripcion', 'Ciclo en preparación, se pueden cargar archivos'
    ),
    'inicializacion', JSON_OBJECT(
        'puede_recibir_archivos', true,
        'permite_edicion', false,
        'descripcion', 'Ciclo en proceso de inicialización'
    ),
    'activo', JSON_OBJECT(
        'puede_recibir_archivos', false,
        'permite_edicion', false,
        'descripcion', 'Ciclo activo para operaciones'
    ),
    'verificacion', JSON_OBJECT(
        'puede_recibir_archivos', false,
        'permite_edicion', false,
        'descripcion', 'Ciclo en proceso de verificación'
    ),
    'finalizacion', JSON_OBJECT(
        'puede_recibir_archivos', false,
        'permite_edicion', false,
        'descripcion', 'Ciclo finalizado'
    ),
    'archivado', JSON_OBJECT(
        'puede_recibir_archivos', false,
        'permite_edicion', false,
        'descripcion', 'Ciclo archivado para consulta histórica'
    )
)
WHERE configuracion_estados IS NULL;

-- Paso 7: Crear vista para consultar estados de ciclos
CREATE OR REPLACE VIEW vista_ciclos_estados AS
SELECT 
    id,
    nombre,
    estado,
    fecha_inicio,
    fecha_fin,
    fecha_inicializacion,
    fecha_activacion,
    fecha_inicio_verificacion,
    fecha_cierre_real,
    CASE 
        WHEN estado IN ('preparacion', 'inicializacion') THEN TRUE
        ELSE FALSE
    END AS puede_recibir_archivos,
    CASE 
        WHEN estado = 'verificacion' THEN TRUE
        ELSE FALSE
    END AS esta_en_verificacion,
    CASE 
        WHEN estado = 'preparacion' THEN TRUE
        ELSE FALSE
    END AS puede_ser_activado,
    CASE 
        WHEN estado = 'verificacion' THEN TRUE
        ELSE FALSE
    END AS puede_ser_finalizado,
    creado_en,
    actualizado_en
FROM ciclos_academicos
ORDER BY 
    CASE estado
        WHEN 'verificacion' THEN 1
        WHEN 'activo' THEN 2
        WHEN 'inicializacion' THEN 3
        WHEN 'preparacion' THEN 4
        WHEN 'finalizacion' THEN 5
        WHEN 'archivado' THEN 6
    END,
    fecha_inicio DESC;

-- Paso 8: Crear función para obtener el ciclo en verificación
DELIMITER //

CREATE FUNCTION IF NOT EXISTS obtener_ciclo_en_verificacion()
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE ciclo_id INT DEFAULT NULL;
    
    SELECT id INTO ciclo_id
    FROM ciclos_academicos 
    WHERE estado = 'verificacion'
    LIMIT 1;
    
    RETURN ciclo_id;
END//

DELIMITER ;

-- Paso 9: Crear procedimiento para cambiar estado de ciclo con validaciones
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS cambiar_estado_ciclo(
    IN p_ciclo_id INT,
    IN p_nuevo_estado ENUM('preparacion', 'inicializacion', 'activo', 'verificacion', 'finalizacion', 'archivado'),
    IN p_usuario_id INT,
    OUT p_resultado VARCHAR(255)
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    DECLARE v_ciclo_verificacion INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_resultado = 'Error al cambiar estado del ciclo';
    END;
    
    START TRANSACTION;
    
    -- Obtener estado actual
    SELECT estado INTO v_estado_actual
    FROM ciclos_academicos 
    WHERE id = p_ciclo_id;
    
    -- Validar que el ciclo existe
    IF v_estado_actual IS NULL THEN
        SET p_resultado = 'Ciclo no encontrado';
        ROLLBACK;
    ELSE
        -- Validaciones específicas
        IF p_nuevo_estado = 'verificacion' THEN
            -- Solo puede haber un ciclo en verificación
            SET v_ciclo_verificacion = obtener_ciclo_en_verificacion();
            IF v_ciclo_verificacion IS NOT NULL AND v_ciclo_verificacion != p_ciclo_id THEN
                SET p_resultado = 'Ya existe un ciclo en verificación';
                ROLLBACK;
            ELSE
                -- Cambiar estado
                UPDATE ciclos_academicos 
                SET estado = p_nuevo_estado,
                    actualizado_en = NOW()
                WHERE id = p_ciclo_id;
                
                SET p_resultado = 'Estado cambiado exitosamente';
                COMMIT;
            END IF;
        ELSE
            -- Cambiar estado normal
            UPDATE ciclos_academicos 
            SET estado = p_nuevo_estado,
                actualizado_en = NOW(),
                cerrado_por = IF(p_nuevo_estado = 'finalizacion', p_usuario_id, cerrado_por)
            WHERE id = p_ciclo_id;
            
            SET p_resultado = 'Estado cambiado exitosamente';
            COMMIT;
        END IF;
    END IF;
END//

DELIMITER ;

-- Paso 10: Mostrar resumen de cambios
SELECT 
    'Actualización completada' as resultado,
    COUNT(*) as total_ciclos,
    GROUP_CONCAT(DISTINCT estado) as estados_disponibles
FROM ciclos_academicos;

-- Mostrar ciclos por estado
SELECT 
    estado,
    COUNT(*) as cantidad,
    GROUP_CONCAT(nombre SEPARATOR ', ') as nombres_ciclos
FROM ciclos_academicos 
GROUP BY estado
ORDER BY 
    CASE estado
        WHEN 'verificacion' THEN 1
        WHEN 'activo' THEN 2
        WHEN 'inicializacion' THEN 3
        WHEN 'preparacion' THEN 4
        WHEN 'finalizacion' THEN 5
        WHEN 'archivado' THEN 6
    END; 