/**
 * Sistema de Navegación Unificado
 * Maneja la navegación entre páginas manteniendo la autenticación
 * y proporcionando una experiencia fluida para todos los roles
 */

// Configuración de rutas por rol
const RUTAS_POR_ROL = {
    administrador: {
        base: './paginas/dashboard/admin',
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
        base: './paginas/dashboard/docente',
        paginas: {
            tablero: 'tablero.html',
            portafolio: 'portafolio.html',
            documentos: 'documentos.html',
            observaciones: 'observaciones.html',
            perfil: 'perfil.html'
        }
    },
    verificador: {
        base: './paginas/dashboard/verificador',
        paginas: {
            tablero: 'tablero.html',
            revision: 'revision.html',
            docentes: 'docentes.html',
            reportes: 'reportes.html',
            perfil: 'perfil.html'
        }
    }
};

// Estado global de navegación
let navegacionEstado = {
    rolActual: null,
    paginaActual: null,
    menuInicializado: false
};

/**
 * Inicializa el sistema de navegación
 */
function inicializarNavegacion() {
    console.log('🧭 Inicializando sistema de navegación');
    
    // NO verificar autenticación en páginas públicas
    const rutaActual = window.location.pathname.toLowerCase();
    const esPaginaPublica = (
        rutaActual === '/' ||
        rutaActual === '/index.html' ||
        rutaActual.includes('/login.html') ||
        rutaActual.includes('/autenticacion/') ||
        rutaActual.includes('index.html') ||
        rutaActual.endsWith('/') ||
        rutaActual.includes('login') ||
        rutaActual.includes('selector-roles') ||
        rutaActual === ''
    );
    
    if (esPaginaPublica) {
        console.log('🏠 Página pública detectada - no inicializando navegación');
        return;
    }
    
    // Verificar autenticación SOLO en páginas protegidas
    if (!APP.estaAutenticado()) {
        console.log('❌ Usuario no autenticado, redirigiendo a login');
        APP.redirigirALogin();
        return;
    }
    
    // Obtener usuario y rol actual
    const usuario = APP.obtenerUsuario();
    if (!usuario) {
        console.log('❌ No se encontró información del usuario');
        APP.redirigirALogin();
        return;
    }
    
    // Determinar rol actual
    navegacionEstado.rolActual = usuario.rolActual || usuario.rol;
    if (!navegacionEstado.rolActual) {
        console.log('❌ No se pudo determinar el rol del usuario');
        APP.redirigirASelector();
        return;
    }
    
    console.log('✅ Navegación inicializada para rol:', navegacionEstado.rolActual);
    
    // Determinar página actual
    determinarPaginaActual();
    
    // Inicializar menú de navegación
    inicializarMenu();
    
    // Configurar eventos de navegación
    configurarEventosNavegacion();
    
    // Actualizar información del usuario en la interfaz
    actualizarInfoUsuario();
}

/**
 * Determina la página actual basada en la URL
 */
function determinarPaginaActual() {
    const rutaActual = window.location.pathname;
    const nombreArchivo = rutaActual.split('/').pop();
    navegacionEstado.paginaActual = nombreArchivo.replace('.html', '');
    
    console.log('📍 Página actual:', navegacionEstado.paginaActual);
}

/**
 * Inicializa el menú de navegación dinámicamente
 */
function inicializarMenu() {
    if (navegacionEstado.menuInicializado) return;
    
    // Buscar el contenedor del menú con selectores más específicos
    const menuContainer = document.querySelector('.sidebar .components, .sidebar-nav, .nav-menu, #sidebarMenu');
    if (!menuContainer) {
        console.info('ℹ️ Usando sidebar estático (no se requiere menú dinámico)');
        // Si no encuentra el contenedor dinámico, marca como inicializado para evitar errores
        navegacionEstado.menuInicializado = true;
        return;
    }
    
    // Limpiar menú existente
    menuContainer.innerHTML = '';
    
    // Generar menú según el rol
    const menuItems = generarMenuPorRol(navegacionEstado.rolActual);
    menuContainer.appendChild(menuItems);
    
    navegacionEstado.menuInicializado = true;
    console.log('✅ Menú inicializado para rol:', navegacionEstado.rolActual);
}

/**
 * Genera el menú de navegación según el rol
 */
