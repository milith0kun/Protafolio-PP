# Sistema de Navegación Unificado

## 📋 Descripción

El Sistema de Navegación Unificado es una solución integral que permite a los usuarios navegar de manera fluida entre las diferentes páginas del sistema, manteniendo su sesión activa y proporcionando una experiencia consistente independientemente del rol del usuario.

## 🎯 Características Principales

### ✅ Autenticación Automática
- Verificación automática de autenticación en cada página
- Redirección inteligente según el rol del usuario
- Mantenimiento de sesión activa entre páginas

### ✅ Navegación Dinámica
- Menús generados dinámicamente según el rol del usuario
- Enlaces inteligentes que respetan los permisos
- Navegación sin recarga de página

### ✅ Multi-Rol
- Soporte para usuarios con múltiples roles
- Cambio de rol sin perder la sesión
- Menús específicos para cada rol

### ✅ Responsive
- Adaptación automática a diferentes tamaños de pantalla
- Menú hamburguesa en dispositivos móviles
- Experiencia optimizada para tablets y móviles

## 🏗️ Arquitectura

### Archivos Principales

1. **`navegacion.js`** - Núcleo del sistema de navegación
2. **`admin-auth.js`** - Autenticación específica para administradores
3. **`navegacion-unificada.css`** - Estilos del sistema de navegación
4. **`nucleo.js`** - Funciones base del sistema
5. **`configuracion.js`** - Configuración global

### Estructura de Roles

```javascript
const RUTAS_POR_ROL = {
    administrador: {
        base: '/paginas/dashboard/admin',
        paginas: {
            tablero: 'tablero.html',
            usuarios: 'usuarios.html',
            asignaturas: 'asignaturas.html',
            ciclos: 'ciclos.html',
            portafolios: 'portafolios.html',
            reportes: 'reportes.html',
            'carga-masiva': 'carga-masiva.html',
            'verificar-datos': 'verificar-datos.html'
        }
    },
    docente: {
        base: '/paginas/dashboard/docente',
        paginas: {
            tablero: 'tablero.html',
            portafolio: 'portafolio.html',
            documentos: 'documentos.html',
            observaciones: 'observaciones.html',
            perfil: 'perfil.html'
        }
    },
    verificador: {
        base: '/paginas/dashboard/verificador',
        paginas: {
            tablero: 'tablero.html',
            revision: 'revision.html',
            docentes: 'docentes.html',
            reportes: 'reportes.html',
            perfil: 'perfil.html'
        }
    }
};
```

## 🚀 Implementación

### 1. Estructura HTML

```html
<!-- Navegación dinámica -->
<nav class="main-nav">
    <ul class="nav-list" id="sidebarMenu">
        <!-- El menú se generará dinámicamente -->
    </ul>
</nav>

<!-- Enlaces con navegación inteligente -->
<a href="#" data-pagina="usuarios" class="btn btn-primary">
    Gestionar Usuarios
</a>
```

### 2. Carga de Scripts

```html
<!-- Orden importante de carga -->
<script src="../../../assets/js/nucleo/configuracion.js"></script>
<script src="../../../assets/js/nucleo.js"></script>
<script src="../../../assets/js/navegacion.js"></script>
<script src="../../../assets/js/admin-auth.js"></script>
```

### 3. Verificación de Autenticación

```javascript
// En cada página
document.addEventListener('DOMContentLoaded', function() {
    // Verificación automática
    if (!window.verificarAutenticacion(['administrador'])) {
        return;
    }
    
    // Resto de la inicialización de la página
    inicializarComponentes();
});
```

## 🔧 Funciones Principales

### `inicializarNavegacion()`
Inicializa el sistema de navegación completo:
- Verifica autenticación
- Determina el rol actual
- Genera el menú dinámico
- Configura eventos de navegación

### `navegarAPagina(pagina)`
Navega a una página específica:
- Valida permisos
- Construye la URL correcta
- Realiza la navegación

### `verificarAutenticacion(rolesPermitidos)`
Verifica si el usuario puede acceder a una página:
- Comprueba autenticación
- Valida roles
- Redirige si es necesario

