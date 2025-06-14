# Mi Portafolio
# 📋 SISTEMA PORTAFOLIO DOCENTE UNSAAC - ESTRUCTURA COMPLETA CORREGIDA
## Explicación Clara con Backend + Frontend + Base de Datos

---

## 🎯 ¿QUÉ ES EXACTAMENTE ESTE SISTEMA?

### **Analogía Simple:**
Imagina **Google Drive** pero **específico para universidades**, donde:
- Los **docentes** organizan documentos de sus clases
- Los **verificadores** revisan si están bien hechos
- Los **administradores** supervisan todo el proceso

### **¿Por qué es necesario?**
Las universidades necesitan **acreditarse** (obtener certificaciones de calidad). Para esto, deben demostrar que sus profesores:
- Planifican bien sus clases
- Tienen materiales educativos de calidad
- Evalúan correctamente a los estudiantes
- Documentan todo su trabajo académico

**Tradicionalmente** esto se hacía con **papeles físicos** → **Caótico, lento, se pierde**
**Con este sistema** se hace **digital** → **Organizado, rápido, seguro**

---

## 👥 ¿QUIÉNES USAN EL SISTEMA Y QUÉ HACEN?

### **1. EL DOCENTE (Profesor Universitario)**
**¿Qué hace normalmente?**
- Enseña cursos de universidad que necesitan acreditación
- Subir archivs al sistema de foramal genral varios archivs o   uno por uno donde corresponde para su validacio o verfocacion 
- Sube el material del curso que enseña 

**¿Qué hace en el sistema?**
- **Organiza** todos sus documentos por curso
- **Sube archivos** de manera fácil (arrastrar y soltar)
- **Responde** cuando le piden correcciones
- **Ve su progreso** (qué le falta completar)

**Ejemplo:** Dr. Juan enseña "Algoritmos" y "Base de Datos". Tiene una carpeta para cada curso donde guarda syllabus, exámenes, presentaciones, etc.

### **2. EL VERIFICADOR (Supervisor de Calidad)**
**¿Qué hace normalmente?**
- Revisa si el trabajo de los docentes cumple estándares
- Da retroalimentación para mejorar
- Aprueba o rechaza documentos

**¿Qué hace en el sistema?**
- **Revisa documentos** de los docentes asignados
- **Aprueba** si está bien, **rechaza** si falta algo
- **Escribe observaciones** explicando qué mejorar
- **Hace seguimiento** del progreso de cada docente

**Ejemplo:** Dra. María revisa los portafolios de 10 docentes. Ve que al Dr. Juan le falta el syllabus actualizado y le escribe una observación.

### **3. EL ADMINISTRADOR (Gestor del Sistema)**
**¿Qué hace normalmente?**
- Supervisa todo el proceso de acreditación
- Coordina entre docentes y verificadores
- Genera reportes para autoridades

**¿Qué hace en el sistema?**
- **Configura** todo el sistema al inicio
- **Carga datos** masivos desde Excel
- **Asigna** qué verificador revisa a qué docente
- **Supervisa** el progreso general
- **Genera reportes** para la universidad

**Ejemplo:** Mg. Carlos administra todo el sistema. Al inicio del semestre carga la lista de docentes y cursos desde Excel, asigna verificadores, y supervisa que todo marche bien.

---

## 🎭 ¿QUÉ ES EL SISTEMA MULTI-ROL?

### **Explicación Simple:**
**Una persona puede tener varios roles a la vez**

### **¿Por qué es útil?**
En universidades reales, una persona puede ser:
- **Docente** (enseña cursos) + **Verificador** (revisa a otros docentes)
- **Administrador** (gestiona sistema) + **Docente** (también enseña)

### **¿Cómo funciona?**
1. **Dr. Pedro** es docente Y verificador
2. **Por la mañana** actúa como docente → Ve sus cursos, sube archivos
3. **Por la tarde** actúa como verificador → Revisa trabajo de otros docentes
4. **Cambia de rol** con un simple click en el sistema
5. **La interfaz cambia** según el rol que esté usando

### **Restricciones Importantes:**
- **Docente** puede ser verificador ✅
- **Verificador** puede ser docente ✅  
- **Administrador** puede ser docente ✅
- **Docente NUNCA puede ser administrador** ❌ (por seguridad)

---

## 🖥️ ¿CÓMO SE VE LA INTERFAZ PRINCIPAL?

### **Inspiración: Windows Explorer**
El sistema se ve como el **explorador de archivos de Windows**, pero para documentos académicos.

### **Diseño de 3 Partes:**

```
┌─────────────────────────────────────────────────────────────────┐
│ PARTE SUPERIOR: Navegación                                      │
│ "Inicio > Mis Portafolios > Algoritmos > Syllabus"             │
├─────────────────┬───────────────────────┬─────────────────────────┤
│                 │                       │                         │
│ PARTE IZQUIERDA │   PARTE CENTRAL       │   PARTE DERECHA        │
│                 │                       │                         │
│ Árbol de        │   Vista de Archivos   │   Área de Subida       │
│ Carpetas        │                       │                         │
│                 │   📄 Doc1  📄 Doc2    │   "Arrastra archivos   │
│ 📁 Curso 1      │   📄 Doc3  📄 Doc4    │    aquí"               │
│ 📁 Curso 2      │                       │                         │
│ 📁 Curso 3      │   [Lista] [Cuadrícula]│   [Seleccionar Archivo] │
│                 │                       │                         │
│                 │   Buscar: _______     │   ✅ Auto-distribución  │
└─────────────────┴───────────────────────┴─────────────────────────┘
```

### **¿Qué hace cada parte?**

