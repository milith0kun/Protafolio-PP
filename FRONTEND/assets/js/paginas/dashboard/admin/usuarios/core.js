/**
 * USUARIOS ADMIN - MÓDULO CORE
 * Inicialización, autenticación y configuración
 */

// ================================================
// ESTADO GLOBAL
// ================================================

const usuariosState = {
    token: null,
    usuario: null,
    inicializado: false,
    tablaUsuarios: null,
    modoEdicion: false
};

// ================================================
// INICIALIZACIÓN PRINCIPAL
// ================================================

async function initialize() {
    console.log('🔧 Inicializando módulo core de usuarios...');
    
    try {
        // Verificar autenticación
        if (!verificarAutenticacion()) {
            return false;
        }
        
        // Verificar configuración
        if (!verificarConfiguracion()) {
            return false;
        }
        
        // Configurar sistema
        configurarSistema();
        
        usuariosState.inicializado = true;
        console.log('✅ Módulo core de usuarios inicializado');
        return true;
        
    } catch (error) {
        console.error('❌ Error en inicialización core usuarios:', error);
        throw error;
    }
}

// ================================================
// AUTENTICACIÓN
// ================================================

/**
 * Obtiene el token de autenticación válido
 */
function obtenerTokenValido() {
    // 1. Desde sessionStorage (sesión actual)
    let token = sessionStorage.getItem(CONFIG.STORAGE.TOKEN);
    if (token) {
        usuariosState.token = token;
        return token;
    }
    
    // 2. Desde localStorage (sesión recordada)
    token = localStorage.getItem(CONFIG.STORAGE.TOKEN);
    if (token) {
        usuariosState.token = token;
        return token;
    }
    
    // 3. Desde el sistema de autenticación global
    if (window.AUTH?.obtenerToken) {
        token = window.AUTH.obtenerToken();
        if (token) {
            usuariosState.token = token;
            return token;
        }
    }
    
    console.error('❌ No se pudo obtener token de autenticación');
    return null;
}

/**
 * Verifica si el usuario está autenticado correctamente
 */
function verificarAutenticacion() {
    const token = obtenerTokenValido();
    if (!token) {
        console.error('❌ Usuario no autenticado, redirigiendo al login');
        window.location.href = CONFIG.getRoute?.('LOGIN') || CONFIG.ROUTES?.LOGIN || '../../../paginas/autenticacion/login.html';
        return false;
    }
    
    console.log('✅ Usuario autenticado correctamente');
    return true;
}

/**
 * Maneja errores de respuesta HTTP, especialmente 401
 */
function manejarRespuestaHTTP(response) {
    if (response.status === 401) {
        console.error('❌ Token expirado o inválido');
        mostrarError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        
        // Limpiar tokens
        sessionStorage.removeItem(CONFIG.STORAGE.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE.TOKEN);
        usuariosState.token = null;
        
        // Redirigir al login
        setTimeout(() => {
            window.location.href = CONFIG.getRoute?.('LOGIN') || CONFIG.ROUTES?.LOGIN || '../../../paginas/autenticacion/login.html';
        }, 2000);
        
        throw new Error('Sesión expirada');
    }
    
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    return response;
}

/**
 * Realiza una petición HTTP con manejo de errores de autenticación
 */
async function realizarPeticionSegura(url, options = {}) {
    const token = obtenerTokenValido();
    if (!token) {
        throw new Error('No hay token de autenticación disponible');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const config = {
        ...options,
        headers
    };
    
    console.log('🔐 Realizando petición segura:', { url, method: config.method || 'GET' });
    
    try {
        const response = await fetch(url, config);
        const processedResponse = manejarRespuestaHTTP(response);
        
        if (processedResponse && typeof processedResponse.json === 'function') {
            const data = await processedResponse.json();
            console.log('✅ Datos recibidos exitosamente');
            return data;
        }
        
        return processedResponse;
    } catch (error) {
        console.error('❌ Error en petición HTTP:', error);
        throw error;
    }
}

// ================================================
// CONFIGURACIÓN
// ================================================

/**
 * Verificar configuración del sistema
 */
function verificarConfiguracion() {
    if (!CONFIG || !CONFIG.API || !CONFIG.API.BASE_URL) {
        console.error('❌ Configuración no disponible');
        mostrarError('Error de configuración. Por favor, recargue la página.');
        return false;
    }
    
    console.log('🔗 API Base URL:', CONFIG.API.BASE_URL);
    return true;
}

/**
 * Configurar sistema inicial
 */
function configurarSistema() {
    // Configurar manejo de errores global para este módulo
    window.addEventListener('error', (event) => {
        if (event.filename?.includes('usuarios/')) {
            console.error('❌ Error en módulo usuarios:', event.error);
        }
    });
    
    console.log('⚙️ Sistema de usuarios configurado');
}

// ================================================
// GETTERS Y SETTERS
// ================================================

function obtenerToken() {
    return usuariosState.token || obtenerTokenValido();
}

function obtenerUsuario() {
    return usuariosState.usuario;
}

function estaInicializado() {
    return usuariosState.inicializado;
}

function obtenerTablaUsuarios() {
    return usuariosState.tablaUsuarios;
}

function establecerTablaUsuarios(tabla) {
    usuariosState.tablaUsuarios = tabla;
}

function obtenerModoEdicion() {
    return usuariosState.modoEdicion;
}

function establecerModoEdicion(modo) {
    usuariosState.modoEdicion = modo;
}

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

function mostrarError(mensaje) {
    console.error('❌ Error:', mensaje);
    
    // Intentar usar el sistema de notificaciones si está disponible
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion(mensaje, 'error');
    } else if (window.UIUsuarios?.mostrarError) {
        window.UIUsuarios.mostrarError(mensaje);
    } else {
        alert(`Error: ${mensaje}`);
    }
}

function mostrarExito(mensaje) {
    console.log('✅ Éxito:', mensaje);
    
    // Intentar usar el sistema de notificaciones si está disponible
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion(mensaje, 'success');
    } else if (window.UIUsuarios?.mostrarExito) {
        window.UIUsuarios.mostrarExito(mensaje);
    } else {
        // Fallback simple
        console.log('✅', mensaje);
    }
}

// ================================================
// EXPORTACIÓN DEL MÓDULO
// ================================================

window.UsuariosCore = {
    // Inicialización
    initialize,
    
    // Autenticación
    obtenerTokenValido,
    verificarAutenticacion,
    realizarPeticionSegura,
    
    // Estado
    obtenerToken,
    obtenerUsuario,
    estaInicializado,
    obtenerTablaUsuarios,
    establecerTablaUsuarios,
    obtenerModoEdicion,
    establecerModoEdicion,
    
    // Utilidades
    mostrarError,
    mostrarExito
};

console.log('✅ Módulo Core de Usuarios cargado'); 