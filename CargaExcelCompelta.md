🎯 PROMPT PARA IA - SISTEMA PORTAFOLIO DOCENTE UNIVERSITARIO
📋 CONTEXTO
Tengo un sistema base de portafolio docente con base de datos MySQL ya creada. Necesito implementar la funcionalidad de carga masiva de 8 archivos Excel que inicialice completamente el sistema y auto-genere portafolios para todos los docentes según una estructura específica.

🗄️ BASE DE DATOS EXISTENTE
La base de datos ya está creada con todas las tablas necesarias:

usuarios, usuarios_roles, ciclos_academicos
asignaturas, docentes_asignaturas, verificadores_docentes
estructura_portafolio_base, portafolios, archivos_subidos
Y todas las tablas de apoyo (notificaciones, observaciones, etc.)

Estado actual: Base de datos vacía, lista para ser poblada.

📂 ARCHIVOS EXCEL A PROCESAR (8 archivos)
📁 1. CONFIGURACIONES DEL SISTEMA
Archivo: 01_configuraciones_sistema.xlsx
Tabla destino: configuraciones
CLAVEVALORTIPODESCRIPCIONCATEGORIAMODIFICABLEmax_size_file10485760numberTamaño máximo archivo (10MB)archivos1formatos_permitidos["pdf","docx","xlsx","pptx"]jsonFormatos aceptadosarchivos1auto_crear_portafoliostruebooleanCrear portafolios automáticamentesistema1
Propósito: Define parámetros operativos del sistema completo.

🏛️ 2. CARRERAS Y PROGRAMAS
Archivo: 02_carreras_programas.xlsx
Tabla destino: Nueva tabla carreras (crear si no existe)
CODIGO_CARRERANOMBRE_CARRERAFACULTADDURACION_SEMESTRESGRADO_OTORGADOACTIVOIININGENIERIA INFORMATICAFACULTAD DE INGENIERIA10Ingeniero Informático1ADMADMINISTRACIONFACULTAD DE CIENCIAS EMPRESARIALES10Licenciado en Administración1
Propósito: Define carreras universitarias disponibles para validar asignaciones.

👥 3. USUARIOS DOCENTES
Archivo: 03_usuarios_docentes.xlsx
Tablas destino: usuarios + usuarios_roles
COD_DOCENTENOMBRESAPELLIDOSCORREOTELEFONOCARRERA_PRINCIPALGRADO_ACADEMICOESPECIALIDADACTIVOIF001WALDO ELIOIBARRA ZAMBRANOwaldo.ibarra@universidad.edu987654321IINMAGISTERPROGRAMACION1IF002JAVIER DAVIDCHAVEZ CENTENOjavier.chavez@universidad.edu987654322IINDOCTORSISTEMAS1
Propósito: Crea usuarios con rol 'docente'. Cada docente tendrá portafolios auto-generados.

🔍 4. VERIFICADORES
Archivo: 04_verificadores.xlsx
Tablas destino: usuarios + usuarios_roles
NOMBRESAPELLIDOSCORREOTELEFONOESPECIALIDADCARRERA_ASIGNADAGRADO_ACADEMICOEXPERIENCIA_ANOSACTIVOMARIA ELENARODRIGUEZ GARCIAmaria.rodriguez@universidad.edu987654351SISTEMAS_PROGRAMACIONIINDOCTOR151CARLOS ANTONIOMAMANI QUISPEcarlos.mamani@universidad.edu987654352BASES_DATOSIINMAGISTER121
Propósito: Crea usuarios con rol 'verificador'. Supervisarán portafolios de docentes.

👨‍💼 5. ADMINISTRADORES
Archivo: 05_administradores.xlsx
Tablas destino: usuarios + usuarios_roles
NOMBRESAPELLIDOSCORREOTELEFONONIVEL_ACCESODEPARTAMENTOPERMISOS_ESPECIALESACTIVOJUAN CARLOSSILVA TORRESadmin.silva@universidad.edu987654366SUPER_ADMINTECNOLOGIAS_INFORMACION["crear_ciclos","gestionar_usuarios"]1
Propósito: Crea usuarios con rol 'administrador' con diferentes niveles de acceso.