function generarMenuPorRol(rol) {
    const fragment = document.createDocumentFragment();
    const rutasRol = RUTAS_POR_ROL[rol];
    
    if (!rutasRol) {
        console.error('❌ No se encontraron rutas para el rol:', rol);
        return fragment;
    }
    
    // Definir elementos del menú según el rol
    let menuConfig = [];
    
    switch (rol) {
        case 'administrador':
            menuConfig = [
                { id: 'tablero', titulo: 'Tablero', icono: 'fas fa-tachometer-alt' },
                { id: 'usuarios', titulo: 'Usuarios', icono: 'fas fa-users' },
                { id: 'ciclos', titulo: 'Ciclos Académicos', icono: 'fas fa-calendar-alt' },
                { id: 'asignaturas', titulo: 'Asignaturas', icono: 'fas fa-book' },
                { id: 'portafolios', titulo: 'Portafolios', icono: 'fas fa-folder-open' },
                { id: 'carga-masiva', titulo: 'Carga Masiva', icono: 'fas fa-upload' },
                { id: 'verificar-datos', titulo: 'Verificar Datos', icono: 'fas fa-check-circle' },
                { id: 'reportes', titulo: 'Reportes', icono: 'fas fa-chart-bar' }
            ];
            break;
        case 'docente':
            menuConfig = [
                { id: 'tablero', titulo: 'Tablero', icono: 'fas fa-tachometer-alt' },
                { id: 'portafolio', titulo: 'Mi Portafolio', icono: 'fas fa-folder' },
                { id: 'documentos', titulo: 'Documentos', icono: 'fas fa-file-alt' },
                { id: 'observaciones', titulo: 'Observaciones', icono: 'fas fa-comments' },
                { id: 'perfil', titulo: 'Mi Perfil', icono: 'fas fa-user' }
            ];
            break;
        case 'verificador':
            menuConfig = [
                { id: 'tablero', titulo: 'Tablero', icono: 'fas fa-tachometer-alt' },
                { id: 'revision', titulo: 'Revisión', icono: 'fas fa-search' },
                { id: 'docentes', titulo: 'Docentes', icono: 'fas fa-chalkboard-teacher' },
                { id: 'reportes', titulo: 'Reportes', icono: 'fas fa-chart-line' },
                { id: 'perfil', titulo: 'Mi Perfil', icono: 'fas fa-user' }
            ];
            break;
    }
    
    // Crear elementos del menú
    menuConfig.forEach(item => {
        const menuItem = crearElementoMenu(item, rutasRol);
        fragment.appendChild(menuItem);
    });
    
    // Agregar separador y opciones de usuario
    fragment.appendChild(crearSeparadorMenu());
    fragment.appendChild(crearMenuUsuario());
    
    return fragment;
}

/**
 * Crea un elemento de menú
 */
function crearElementoMenu(config, rutasRol) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = '#';
    a.setAttribute('data-pagina', config.id);
    
    // Marcar como activo si es la página actual
    if (navegacionEstado.paginaActual === config.id) {
        a.classList.add('active');
    }
    
    a.innerHTML = `
        <i class="${config.icono}"></i>
        <span>${config.titulo}</span>
    `;
    
    // Agregar evento de clic
    a.addEventListener('click', (e) => {
        e.preventDefault();
        navegarAPagina(config.id);
    });
    
    li.appendChild(a);
    return li;
}

/**
 * Crea un separador en el menú
 */
function crearSeparadorMenu() {
    const li = document.createElement('li');
    li.className = 'nav-divider';
    li.innerHTML = '<hr class="sidebar-divider">';
    return li;
}

/**
 * Crea el menú de opciones de usuario
 */
function crearMenuUsuario() {
    const fragment = document.createDocumentFragment();
    
    // Cambiar rol (si tiene múltiples roles)
    const usuario = APP.obtenerUsuario();
    if (usuario && usuario.roles && usuario.roles.length > 1) {
        const cambiarRolItem = document.createElement('li');
        cambiarRolItem.className = 'nav-item';
        cambiarRolItem.innerHTML = `
            <a class="nav-link" href="#" id="btnCambiarRol">
                <i class="fas fa-exchange-alt"></i>
                <span>Cambiar Rol</span>
            </a>
        `;
        fragment.appendChild(cambiarRolItem);
    }
    
    // Cerrar sesión
    const cerrarSesionItem = document.createElement('li');
    cerrarSesionItem.className = 'nav-item';
    cerrarSesionItem.innerHTML = `
        <a class="nav-link" href="#" id="btnCerrarSesion">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
        </a>
    `;
    
    fragment.appendChild(cerrarSesionItem);
    return fragment;
}

/**
 * Configura los eventos de navegación
 */
function configurarEventosNavegacion() {
    // Evento para cambiar rol
    const btnCambiarRol = document.getElementById('btnCambiarRol');
    if (btnCambiarRol) {
        btnCambiarRol.addEventListener('click', (e) => {
            e.preventDefault();
            APP.redirigirASelector();
        });
    }
    
    // Evento para cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            confirmarCerrarSesion();
        });
    }
    
    // Interceptar enlaces de navegación existentes
    document.addEventListener('click', (e) => {
        const enlace = e.target.closest('a[data-pagina]');
        if (enlace) {
            e.preventDefault();
            const pagina = enlace.getAttribute('data-pagina');
            navegarAPagina(pagina);
        }
    });
}

/**
 * Navega a una página específica
 */
