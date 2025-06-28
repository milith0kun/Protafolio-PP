/**
 * TABLERO ADMIN - MÓDULO DATA
 * Manejo de datos y operaciones con API
 */

// ================================================
// ESTADO GLOBAL DE DATOS
// ================================================

const dataState = {
    estadoSistema: null,
    metricas: null,
    cicloActual: null,
    actividadesRecientes: [],
    ciclosDisponibles: [],
    cargando: false,
    ultimaActualizacion: null
};

// ================================================
// INICIALIZACIÓN DEL MÓDULO
// ================================================

async function initialize() {
    console.log('📊 Inicializando módulo de datos del tablero...');
    
    try {
        await cargarDatosIniciales();
        configurarActualizacionAutomatica();
        console.log('✅ Módulo de datos inicializado');
    } catch (error) {
        console.error('❌ Error en inicialización de datos:', error);
        throw error;
    }
}

// ================================================
// CARGA DE DATOS PRINCIPALES
// ================================================

/**
 * Cargar todos los datos iniciales del dashboard
 */
async function cargarDatosIniciales() {
    dataState.cargando = true;
    
    try {
        const config = window.TableroCore?.obtenerConfigDashboard?.() || {};
        const endpoints = config.apiEndpoints || {};
        
        // Cargar datos en paralelo para mejor rendimiento
        const [estadoSistema, metricas, cicloActual, actividades, ciclos] = await Promise.allSettled([
            cargarEstadoSistema(endpoints.estadoSistema),
            cargarMetricas(endpoints.metricas),
            cargarCicloActual(endpoints.cicloActual),
            cargarActividadesRecientes(endpoints.actividades),
            cargarCiclosDisponibles(endpoints.ciclosDisponibles)
        ]);
        
        // Procesar resultados
        procesarResultados({
            estadoSistema,
            metricas,
            cicloActual,
            actividades,
            ciclos
        });
        
        dataState.ultimaActualizacion = new Date();
        
    } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        throw error;
    } finally {
        dataState.cargando = false;
    }
}

/**
 * Procesar resultados de las promesas
 */
function procesarResultados(resultados) {
    // Estado del sistema
    if (resultados.estadoSistema.status === 'fulfilled') {
        dataState.estadoSistema = resultados.estadoSistema.value;
    } else {
        console.error('Error cargando estado del sistema:', resultados.estadoSistema.reason);
    }
    
    // Métricas
    if (resultados.metricas.status === 'fulfilled') {
        dataState.metricas = resultados.metricas.value;
    } else {
        console.error('Error cargando métricas:', resultados.metricas.reason);
    }
    
    // Ciclo actual
    if (resultados.cicloActual.status === 'fulfilled') {
        dataState.cicloActual = resultados.cicloActual.value;
    } else {
        console.error('Error cargando ciclo actual:', resultados.cicloActual.reason);
    }
    
    // Actividades recientes
    if (resultados.actividades.status === 'fulfilled') {
        dataState.actividadesRecientes = resultados.actividades.value || [];
    } else {
        console.error('Error cargando actividades:', resultados.actividades.reason);
    }
    
    // Ciclos disponibles
    if (resultados.ciclos.status === 'fulfilled') {
        dataState.ciclosDisponibles = resultados.ciclos.value || [];
    } else {
        console.error('Error cargando ciclos disponibles:', resultados.ciclos.reason);
    }
}

// ================================================
// FUNCIONES DE CARGA ESPECÍFICAS
// ================================================

/**
 * Cargar estado del sistema
 */
async function cargarEstadoSistema(endpoint) {
    if (!endpoint) return { activo: true, mensaje: 'Sistema operativo' };
    
    try {
        const response = await window.apiRequest(`${CONFIG.API.ENDPOINTS.DASHBOARD}/stats`, 'GET');
        return response.data || { activo: true, mensaje: 'Sistema operativo' };
    } catch (error) {
        // Solo mostrar warning si no es un error de red común
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('NetworkError')) {
            console.warn('⚠️ Error obteniendo estado del sistema:', error.message);
        }
        return { activo: true, mensaje: 'Estado no disponible' };
    }
}

/**
 * Cargar métricas del dashboard
 */
async function cargarMetricas(endpoint) {
    if (!endpoint) return obtenerMetricasPorDefecto();
    
    try {
        // Usar el endpoint correcto para estadísticas (probando múltiples endpoints)
        let response;
        try {
            response = await window.apiRequest(`${CONFIG.API.ENDPOINTS.DASHBOARD}/estadisticas`, 'GET');
        } catch (firstError) {
            console.warn('⚠️ Endpoint /estadisticas no disponible, probando /stats');
            response = await window.apiRequest(`${CONFIG.API.ENDPOINTS.DASHBOARD}/stats`, 'GET');
        }
        
        console.log('📊 Respuesta de estadísticas:', response);
        
        // El endpoint devuelve directamente los datos, no en una propiedad 'data'
        return response || obtenerMetricasPorDefecto();
    } catch (error) {
        // Solo mostrar warning si no es un error de red común
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('NetworkError')) {
            console.warn('⚠️ Error obteniendo métricas:', error.message);
        }
        return obtenerMetricasPorDefecto();
    }
}