📚 6. ESTRUCTURA PORTAFOLIO BASE
Archivo: 06_estructura_portafolio.xlsx
Tabla destino: estructura_portafolio_base
NOMBREDESCRIPCIONNIVELORDENCARPETA_PADREREQUIERE_CREDITOPERTENECE_PRESENTACIONICONOCOLOR0. PRESENTACIÓN DEL PORTAFOLIOInformación general del docente1001user#007bff0.1 CARÁTULACarátula del portafolio210. PRESENTACIÓN DEL PORTAFOLIO01file-text#28a7450.2 CARGA ACADÉMICACarga académica del docente220. PRESENTACIÓN DEL PORTAFOLIO01calendar#17a2b81. SILABOSDocumentos silabo del curso1110file-text#007bff1.1 SILABO UNSAACSilabo formato UNSAAC211. SILABOS10file#28a7451.2 SILABO ICACITSilabo formato ICACIT221. SILABOS10file#28a7452. AVANCE ACADÉMICO POR SESIONESControl de avance por sesiones1210calendar#007bff3. MATERIAL DE ENSEÑANZAMaterial didáctico del curso1310folder#007bff3.1 PRIMERA UNIDADMaterial primera unidad213. MATERIAL DE ENSEÑANZA10folder#6f42c13.2 SEGUNDA UNIDADMaterial segunda unidad223. MATERIAL DE ENSEÑANZA10folder#6f42c13.3 TERCERA UNIDADMaterial tercera unidad (4-5 créditos)233. MATERIAL DE ENSEÑANZA10folder#6f42c15. ENUNCIADO DE EXÁMENES Y SOLUCIÓNExámenes y soluciones1510clipboard#007bff5.1 EXAMEN DE ENTRADAExamen de entrada215. ENUNCIADO DE EXÁMENES Y SOLUCIÓN10file#ffc1075.2 PRIMER EXAMENPrimer examen parcial225. ENUNCIADO DE EXÁMENES Y SOLUCIÓN10file#ffc1075.3 SEGUNDO EXAMENSegundo examen parcial235. ENUNCIADO DE EXÁMENES Y SOLUCIÓN10file#ffc1075.4 TERCER EXAMENTercer examen (4-5 créditos)245. ENUNCIADO DE EXÁMENES Y SOLUCIÓN10file#ffc1076. TRABAJOS ESTUDIANTILESTrabajos destacados de estudiantes1610star#007bff7. ARCHIVOS PORTAFOLIO DOCENTEArchivos administrativos del portafolio1710archive#007bff
Propósito: Define la estructura jerárquica exacta que tendrán TODOS los portafolios. Incluye lógica para créditos (carpetas 3.3 y 5.4 solo aparecen si el curso tiene 4-5 créditos).

📖 7. CARGA ACADÉMICA
Archivo: 07_carga_academica.xlsx
Tablas destino: asignaturas + docentes_asignaturas
CODIGOCARRERACURSOCREDITOSTIPOCOD_DOCENTEDOCENTESEMESTREANIOGRUPOAULAMATRICULADOSIF101AININGENIERIA INFORMATICAFUNDAMENTOS DE LA PROGRAMACION3PIF001WALDO ELIO IBARRA ZAMBRANO2025-I2025ALAB30617IF031AININGENIERIA INFORMATICAPROGRAMACIÓN I4PIF002JAVIER DAVID CHAVEZ CENTENO2025-I2025ALAB30422
Propósito: Crea asignaturas y las asigna a docentes. IMPORTANTE: Por cada fila se debe auto-crear un portafolio completo para esa combinación docente-asignatura.

🔗 8. ASIGNACIÓN VERIFICADORES-DOCENTES
Archivo: 08_asignacion_verificadores.xlsx
Tabla destino: verificadores_docentes
COD_DOCENTECORREO_DOCENTECORREO_VERIFICADORNOMBRE_VERIFICADORESPECIALIDAD_VERIFICADORPRIORIDADOBSERVACIONESIF001waldo.ibarra@universidad.edumaria.rodriguez@universidad.eduMARIA ELENA RODRIGUEZ GARCIASISTEMAS_PROGRAMACIONALTAEspecialista en programaciónIF002javier.chavez@universidad.educarlos.mamani@universidad.eduCARLOS ANTONIO MAMANI QUISPEBASES_DATOSALTAEspecialista en BD
Propósito: Asigna verificadores específicos a cada docente según especialidades.

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