/**
 * Script optimizado para la página de login
 * Maneja la autenticación de forma eficiente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Inicializando página de login...');
    
    // Configurar todos los elementos de la página
    configurarInterfaz();
    
    // Mostrar información de debug en desarrollo
    if (esModoDesarrollo()) {
        setTimeout(mostrarInformacionDebug, 100);
    }
});

/**
 * Configurar toda la interfaz de login
 */
function configurarInterfaz() {
    configurarFormularioLogin();
    configurarMenuResponsive();
    configurarAlertas();
}

/**
 * Configurar el formulario de login principal
 */
function configurarFormularioLogin() {
    const elementos = obtenerElementosFormulario();
    if (!elementos.formulario) {
        console.error('❌ Elementos del formulario no encontrados');
        return;
    }
    
    const { formulario, correoInput, passwordInput, btnLogin, btnMostrar } = elementos;
    
    // Configurar visibilidad de contraseña
    configurarTogglePassword(btnMostrar, passwordInput);
    
    // Configurar envío del formulario
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        await procesarLogin(correoInput.value.trim(), passwordInput.value, btnLogin);
    });
    
    // Configurar validación en tiempo real
    configurarValidacionTiempoReal(correoInput, passwordInput);
    
    // Auto-focus en el campo de correo
    setTimeout(() => correoInput.focus(), 100);
    
    console.log('✅ Formulario de login configurado');
}

/**
 * Obtener todos los elementos del formulario
 */
function obtenerElementosFormulario() {
    return {
        formulario: document.getElementById('formulario-login'),
        correoInput: document.getElementById('correo'),
        passwordInput: document.getElementById('password'),
        btnLogin: document.getElementById('btn-login'),
        btnMostrar: document.getElementById('btn-mostrar-password')
    };
}

/**
 * Configurar botón de mostrar/ocultar contraseña
 */
function configurarTogglePassword(btnMostrar, passwordInput) {
    if (!btnMostrar || !passwordInput) return;
    
    btnMostrar.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        const icon = this.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
        
        this.title = isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';
    });
}

/**
 * Configurar validación en tiempo real optimizada
 */
function configurarValidacionTiempoReal(correoInput, passwordInput) {
    let timeoutValidacion;
    
    // Validación de correo
    correoInput.addEventListener('input', function() {
        clearTimeout(timeoutValidacion);
        
        if (this.value.trim()) {
            ocultarTodasLasAlertas();
        }
        
        // Validar después de 1.5 segundos
        timeoutValidacion = setTimeout(() => {
            const correo = this.value.trim();
            if (correo.length >= 5 && !validarEmail(correo)) {
                mostrarError('Formato de correo electrónico inválido');
            }
        }, 1500);
    });
    
    // Validación de contraseña
    passwordInput.addEventListener('input', function() {
        if (this.value.trim()) {
            ocultarTodasLasAlertas();
        }
    });
}

/**
 * Procesar el login del usuario
 */
async function procesarLogin(correo, password, btnLogin) {
    ocultarTodasLasAlertas();
    
    // Validar campos
    const errorValidacion = validarCamposLogin(correo, password);
    if (errorValidacion) {
        mostrarError(errorValidacion);
        return;
    }
    
    const recordarSesion = document.getElementById('recordar-sesion')?.checked || false;
    
    // Configurar estado de carga
    const estadoOriginal = configurarEstadoCarga(btnLogin, true);
    
    try {
        console.log('🔐 Procesando login...', { correo, recordarSesion });
        
        const resultado = await AUTH.iniciarSesion(correo, password);
        console.log('📥 Resultado del login:', resultado);
        
        if (resultado.exito) {
            mostrarExito('¡Inicio de sesión exitoso! Redirigiendo...');
            
            // Guardar sesión
            AUTH.guardarSesion?.(recordarSesion);
            
            // Redirigir según el resultado
            setTimeout(() => redirigirSegunResultado(resultado), 1000);
        } else {
            mostrarError(resultado.mensaje || 'Error de autenticación');
        }
        
    } catch (error) {
        console.error('❌ Error crítico en login:', error);
        mostrarError('No se pudo conectar con el servidor. Intente nuevamente.');
    } finally {
        setTimeout(() => configurarEstadoCarga(btnLogin, false, estadoOriginal), 2000);
    }
}

/**
 * Validar campos de login
 */
function validarCamposLogin(correo, password) {
    if (!correo && !password) {
        return 'Debe completar el correo y la contraseña';
    }
    if (!correo) {
        return 'Debe ingresar su correo institucional';
    }
    if (!password) {
        return 'Debe ingresar su contraseña';
    }
    if (!validarEmail(correo)) {
        return 'El formato del correo electrónico no es válido';
    }
    if (password.length < 4) {
        return 'La contraseña debe tener al menos 4 caracteres';
    }
    return null;
}

