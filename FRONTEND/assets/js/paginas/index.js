/**
 * Script específico para la página de inicio
 * Controla la navegación y redirección desde la página principal
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG - Inicializando página de inicio');
    
    // Configurar botones principales
    const btnAcceder = document.getElementById('btn-acceder');
    if (btnAcceder) {
        btnAcceder.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('DEBUG - Botón acceder clickeado');
            window.location.href = window.CONFIG.ROUTES.LOGIN;
        });
    }
    
    const btnRegistrarse = document.getElementById('btn-registrarse');
    if (btnRegistrarse) {
        btnRegistrarse.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('DEBUG - Botón registrarse clickeado');
            // El registro también debe ir al login primero
            window.location.href = window.CONFIG.ROUTES.LOGIN;
        });
    }
    
    // Configurar enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            console.log('DEBUG - Enlace clickeado:', action);
            
            switch(action) {
                case 'inicio':
                    window.location.href = '/';
                    break;
                case 'login':
                    window.location.href = window.CONFIG.ROUTES.LOGIN;
                    break;
                case 'ayuda':
                    window.location.href = '/paginas/compartidas/ayuda.html';
                    break;
                case 'recuperar':
                    window.location.href = '/paginas/autenticacion/recuperar.html';
                    break;
                case 'soporte':
                    window.location.href = 'mailto:portafolio@unsaac.edu.pe';
                    break;
                case 'terminos':
                    window.location.href = '/paginas/compartidas/terminos.html';
                    break;
                case 'privacidad':
                    window.location.href = '/paginas/compartidas/privacidad.html';
                    break;
                case 'cookies':
                    window.location.href = '/paginas/compartidas/cookies.html';
                    break;
                case 'accesibilidad':
                    window.location.href = '/paginas/compartidas/accesibilidad.html';
                    break;
                default:
                    console.warn('Acción no reconocida:', action);
            }
        });
    });
    
    // Configurar botones de roles si existen
    const botonesRoles = document.querySelectorAll('.role-card-link');
    botonesRoles.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            const rol = this.getAttribute('data-role');
            console.log('DEBUG - Botón de rol clickeado:', rol);
            
            // Si el usuario está autenticado, redirigir según el rol
            if (APP && APP.estaAutenticado) {
                if (APP.estaAutenticado()) {
                    const usuario = APP.obtenerUsuario();
                    if (usuario && usuario.rol === rol) {
                        // El usuario ya tiene este rol, redirigir al dashboard correspondiente
                        if (window.autenticacion && window.autenticacion.redirigirSegunRol) {
                            window.autenticacion.redirigirSegunRol(rol);
                        } else {
                            // Fallback si no existe la función
                            const dashboardRoute = window.CONFIG.ROUTES.DASHBOARD[rol.toUpperCase()];
                            if (dashboardRoute) {
                                window.location.href = dashboardRoute;
                            } else {
                                window.location.href = window.CONFIG.ROUTES.SELECTOR_ROLES;
                            }
                        }
                    } else {
                        // El usuario está autenticado pero con otro rol, ir al selector de roles
                        window.location.href = window.CONFIG.ROUTES.SELECTOR_ROLES;
                    }
                } else {
                    // Si no está autenticado, ir al login
                    window.location.href = window.CONFIG.ROUTES.LOGIN;
                }
            } else {
                // Si no existe el objeto APP, ir directamente al login
                window.location.href = window.CONFIG.ROUTES.LOGIN;
            }
        });
    });
});
