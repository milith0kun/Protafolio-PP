-- =============================================================
-- 📊 DATOS MÍNIMOS DE INICIALIZACIÓN
-- Sistema Portafolio Docente UNSAAC
-- Datos esenciales para arrancar el sistema
-- Los datos masivos se cargarán posteriormente via Excel
-- =============================================================

USE portafolio_docente_carga_academica;

-- =======================================
-- 1. USUARIO ADMINISTRADOR INICIAL
-- =======================================

-- Usuario administrador del sistema (contraseña: admin123)
INSERT INTO usuarios (nombres, apellidos, correo, contrasena, activo) VALUES 
('Administrador', 'Sistema', 'admin@unsaac.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- Asignar rol de administrador al usuario inicial
INSERT INTO usuarios_roles (usuario_id, rol, activo, asignado_por) VALUES 
(1, 'administrador', 1, 1);

-- =======================================
-- 2. CICLO ACADÉMICO INICIAL
-- =======================================

-- Ciclo académico actual
INSERT INTO ciclos_academicos (nombre, descripcion, estado, fecha_inicio, fecha_fin, semestre_actual, anio_actual, creado_por) VALUES 
('2024-I', 'Primer semestre académico 2024', 'activo', '2024-04-01', '2024-07-31', '2024-I', 2024, 1);

-- Estados de módulos del sistema para el ciclo inicial
INSERT INTO estados_sistema (ciclo_id, modulo, habilitado, actualizado_por) VALUES 
(1, 'carga_datos', 1, 1),          -- Módulo de carga habilitado
(1, 'gestion_documentos', 0, 1),   -- Gestión de documentos deshabilitado inicialmente
(1, 'verificacion', 0, 1),         -- Verificación deshabilitado inicialmente  
(1, 'reportes', 0, 1);             -- Reportes deshabilitado inicialmente

-- =======================================
-- 3. SEMESTRES ESTÁNDAR
-- =======================================

-- Semestres académicos estándar (I al X)
INSERT INTO semestres (nombre, ciclo_id, activo) VALUES 
('I', 1, 1),   ('II', 1, 1),  ('III', 1, 1), ('IV', 1, 1),  ('V', 1, 1),
('VI', 1, 1),  ('VII', 1, 1), ('VIII', 1, 1),('IX', 1, 1),  ('X', 1, 1);

-- =======================================
-- 4. PARÁMETROS BÁSICOS DEL SISTEMA
-- =======================================

INSERT INTO parametros_sistema (clave, valor, tipo, descripcion, categoria, modificable, actualizado_por) VALUES
-- Configuración de archivos
('max_tamanio_archivo_mb', '50', 'numero', 'Tamaño máximo de archivo en MB', 'archivos', 1, 1),
('formatos_permitidos', '["pdf","docx","xlsx","pptx","jpg","png","txt"]', 'json', 'Formatos de archivo permitidos', 'archivos', 1, 1),

-- Configuración de plazos
('dias_plazo_entrega', '15', 'numero', 'Días de plazo para entrega de documentos', 'plazos', 1, 1),
('dias_plazo_verificacion', '7', 'numero', 'Días de plazo para verificación de documentos', 'plazos', 1, 1),

-- Configuración de verificación
('porcentaje_minimo_aprobacion', '70', 'numero', 'Porcentaje mínimo para aprobar verificación', 'verificacion', 1, 1),

-- Configuración de notificaciones
('notificaciones_email', 'true', 'booleano', 'Enviar notificaciones por email', 'notificaciones', 1, 1),
('notificaciones_push', 'true', 'booleano', 'Enviar notificaciones push', 'notificaciones', 1, 1),

-- Configuración de seguridad
('max_intentos_login', '5', 'numero', 'Máximo de intentos fallidos de login', 'seguridad', 1, 1),
('tiempo_bloqueo_minutos', '30', 'numero', 'Tiempo de bloqueo tras intentos fallidos (minutos)', 'seguridad', 1, 1),
('sesion_duracion_horas', '8', 'numero', 'Duración máxima de sesión en horas', 'seguridad', 1, 1),

-- Información del sistema
('version_sistema', '2.0.0', 'texto', 'Versión actual del sistema', 'sistema', 0, 1),
('nombre_institucion', 'Universidad Nacional de San Antonio Abad del Cusco', 'texto', 'Nombre de la institución', 'sistema', 1, 1),
('sigla_institucion', 'UNSAAC', 'texto', 'Sigla de la institución', 'sistema', 1, 1);

-- =======================================
-- 5. ESTRUCTURA COMPLETA DEL PORTAFOLIO
-- =======================================

-- NIVEL 0: CARPETA RAÍZ DE PRESENTACIÓN (COMÚN A TODOS LOS CURSOS)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('0. PRESENTACIÓN DEL PORTAFOLIO', 'Carpeta principal de presentación común a todos los cursos del docente', 1, 1, 0, NULL, 1, 'user-circle', '#2563eb', 1);

-- SUBCARPETAS DE PRESENTACIÓN (NIVEL 1)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('0.1 CARÁTULA', 'Carátula oficial del portafolio docente', 2, 1, 0, 1, 1, 'file-text', '#3b82f6', 1),
('0.2 CARGA ACADÉMICA', 'Documento de carga académica asignada', 2, 2, 0, 1, 1, 'calendar', '#3b82f6', 1),
('0.3 FILOSOFÍA DOCENTE', 'Filosofía y metodología de enseñanza del docente', 2, 3, 0, 1, 1, 'book-open', '#3b82f6', 1),
('0.4 CURRÍCULUM VITAE', 'Currículum vitae actualizado del docente', 2, 4, 0, 1, 1, 'user', '#3b82f6', 1);

-- NIVEL 0: CARPETA PRINCIPAL POR CURSO (PLANTILLA)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('Curso: [NOMBRE DEL CURSO] – [CÓDIGO]', 'Carpeta principal del curso específico (se genera automáticamente)', 1, 2, 0, NULL, 0, 'graduation-cap', '#059669', 1);

-- CARPETAS PRINCIPALES DEL CURSO (NIVEL 1)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('1. SILABOS', 'Sílabos oficiales del curso', 2, 1, 0, 5, 0, 'file-text', '#10b981', 1),
('2. AVANCE ACADÉMICO POR SESIONES', 'Registro del avance académico por cada sesión de clase', 2, 2, 0, 5, 0, 'calendar-days', '#10b981', 1),
('3. MATERIAL DE ENSEÑANZA', 'Material didáctico organizado por unidades', 2, 3, 0, 5, 0, 'book', '#10b981', 1),
('4. ASIGNACIONES', 'Asignaciones y tareas del curso', 2, 4, 0, 5, 0, 'clipboard-list', '#10b981', 1),
('5. ENUNCIADO DE EXÁMENES Y SOLUCIÓN', 'Exámenes, enunciados y sus respectivas soluciones', 2, 5, 0, 5, 0, 'file-check', '#10b981', 1),
('6. TRABAJOS ESTUDIANTILES', 'Trabajos de estudiantes organizados por calificación', 2, 6, 0, 5, 0, 'users', '#10b981', 1),
('7. ARCHIVOS PORTAFOLIO DOCENTE', 'Archivos administrativos del portafolio', 2, 7, 0, 5, 0, 'folder', '#10b981', 1);

-- SUBCARPETAS DE SÍLABOS (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('1.1 SILABO UNSAAC', 'Sílabo oficial según formato UNSAAC', 3, 1, 0, 6, 0, 'file', '#34d399', 1),
('1.2 SILABO ICACIT', 'Sílabo según estándares ICACIT', 3, 2, 0, 6, 0, 'file', '#34d399', 1),
('1.3 REGISTRO DE ENTREGA DE SILABO', 'Constancia de entrega del sílabo a estudiantes', 3, 3, 0, 6, 0, 'file-check', '#34d399', 1);

-- SUBCARPETAS DE MATERIAL DE ENSEÑANZA (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('3.1 PRIMERA UNIDAD', 'Material didáctico de la primera unidad', 3, 1, 0, 8, 0, 'folder', '#34d399', 1),
('3.2 SEGUNDA UNIDAD', 'Material didáctico de la segunda unidad', 3, 2, 0, 8, 0, 'folder', '#34d399', 1),
('3.3 TERCERA UNIDAD', 'Material didáctico de la tercera unidad (solo cursos 4-5 créditos)', 3, 3, 4, 8, 0, 'folder', '#34d399', 1);

-- SUBCARPETAS DE EXÁMENES (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.1 EXAMEN DE ENTRADA', 'Examen diagnóstico de entrada', 3, 1, 0, 10, 0, 'file-text', '#34d399', 1),
('5.2 PRIMER EXAMEN', 'Primer examen parcial', 3, 2, 0, 10, 0, 'file-text', '#34d399', 1),
('5.3 SEGUNDO EXAMEN', 'Segundo examen parcial', 3, 3, 0, 10, 0, 'file-text', '#34d399', 1),
('5.4 TERCER EXAMEN', 'Tercer examen parcial (solo cursos 4-5 créditos)', 3, 4, 4, 10, 0, 'file-text', '#34d399', 1);

-- SUBCARPETAS DE EXAMEN DE ENTRADA (NIVEL 3)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.1.1 ENUNCIADO DE EXAMEN Y RESOLUCIÓN', 'Enunciado del examen de entrada y su resolución', 4, 1, 0, 17, 0, 'file', '#6ee7b7', 1),
('5.1.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al examen de entrada', 4, 2, 0, 17, 0, 'users', '#6ee7b7', 1),
('5.1.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del examen de entrada', 4, 3, 0, 17, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE PRIMER EXAMEN (NIVEL 3)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.2.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', 'Enunciado del primer examen y su resolución', 4, 1, 0, 18, 0, 'file', '#6ee7b7', 1),
('5.2.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al primer examen', 4, 2, 0, 18, 0, 'users', '#6ee7b7', 1),
('5.2.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del primer examen', 4, 3, 0, 18, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE SEGUNDO EXAMEN (NIVEL 3)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.3.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', 'Enunciado del segundo examen y su resolución', 4, 1, 0, 19, 0, 'file', '#6ee7b7', 1),
('5.3.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al segundo examen', 4, 2, 0, 19, 0, 'users', '#6ee7b7', 1),
('5.3.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del segundo examen', 4, 3, 0, 19, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE TERCER EXAMEN (NIVEL 3) - Solo cursos 4-5 créditos
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.4.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', 'Enunciado del tercer examen y su resolución', 4, 1, 4, 20, 0, 'file', '#6ee7b7', 1),
('5.4.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al tercer examen', 4, 2, 4, 20, 0, 'users', '#6ee7b7', 1),
('5.4.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del tercer examen', 4, 3, 4, 20, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE TRABAJOS ESTUDIANTILES (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('6.1 EXCELENTE (19–20)', 'Trabajos estudiantiles con calificación excelente', 3, 1, 0, 11, 0, 'star', '#34d399', 1),
('6.2 BUENO (16–18)', 'Trabajos estudiantiles con calificación buena', 3, 2, 0, 11, 0, 'thumbs-up', '#34d399', 1),
('6.3 REGULAR (14–15)', 'Trabajos estudiantiles con calificación regular', 3, 3, 0, 11, 0, 'minus', '#34d399', 1),
('6.4 MALO (10–13)', 'Trabajos estudiantiles con calificación mala', 3, 4, 0, 11, 0, 'thumbs-down', '#34d399', 1),
('6.5 POBRE (0–07)', 'Trabajos estudiantiles con calificación pobre', 3, 5, 0, 11, 0, 'x-circle', '#34d399', 1);

-- SUBCARPETAS DE ARCHIVOS PORTAFOLIO DOCENTE (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('7.1 ASISTENCIA DE ALUMNOS', 'Registro de asistencia de estudiantes', 3, 1, 0, 12, 0, 'user-check', '#34d399', 1),
('7.2 REGISTRO DE NOTAS DEL CENTRO DE CÓMPUTO', 'Registro oficial de notas del centro de cómputo', 3, 2, 0, 12, 0, 'file-spreadsheet', '#34d399', 1),
('7.3 CIERRE DE PORTAFOLIO', 'Documentos de cierre del portafolio', 3, 3, 0, 12, 0, 'file-check', '#34d399', 1);

-- =======================================
-- 6. ASIGNAR TODOS LOS ROLES AL ADMINISTRADOR
-- =======================================

-- El administrador tiene todos los roles para gestión completa del sistema
INSERT INTO usuarios_roles (usuario_id, rol, activo, asignado_por) VALUES 
(1, 'docente', 1, 1),        -- Admin también puede ser docente
(1, 'verificador', 1, 1);    -- Admin también puede ser verificador

-- =======================================
-- 7. USUARIOS ESPECÍFICOS POR ROL
-- =======================================

-- DOCENTES DE PRUEBA
INSERT INTO usuarios (nombres, apellidos, correo, contrasena, activo) VALUES 
('Juan Carlos', 'Pérez López', 'juan.perez@unsaac.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
('María Elena', 'Gutiérrez Vega', 'maria.gutierrez@unsaac.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
('Carlos Alberto', 'Quispe Mamani', 'carlos.quispe@unsaac.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- VERIFICADORES DE PRUEBA
INSERT INTO usuarios (nombres, apellidos, correo, contrasena, activo) VALUES 
('Ana Lucía', 'Rodríguez Huamán', 'ana.rodriguez@unsaac.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
('Pedro Miguel', 'Condori Soto', 'pedro.condori@unsaac.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- ADMINISTRADOR ADICIONAL
INSERT INTO usuarios (nombres, apellidos, correo, contrasena, activo) VALUES 
('Laura Patricia', 'Mendoza Cruz', 'laura.mendoza@unsaac.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- =======================================
-- 8. ASIGNACIÓN DE ROLES ESPECÍFICOS
-- =======================================

-- Roles para DOCENTES
INSERT INTO usuarios_roles (usuario_id, rol, activo, asignado_por) VALUES 
(2, 'docente', 1, 1),     -- Juan Carlos - Docente
(3, 'docente', 1, 1),     -- María Elena - Docente  
(4, 'docente', 1, 1);     -- Carlos Alberto - Docente

-- Roles para VERIFICADORES
INSERT INTO usuarios_roles (usuario_id, rol, activo, asignado_por) VALUES 
(5, 'verificador', 1, 1), -- Ana Lucía - Verificador
(6, 'verificador', 1, 1); -- Pedro Miguel - Verificador

-- Rol para ADMINISTRADOR ADICIONAL
INSERT INTO usuarios_roles (usuario_id, rol, activo, asignado_por) VALUES 
(7, 'administrador', 1, 1); -- Laura Patricia - Administrador

-- ALGUNOS USUARIOS CON MÚLTIPLES ROLES (más realista)
INSERT INTO usuarios_roles (usuario_id, rol, activo, asignado_por) VALUES 
(3, 'verificador', 1, 1),  -- María Elena también es verificador
(5, 'docente', 1, 1),      -- Ana Lucía también es docente
(7, 'docente', 1, 1),      -- Laura también puede ser docente
(7, 'verificador', 1, 1);  -- Laura también puede ser verificador

-- =======================================
-- 9. CARRERAS DE EJEMPLO
-- =======================================

-- Carreras principales de la UNSAAC para pruebas
INSERT INTO carreras (codigo, nombre, facultad, duracion_semestres, grado_otorgado, activo) VALUES
('ING-SIS', 'Ingeniería de Sistemas', 'Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica', 10, 'Ingeniero de Sistemas', 1),
('ING-INF', 'Ingeniería Informática', 'Facultad de Ingeniería Eléctrica, Electrónica, Informática y Mecánica', 10, 'Ingeniero Informático', 1),
('MED-HUM', 'Medicina Humana', 'Facultad de Medicina Humana', 12, 'Médico Cirujano', 1);

-- =======================================
-- 10. ASIGNATURAS DE EJEMPLO
-- =======================================

-- Asignaturas de muestra para cada carrera
INSERT INTO asignaturas (nombre, codigo, carrera, semestre, anio, creditos, horas_teoricas, tipo, ciclo_id, activo) VALUES
-- Ingeniería de Sistemas
('Programación I', 'IS-101', 'Ingeniería de Sistemas', 'I', 2024, 4, 3, 'teoria', 1, 1),
('Algoritmos y Estructura de Datos', 'IS-201', 'Ingeniería de Sistemas', 'II', 2024, 4, 3, 'teoria', 1, 1),
('Programación Orientada a Objetos', 'IS-301', 'Ingeniería de Sistemas', 'III', 2024, 4, 3, 'teoria', 1, 1),
('Base de Datos', 'IS-401', 'Ingeniería de Sistemas', 'IV', 2024, 5, 4, 'teoria', 1, 1),

-- Ingeniería Informática  
('Fundamentos de Programación', 'II-101', 'Ingeniería Informática', 'I', 2024, 4, 3, 'teoria', 1, 1),
('Matemática Discreta', 'II-102', 'Ingeniería Informática', 'I', 2024, 3, 2, 'teoria', 1, 1),

-- Medicina Humana
('Anatomía Humana I', 'MH-201', 'Medicina Humana', 'II', 2024, 5, 4, 'teoria', 1, 1),
('Fisiología Humana', 'MH-301', 'Medicina Humana', 'III', 2024, 5, 4, 'teoria', 1, 1);

-- =======================================
-- 11. ASIGNACIONES DOCENTE-ASIGNATURA
-- =======================================

-- Asignaciones de docentes a asignaturas para pruebas
INSERT INTO docentes_asignaturas (docente_id, asignatura_id, ciclo_id, grupo, activo, asignado_por) VALUES
-- Juan Carlos Pérez - Ingeniería de Sistemas
(2, 1, 1, 'A', 1, 1),  -- Programación I - Grupo A
(2, 3, 1, 'A', 1, 1),  -- POO - Grupo A

-- María Elena Gutiérrez - Ingeniería de Sistemas e Informática
(3, 2, 1, 'A', 1, 1),  -- Algoritmos - Grupo A  
(3, 5, 1, 'A', 1, 1),  -- Fundamentos de Programación - Grupo A

-- Carlos Alberto Quispe - Base de Datos
(4, 4, 1, 'A', 1, 1),  -- Base de Datos - Grupo A

-- Ana Lucía Rodríguez (docente-verificador) - Medicina
(5, 7, 1, 'A', 1, 1);  -- Anatomía Humana I - Grupo A

-- =======================================
-- 12. ASIGNACIONES VERIFICADOR-DOCENTE  
-- =======================================

-- Asignaciones de verificadores a docentes
INSERT INTO verificadores_docentes (verificador_id, docente_id, ciclo_id, activo, asignado_por) VALUES
-- Ana Lucía verifica a Juan Carlos y Carlos Alberto
(5, 2, 1, 1, 1),  -- Ana → Juan Carlos
(5, 4, 1, 1, 1),  -- Ana → Carlos Alberto  

-- Pedro Miguel verifica a María Elena
(6, 3, 1, 1, 1),  -- Pedro → María Elena

-- María Elena (verificador) verifica a Ana Lucía (cuando actúa como docente)
(3, 5, 1, 1, 1);  -- María → Ana Lucía

-- =======================================
-- 13. PORTAFOLIOS DE EJEMPLO
-- =======================================

-- Portafolios automáticos basados en las asignaciones
INSERT INTO portafolios (nombre, docente_id, asignatura_id, grupo, asignacion_id, semestre_id, ciclo_id, estado, activo, creado_por) VALUES
-- Portafolios de Juan Carlos Pérez
('Portafolio Programación I - 2024-I', 2, 1, 'A', 1, 1, 1, 'activo', 1, 1),
('Portafolio POO - 2024-I', 2, 3, 'A', 2, 3, 1, 'activo', 1, 1),

-- Portafolios de María Elena Gutiérrez  
('Portafolio Algoritmos - 2024-I', 3, 2, 'A', 3, 2, 1, 'activo', 1, 1),
('Portafolio Fundamentos Prog - 2024-I', 3, 5, 'A', 4, 1, 1, 'activo', 1, 1),

-- Portafolio de Carlos Alberto Quispe
('Portafolio Base de Datos - 2024-I', 4, 4, 'A', 5, 4, 1, 'activo', 1, 1),

-- Portafolio de Ana Lucía Rodríguez
('Portafolio Anatomía Humana I - 2024-I', 5, 7, 'A', 6, 2, 1, 'activo', 1, 1);

-- =======================================
-- 14. NOTIFICACIONES DE BIENVENIDA
-- =======================================

-- Notificaciones de bienvenida para todos los usuarios
INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje) VALUES 
-- Administrador principal
(1, 'sistema', 'Bienvenido al Sistema de Portafolio Docente', 
 'Sistema inicializado correctamente. Tienes acceso completo como administrador, docente y verificador.'),

-- Docentes
(2, 'sistema', 'Bienvenido Docente', 
 'Tu cuenta de docente ha sido creada. Tienes asignadas 2 asignaturas para el ciclo 2024-I.'),
(3, 'sistema', 'Bienvenido Docente-Verificador', 
 'Tu cuenta ha sido creada con roles de docente y verificador. Revisa tus asignaciones.'),
(4, 'sistema', 'Bienvenido Docente', 
 'Tu cuenta de docente ha sido creada. Tienes 1 asignatura asignada para el ciclo 2024-I.'),

-- Verificadores
(5, 'sistema', 'Bienvenido Docente-Verificador', 
 'Tu cuenta ha sido creada con roles de docente y verificador. Revisa tus responsabilidades.'),
(6, 'sistema', 'Bienvenido Verificador', 
 'Tu cuenta de verificador ha sido creada. Tienes docentes asignados para verificar.'),

-- Administrador adicional
(7, 'sistema', 'Bienvenido Administrador', 
 'Tu cuenta de administrador ha sido creada con permisos completos del sistema.');

-- =======================================
-- CREDENCIALES DE ACCESO
-- =======================================

/*
🔐 CREDENCIALES DE ACCESO INICIAL (Contraseña para todos: "password123"):

👨‍💼 ADMINISTRADORES:
- admin@unsaac.edu.pe (Administrador principal - TODOS LOS ROLES)
- laura.mendoza@unsaac.edu.pe (Administrador adicional + docente + verificador)

👨‍🏫 DOCENTES:
- juan.perez@unsaac.edu.pe (Docente - 2 asignaturas)
- maria.gutierrez@unsaac.edu.pe (Docente + Verificador - 2 asignaturas)
- carlos.quispe@unsaac.edu.pe (Docente - 1 asignatura)
- ana.rodriguez@unsaac.edu.pe (Docente + Verificador - 1 asignatura)

🔍 VERIFICADORES:
- ana.rodriguez@unsaac.edu.pe (Verificador + Docente)
- pedro.condori@unsaac.edu.pe (Verificador puro)
- maria.gutierrez@unsaac.edu.pe (Verificador + Docente)
- laura.mendoza@unsaac.edu.pe (Verificador + Administrador + Docente)

📊 RESUMEN DE ROLES:
- 3 Administradores (admin principal + 2 adicionales)
- 5 Docentes (con diferentes combinaciones de roles)
- 4 Verificadores (algunos con múltiples roles)
- Total: 7 usuarios únicos con 12 asignaciones de roles
*/

-- =======================================
-- REGISTRO DE INICIALIZACIÓN
-- =======================================

-- Actividad de inicialización del sistema
INSERT INTO actividades (tipo, modulo, descripcion, usuario_id, detalles) VALUES 
('creacion', 'sistema', 'Inicialización del sistema con datos mínimos', 1, 
 JSON_OBJECT('accion', 'inicializacion_datos_minimos', 'timestamp', NOW()));

-- Registro en migraciones
INSERT INTO migraciones (nombre, descripcion, aplicada_en, estado) VALUES 
('datos_minimos_iniciales', 'Inserción de datos mínimos para inicialización del sistema', NOW(), 'aplicada');

-- =======================================
-- VERIFICACIÓN FINAL
-- =======================================

-- Consultas de verificación
SELECT '✅ DATOS MÍNIMOS INSERTADOS CORRECTAMENTE' as ESTADO;
SELECT COUNT(*) as 'Usuarios creados' FROM usuarios;
SELECT COUNT(*) as 'Roles asignados' FROM usuarios_roles;
SELECT COUNT(*) as 'Ciclos académicos' FROM ciclos_academicos;
SELECT COUNT(*) as 'Parámetros del sistema' FROM parametros_sistema;
SELECT COUNT(*) as 'Elementos de estructura' FROM estructura_portafolio_base;

-- =======================================
-- INFORMACIÓN IMPORTANTE
-- =======================================

/*
🔐 CREDENCIALES DE ACCESO INICIAL:

Administrador:
- Usuario: admin@unsaac.edu.pe
- Contraseña: admin123

Docente de Prueba:
- Usuario: docente.prueba@unsaac.edu.pe  
- Contraseña: docente123

Verificador de Prueba:
- Usuario: verificador.prueba@unsaac.edu.pe
- Contraseña: verificador123

📂 ESTRUCTURA PREPARADA PARA CARGA MASIVA:
- ✅ Estructura de portafolio completa
- ✅ Parámetros del sistema configurados
- ✅ Ciclo académico activo
- ✅ Módulo de carga de datos habilitado
- ✅ Usuarios base para pruebas

📋 PRÓXIMOS PASOS:
1. Acceder al sistema con el usuario administrador
2. Ir al módulo "Carga de Datos"
3. Cargar archivos Excel con:
   - Usuarios masivos (docentes, verificadores)
   - Carreras completas
   - Asignaturas por carrera
   - Carga académica (asignaciones docente-asignatura)
   - Asignaciones verificador-docente

💡 DATOS LISTOS PARA CARGAR VIA EXCEL:
- users.xlsx (usuarios masivos)
- carreras.xlsx (carreras de la universidad)
- asignaturas.xlsx (asignaturas por carrera y semestre)
- carga_academica.xlsx (asignaciones docente-asignatura)
- verificadores.xlsx (asignaciones verificador-docente)
*/