/**
 * 🧭 Sistema de Navegación Unificado - Portafolio Docente UNSAAC
 * Maneja la navegación, breadcrumbs, menús dinámicos y rutas
 */

class SistemaNavegacion {
    constructor() {
        this.rutaActual = window.location.pathname;
        this.usuario = null;
        this.menuItems = {};
        this.breadcrumbs = [];
        this.inicializar();
    }

    inicializar() {
        this.cargarUsuario();
        this.configurarMenusPorRol();
        this.inicializarEventListeners();
        this.actualizarNavegacionActual();
        this.configurarBreadcrumbs();
        // Notificaciones manejadas por el sistema NOTIFICACIONES
    }

    cargarUsuario() {
        try {
            // Usar el sistema AUTH unificado
            this.usuario = window.AUTH ? window.AUTH.obtenerUsuario() : null;
        } catch (error) {
            console.error('Error al cargar usuario:', error);
        }
    }

    configurarMenusPorRol() {
        const menuAdmin = [
            {
                id: 'dashboard',
                titulo: 'Dashboard',
                icono: 'fas fa-tachometer-alt',
                url: CONFIG.getRoute?.('DASHBOARD_ADMIN') || CONFIG.ROUTES?.DASHBOARD_ADMIN || '/paginas/dashboard/admin/tablero.html',
                activo: false
            },
            {
                id: 'usuarios',
                titulo: 'Gestión de Usuarios',
                icono: 'fas fa-users',
                url: '/paginas/dashboard/admin/usuarios.html',
                activo: false
            },
            {
                id: 'ciclos',
                titulo: 'Ciclos Académicos',
                icono: 'fas fa-calendar-alt',
                url: '/paginas/dashboard/admin/ciclos.html',
                activo: false
            },
            {
                id: 'carreras',
                titulo: 'Carreras',
                icono: 'fas fa-graduation-cap',
                url: '/paginas/dashboard/admin/carreras.html',
                activo: false
            },
            {
                id: 'asignaturas',
                titulo: 'Asignaturas',
                icono: 'fas fa-book',
                url: '/paginas/dashboard/admin/asignaturas.html',
                activo: false
            },
            {
                id: 'portafolios',
                titulo: 'Gestión de Portafolios',
                icono: 'fas fa-folder-open',
                url: '/paginas/dashboard/admin/portafolios.html',
                activo: false
            },
            {
                id: 'carga-masiva',
                titulo: 'Carga Masiva',
                icono: 'fas fa-upload',
                url: '/paginas/dashboard/admin/carga-masiva.html',
                activo: false,
                submenu: [
                    {
                        titulo: 'Cargar Datos',
                        url: '/paginas/dashboard/admin/carga-masiva.html',
                        icono: 'fas fa-file-upload'
                    },
                    {
                        titulo: 'Verificar Datos',
                        url: '/paginas/dashboard/admin/verificar-datos.html',
                        icono: 'fas fa-check-circle'
                    }
                ]
            },
            {
                id: 'reportes',
                titulo: 'Reportes y Analytics',
                icono: 'fas fa-chart-bar',
                url: '/paginas/dashboard/admin/reportes.html',
                activo: false
            },
            {
                id: 'configuracion',
                titulo: 'Configuración',
                icono: 'fas fa-cog',
                url: '/paginas/dashboard/admin/configuracion.html',
                activo: false
            }
        ];

        const menuDocente = [
            {
                id: 'dashboard',
                titulo: 'Mi Dashboard',
                icono: 'fas fa-home',
                url: CONFIG.getRoute?.('DASHBOARD_DOCENTE') || CONFIG.ROUTES?.DASHBOARD_DOCENTE || '/paginas/dashboard/docente/tablero.html',
                activo: false
            },
            {
                id: 'portafolios',
                titulo: 'Mis Portafolios',
                icono: 'fas fa-folder-open',
                url: '/paginas/dashboard/docente/portafolios.html',
                activo: false
            },
            {
                id: 'asignaciones',
                titulo: 'Mis Asignaciones',
                icono: 'fas fa-chalkboard-teacher',
                url: '/paginas/dashboard/docente/asignaciones.html',
                activo: false
            },
            {
                id: 'documentos',
                titulo: 'Gestión de Documentos',
                icono: 'fas fa-file-alt',
                url: '/paginas/dashboard/docente/documentos.html',
                activo: false
            },
            {
                id: 'observaciones',
                titulo: 'Observaciones',
                icono: 'fas fa-eye',
                url: '/paginas/dashboard/docente/observaciones.html',
                activo: false
            }
        ];

        const menuVerificador = [
            {
                id: 'dashboard',
                titulo: 'Dashboard',
                icono: 'fas fa-tachometer-alt',
                url: CONFIG.getRoute?.('DASHBOARD_VERIFICADOR') || CONFIG.ROUTES?.DASHBOARD_VERIFICADOR || '/paginas/dashboard/verificador/tablero.html',
                activo: false
            },
            {
                id: 'docentes-asignados',
                titulo: 'Docentes Asignados',
                icono: 'fas fa-user-check',
                url: '/paginas/dashboard/verificador/docentes.html',
                activo: false
            },
            {
                id: 'portafolios',
                titulo: 'Portafolios a Verificar',
                icono: 'fas fa-folder-open',
                url: '/paginas/dashboard/verificador/portafolios.html',
                activo: false
            },
            {
                id: 'verificacion',
                titulo: 'Verificación de Documentos',
                icono: 'fas fa-search',
                url: '/paginas/dashboard/verificador/verificacion.html',
                activo: false
            },
            {
                id: 'observaciones',
                titulo: 'Gestión de Observaciones',
                icono: 'fas fa-clipboard-check',
                url: '/paginas/dashboard/verificador/observaciones.html',
                activo: false
            },
            {
                id: 'reportes',
                titulo: 'Reportes de Verificación',
                icono: 'fas fa-chart-line',
                url: '/paginas/dashboard/verificador/reportes.html',
                activo: false
            }
        ];

        this.menuItems = {
            administrador: menuAdmin,
            docente: menuDocente,
            verificador: menuVerificador
        };
    }

