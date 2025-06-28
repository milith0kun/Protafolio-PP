/**
 * Script optimizado para la página de inicio
 * Controla la navegación y redirección desde la página principal
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Inicializando página de inicio');
    
    // Configurar todos los elementos de interfaz
    configurarInterfaz();
    
    // Verificar si hay sesión activa
    verificarSesionExistente();
});

/**
 * Configura toda la interfaz de la página de inicio
 */
function configurarInterfaz() {
    configurarBotonesAcceso();
    configurarNavegacionInterna();
    configurarMenuMovil();
}

/**
 * Configura todos los botones de acceso al sistema
 */
function configurarBotonesAcceso() {
    // Selectores consolidados para todos los botones de login
    const selectoresLogin = [
        '#btn-acceder',
        '#btn-nav-login', 
        '#footer-login',
        '.role-access-btn'
    ];
    
    // Configurar todos los botones de una vez
    selectoresLogin.forEach(selector => {
        const elementos = document.querySelectorAll(selector);
        elementos.forEach(elemento => {
            elemento.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Log específico para botones de rol
                if (this.classList.contains('role-access-btn')) {
                    const rol = this.getAttribute('data-role');
                    console.log('👤 Acceso solicitado para rol:', rol);
                }
                
                redirigirAlLogin();
            });
        });
    });
}

/**
 * Configura la navegación interna de la página (anclas)
 */
function configurarNavegacionInterna() {
    const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Scroll suave al elemento
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Actualizar navegación activa
                actualizarNavegacionActiva(this);
            }
        });
    });
}

/**
 * Verifica si existe una sesión activa y actualiza la interfaz
 */
function verificarSesionExistente() {
    if (window.AUTH?.existeSesionGuardada?.()) {
        console.log('✅ Sesión guardada detectada');
        
        // Actualizar botón principal
        const btnAcceder = document.getElementById('btn-acceder');
        if (btnAcceder) {
            btnAcceder.innerHTML = '<i class="fas fa-play"></i> Continuar Sesión';
            btnAcceder.title = 'Continuar con la sesión guardada';
        }
        
        // Mostrar información del usuario
        mostrarInfoUsuarioGuardado();
    }
}

/**
 * Muestra información del usuario guardado en el header
 */
function mostrarInfoUsuarioGuardado() {
    try {
        const usuarioGuardado = localStorage.getItem(window.CONFIG?.STORAGE?.USER);
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            const userNameElement = document.getElementById('userName');
            
            if (userNameElement && usuario.nombres) {
                userNameElement.textContent = `${usuario.nombres} (Sesión activa)`;
                userNameElement.classList.add('user-logged');
            }
        }
    } catch (error) {
        console.warn('⚠️ Error al mostrar usuario guardado:', error);
    }
}

/**
 * Configura el menú móvil
 */
function configurarMenuMovil() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (!menuToggle || !mainNav) return;
    
    menuToggle.addEventListener('click', function() {
        const isActive = mainNav.classList.toggle('active');
        this.classList.toggle('active', isActive);
        
        // Cambiar icono
        const icon = this.querySelector('i');
        if (icon) {
            icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        }
    });
    
    // Cerrar menú al hacer clic en un enlace
    mainNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            menuToggle.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        });
    });
}

/**
 * Actualiza la navegación activa
 */
function actualizarNavegacionActiva(enlaceActivo) {
    // Remover clase active de todos los enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase active al enlace clickeado
    enlaceActivo.classList.add('active');
}

/**
 * Redirige al sistema de login de forma optimizada
 */
function redirigirAlLogin() {
    // Intentar restaurar sesión existente
    if (window.AUTH?.restaurarSesionManual?.()) {
        console.log('✅ Sesión restaurada, redirigiendo al dashboard...');
        
        const usuario = window.AUTH.obtenerUsuario();
        if (usuario?.rolActual) {
            window.location.href = obtenerDashboardPorRol(usuario.rolActual);
            return;
        } else if (usuario?.roles?.length > 1) {
            window.location.href = CONFIG.getRoute?.('SELECTOR_ROLES') || CONFIG.ROUTES?.SELECTOR_ROLES || './paginas/autenticacion/selector-roles.html';
            return;
        }
    }
    
    // No hay sesión válida, ir al login
    const rutaLogin = CONFIG.getRoute?.('LOGIN') || CONFIG.ROUTES?.LOGIN || './paginas/autenticacion/login.html';
    window.location.href = rutaLogin;
}

/**
 * Obtiene la ruta del dashboard según el rol
 */
function obtenerDashboardPorRol(rol) {
    const dashboards = {
        'administrador': CONFIG.getRoute?.('DASHBOARD_ADMIN') || CONFIG.ROUTES?.DASHBOARD_ADMIN,
        'docente': CONFIG.getRoute?.('DASHBOARD_DOCENTE') || CONFIG.ROUTES?.DASHBOARD_DOCENTE,
        'verificador': CONFIG.getRoute?.('DASHBOARD_VERIFICADOR') || CONFIG.ROUTES?.DASHBOARD_VERIFICADOR
    };
    
    return dashboards[rol] || CONFIG.getRoute?.('LOGIN') || CONFIG.ROUTES?.LOGIN || './paginas/autenticacion/login.html';
}

// Función de depuración (solo en modo desarrollo)
if (['localhost', '127.0.0.1'].includes(window.location.hostname) || 
    window.location.href.includes('localhost')) {
    
    window.limpiarSesionCompleta = function() {
        console.log('🧹 Limpiando sesión completa...');
        
        // Limpiar almacenamiento
        if (window.CONFIG?.STORAGE) {
            Object.values(window.CONFIG.STORAGE).forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
        }
        
        // Limpiar AUTH
        window.AUTH?.limpiarSesion?.();
        
        console.log('✅ Sesión limpiada. Recargando página...');
        setTimeout(() => window.location.reload(), 1000);
    };
    
    console.log('🔧 Modo desarrollo: limpiarSesionCompleta() disponible');
}

console.log('✅ Script del index inicializado correctamente');