#### **PARTE SUPERIOR - Navegación**
- Como las "migas de pan" en sitios web
- Muestra dónde estás: "Inicio > Mis Portafolios > Algoritmos"
- Puedes hacer click en cualquier parte para regresar

#### **PARTE IZQUIERDA - Árbol de Carpetas**
- Lista todas las carpetas como un árbol
- Click para expandir carpetas (como Windows)
- Íconos 📁 para carpetas, colores según estado
- Verde = completo, Rojo = falta algo, Amarillo = en proceso

#### **PARTE CENTRAL - Vista de Archivos**
- Muestra los archivos de la carpeta seleccionada
- Puedes verlos como lista o cuadrícula
- Información: nombre, tamaño, fecha, estado
- Botones para aprobar/rechazar (solo verificadores)
- Campo de búsqueda para encontrar archivos

#### **PARTE DERECHA - Área de Subida**
- Zona principal para subir archivos
- Arrastra archivos desde tu computadora
- Sistema inteligente sugiere dónde ponerlos
- Muestra progreso de subida
- Botón para seleccionar archivos tradicional

---

## 🏗️ ESTRUCTURA TÉCNICA CORRECTA: BACKEND + FRONTEND + BASE DE DATOS

### **📁 ORGANIZACIÓN PROFESIONAL:**

```
portafolio-docente-unsaac/
├── 📁 BACKEND/                          # Servidor Node.js/Express
│   ├── servidor.js                      # Archivo principal del servidor
│   ├── package.json                     # Dependencias del backend
│   ├── .env                             # Variables de entorno
│   ├── 📁 controladores/                # Lógica de negocio
│   │   ├── autenticacion.js
│   │   ├── usuarios.js
│   │   ├── archivos.js
│   │   └── reportes.js
│   ├── 📁 modelos/                      # Modelos de datos
│   │   ├── Usuario.js
│   │   ├── Portafolio.js
│   │   └── Archivo.js
│   ├── 📁 rutas/                        # APIs/Endpoints
│   │   ├── auth.js
│   │   ├── usuarios.js
│   │   └── archivos.js
│   ├── 📁 middleware/                   # Middleware personalizado
│   │   ├── verificar-jwt.js
│   │   └── subir-archivos.js
│   ├── 📁 servicios/                    # Servicios de negocio
│   │   ├── procesador-excel.js
│   │   └── generador-reportes.js
│   ├── 📁 utilidades/                   # Funciones auxiliares
│   │   └── validaciones.js
│   └── 📁 uploads/                      # Archivos subidos
├── 📁 FRONTEND/                         # Cliente web
│   ├── index.html                       # Página principal
│   ├── 📁 paginas/                      # Páginas HTML
│   │   ├── administrador/
│   │   ├── docente/
│   │   └── verificador/
│   ├── 📁 assets/                       # Recursos estáticos
│   │   ├── 📁 css/                      # Estilos CSS
│   │   ├── 📁 js/                       # JavaScript
│   │   └── 📁 imagenes/                 # Imágenes y logos
│   └── 📁 componentes/                  # Componentes reutilizables
│       ├── cabecera.html
│       └── pie-pagina.html
├── 📁 BASE-DE-DATOS/                    # Scripts SQL
│   ├── 01-crear-estructura.sql         # Crear tablas
│   ├── 02-datos-iniciales.sql          # Datos de prueba
│   ├── 03-indices-optimizacion.sql     # Optimizaciones
│   └── 📁 migraciones/                  # Scripts evolutivos
├── 📁 DOCUMENTACION/                    # Documentación del proyecto
│   ├── README.md
│   ├── API.md
│   └── INSTALACION.md
└── 📁 CONFIGURACION/                    # Archivos de configuración
    ├── nginx.conf
    └── docker-compose.yml
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN - 4 ETAPAS DETALLADAS


### **🗂️ ADMINISTRACIÓN DE ARCHIVOS ESCALABLE**

#### **Concepto Clave: Estructura que Crece**
Cada etapa construye **SOLO LOS ARCHIVOS NECESARIOS** para esa funcionalidad, pero de manera que puedan crecer después.

**Analogía Simple:**
- **Etapa 1**: Casa con 1 cuarto básico (funciona, puedes vivir)
- **Etapa 2**: Agregas cocina y baño (más funcional)
- **Etapa 3**: Agregas sala y comedor (más cómodo)
- **Etapa 4**: Agregas decoración y acabados de lujo (completo)

---

## 📅 ETAPA 1: FUNDAMENTOS (2 semanas)
### **Objetivo:** Sistema básico donde puedas entrar loguearte y navegar selecioanar el rol y direccionar a sus paginas respectivas  y tener todo lo minimo para la etapa 2

#### **🗂️ ARCHIVOS A CREAR (Solo lo esencial):**

```
portafolio-docente-unsaac/
├── 📁 BACKEND/ (8 archivos)
│   ├── servidor.js                      # Servidor Express principal
│   ├── package.json                     # Dependencias Node.js
│   ├── .env                             # Variables de entorno
│   ├── 📁 controladores/
│   │   └── autenticacion.js             # Login/logout backend
│   ├── 📁 modelos/
│   │   └── Usuario.js                   # Modelo de usuario
│   ├── 📁 rutas/
│   │   └── auth.js                      # APIs de autenticación
│   ├── 📁 middleware/
│   │   └── verificar-jwt.js             # Verificar tokens
│   └── 📁 uploads/                      # Carpeta archivos (vacía)
├── 📁 FRONTEND/ (10 archivos)
│   ├── index.html                       # Página de login
│   ├── 📁 paginas/
│   │   ├── tablero-admin.html           # Dashboard administrador
│   │   ├── tablero-docente.html         # Dashboard docente
│   │   ├── tablero-verificador.html     # Dashboard verificador
│   │   └── selector-rol.html            # Cambio de roles
│   ├── 📁 assets/
│   │   ├── 📁 css/
│   │   │   └── principal.css            # Estilos principales
│   │   └── 📁 js/
│   │       ├── nucleo.js                # Funciones base
│   │       └── autenticacion.js         # Login frontend
│   └── 📁 componentes/
│       ├── cabecera.html                # Header reutilizable
│       └── pie-pagina.html              # Footer reutilizable
└── 📁 BASE-DE-DATOS/ (1 archivo)
    └── 01-tablas-basicas.sql            # Usuarios, roles básicos
