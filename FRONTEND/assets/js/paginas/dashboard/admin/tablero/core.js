/**
 * TABLERO ADMIN - MÓDULO CORE
 * Inicialización y verificación de autenticación
 */

// ================================================
// INICIALIZACIÓN PRINCIPAL
// ================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Dashboard de Administrador inicializado');
    inicializarDashboard();
});

/**
 * Función principal de inicialización
 */
async function inicializarDashboard() {
    try {
        // 1. Verificar autenticación
        if (!verificarAutenticacionRapida()) {
            return; // La función ya maneja redirección
        }
        
        // 2. Configurar componentes básicos
        configurarComponentesBasicos();
        
        // 3. Inicializar otros módulos
        await Promise.all([
            initializeEventos(),
            initializeData(),
            initializeUI()
        ]);
        
        console.log('✅ Dashboard inicializado completamente');
        
    } catch (error) {
        console.error('❌ Error en inicialización del dashboard:', error);
        mostrarErrorGeneral('Error al cargar el dashboard');
    }
}

// ================================================
// VERIFICACIÓN DE AUTENTICACIÓN OPTIMIZADA
// ================================================

/**
 * Verificación rápida de autenticación
 */
function verificarAutenticacionRapida() {
    // Verificar disponibilidad del sistema AUTH
    if (!window.AUTH?.verificarAutenticacion?.()) {
        console.warn('⚠️ Autenticación fallida, redirigiendo...');
        window.location.href = '../../autenticacion/login.html';
        return false;
    }
    
    // Verificar rol de administrador
    const rolActual = AUTH.obtenerRolActivo();
    if (!['administrador', 'admin'].includes(rolActual?.toLowerCase())) {
        console.warn('⚠️ Sin permisos de administrador');
        alert('No tienes permisos para acceder a esta sección');
        window.location.href = '../../autenticacion/selector-roles.html';
        return false;
    }
    
    console.log('✅ Autenticación verificada - Rol:', rolActual);
    return true;
}

// ================================================
// CONFIGURACIÓN DE COMPONENTES BÁSICOS
// ================================================

/**
 * Configurar componentes básicos del dashboard
 */
function configurarComponentesBasicos() {
    // Inicializar tooltips de Bootstrap
    initializeTooltips();
    
    // Inicializar popovers de Bootstrap
    initializePopovers();
    
    // Configurar información del usuario en header
    actualizarInfoUsuario();
    
    console.log('✅ Componentes básicos configurados');
}

function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => new bootstrap.Tooltip(el));
}

function initializePopovers() {
    const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(el => new bootstrap.Popover(el));
}

function actualizarInfoUsuario() {
    const usuario = AUTH.obtenerUsuario();
    if (!usuario) return;
    
    // Actualizar nombre en header
    const nombreElemento = document.getElementById('nombreUsuario');
    if (nombreElemento) {
        nombreElemento.textContent = usuario.nombres || 'Administrador';
    }
    
    // Actualizar email en dropdown si existe
    const emailElemento = document.getElementById('dropdownUserEmail');
    if (emailElemento) {
        emailElemento.textContent = usuario.correo || usuario.email || '';
    }
}

// ================================================
// FUNCIONES DE INICIALIZACIÓN DE MÓDULOS
// ================================================

/**
 * Inicializar módulo de eventos
 */
async function initializeEventos() {
    if (window.EventosTablero) {
        await EventosTablero.initialize();
    } else {
        console.warn('⚠️ Módulo EventosTablero no disponible');
    }
}

/**
 * Inicializar módulo de datos
 */
async function initializeData() {
    if (window.DataTablero) {
        await DataTablero.initialize();
    } else {
        console.warn('⚠️ Módulo DataTablero no disponible');
    }
}

/**
 * Inicializar módulo de interfaz
 */
async function initializeUI() {
    if (window.UITablero) {
        await UITablero.initialize();
    } else {
        console.warn('⚠️ Módulo UITablero no disponible');
    }
}

// ================================================
// FUNCIONES DE UTILIDAD GLOBAL
// ================================================

/**
 * Mostrar error general del dashboard
 */
function mostrarErrorGeneral(mensaje) {
    console.error('❌ Error general:', mensaje);
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion(mensaje, 'error');
    } else {
        alert(`Error: ${mensaje}`);
    }
}

/**
 * Obtener configuración del dashboard
 */
function obtenerConfigDashboard() {
    return {
        apiEndpoints: {
            estadoSistema: '/dashboard/estado-sistema',
            metricas: '/dashboard/metricas',
            cicloActual: '/ciclos/actual',
            actividades: '/dashboard/actividades-recientes',
            ciclosDisponibles: '/ciclos'
        },
        elementos: {
            nombreUsuario: 'nombreUsuario',
            emailUsuario: 'dropdownUserEmail',
            estadoSistema: 'estadoSistema',
            systemStatusBadge: 'systemStatusBadge',
            systemStatusMessage: 'systemStatusMessage'
        }
    };
}

// Exponer funciones globales
window.TableroCore = {
    initialize: inicializarDashboard,
    verificarAutenticacionRapida,
    configurarComponentesBasicos,
    mostrarErrorGeneral,
    obtenerConfigDashboard
};

console.log('✅ Módulo Core del Tablero cargado'); 