function navegarAPagina(pagina) {
    console.log('🧭 Navegando a:', pagina);
    
    const rutasRol = RUTAS_POR_ROL[navegacionEstado.rolActual];
    if (!rutasRol || !rutasRol.paginas[pagina]) {
        console.error('❌ Página no encontrada:', pagina);
        APP.mostrarNotificacion('Página no disponible', 'error');
        return;
    }
    
    // Construir URL completa
    const url = `${rutasRol.base}/${rutasRol.paginas[pagina]}`;
    
    // Verificar si ya estamos en la página
    if (navegacionEstado.paginaActual === pagina) {
        console.log('ℹ️ Ya estás en la página:', pagina);
        return;
    }
    
    // Navegar a la página
    window.location.href = url;
}

/**
 * Actualiza la información del usuario en la interfaz
 */
function actualizarInfoUsuario() {
    const usuario = APP.obtenerUsuario();
    if (!usuario) return;
    
    // Actualizar nombre del usuario
    const nombreUsuarioElements = document.querySelectorAll('.user-name, #nombreUsuario, .username');
    nombreUsuarioElements.forEach(element => {
        const nombre = usuario.nombres || usuario.nombre || 'Usuario';
        const apellidos = usuario.apellidos || '';
        element.textContent = `${nombre} ${apellidos}`.trim();
    });
    
    // Actualizar rol del usuario
    const rolUsuarioElements = document.querySelectorAll('.user-role, #rolUsuario, .userrole');
    rolUsuarioElements.forEach(element => {
        const rol = navegacionEstado.rolActual || 'Sin rol';
        element.textContent = formatearRol(rol);
    });
    
    // Actualizar avatar si existe
    const avatarElements = document.querySelectorAll('.user-avatar, #avatarUsuario');
    avatarElements.forEach(element => {
        if (usuario.avatar) {
            element.src = usuario.avatar;
        } else {
            // Avatar por defecto basado en iniciales
            const iniciales = obtenerIniciales(usuario.nombres, usuario.apellidos);
            element.alt = iniciales;
        }
    });
}

/**
 * Formatea el nombre del rol
 */
function formatearRol(rol) {
    if (!rol) return 'Sin rol';
    return rol.charAt(0).toUpperCase() + rol.slice(1);
}

/**
 * Obtiene las iniciales del usuario
 */
function obtenerIniciales(nombres, apellidos) {
    const n = nombres ? nombres.charAt(0).toUpperCase() : '';
    const a = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return n + a;
}

/**
 * Confirma el cierre de sesión
 */
function confirmarCerrarSesion() {
    APP.mostrarConfirmacion(
        'Cerrar Sesión',
        '¿Está seguro que desea cerrar su sesión?',
        'question',
        'Sí, cerrar sesión',
        'Cancelar'
    ).then((confirmado) => {
        if (confirmado) {
            APP.cerrarSesion();
        }
    });
}

/**
 * Marca un elemento del menú como activo
 */
function marcarMenuActivo(pagina) {
    // Remover clase active de todos los enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase active al enlace correspondiente
    const enlaceActivo = document.querySelector(`a[data-pagina="${pagina}"]`);
    if (enlaceActivo) {
        enlaceActivo.classList.add('active');
    }
}

/**
 * Verifica si el usuario tiene acceso a una página específica
 */
function verificarAccesoPagina(pagina) {
    const rutasRol = RUTAS_POR_ROL[navegacionEstado.rolActual];
    return rutasRol && rutasRol.paginas[pagina];
}

/**
 * Función de utilidad para verificar autenticación en páginas específicas
 */
function verificarAutenticacion(rolesPermitidos = []) {
    console.log('🔐 Verificando autenticación...');
    
    // Verificar si está autenticado
    if (!APP.estaAutenticado()) {
        console.log('❌ Usuario no autenticado');
        APP.redirigirALogin();
        return false;
    }
    
    // Obtener usuario
    const usuario = APP.obtenerUsuario();
    if (!usuario) {
        console.log('❌ No se encontró información del usuario');
        APP.redirigirALogin();
        return false;
    }
    
    // Verificar rol si se especificaron roles permitidos
    if (rolesPermitidos.length > 0) {
        const rolActual = usuario.rolActual || usuario.rol;
        if (!rolesPermitidos.includes(rolActual)) {
            console.log('❌ Usuario no tiene permisos para esta página');
            APP.mostrarNotificacion('No tiene permisos para acceder a esta página', 'error');
            
            // Redirigir al dashboard correspondiente
            const rutaCorrecta = RUTAS_POR_ROL[rolActual];
            if (rutaCorrecta) {
                window.location.href = `${rutaCorrecta.base}/${rutaCorrecta.paginas.tablero}`;
            } else {
                APP.redirigirASelector();
            }
            return false;
        }
    }
    
    console.log('✅ Autenticación verificada correctamente');
    return true;
}

// Inicializar navegación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que otros scripts se hayan cargado
    setTimeout(inicializarNavegacion, 100);
});

// Exportar funciones globales para compatibilidad
window.Navegacion = {
    inicializarNavegacion,
    navegarAPagina,
    verificarAccesoPagina,
    marcarMenuActivo,
    verificarAutenticacion
};

// Hacer disponible la función de verificación globalmente (solo si no existe)
if (!window.verificarAutenticacion) {
    window.verificarAutenticacion = verificarAutenticacion;
}