```

#### **¿Qué hace cada componente?**

**BACKEND (8 archivos):**
- `servidor.js` - El "cerebro" del sistema, servidor Express
- `package.json` - Lista de librerías Node.js necesarias
- `.env` - Configuración secreta (contraseñas, tokens)
- `controladores/autenticacion.js` - Verifica usuarios y contraseñas
- `modelos/Usuario.js` - Estructura de datos de usuarios
- `rutas/auth.js` - URLs para login (/login, /logout, etc.)
- `middleware/verificar-jwt.js` - Verifica que usuario esté logueado
- `uploads/` - Carpeta donde se guardarán archivos después
- `BASE-DE-DATOS/` - Base de datos para usuarios y roles
- `BASE-DE-DATOS/01-tablas-basicas.sql` - Tablas para usuarios y roles


**FRONTEND (8 archivos):**
- `index.html` - Página donde usuario pone email y contraseña
- `paginas/tablero-*.html` - Página principal de cada tipo de usuario
- `assets/css/principal.css` - Colores, fuentes, diseño básico
- `assets/js/nucleo.js` - Funciones que usan todas las páginas
- `assets/js/autenticacion.js` - Maneja login, logout, cambio de roles
- `assets/js/gestion-usuarios.js` - Maneja gestion de usuarios
- `assets/js/carga-excel.js` - Maneja carga de excel
- `assets/js/procesador-excel.js` - Maneja procesador de excel
- `assets/js/formularios.js` - Maneja formularios
- `assets/js/tablas.js` - Maneja tablas
- `assets/js/roles.js` - Maneja roles



**BASE DE DATOS (1 archivo):**
- `01-tablas-basicas.sql` - Crea tablas para usuarios y roles

#### **¿Cómo sé que Etapa 1 funciona?**
- ✅ Puedo entrar con usuario y contraseña
- ✅ Puedo seleccionar el rol
- ✅ Puedo iniciar sesión
    
- ✅ Veo diferente menú según mi rol
- ✅ Puedo cambiar de rol si tengo varios
- ✅ Puedo navegar entre páginas básicas
- ✅ Puedo cerrar sesión
- ✅ Puedo iniciar sesión con el rol que seleccioné
- ✅ Si solo tengo un rol puedo iniciar sesión directamente
- ✅ Si tengo mas de dos roles puedo seleccionar el rol que quiero iniciar sesión
- ✅ Puedo cambiar de rol si tengo varios
- ✅ Puedo iniciar sesión con el rol que seleccioné

#### **¿Qué NO hace aún?**
- ❌ No puedo subir archivos
- ❌ No hay explorador de archivos
- ❌ No hay verificación de documentos
- ❌ No hay reportes
- ❌ No hay verificación de documentos
    


**TOTAL ETAPA 1: 19 archivos** (mínimo funcional) pueden ser mas hay que revisar antes d emepesar cualquier impleamntacion 

---

## 📅 ETAPA 2: ADMINISTRACIÓN COMPLETA (3 semanas)
### **Objetivo:** El administrador puede gestionar todo el sistema cargar los excel y iniciar el sistema de verificacion 

#### **🗂️ ARCHIVOS QUE SE AGREGAN:**

```
portafolio-docente-unsaac/
├── 📁 BACKEND/ (+16 archivos nuevos)
│   ├── 📁 controladores/ (+5 archivos)
│   │   ├── usuarios.js                  # CRUD usuarios
│   │   ├── excel.js                     # Procesador Excel
│   │   ├── ciclos.js                    # Ciclos académicos
│   │   ├── asignaciones.js              # Asignaciones
│   │   └── reportes.js                  # Generador reportes
│   ├── 📁 modelos/ (+4 archivos)
│   │   ├── Ciclo.js                     # Modelo ciclo académico
│   │   ├── Asignatura.js                # Modelo asignatura
│   │   ├── Portafolio.js                # Modelo portafolio
│   │   └── Asignacion.js                # Modelo asignaciones
│   ├── 📁 rutas/ (+4 archivos)
│   │   ├── usuarios.js                  # APIs usuarios
│   │   ├── excel.js                     # APIs carga Excel
│   │   ├── ciclos.js                    # APIs ciclos
│   │   └── reportes.js                  # APIs reportes
│   └── 📁 servicios/ (+3 archivos)
│       ├── procesador-excel.js          # Lógica Excel
│       ├── generador-reportes.js        # Lógica reportes
│       └── validador-datos.js           # Validaciones
├── 📁 FRONTEND/ (+13 archivos nuevos)
│   ├── 📁 paginas/ (+5 archivos)
│   │   ├── gestion-usuarios.html        # Gestión usuarios
│   │   ├── carga-excel.html             # Subir Excel
│   │   ├── ciclos-academicos.html       # Gestión ciclos
│   │   ├── asignaciones.html            # Asignaciones
│   │   └── reportes.html                # Reportes
│   ├── 📁 assets/css/ (+3 archivos)
│   │   ├── formularios.css              # Estilos formularios
│   │   ├── tablas.css                   # Estilos tablas
│   │   └── reportes.css                 # Estilos reportes
│   └── 📁 assets/js/ (+5 archivos)
│       ├── gestion-usuarios.js          # Funciones usuarios
│       ├── procesador-excel.js          # Procesar Excel
│       ├── ciclos.js                    # Funciones ciclos
│       ├── asignaciones.js              # Funciones asignaciones
│       └── reportes.js                  # Funciones reportes
└── 📁 BASE-DE-DATOS/ (+1 archivo)
    └── 02-tablas-completas.sql          # Ciclos, asignaturas, etc.