### `actualizarInfoUsuario()`
Actualiza la información del usuario en la interfaz:
- Nombre y apellidos
- Rol actual
- Avatar (si existe)

## 📱 Navegación Responsive

### Desktop
- Menú horizontal completo
- Todos los elementos visibles
- Hover effects y animaciones

### Tablet/Mobile
- Menú hamburguesa
- Navegación colapsible
- Optimización táctil

## 🎨 Personalización

### Estilos por Rol
```css
.nav-link[data-role="administrador"] {
    border-left: 3px solid #dc3545;
}

.nav-link[data-role="docente"] {
    border-left: 3px solid #007bff;
}

.nav-link[data-role="verificador"] {
    border-left: 3px solid #28a745;
}
```

### Temas
- Modo claro (por defecto)
- Modo oscuro (automático según preferencias del sistema)
- Personalización por rol

## 🔒 Seguridad

### Verificación de Permisos
- Validación en frontend y backend
- Tokens JWT para autenticación
- Roles verificados en cada petición

### Protección de Rutas
- Páginas protegidas por rol
- Redirección automática si no hay permisos
- Manejo de sesiones expiradas

## 🐛 Debugging

### Logs del Sistema
```javascript
console.log('🧭 Inicializando sistema de navegación');
console.log('✅ Navegación inicializada para rol:', rolActual);
console.log('📍 Página actual:', paginaActual);
```

### Verificación de Estado
```javascript
// Verificar estado de navegación
console.log(navegacionEstado);

// Verificar usuario actual
console.log(APP.obtenerUsuario());

// Verificar token
console.log(APP.obtenerToken());
```

## 📋 Lista de Verificación

### Para Nuevas Páginas
- [ ] Incluir scripts de navegación en orden correcto
- [ ] Agregar CSS de navegación unificada
- [ ] Usar `data-pagina` en enlaces internos
- [ ] Verificar autenticación con `window.verificarAutenticacion()`
- [ ] Agregar contenedor de menú `#sidebarMenu`

### Para Nuevos Roles
- [ ] Agregar configuración en `RUTAS_POR_ROL`
- [ ] Definir páginas específicas del rol
- [ ] Crear estilos CSS específicos
- [ ] Actualizar verificaciones de permisos

## 🚨 Problemas Comunes

### Error: "verificarAutenticacion is not defined"
**Solución:** Verificar que `navegacion.js` se carga antes que los scripts de página.

### Menú no se genera
**Solución:** Verificar que existe el contenedor `#sidebarMenu` en el HTML.

### Navegación no funciona
**Solución:** Verificar que los enlaces usan `data-pagina` en lugar de `href` directo.

### Usuario no autenticado
**Solución:** Verificar que el token JWT es válido y el usuario tiene el rol correcto.

## 🔄 Flujo de Navegación

1. **Carga de Página**
   - Se cargan los scripts base
   - Se inicializa el sistema de navegación
   - Se verifica la autenticación

2. **Generación de Menú**
   - Se determina el rol del usuario
   - Se genera el menú dinámicamente
   - Se marca la página actual como activa

3. **Navegación**
   - Usuario hace clic en enlace
   - Se validan permisos
   - Se construye URL y se navega

4. **Mantenimiento de Sesión**
   - Token se incluye en peticiones
   - Información de usuario se mantiene
   - Rol actual se preserva

## 📈 Beneficios

### Para Desarrolladores
- Código reutilizable
- Mantenimiento simplificado
- Consistencia en toda la aplicación
- Fácil agregar nuevas páginas

### Para Usuarios
- Navegación intuitiva
- Experiencia fluida
- Sin pérdida de sesión
- Interfaz consistente

### Para Administradores
- Control granular de permisos
- Fácil gestión de roles
- Monitoreo de navegación
- Seguridad mejorada

## 🔮 Futuras Mejoras

- [ ] Navegación con breadcrumbs
- [ ] Historial de navegación
- [ ] Favoritos/marcadores
- [ ] Búsqueda en menú
- [ ] Atajos de teclado
- [ ] Notificaciones en tiempo real
- [ ] Modo offline básico

---

**Nota:** Este sistema está diseñado para ser escalable y mantenible. Cualquier modificación debe seguir los patrones establecidos para mantener la consistencia. 