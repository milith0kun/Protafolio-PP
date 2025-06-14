/**
 * Módulo de autenticación
 * Maneja el inicio y cierre de sesión, y la verificación de autenticación
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG - Autenticación inicializada en:', window.location.pathname);
    
    // Verificar si estamos en la página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('DEBUG - Formulario de login detectado, configurando eventos');
        configurarLogin();
    }
    
    // Verificar autenticación en páginas protegidas
    const rutaActual = window.location.pathname;
    console.log('DEBUG - Ruta actual:', rutaActual);
    
    // Páginas públicas que no requieren verificación de autenticación
    const paginasPublicas = ['index.html', 'login.html', 'registro.html'];
    const esPaginaPublica = paginasPublicas.some(pagina => rutaActual.includes(pagina)) || rutaActual.endsWith('/');
    
    if (!esPaginaPublica) {
        console.log('DEBUG - Verificando autenticación en página protegida');
        verificarAutenticacion();
    } else {
        console.log('DEBUG - Página pública, no se verifica autenticación:', rutaActual);
    }
});

/**
 * Configura los eventos del formulario de login
 */
function configurarLogin() {
    console.log('DEBUG - Configurando login');
    const loginForm = document.getElementById('formulario-login');
    const togglePassword = document.getElementById('btn-mostrar-password');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('alerta-error');
    const textoError = document.getElementById('texto-error');
    
    console.log('DEBUG - Elementos del formulario:', {
        loginForm: !!loginForm,
        togglePassword: !!togglePassword,
        passwordInput: !!passwordInput,
        errorMessage: !!errorMessage,
        textoError: !!textoError
    });

    // Mostrar/ocultar contraseña
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Manejar envío del formulario
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('DEBUG - Procesando envío del formulario');
            const email = document.getElementById('correo').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('recordar-sesion').checked;
            
            console.log('DEBUG - Datos del formulario:', {
                email: email,
                passwordLength: password ? password.length : 0,
                rememberMe: rememberMe
            });

            // Validación básica
            if (!email || !password) {
                if (textoError) {
                    textoError.textContent = 'Por favor, complete todos los campos';
                    errorMessage.classList.remove('d-none');
                    // Ocultar después de 5 segundos
                    setTimeout(() => {
                        errorMessage.classList.add('d-none');
                    }, 5000);
                }
                return;
            }

            // Guardar referencia al botón de envío fuera del try-catch para usarlo en ambos bloques
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            
            try {
                // Mostrar indicador de carga
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

                console.log('DEBUG - Enviando petición de login con email:', email);
                
                // Realizar petición de login
                const data = await APP.apiRequest('/auth/login', 'POST', {
                    correo: email, // Corregido: enviar como 'correo' para coincidir con el backend
                    password: password
                }, false);

                console.log('DEBUG - Respuesta de login recibida:', data);
                
                // Validar que la respuesta contiene token y datos del usuario
                if (!data.token) {
                    throw new Error('La respuesta no contiene un token válido');
                }
                
                if (!data.usuario) {
                    throw new Error('La respuesta no contiene datos del usuario');
                }
                
                // Validar que el usuario tiene roles
                if (!data.usuario.roles || data.usuario.roles.length === 0) {
                    throw new Error('El usuario no tiene roles asignados');
                }

                // Guardar token y datos del usuario
                APP.guardarToken(data.token);
                APP.guardarUsuario(data.usuario);
                
                console.log('DEBUG - Token y usuario guardados correctamente');
                console.log('DEBUG - Roles del usuario:', data.usuario.roles);

                // Verificar si el usuario tiene múltiples roles
                window.autenticacion.verificarRolesYRedirigir();

            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                
                // Determinar mensaje de error más descriptivo
                let mensajeError = 'Error al iniciar sesión. Verifique sus credenciales.';
                
                if (error.status === 401) {
                    mensajeError = 'Credenciales incorrectas. Verifique su correo y contraseña.';
                } else if (error.status === 404) {
                    mensajeError = 'Usuario no encontrado. Verifique su correo electrónico.';
                } else if (error.status === 403) {
                    mensajeError = 'Usuario inactivo o sin permisos. Contacte al administrador.';
                } else if (error.status === 500) {
                    mensajeError = 'Error en el servidor. Intente nuevamente más tarde.';
                } else if (error.message && error.message.includes('Failed to fetch')) {
                    mensajeError = 'No se pudo conectar con el servidor. Verifique que el servidor backend esté en ejecución.';
                }
                
                // Usar mensaje personalizado si está disponible
                if (error.data?.mensaje) {
                    mensajeError = error.data.mensaje;
                }
                
                // Mostrar mensaje de error
                APP.mostrarError(mensajeError, errorMessage);
                
                // Restaurar botón
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            }
        });
    }
}