```

#### **¿Qué hace cada archivo NUEVO?**

**BACKEND NUEVOS:**
- `controladores/usuarios.js` - Crear, editar, eliminar usuarios
- `controladores/excel.js` - Procesa miles de registros de Excel
- `servicios/generador-reportes.js` - Crea reportes en PDF y Excel
- `modelos/Ciclo.js` - Estructura de datos para semestres
- `modelos/Asignatura.js` - Estructura de datos para asignaturas
- `modelos/Portafolio.js` - Estructura de datos para portafolios
- `modelos/Asignacion.js` - Estructura de datos para asignaciones
- `modelos/Reporte.js` - Estructura de datos para reportes
- `modelos/Usuario.js` - Estructura de datos para usuarios
- `modelos/Archivo.js` - Estructura de datos para archivos

**FRONTEND NUEVOS:**
- `paginas/gestion-usuarios.html` - Página para gestionar usuarios
- `paginas/carga-excel.html` - Página para subir archivos Excel
- `assets/js/procesador-excel.js` - Lee archivos Excel y muestra datos
- `assets/css/formularios.css` - Estilos para formularios   
- `assets/js/gestion-usuarios.js` - Funciones para gestionar usuarios
- `assets/js/carga-excel.js` - Funciones para cargar Excel
- `assets/js/procesador-excel.js` - Funciones para procesar Excel
- `assets/js/formularios.js` - Funciones para formularios   

#### **¿Cómo sé que Etapa 2 funciona?**
- ✅ Administrador puede crear usuarios
- ✅ Carga de Excel procesa correctamente
- ✅ Se crean portafolios automáticamente
- ✅ Asignaciones funcionan correctamente
- ✅ Reportes se generan sin errores
- ✅ Los 3 susurios deben tener la misma funcionalidad 
- ✅ Los 3 usuario ya deberian poder  o  un minimo funcional en el admin de archivo o solo mostrar estrucutras para la seguiente fase para ver si genran los porfolios
- ✅  el sistema de arga de los excel ya debera esta listo para empiesa el sistema de verificacion almenos la parte inciaal para seguir con lso demas pasos
- ✅ 



#### **¿Qué NO hace aún?**
- ❌ Docentes aún no pueden subir archivos
- ❌ No hay interfaz de explorador
- ❌ Verificadores no pueden revisar
- ❌ No hay verificacion de documentos
-  

**TOTAL ETAPA 2: +30 archivos = 49 archivos**

---

## 📅 ETAPA 3: ARCHIVOS BÁSICOS (2 semanas)
### **Objetivo:** Docentes pueden subir archivos básicos

#### **🗂️ ARCHIVOS QUE SE AGREGAN:**

```
portafolio-docente-unsaac/
├── 📁 BACKEND/ (+12 archivos nuevos)
│   ├── 📁 controladores/ (+2 archivos)
│   │   ├── archivos.js                  # Gestión archivos
│   │   └── verificacion.js              # Verificación documentos
│   ├── 📁 modelos/ (+2 archivos)
│   │   ├── Archivo.js                   # Modelo archivo
│   │   └── Observacion.js               # Modelo observaciones
│   ├── 📁 rutas/ (+2 archivos)
│   │   ├── archivos.js                  # APIs archivos
│   │   └── verificacion.js              # APIs verificación
│   ├── 📁 servicios/ (+3 archivos)
│   │   ├── subir-archivos.js            # Lógica subida
│   │   ├── validar-archivos.js          # Validaciones archivos
│   │   └── gestor-permisos.js           # Permisos archivos
│   └── 📁 middleware/ (+3 archivos)
│       ├── upload-multer.js             # Configuración Multer
│       ├── validar-archivo.js           # Validar archivos
│       └── verificar-permisos.js        # Verificar permisos
├── 📁 FRONTEND/ (+8 archivos nuevos)
│   ├── 📁 paginas/ (+4 archivos)
│   │   ├── mis-portafolios.html         # Lista portafolios
│   │   ├── subir-archivos.html          # Subir archivos
│   │   ├── lista-archivos.html          # Ver archivos
│   │   └── cola-verificacion.html       # Cola verificación
│   ├── 📁 assets/css/ (+1 archivo)
│   │   └── archivos.css                 # Estilos archivos
│   └── 📁 assets/js/ (+3 archivos)
│       ├── subir-archivos.js            # Subir archivos
│       ├── lista-archivos.js            # Listar archivos
│       └── verificacion.js              # Verificar archivos
└── 📁 BASE-DE-DATOS/ (+1 archivo)
    └── 03-tablas-archivos.sql           # Tablas archivos