/**
 * Configurar estado de carga del botón
 */
function configurarEstadoCarga(btnLogin, cargar, estadoOriginal = null) {
    if (cargar) {
        const textoOriginal = btnLogin.innerHTML;
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        return textoOriginal;
    } else {
        btnLogin.disabled = false;
        btnLogin.innerHTML = estadoOriginal;
    }
}

/**
 * Redirigir según el resultado del login
 */
function redirigirSegunResultado(resultado) {
    if (resultado.requiereSeleccionRol) {
        console.log('🎭 Usuario con múltiples roles detectado');
        const selectorUrl = CONFIG.getRoute?.('SELECTOR_ROLES') || CONFIG.ROUTES?.SELECTOR_ROLES || './selector-roles.html';
        window.location.href = selectorUrl;
    } else {
        console.log('✅ Login directo exitoso');
        
        // Obtener URL de redirección
        let urlRedireccion = resultado.redirigirA;
        
        // Si no viene la URL, determinarla basada en el usuario
        if (!urlRedireccion) {
            const usuario = AUTH.obtenerUsuario();
            if (usuario?.rolActual) {
                urlRedireccion = obtenerDashboardPorRol(usuario.rolActual);
            } else {
                urlRedireccion = CONFIG.getRoute?.('SELECTOR_ROLES') || CONFIG.ROUTES?.SELECTOR_ROLES || './selector-roles.html';
            }
        }
        
        console.log('🔀 Redirigiendo a:', urlRedireccion);
        window.location.href = urlRedireccion;
    }
}

/**
 * Obtener dashboard según el rol del usuario usando CONFIG
 */
function obtenerDashboardPorRol(rol) {
    const dashboards = {
        'administrador': CONFIG.getRoute?.('DASHBOARD_ADMIN') || CONFIG.ROUTES?.DASHBOARD_ADMIN,
        'docente': CONFIG.getRoute?.('DASHBOARD_DOCENTE') || CONFIG.ROUTES?.DASHBOARD_DOCENTE,
        'verificador': CONFIG.getRoute?.('DASHBOARD_VERIFICADOR') || CONFIG.ROUTES?.DASHBOARD_VERIFICADOR
    };
    
    return dashboards[rol] || CONFIG.getRoute?.('SELECTOR_ROLES') || CONFIG.ROUTES?.SELECTOR_ROLES || './selector-roles.html';
}

/**
 * Configurar menú responsive
 */
function configurarMenuResponsive() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (!menuToggle || !mainNav) return;
    
    menuToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        
        const icon = this.querySelector('i');
        if (icon) {
            icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
        }
    });
}

/**
 * Configurar sistema de alertas
 */
function configurarAlertas() {
    // Configurar botones de cerrar alertas
    document.querySelectorAll('.alert-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.alert').classList.add('d-none');
        });
    });
}

/**
 * Ocultar todas las alertas
 */
function ocultarTodasLasAlertas() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.classList.add('d-none');
    });
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    const alertaError = document.getElementById('alerta-error');
    const textoError = document.getElementById('texto-error');
    
    if (alertaError && textoError) {
        textoError.textContent = mensaje;
        alertaError.classList.remove('d-none');
        
        // Auto-ocultar después de 8 segundos
        setTimeout(() => {
            alertaError.classList.add('d-none');
        }, 8000);
    }
    
    console.error('❌ Error:', mensaje);
}

/**
 * Mostrar mensaje de éxito
 */
function mostrarExito(mensaje) {
    const alertaExito = document.getElementById('alerta-exito');
    const textoExito = document.getElementById('texto-exito');
    
    if (alertaExito && textoExito) {
        textoExito.textContent = mensaje;
        alertaExito.classList.remove('d-none');
    }
    
    console.log('✅', mensaje);
}

/**
 * Validar formato de email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Verificar si está en modo desarrollo
 */
function esModoDesarrollo() {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

/**
 * Mostrar información de debug (solo desarrollo)
 */
function mostrarInformacionDebug() {
    if (!esModoDesarrollo()) return;
    
    console.log('%c🔧 MODO DESARROLLO ACTIVO', 'color: orange; font-weight: bold;');
    console.log('Funciones disponibles:');
    console.log('- AUTH: Sistema de autenticación');
    console.log('- CONFIG: Configuración global');
    
    // Función global de limpieza para debug
    window.limpiarLogin = () => {
        ocultarTodasLasAlertas();
        document.getElementById('correo').value = '';
        document.getElementById('password').value = '';
        console.log('🧹 Formulario limpiado');
    };
    
    console.log('- limpiarLogin(): Limpiar formulario');
}

console.log('✅ Script de login optimizado inicializado'); 