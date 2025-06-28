🎯 PROMPT PARA IA - SISTEMA PORTAFOLIO DOCENTE UNIVERSITARIO
📋 CONTEXTO
Tengo un sistema base de portafolio docente con base de datos MySQL ya creada. Necesito implementar la funcionalidad de carga masiva de 8 archivos Excel que inicialice completamente el sistema y auto-genere portafolios para todos los docentes según una estructura específica.


🤖 LÓGICA DE AUTO-CREACIÓN DE PORTAFOLIOS
REGLA PRINCIPAL: Por cada fila en 07_carga_academica.xlsx, crear automáticamente un portafolio completo replicando la estructura de 06_estructura_portafolio.xlsx.
Algoritmo de creación:
PARA CADA fila en carga_academica:
    1. Crear portafolio principal en tabla `portafolios`
    2. Leer estructura_portafolio_base ordenada por nivel y orden
    3. Para elementos nivel 1: crear carpeta principal
    4. Para elementos nivel 2: crear subcarpeta dentro de su padre
    5. LÓGICA ESPECIAL para créditos:
       - Si CREDITOS >= 4: incluir "3.3 TERCERA UNIDAD" y "5.4 TERCER EXAMEN"
       - Si CREDITOS < 4: omitir esas carpetas
    6. Crear carpeta "0. PRESENTACIÓN" (común a todos los cursos del docente)
    7. Asignar permisos según roles
Estructura esperada por portafolio:
📦 Portafolio: "FUNDAMENTOS DE PROGRAMACIÓN - WALDO IBARRA"
├── 📁 0. PRESENTACIÓN DEL PORTAFOLIO (compartida entre todos sus cursos)
│   ├── 0.1 CARÁTULA
│   ├── 0.2 CARGA ACADÉMICA  
│   ├── 0.3 FILOSOFÍA DOCENTE
│   └── 0.4 CURRÍCULUM VITAE
├── 📚 Curso: FUNDAMENTOS DE PROGRAMACIÓN – IF101AIN
│   ├── 📁 1. SILABOS
│   │   ├── 1.1 SILABO UNSAAC
│   │   ├── 1.2 SILABO ICACIT
│   │   └── 1.3 REGISTRO DE ENTREGA
│   ├── 📁 2. AVANCE ACADÉMICO POR SESIONES
│   ├── 📁 3. MATERIAL DE ENSEÑANZA
│   │   ├── 3.1 PRIMERA UNIDAD
│   │   ├── 3.2 SEGUNDA UNIDAD
│   │   └── (3.3 TERCERA UNIDAD solo si créditos >= 4)
│   ├── 📁 5. ENUNCIADO DE EXÁMENES
│   │   ├── 5.1 EXAMEN DE ENTRADA
│   │   ├── 5.2 PRIMER EXAMEN  
│   │   ├── 5.3 SEGUNDO EXAMEN
│   │   └── (5.4 TERCER EXAMEN solo si créditos >= 4)
│   ├── 📁 6. TRABAJOS ESTUDIANTILES
│   └── 📁 7. ARCHIVOS PORTAFOLIO DOCENTE

🎯 FUNCIONALIDADES POR ROL
👨‍🏫 DOCENTE

Ver solo SUS portafolios (filtrados por usuario)
Subir archivos PDF, DOCX, XLSX a cualquier carpeta de sus portafolios
Ver estado de documentos: pendiente, en revisión, aprobado, rechazado
Recibir notificaciones de observaciones de verificadores

🔍 VERIFICADOR

Ver portafolios de docentes asignados (según tabla verificadores_docentes)
Cambiar estado de documentos: aprobar, rechazar, solicitar corrección
Dejar observaciones específicas por archivo
Ver progreso general de cada docente

👨‍💼 ADMINISTRADOR

Ver estructura completa de todos los portafolios
Generar reportes de avance por carrera, semestre, docente
Gestionar asignaciones verificador-docente
Descargar portafolios completos


⚙️ REQUERIMIENTOS TÉCNICOS
Orden de procesamiento obligatorio:

Validar formato y estructura de los 8 archivos Excel
Procesar archivos en orden: 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08
Auto-crear portafolios después de procesar archivo 07
Asignar verificadores después de procesar archivo 08
Enviar notificaciones a todos los usuarios

Validaciones críticas:

Emails únicos en todo el sistema
Códigos de docente únicos
Referencias válidas entre tablas (claves foráneas)
Formatos JSON válidos en campos correspondientes

Manejo de errores:

Si falla cualquier archivo: rollback completo de la transacción
Reportar errores específicos con número de fila
Logs detallados de todo el proceso


📊 RESULTADO ESPERADO
Al completar la carga exitosamente:

✅ 30 usuarios creados (docentes + verificadores + admins)
✅ 25 asignaturas registradas
✅ 30 portafolios auto-generados con estructura completa
✅ 200+ carpetas creadas automáticamente
✅ 30 asignaciones verificador-docente establecidas
✅ 90+ notificaciones enviadas automáticamente

IMPLEMENTA:
Sistema completo de carga Excel que procese los 8 archivos, valide integridad, auto-cree portafolios con la estructura exacta especificada, asigne verificadores y genere reportes del proceso. El sistema debe quedar completamente funcional y listo para que docentes suban documentos y verificadores los revisen.