```

#### **¿Qué hace cada archivo NUEVO?**

**BACKEND NUEVOS:**
- `controladores/archivos.js` - Maneja subida, descarga, eliminación
- `servicios/subir-archivos.js` - Guarda archivos en el servidor
- `middleware/upload-multer.js` - Configuración para subir archivos
- `modelos/Archivo.js` - Estructura de datos de archivos
- `rutas/archivos.js` - URLs para archivos
- `BASE-DE-DATOS/02-tablas-completas.sql` - Tablas para archivos


**FRONTEND NUEVOS:**
- `paginas/mis-portafolios.html` - Docente ve sus cursos asignados
- `paginas/subir-archivos.html` - Botón simple "Seleccionar Archivo"
- `assets/js/subir-archivos.js` - Sube archivos con botón tradicional
- `assets/css/archivos.css` - Estilos para listas de archivos

#### **¿Cómo sé que Etapa 3 funciona?**
- ✅ Docente puede subir archivos
- ✅ Validaciones rechazan archivos incorrectos
- ✅ Archivos se guardan correctamente
- ✅ Permisos se respetan (docente solo ve sus archivos)
- ✅ Verificador puede aprobar/rechazar
- ✅ Genera reportes
- ✅ Descarga masiva genera ZIP correctamente
- ✅ El docenrte puede descargar sus archivos
- ✅ El docenrte puede ver sus archivos
- ✅ El docenrte puede eliminar sus archivos
- ✅ El docenrte puede editar sus archivos
- ✅ El docenrte puede buscar sus archivos
- ✅ El docenrte puede ordenar sus archivos
- ✅ El docenrte puede ver sus archivos
- ✅ El verificador puede aprobar/rechazar
- ✅ El verificador puede ver sus archivos
- ✅ El verificador puede buscar sus archivos
- ✅ El verificador puede ordenar sus archivos
- ✅ El verificador puede ver sus archivos
- ✅ El administrador puede aprobar/rechazar
- ✅ El administrador puede ver de todos los usuarios
- ✅ El administrador puede buscar de todos los usuarios
- ✅ El administrador puede ordenar de todos los usuarios
- ✅ El administrador puede ver de todos los usuarios
- ✅ El administrador puede eliminar de todos los usuarios
#### **¿Qué NO hace aún?**
- ❌ No hay drag & drop
- ❌ No hay interfaz tipo Windows
- ❌ No hay auto-distribución inteligente


**TOTAL ETAPA 3: +21 archivos = 70 archivos**

---

## 📅 ETAPA 4: EXPLORADOR AVANZADO (3 semanas)
### **Objetivo:** Sistema completo tipo Windows Explorer

#### **🗂️ ARCHIVOS QUE SE AGREGAN:**

```
portafolio-docente-unsaac/
├── 📁 BACKEND/ (+8 archivos nuevos)
│   ├── 📁 controladores/ (+2 archivos)
│   │   ├── explorador.js                # Lógica explorador
│   │   └── busqueda.js                  # Búsqueda archivos
│   ├── 📁 servicios/ (+4 archivos)
│   │   ├── auto-distribucion.js         # Auto-distribución IA
│   │   ├── generador-zip.js             # Crear archivos ZIP
│   │   ├── busqueda-contenido.js        # Buscar en contenido
│   │   └── estructura-carpetas.js       # Gestión carpetas
│   └── 📁 rutas/ (+2 archivos)
│       ├── explorador.js                # APIs explorador
│       └── busqueda.js                  # APIs búsqueda
├── 📁 FRONTEND/ (+9 archivos nuevos)
│   ├── 📁 paginas/ (+1 archivo)
│   │   └── explorador-completo.html     # Interfaz explorador
│   ├── 📁 assets/css/ (+3 archivos)
│   │   ├── explorador-windows.css       # Estilos Windows
│   │   ├── arrastrar-soltar.css         # Estilos drag & drop
│   │   └── arbol-carpetas.css           # Estilos árbol
│   └── 📁 assets/js/ (+5 archivos)
│       ├── explorador-principal.js      # Lógica principal
│       ├── arrastrar-soltar.js          # Drag & drop
│       ├── auto-distribucion.js         # Auto-distribución
│       ├── busqueda-avanzada.js         # Búsqueda
│       └── navegacion-arbol.js          # Árbol navegación
└── 📁 BASE-DE-DATOS/ (+1 archivo)
    └── 04-optimizaciones.sql            # Índices y optimizaciones
```

#### **Diseño Visual Específico a Implementar:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [BREADCRUMB] Inicio > Mis Portafolios > Algoritmos > Syllabus   │
├──────────────┬──────────────────────────┬─────────────────────────┤
│              │                          │                         │
│   ÁRBOL DE   │     VISTA DE ARCHIVOS    │   PANEL DE CARGA       │
│   CARPETAS   │                          │                         │
│              │  ┌─────┬─────┬─────┐    │  ┌─────────────────────┐ │
│ 📁 Curso 1   │  │ 📄  │ 📄  │ 📄  │    │  │ Arrastra archivos   │ │
│ 📁 Curso 2   │  │Doc1 │Doc2 │Doc3 │    │  │ aquí o haz clic     │ │
│ 📁 Curso 3   │  └─────┴─────┴─────┘    │  │                     │ │
│              │                          │  │  [Seleccionar]      │ │
│              │  [Lista] [Grid] [Detalles] │  └─────────────────────┘ │
│              │                          │                         │
│              │  Filtros: [Tipo] [Estado] │ Distribución:           │
│              │  Buscar: [_____________] │ ✅ Automática            │
└──────────────┴──────────────────────────┴─────────────────────────┘
```

#### **¿Qué hace cada archivo NUEVO?**

**BACKEND NUEVOS:**
- `controladores/explorador.js` - Maneja navegación tipo Windows
- `servicios/auto-distribucion.js` - IA básica que analiza nombres
- `servicios/generador-zip.js` - Crea archivos ZIP para descarga masiva
- `rutas/busqueda.js` - APIs para búsqueda avanzada