/**
 * Cargar ciclo académico actual
 */
async function cargarCicloActual(endpoint) {
    if (!endpoint) return null;
    
    try {
        const response = await window.apiRequest(`${CONFIG.API.ENDPOINTS.CICLOS}/activo`, 'GET');
        return response.data || null;
    } catch (error) {
        // Solo mostrar warning si no es un error de red común
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('NetworkError')) {
            console.warn('⚠️ Error obteniendo ciclo actual:', error.message);
        }
        return null;
    }
}

/**
 * Cargar actividades recientes
 */
async function cargarActividadesRecientes(endpoint) {
    if (!endpoint) return [];
    
    try {
        const response = await window.apiRequest(`${CONFIG.API.ENDPOINTS.DASHBOARD}/actividades`, 'GET');
        return response.data || [];
    } catch (error) {
        // Solo mostrar warning si no es un error de red común
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('NetworkError')) {
            console.warn('⚠️ Error obteniendo actividades recientes:', error.message);
        }
        return [];
    }
}

/**
 * Cargar ciclos disponibles
 */
async function cargarCiclosDisponibles(endpoint) {
    if (!endpoint) return [];
    
    try {
        const response = await window.apiRequest(`${CONFIG.API.ENDPOINTS.CICLOS}`, 'GET');
        return response.data || [];
    } catch (error) {
        // Solo mostrar warning si no es un error de red común
        if (!error.message?.includes('Failed to fetch') && !error.message?.includes('NetworkError')) {
            console.warn('⚠️ Error obteniendo ciclos disponibles:', error.message);
        }
        return [];
    }
}

// ================================================
// VALORES POR DEFECTO
// ================================================

function obtenerMetricasPorDefecto() {
    return {
        usuarios: 0,
        carreras: 0,
        asignaturas: 0,
        asignaciones: 0,
        verificaciones: 0,
        portafolios: 0,
        timestamp: new Date().toISOString()
    };
}

// ================================================
// ACTUALIZACIÓN AUTOMÁTICA
// ================================================

let intervaloActualizacion = null;

/**
 * Configurar actualización automática de datos
 */
function configurarActualizacionAutomatica() {
    // Actualizar cada 5 minutos
    const INTERVALO_ACTUALIZACION = 5 * 60 * 1000;
    
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
    }
    
    intervaloActualizacion = setInterval(async () => {
        console.log('🔄 Actualizando datos automáticamente...');
        try {
            await cargarDatosIniciales();
            if (window.UITablero?.actualizarInterfaz) {
                window.UITablero.actualizarInterfaz();
            }
        } catch (error) {
            console.error('❌ Error en actualización automática:', error);
        }
    }, INTERVALO_ACTUALIZACION);
}

/**
 * Detener actualización automática
 */
function detenerActualizacionAutomatica() {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
        intervaloActualizacion = null;
    }
}

// ================================================
// GETTERS PÚBLICOS
// ================================================

function obtenerEstadoSistema() {
    return dataState.estadoSistema;
}

function obtenerMetricas() {
    return dataState.metricas;
}

function obtenerCicloActual() {
    return dataState.cicloActual;
}

function obtenerActividadesRecientes() {
    return dataState.actividadesRecientes;
}

function obtenerCiclosDisponibles() {
    return dataState.ciclosDisponibles;
}

function estaCargando() {
    return dataState.cargando;
}

function obtenerUltimaActualizacion() {
    return dataState.ultimaActualizacion;
}

// ================================================
// FUNCIONES DE ACTUALIZACIÓN MANUAL
// ================================================

/**
 * Actualizar datos manualmente
 */
async function actualizarDatos() {
    console.log('🔄 Actualizando datos manualmente...');
    await cargarDatosIniciales();
    
    // Notificar a la UI
    if (window.UITablero?.actualizarInterfaz) {
        window.UITablero.actualizarInterfaz();
    }
}

/**
 * Limpiar caché de datos
 */
function limpiarCache() {
    dataState.estadoSistema = null;
    dataState.metricas = null;
    dataState.cicloActual = null;
    dataState.actividadesRecientes = [];
    dataState.ciclosDisponibles = [];
    dataState.ultimaActualizacion = null;
}

// ================================================
// EXPORTACIÓN DEL MÓDULO
// ================================================

window.DataTablero = {
    // Inicialización
    initialize,
    
    // Getters
    obtenerEstadoSistema,
    obtenerMetricas,
    obtenerCicloActual,
    obtenerActividadesRecientes,
    obtenerCiclosDisponibles,
    estaCargando,
    obtenerUltimaActualizacion,
    
    // Acciones
    actualizarDatos,
    limpiarCache,
    
    // Control de actualización
    configurarActualizacionAutomatica,
    detenerActualizacionAutomatica
};

console.log('✅ Módulo Data del Tablero cargado'); 