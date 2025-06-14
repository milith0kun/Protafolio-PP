USE portafolio_docente_carga_academica;

-- =======================================
-- INSERTAR ESTRUCTURA BASE DEL PORTAFOLIO
-- Sistema de Portafolio Docente UNSAAC
-- =======================================

-- NIVEL 0: CARPETA RAÍZ (PRESENTACIÓN - COMÚN A TODOS LOS CURSOS)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('0. PRESENTACIÓN DEL PORTAFOLIO', 'Carpeta principal de presentación común a todos los cursos del docente', 1, 1, 0, NULL, 1, 'user-circle', '#2563eb', 1);

-- SUBCARPETAS DE PRESENTACIÓN (NIVEL 1)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('0.1 CARÁTULA', 'Carátula oficial del portafolio docente', 2, 1, 0, 1, 1, 'file-text', '#3b82f6', 1),
('0.2 CARGA ACADÉMICA', 'Documento de carga académica asignada', 2, 2, 0, 1, 1, 'calendar', '#3b82f6', 1),
('0.3 FILOSOFÍA DOCENTE', 'Filosofía y metodología de enseñanza del docente', 2, 3, 0, 1, 1, 'book-open', '#3b82f6', 1),
('0.4 CURRÍCULUM VITAE', 'Currículum vitae actualizado del docente', 2, 4, 0, 1, 1, 'user', '#3b82f6', 1);

-- NIVEL 0: CARPETA PRINCIPAL POR CURSO
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('Curso: [NOMBRE DEL CURSO] – [CÓDIGO]', 'Carpeta principal del curso específico (se genera automáticamente)', 1, 2, 0, NULL, 0, 'graduation-cap', '#059669', 1);

-- CARPETAS PRINCIPALES DEL CURSO (NIVEL 1)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('1. SILABOS', 'Sílabos oficiales del curso', 2, 1, 0, 6, 0, 'file-text', '#10b981', 1),
('2. AVANCE ACADÉMICO POR SESIONES', 'Registro del avance académico por cada sesión de clase', 2, 2, 0, 6, 0, 'calendar-days', '#10b981', 1),
('3. MATERIAL DE ENSEÑANZA', 'Material didáctico organizado por unidades', 2, 3, 0, 6, 0, 'book', '#10b981', 1),
('4. ASIGNACIONES', 'Asignaciones y tareas del curso', 2, 4, 0, 6, 0, 'clipboard-list', '#10b981', 1),
('5. ENUNCIADO DE EXÁMENES Y SOLUCIÓN', 'Exámenes, enunciados y sus respectivas soluciones', 2, 5, 0, 6, 0, 'file-check', '#10b981', 1),
('6. TRABAJOS ESTUDIANTILES', 'Trabajos de estudiantes organizados por calificación', 2, 6, 0, 6, 0, 'users', '#10b981', 1),
('7. ARCHIVOS PORTAFOLIO DOCENTE', 'Archivos administrativos del portafolio', 2, 7, 0, 6, 0, 'folder', '#10b981', 1);