**FRONTEND NUEVOS:**
- `paginas/explorador-completo.html` - La interfaz de 3 paneles exacta
- `assets/css/explorador-windows.css` - Hace que se vea como Windows
- `assets/js/arrastrar-soltar.js` - Funcionalidad de drag & drop
- `assets/js/auto-distribucion.js` - Sugiere carpeta según archivo

#### **¿Cómo sé que Etapa 4 funciona?**
- ✅ Interfaz se ve exactamente como Windows Explorer
- ✅ Drag & drop de múltiples archivos funciona fluídamente
- ✅ Auto-distribución sugiere carpetas correctas 80% de las veces
- ✅ Búsqueda encuentra archivos en menos de 2 segundos
- ✅ Descarga masiva genera ZIP correctamente

**TOTAL ETAPA 4: +18 archivos = 88 archivos FINALES**

---

## 📊 RESUMEN: CRECIMIENTO CONTROLADO DE ARCHIVOS

### **📈 Evolución Profesional Corregida:**

```
ETAPA 1: 19 archivos básicos
├── BACKEND: 8 archivos (servidor, auth básico)
├── FRONTEND: 10 archivos (páginas básicas)  
└── BASE-DE-DATOS: 1 archivo (tablas usuarios)


ETAPA 2: +30 archivos = 49 archivos
├── BACKEND: +16 archivos (administración completa)
├── FRONTEND: +13 archivos (interfaces admin)
└── BASE-DE-DATOS: +1 archivo (tablas académicas)

ETAPA 3: +21 archivos = 70 archivos  
├── BACKEND: +12 archivos (gestión archivos)
├── FRONTEND: +8 archivos (interfaces archivos)
└── BASE-DE-DATOS: +1 archivo (tablas archivos)

ETAPA 4: +18 archivos = 88 archivos FINALES
├── BACKEND: +8 archivos (explorador avanzado)
├── FRONTEND: +9 archivos (interfaz Windows)
└── BASE-DE-DATOS: +1 archivo (optimizaciones)
```

### **🎯 DISTRIBUCIÓN FINAL PROFESIONAL:**

```
📁 BACKEND (44 archivos):
├── 1 servidor principal (servidor.js)
├── 9 controladores (lógica de negocio)
├── 7 modelos (estructura de datos)
├── 8 rutas (APIs/endpoints)
├── 6 middleware (seguridad y validaciones)
├── 10 servicios (procesamiento complejo)
├── 2 utilidades (funciones auxiliares)
└── 1 carpeta uploads

📁 FRONTEND (40 archivos):
├── 1 página principal (index.html)
├── 14 páginas HTML específicas
├── 7 archivos CSS (estilos)
├── 13 archivos JavaScript (funcionalidad)
├── 2 componentes reutilizables
└── 3 carpetas de assets organizadas

📁 BASE-DE-DATOS (4 archivos):
├── 01-tablas-basicas.sql (Etapa 1)
├── 02-tablas-completas.sql (Etapa 2)
├── 03-tablas-archivos.sql (Etapa 3)
└── 04-optimizaciones.sql (Etapa 4)
```

---

## 🔄 ¿CÓMO FUNCIONA TODO EL PROCESO?

### **FASE 1: PREPARACIÓN (Solo Administrador)**

#### **Paso 1: Configurar el Semestre**
- Administrador crea "Ciclo 2024-I"
- Define fechas: inicio, fin, fechas límite
- Sistema queda en modo "preparación"

#### **Paso 2: Cargar Información**
- Administrador tiene Excel con datos:
  - Lista de docentes
  - Lista de cursos
  - Qué docente enseña qué curso
- Sube el Excel al sistema
- Sistema procesa y crea cuentas automáticamente

#### **Paso 3: Asignar Verificadores**
- Administrador decide qué verificador revisa a qué docente
- Puede ser manual: "María revisa a Juan"
- Puede ser automático: sistema distribuye equitativamente

#### **Paso 4: Generar Portafolios**
- Sistema crea automáticamente carpetas para cada docente
- Cada curso tiene su estructura predefinida para 3 y 4 creditos :
  ```
  📁 Algoritmos
  ├── 📁 Información General (syllabus, CV)
  ├── 📁 Planificación (cronograma, competencias)  
  ├── 📁 Clases (presentaciones, material)
  ├── 📁 Evaluaciones (exámenes, rúbricas)
  └── 📁 Trabajos Estudiantes (mejores trabajos)
  ```

#### **Paso 5: Activar Sistema**
- Administrador verifica que todo esté listo
- Cambia estado a "activo"
- Sistema envía emails a todos: "¡Ya pueden empezar!"

### **FASE 2: TRABAJO ACTIVO (Todos los usuarios)**

#### **Trabajo del Docente:**
1. **Entra al sistema** → Ve sus cursos asignados
2. **Selecciona un curso** → Ve estructura de carpetas
3. **Navega a una carpeta** → Ej: "Información General"
4. **Arrastra archivo** → Syllabus.pdf desde su computadora
5. **Sistema inteligente sugiere** → "¿Este archivo va en carpeta Syllabus?"
6. **Confirma o corrige** → Si está bien, acepta sugerencia
7. **Archivo se sube** → Ve progreso en tiempo real
8. **Ve su progreso general** → "Curso 80% completo"

#### **Trabajo del Verificador:**
1. **Entra al sistema** → Ve lista de docentes asignados
2. **Ve alertas** → "Dr. Juan subió 3 documentos nuevos"
3. **Selecciona un docente** → Entra a su portafolio
4. **Revisa documento** → Abre el archivo para evaluar
5. **Toma decisión:**
   - ✅ **Aprobar**: "Está bien, cumple requisitos"
   - ❌ **Rechazar**: "Falta información importante"
   - ⚠️ **Pedir corrección**: "Está bien pero mejorar X"