    obtenerMenuActual() {
        const rol = window.AUTH ? window.AUTH.obtenerRolActivo() : 'docente';
        return this.menuItems[rol] || [];
    }

    renderizarMenu(contenedorId = 'menu-navegacion') {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        const menuItems = this.obtenerMenuActual();
        const menuHTML = this.generarHTMLMenu(menuItems);
        
        contenedor.innerHTML = menuHTML;
        this.configurarEventosMenu();
    }

    generarHTMLMenu(items) {
        return items.map(item => {
            const tieneSubmenu = item.submenu && item.submenu.length > 0;
            const esActivo = this.esRutaActiva(item.url);
            
            if (tieneSubmenu) {
                return `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle ${esActivo ? 'active' : ''}" 
                           href="#" role="button" data-bs-toggle="dropdown">
                            <i class="${item.icono} me-2"></i>
                            ${item.titulo}
                        </a>
                        <ul class="dropdown-menu">
                            ${item.submenu.map(subitem => `
                                <li>
                                    <a class="dropdown-item ${this.esRutaActiva(subitem.url) ? 'active' : ''}" 
                                       href="${subitem.url}">
                                        <i class="${subitem.icono} me-2"></i>
                                        ${subitem.titulo}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </li>
                `;
            } else {
                return `
                    <li class="nav-item">
                        <a class="nav-link ${esActivo ? 'active' : ''}" href="${item.url}">
                            <i class="${item.icono} me-2"></i>
                            ${item.titulo}
                        </a>
                    </li>
                `;
            }
        }).join('');
    }

    esRutaActiva(url) {
        return this.rutaActual.includes(url) || 
               this.rutaActual === url ||
               (url.includes('tablero.html') && this.rutaActual.includes('dashboard'));
    }

    configurarBreadcrumbs() {
        const breadcrumbContainer = document.getElementById('breadcrumb-container');
        if (!breadcrumbContainer) return;

        const breadcrumbs = this.generarBreadcrumbs();
        const breadcrumbHTML = `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    ${breadcrumbs.map((item, index) => {
                        const esUltimo = index === breadcrumbs.length - 1;
                        return `
                            <li class="breadcrumb-item ${esUltimo ? 'active' : ''}">
                                ${esUltimo ? 
                                    item.titulo : 
                                    `<a href="${item.url}">${item.titulo}</a>`
                                }
                            </li>
                        `;
                    }).join('')}
                </ol>
            </nav>
        `;
        
        breadcrumbContainer.innerHTML = breadcrumbHTML;
    }

    generarBreadcrumbs() {
        const breadcrumbs = [
            { titulo: 'Inicio', url: '/' }
        ];

        // Determinar breadcrumbs basado en la ruta actual
        if (this.rutaActual.includes('/dashboard/')) {
            const rol = window.AUTH ? window.AUTH.obtenerRolActivo() : 'docente';
            breadcrumbs.push({
                titulo: 'Dashboard',
                url: CONFIG.getRoute?.(`DASHBOARD_${rol.toUpperCase()}`) || CONFIG.ROUTES?.[`DASHBOARD_${rol.toUpperCase()}`] || `/paginas/dashboard/${rol}/tablero.html`
            });

            // Agregar breadcrumb específico de la página
            const paginaActual = this.obtenerTituloPaginaActual();
            if (paginaActual && paginaActual !== 'Dashboard') {
                breadcrumbs.push({
                    titulo: paginaActual,
                    url: this.rutaActual
                });
            }
        }

        return breadcrumbs;
    }

    obtenerTituloPaginaActual() {
        const menuItems = this.obtenerMenuActual();
        
        // Buscar en items principales
        for (const item of menuItems) {
            if (this.esRutaActiva(item.url)) {
                return item.titulo;
            }
            
            // Buscar en submenús
            if (item.submenu) {
                for (const subitem of item.submenu) {
                    if (this.esRutaActiva(subitem.url)) {
                        return subitem.titulo;
                    }
                }
            }
        }

        // Fallback basado en el título de la página
        return document.title.split('-')[0]?.trim() || 'Página';
    }

    // Notificaciones manejadas por el sistema NOTIFICACIONES
    // Eliminadas funciones duplicadas de configurarNotificaciones, etc.

    configurarEventosMenu() {
        // Configurar eventos de navegación con animaciones
        document.querySelectorAll('.nav-link[href]').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = link.getAttribute('href');
                if (url && !url.startsWith('#')) {
                    this.navegarConTransicion(url);
                }
            });
        });
    }

    navegarConTransicion(url) {
        // Agregar clase de transición
        document.body.classList.add('page-transition');
        
        // Pequeño delay para la animación
        setTimeout(() => {
            window.location.href = url;
        }, 150);
    }

    inicializarEventListeners() {
        // Actualizar navegación en cambios de hash
        window.addEventListener('hashchange', () => {
            this.actualizarNavegacionActual();
        });

        // Configurar responsive sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.toggleSidebar.bind(this));
        }

        // Auto-actualizar notificaciones deshabilitado (sistema de notificaciones eliminado)

        // Configurar eventos de navegación
        this.configurarEventosNavegacion();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    actualizarNavegacionActual() {
        this.rutaActual = window.location.pathname;
        
        // Actualizar elementos activos del menú
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && this.esRutaActiva(href)) {
                link.classList.add('active');
            }
        });

        // Actualizar breadcrumbs
        this.configurarBreadcrumbs();
    }

    // Métodos de utilidad para otras partes del sistema
    mostrarPaginaCarga() {
        const loadingHTML = `
            <div id="loading-overlay" class="position-fixed top-0 start-0 w-100 h-100 
                 d-flex justify-content-center align-items-center" 
                 style="background: rgba(255,255,255,0.9); z-index: 9999;">
                <div class="text-center">
                    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <div class="mt-3">
                        <h5>Cargando...</h5>
                        <p class="text-muted">Por favor espere</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    ocultarPaginaCarga() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    obtenerRolUsuario() {
        return window.AUTH ? window.AUTH.obtenerRolActivo() : 'docente';
    }

    obtenerUsuarioActual() {
        return window.AUTH ? window.AUTH.obtenerUsuario() : null;
    }

    /**
     * Configura los eventos de navegación
     */
    configurarEventosNavegacion() {
        // Interceptar enlaces de navegación existentes
        document.addEventListener('click', (e) => {
            const enlace = e.target.closest('a[data-pagina]');
            if (enlace) {
                e.preventDefault();
                const pagina = enlace.getAttribute('data-pagina');
                const url = enlace.getAttribute('href') || this.obtenerURLPagina(pagina);
                if (url) {
                    this.navegarConTransicion(url);
                }
            }
        });
        
        // NOTA: Los botones de cerrar sesión y cambiar rol son manejados
        // por el sistema GESTION_SESIONES de forma global
    }

    /**
     * Actualiza la información del usuario en la interfaz
     */
    actualizarInfoUsuario() {
        // Usar el sistema AUTH unificado
        const usuario = window.AUTH ? window.AUTH.obtenerUsuario() : null;
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
            const rol = window.AUTH ? window.AUTH.obtenerRolActivo() : 'Sin rol';
            element.textContent = this.formatearRol(rol);
        });
        
        // Actualizar avatar si existe
        const avatarElements = document.querySelectorAll('.user-avatar, #avatarUsuario');
        avatarElements.forEach(element => {
            if (usuario.avatar) {
                element.src = usuario.avatar;
            } else {
                // Avatar por defecto basado en iniciales
                const iniciales = this.obtenerIniciales(usuario.nombres, usuario.apellidos);
                element.alt = iniciales;
            }
        });
    }

    // NOTA: Función confirmarCerrarSesion removida para evitar duplicación
    // El sistema GESTION_SESIONES maneja todas las funciones de sesión

    /**
     * Obtiene la URL para una página específica
     */
    obtenerURLPagina(pagina) {
        const rolActual = window.AUTH ? window.AUTH.obtenerRolActivo() : 'administrador';
        const rutasRol = RUTAS_POR_ROL[rolActual];
        
        if (rutasRol && rutasRol.paginas[pagina]) {
            return `${rutasRol.base}/${rutasRol.paginas[pagina]}`;
        }
        
        // Fallback para páginas comunes
        const paginasComunes = {
            'carga-masiva': './paginas/dashboard/admin/carga-masiva.html',
            'usuarios': './paginas/dashboard/admin/usuarios.html',
            'ciclos': './paginas/dashboard/admin/ciclos.html',
            'tablero': './paginas/dashboard/admin/tablero.html',
            'reportes': './paginas/dashboard/admin/reportes.html'
        };
        
        return paginasComunes[pagina] || null;
    }

    /**
     * Verifica si el usuario tiene acceso a una página específica
     */
    verificarAccesoPagina(pagina) {
        const rolActual = window.AUTH ? window.AUTH.obtenerRolActivo() : null;
        const rutasRol = RUTAS_POR_ROL[rolActual];
        return rutasRol && rutasRol.paginas[pagina];
    }
}

// Instancia global
window.NAVEGACION = new SistemaNavegacion();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar menú si existe contenedor
    if (document.getElementById('menu-navegacion')) {
        NAVEGACION.renderizarMenu();
    }
    
    console.log('🧭 Sistema de navegación inicializado');
});

// Estilos CSS para animaciones de navegación
const estilosNavegacion = `
<style>
.page-transition {
    opacity: 0.8;
    transition: opacity 0.15s ease-out;
}

.nav-link {
    transition: all 0.3s ease;
}

.nav-link:hover {
    background-color: rgba(255,255,255,0.1);
    border-radius: 6px;
}

.nav-link.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white !important;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.breadcrumb-item + .breadcrumb-item::before {
    content: "›";
    font-weight: bold;
}

.dropdown-menu {
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-radius: 8px;
}

.dropdown-item:hover {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

@media (max-width: 768px) {
    .navbar-nav .dropdown-menu {
        position: static !important;
        float: none;
        width: auto;
        margin-top: 0;
        background-color: transparent;
        border: 0;
        box-shadow: none;
    }
}
</style>
`;

// Inyectar estilos
document.head.insertAdjacentHTML('beforeend', estilosNavegacion);

console.log('✅ Sistema de navegación avanzado cargado'); 