/**
 * Verifica si el usuario está autenticado
 * Si no está autenticado, redirige a la página de login
 */
function verificarAutenticacion() {
    console.log('DEBUG - Ejecutando verificarAutenticacion() en:', window.location.pathname);
    
    if (!APP.estaAutenticado()) {
        console.log('DEBUG - Usuario no autenticado, redirigiendo a login');
        APP.redirigirALogin();
        return;
    }
    
    console.log('DEBUG - Usuario autenticado correctamente');
    // Aquí podrías verificar si el token sigue siendo válido
    // haciendo una petición a un endpoint protegido
}

// La función cerrarSesion se usa desde APP.cerrarSesion definida en nucleo.js

/**
 * Redirige al usuario al dashboard correspondiente según su rol
 * @param {string} rol - Rol del usuario
 */
function redirigirSegunRol(rol) {
    console.log('DEBUG - Redirigiendo según rol:', rol);
    
    if (!rol) {
        console.error('No se especificó un rol para la redirección');
        return;
    }
    
    // Normalizar el rol a minúsculas para comparación
    const rolLower = typeof rol === 'string' ? rol.toLowerCase() : rol;
    
    // Definir rutas según el rol
    let rutaDestino;
    
    switch (rolLower) {
        case 'administrador':
            rutaDestino = window.CONFIG.ROUTES.DASHBOARD_ADMIN;
            break;
        case 'docente':
            rutaDestino = window.CONFIG.ROUTES.DASHBOARD_DOCENTE;
            break;
        case 'verificador':
            rutaDestino = window.CONFIG.ROUTES.DASHBOARD_VERIFICADOR;
            break;
        default:
            console.error('Rol no reconocido:', rol);
            alert('Rol no reconocido. Contacte al administrador.');
            return;
    }
    
    console.log('DEBUG - Redirigiendo a:', rutaDestino);
    window.location.href = rutaDestino;
}

/**
 * Verifica los roles del usuario y redirige según corresponda
 * Si tiene un solo rol, redirige directamente al dashboard
 * Si tiene múltiples roles, redirige al selector de roles
 * 
 * Actualizado para usar los roles que vienen directamente en la respuesta del login
 * y mejorar el manejo de errores
 */
async function verificarRolesYRedirigir() {
    console.log('DEBUG - Verificando roles del usuario');
    try {
        const usuario = APP.obtenerUsuario();
        
        if (!usuario) {
            console.error('No se encontró información del usuario');
            alert('Error: No se encontró información del usuario. Intente iniciar sesión nuevamente.');
            APP.cerrarSesion();
            return;
        }
        
        // Usar los roles que ya vienen en el objeto usuario desde el login
        const roles = usuario.roles || [];
        console.log('DEBUG - Roles obtenidos:', roles.length, roles);
        
        // Si no tiene roles, mostrar error
        if (roles.length === 0) {
            console.error('El usuario no tiene roles asignados');
            alert('No tiene roles asignados en el sistema. Contacte al administrador.');
            APP.cerrarSesion();
            return;
        }
        
        // Si tiene un solo rol, redirigir directamente al dashboard
        if (roles.length === 1) {
            console.log('DEBUG - Usuario con un solo rol, redirigiendo directamente');
            
            // Verificar que el rol tenga la estructura esperada
            if (!roles[0].rol) {
                console.error('Estructura de rol inválida:', roles[0]);
                alert('Error: Estructura de rol inválida. Contacte al administrador.');
                APP.cerrarSesion();
                return;
            }
            
            // Actualizar el rol actual en el usuario almacenado
            usuario.rolActual = roles[0].rol;
            APP.guardarUsuario(usuario);
            
            console.log('DEBUG - Rol actual establecido:', usuario.rolActual);
            
            // Redirigir al dashboard correspondiente
            redirigirSegunRol(usuario.rolActual);
        } else {
            // Si tiene múltiples roles, redirigir al selector de roles
            console.log('DEBUG - Usuario con múltiples roles, redirigiendo al selector');
            window.location.href = window.CONFIG.ROUTES.SELECTOR_ROLES;
        }
    } catch (error) {
        console.error('Error al verificar roles:', error);
        alert('Error al verificar roles: ' + (error.message || 'Error desconocido') + '. Intente nuevamente.');
        APP.cerrarSesion();
    }
}

// Hacer las funciones disponibles globalmente
window.autenticacion = {
    cerrarSesion: APP.cerrarSesion,
    redirigirSegunRol,
    verificarRolesYRedirigir
};