6. **Escribe observaciones** → "El syllabus debe incluir bibliografía"
7. **Docente recibe notificación** → "Tienes una observación nueva"

#### **Trabajo del Administrador:**
1. **Dashboard general** → Ve progreso de todos
2. **Identifica problemas** → "5 docentes están atrasados"
3. **Interviene si es necesario** → Envía recordatorios
4. **Reasigna si hay problemas** → Cambia verificador sobrecargado
5. **Genera reportes** → Para mostrar a autoridades

### **FASE 3: CIERRE (Solo Administrador)**

#### **Preparación para Cierre:**
- Sistema identifica qué falta
- Envía alertas finales a docentes atrasados
- Da plazo final para completar

#### **Cierre Oficial:**
- Administrador declara: "Ciclo cerrado"
- Sistema bloquea subida de nuevos archivos
- Genera reportes finales
- Crea respaldo de todo

#### **Preparación Siguiente Ciclo:**
- Crea nuevo ciclo "2024-II"
- Puede reutilizar estructura anterior
- Actualiza datos según necesidad

---

## 🎯 CASOS DE USO CON INTERFAZ ESPECÍFICA

### **CASO 1: Docente Sube Documento (Interfaz Específica)**
```
FLUJO USANDO EL EXPLORADOR:
1. Docente accede a su portafolio (breadcrumb: "Inicio > Mis Portafolios")
2. En panel izquierdo, hace clic en 📁 "Algoritmos" (se expande)  
3. Selecciona subcarpeta "01. Información General"
4. Panel central muestra archivos existentes en vista [Grid]
5. En panel derecho, arrastra archivo "Syllabus.pdf" desde escritorio
6. Zona de drop se resalta en verde: "Arrastra archivos aquí"
7. Sistema auto-detecta: "¿Es este un Syllabus? Sugerir carpeta: Syllabus"
8. Docente confirma o corrige la sugerencia
9. Archivo se sube con barra de progreso en panel derecho
10. Al completar, aparece 📄 "Syllabus.pdf" en panel central
11. Breadcrumb actualiza: "Inicio > Mis Portafolios > Algoritmos > Información General"
```

### **CASO 2: Verificador Revisa Documento (Interfaz Específica)**
```
FLUJO USANDO EL EXPLORADOR:
1. Verificador accede a portafolio del docente asignado
2. Panel izquierdo muestra 📁 con indicadores de estado:
   - 📁 Curso 1 ✅ (completo)
   - 📁 Curso 2 ⚠️ (pendiente)  
   - 📁 Curso 3 ❌ (rechazado)
3. Hace clic en 📁 Curso 2 ⚠️
4. Panel central muestra archivos con estados:
   - 📄 Doc1 ✅ (aprobado)
   - 📄 Doc2 ⚠️ (pendiente) 
   - 📄 Doc3 ❌ (rechazado)
5. Click en 📄 Doc2 ⚠️ abre modal de verificación
6. Opciones: [Aprobar] [Rechazar] [Solicitar Corrección]
7. Si rechaza, escribe observación en panel modal
8. Confirma decisión, el archivo cambia a 📄 Doc2 ❌
9. Panel derecho muestra resumen: "2 aprobados, 1 rechazado"
```

### **CASO 3: Administrador Supervisa Sistema (Interfaz Específica)**
```
FLUJO USANDO EL EXPLORADOR:
1. Admin accede con vista global completa
2. Panel izquierdo muestra estructura jerárquica:
   📁 Facultad Ingeniería
   ├── 📁 Ing. Sistemas  
   │   ├── 📁 Dr. Juan Pérez (75% completo)
   │   └── 📁 Mg. Ana García (90% completo)
   └── 📁 Ing. Civil
       └── 📁 Dr. Carlos López (45% completo)
3. Usa filtros en panel central: [Estado: Incompleto]
4. Panel central muestra solo portafolios < 80%
5. Click en 📁 Dr. Carlos López (45% completo)
6. Panel derecho muestra herramientas admin:
   - [Reasignar Verificador]
   - [Enviar Recordatorio]  
   - [Generar Reporte]
   - [Descargar Portafolio]
7. Puede acceder a cualquier archivo y modificar estados
8. Breadcrumb muestra ruta completa de supervisión
```

---

## 🏆 VENTAJAS DE LA ESTRUCTURA CORREGIDA

### **✅ SEPARACIÓN PROFESIONAL:**
- **Backend independiente**: Puede deployarse en servidor separado
- **Frontend independiente**: Puede servirse desde CDN
- **Base de datos separada**: Scripts evolutivos organizados
- **Desarrollo paralelo**: Equipos pueden trabajar simultáneamente

### **✅ ESTRUCTURA ESTÁNDAR:**
- **Sigue mejores prácticas** de la industria
- **Familiar para desarrolladores**: Cualquiera puede entender la estructura
- **Fácil mantenimiento**: Cada componente tiene su lugar específico
- **Escalabilidad garantizada**: Preparado para crecimiento

### **✅ CRECIMIENTO CONTROLADO:**
- **Cada etapa funciona independientemente**
- **Reutilización inteligente**: Los archivos base se usan en todas las etapas
- **Sin duplicación**: No hay código repetido entre componentes
- **Evolución natural**: 19 → 49 → 70 → 88 archivos organizados