-- SUBCARPETAS DE SÍLABOS (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('1.1 SILABO UNSAAC', 'Sílabo oficial según formato UNSAAC', 3, 1, 0, 7, 0, 'file', '#34d399', 1),
('1.2 SILABO ICACIT', 'Sílabo según estándares ICACIT', 3, 2, 0, 7, 0, 'file', '#34d399', 1),
('1.3 REGISTRO DE ENTREGA DE SILABO', 'Constancia de entrega del sílabo a estudiantes', 3, 3, 0, 7, 0, 'file-check', '#34d399', 1);

-- SUBCARPETAS DE MATERIAL DE ENSEÑANZA (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('3.1 PRIMERA UNIDAD', 'Material didáctico de la primera unidad', 3, 1, 0, 9, 0, 'folder', '#34d399', 1),
('3.2 SEGUNDA UNIDAD', 'Material didáctico de la segunda unidad', 3, 2, 0, 9, 0, 'folder', '#34d399', 1),
('3.3 TERCERA UNIDAD', 'Material didáctico de la tercera unidad (solo cursos 4-5 créditos)', 3, 3, 4, 9, 0, 'folder', '#34d399', 1);

-- SUBCARPETAS DE EXÁMENES (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.1 EXAMEN DE ENTRADA', 'Examen diagnóstico de entrada', 3, 1, 0, 11, 0, 'file-text', '#34d399', 1),
('5.2 PRIMER EXAMEN', 'Primer examen parcial', 3, 2, 0, 11, 0, 'file-text', '#34d399', 1),
('5.3 SEGUNDO EXAMEN', 'Segundo examen parcial', 3, 3, 0, 11, 0, 'file-text', '#34d399', 1),
('5.4 TERCER EXAMEN', 'Tercer examen parcial (solo cursos 4-5 créditos)', 3, 4, 4, 11, 0, 'file-text', '#34d399', 1);

-- SUBCARPETAS DE EXAMEN DE ENTRADA (NIVEL 3)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.1.1 ENUNCIADO DE EXAMEN Y RESOLUCIÓN', 'Enunciado del examen de entrada y su resolución', 4, 1, 0, 18, 0, 'file', '#6ee7b7', 1),
('5.1.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al examen de entrada', 4, 2, 0, 18, 0, 'users', '#6ee7b7', 1),
('5.1.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del examen de entrada', 4, 3, 0, 18, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE PRIMER EXAMEN (NIVEL 3)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.2.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', 'Enunciado del primer examen y su resolución', 4, 1, 0, 19, 0, 'file', '#6ee7b7', 1),
('5.2.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al primer examen', 4, 2, 0, 19, 0, 'users', '#6ee7b7', 1),
('5.2.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del primer examen', 4, 3, 0, 19, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE SEGUNDO EXAMEN (NIVEL 3)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.3.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', 'Enunciado del segundo examen y su resolución', 4, 1, 0, 20, 0, 'file', '#6ee7b7', 1),
('5.3.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al segundo examen', 4, 2, 0, 20, 0, 'users', '#6ee7b7', 1),
('5.3.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del segundo examen', 4, 3, 0, 20, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE TERCER EXAMEN (NIVEL 3) - Solo cursos 4-5 créditos
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('5.4.1 ENUNCIADO Y RESOLUCIÓN DE EXAMEN', 'Enunciado del tercer examen y su resolución', 4, 1, 4, 21, 0, 'file', '#6ee7b7', 1),
('5.4.2 ASISTENCIA AL EXAMEN', 'Lista de asistencia al tercer examen', 4, 2, 4, 21, 0, 'users', '#6ee7b7', 1),
('5.4.3 INFORME DE RESULTADOS', 'Informe estadístico de resultados del tercer examen', 4, 3, 4, 21, 0, 'bar-chart', '#6ee7b7', 1);

-- SUBCARPETAS DE TRABAJOS ESTUDIANTILES (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('6.1 EXCELENTE (19–20)', 'Trabajos estudiantiles con calificación excelente', 3, 1, 0, 12, 0, 'star', '#34d399', 1),
('6.2 BUENO (16–18)', 'Trabajos estudiantiles con calificación buena', 3, 2, 0, 12, 0, 'thumbs-up', '#34d399', 1),
('6.3 REGULAR (14–15)', 'Trabajos estudiantiles con calificación regular', 3, 3, 0, 12, 0, 'minus', '#34d399', 1),
('6.4 MALO (10–13)', 'Trabajos estudiantiles con calificación mala', 3, 4, 0, 12, 0, 'thumbs-down', '#34d399', 1),
('6.5 POBRE (0–07)', 'Trabajos estudiantiles con calificación pobre', 3, 5, 0, 12, 0, 'x-circle', '#34d399', 1);

-- SUBCARPETAS DE ARCHIVOS PORTAFOLIO DOCENTE (NIVEL 2)
INSERT INTO estructura_portafolio_base (nombre, descripcion, nivel, orden, requiere_credito, carpeta_padre_id, pertenece_presentacion, icono, color, activo) VALUES
('7.1 ASISTENCIA DE ALUMNOS', 'Registro de asistencia de estudiantes', 3, 1, 0, 13, 0, 'user-check', '#34d399', 1),
('7.2 REGISTRO DE NOTAS DEL CENTRO DE CÓMPUTO', 'Registro oficial de notas del centro de cómputo', 3, 2, 0, 13, 0, 'file-spreadsheet', '#34d399', 1),
('7.3 CIERRE DE PORTAFOLIO', 'Documentos de cierre del portafolio', 3, 3, 0, 13, 0, 'file-check', '#34d399', 1);

-- Mensaje de confirmación
SELECT '✅ ESTRUCTURA DE PORTAFOLIO INSERTADA CORRECTAMENTE' as resultado;
SELECT 'Total de elementos insertados:' as info, COUNT(*) as cantidad FROM estructura_portafolio_base;