### **✅ ADMINISTRACIÓN MÍNIMA ESCALABLE:**
- **Solo lo necesario**: Cada etapa crea exactamente lo que necesita
- **Base sólida**: Los archivos básicos sirven para todas las etapas
- **Especialización**: Cada archivo hace una cosa específica muy bien
- **Fácil debugging**: Fácil encontrar dónde está cada funcionalidad

---

## ⏱️ CRONOGRAMA REALISTA CORREGIDO

### **Semana 1-2: Etapa 1 (19 archivos)**
- **Semana 1**: Backend básico (servidor + auth + BD)
- **Semana 2**: Frontend básico (login + dashboards + componentes)

### **Semana 3-5: Etapa 2 (+30 archivos = 49 total)**
- **Semana 3**: Backend admin (usuarios + Excel + ciclos)
- **Semana 4**: Frontend admin (interfaces + formularios)
- **Semana 5**: Integración + reportes + testing

### **Semana 6-7: Etapa 3 (+21 archivos = 70 total)**
- **Semana 6**: Backend archivos (subida + validación + permisos)
- **Semana 7**: Frontend archivos (interfaces + verificación básica)

### **Semana 8-10: Etapa 4 (+18 archivos = 88 total)**
- **Semana 8**: Backend explorador (IA + búsqueda + ZIP)
- **Semana 9**: Frontend explorador (interfaz Windows + drag & drop)
- **Semana 10**: Integración final + optimización + testing

### **Total: 10 semanas (2.5 meses)**

---

## 🎯 CRITERIOS DE ÉXITO CLAROS

### **¿Cómo sé que cada etapa está lista?**

#### **Etapa 1 Lista:**
- ✅ 3 tipos de usuario pueden entrar
- ✅ Login funciona correctamente
- ✅ Registro funciona correctamente
- ✅ Cada uno ve su interfaz correcta
- ✅ Cambio de rol funciona
- ✅ Navegación básica sin errores

#### **Etapa 2 Lista:**
- ✅ Admin puede cargar Excel de 1000 registros
- ✅ Se crean usuarios automáticamente
- ✅ Asignaciones funcionan correctamente
- ✅ Reportes se generan en menos de 10 segundos

#### **Etapa 3 Lista:**
- ✅ Docente sube archivo de 20MB en menos de 1 minuto
- ✅ Rechaza archivos de formato incorrecto
- ✅ Verificador ve solo archivos asignados
- ✅ Descarga funciona sin errores

#### **Etapa 4 Lista:**
- ✅ Interfaz se ve exactamente como el diseño Windows
- ✅ Drag & drop de 10 archivos simultáneos funciona
- ✅ Auto-distribución acierta 80% de las veces
- ✅ Búsqueda encuentra archivos en menos de 2 segundos

---

## 🚀 CONCLUSIÓN MEJORADA

### **🎯 ¿Qué tienes ahora?**

#### **SISTEMA COMPLETO EXPLICADO:**
- **Concepto claro**: "Google Drive para universidades"
- **3 roles bien definidos**: Admin, Docente, Verificador
- **Interfaz específica**: Explorador tipo Windows en 3 paneles
- **Proceso completo**: Desde configuración hasta cierre de ciclo

#### **ESTRUCTURA TÉCNICA PROFESIONAL:**
- **Backend separado**: 44 archivos organizados profesionalmente
- **Frontend separado**: 40 archivos con estructura clara
- **Base de datos separada**: 4 scripts SQL evolutivos
- **Crecimiento controlado**: 19 → 49 → 70 → 88 archivos

#### **PLAN DE IMPLEMENTACIÓN DETALLADO:**
- **4 etapas escalables**: Cada una construye sobre la anterior
- **Cronograma realista**: 10 semanas con entregables claros
- **Administración mínima**: Solo archivos necesarios por etapa
- **Criterios de éxito**: Métricas específicas para cada etapa

### **🏆 VENTAJAS DE ESTA APROXIMACIÓN CORREGIDA:**

#### **✅ PARA EL DESARROLLO:**
- **Estructura estándar**: Familiar para cualquier desarrollador
- **Desarrollo paralelo**: Backend y frontend independientes
- **Testing incremental**: Cada etapa se prueba por separado
- **Deployment flexible**: Componentes se pueden deployar separadamente

#### **✅ PARA EL USUARIO:**
- **Entrega de valor temprana**: Funcionalidad desde Etapa 1
- **Interfaz profesional**: Explorador tipo Windows en Etapa 4
- **Experiencia consistente**: Componentes reutilizables
- **Performance optimizada**: Separación de responsabilidades

#### **✅ PARA LA UNIVERSIDAD:**
- **Inversión protegida**: Cada etapa es funcional independientemente
- **Escalabilidad garantizada**: Arquitectura preparada para crecimiento
- **Mantenimiento eficiente**: Estructura clara y organizada
- **Adopción gradual**: Usuarios se familiarizan progresivamente

### **📊 NÚMEROS FINALES CORREGIDOS:**
- **88 archivos totales** organizados profesionalmente
- **4 etapas de 2-3 semanas** cada una
- **3 componentes separados** (Backend + Frontend + BD)
- **Interfaz completa** tipo Windows Explorer

### **🎯 PRÓXIMO PASO RECOMENDADO:**
**Empezar con la Etapa 1** - En 2 semanas tendrás un sistema funcional con backend, frontend y base de datos separados, donde puedas entrar, navegar y cambiar roles. Esto te permitirá:
- Probar la arquitectura separada
- Validar la funcionalidad básica multi-rol
- Obtener feedback de usuarios reales
- Construir confianza en el enfoque escalable

**Este sistema transformará la gestión de portafolios académicos en UNSAAC, facilitando los procesos de acreditación con una arquitectura profesional, escalable y mantenible.**