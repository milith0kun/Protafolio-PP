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
    ultimaActualizacion: null,
    servidorOffline: false
};

// ================================================
// INICIALIZACIÓN DEL MÓDULO
// ================================================

async function initialize() {
    console.log('📊 Inicializando módulo de datos del tablero...');
    
    try {
        // Inicializar ciclo desde el selector si existe
        setTimeout(() => {
            inicializarCicloDesdeSelector();
        }, 500);
        
        await cargarDatosIniciales();
        configurarActualizacionAutomatica();
        configurarIntegracionCiclos();
        console.log('✅ Módulo de datos inicializado');
    } catch (error) {
        // Solo mostrar error si no es un problema de conexión
        if (!error.message?.includes('Failed to fetch')) {
            console.error('❌ Error en inicialización de datos:', error);
        }
        throw error;
    }
}

/**
 * Inicializar el ciclo seleccionado desde el selector al cargar la página
 */
function inicializarCicloDesdeSelector() {
    console.log('🔄 Inicializando ciclo desde selector...');
    
    const selector = document.querySelector('#selectCiclo');
    if (selector && selector.value && selector.value !== '') {
        console.log(`📅 Ciclo detectado en selector: ${selector.value}`);
        
        // Establecer como ciclo seleccionado
        localStorage.setItem('cicloSeleccionado', selector.value);
        
        // Forzar actualización de la interfaz
        setTimeout(() => {
            if (window.UITablero?.actualizarInterfaz) {
                window.UITablero.actualizarInterfaz();
            }
        }, 200);
    } else {
        // Solo mostrar warning si no es un problema de servidor offline
        if (!dataState.servidorOffline) {
            console.log('⚠️ No se encontró selector de ciclo con valor');
        }
    }
}

// ================================================
// CARGA DE DATOS PRINCIPALES
// ================================================

/**
 * Cargar todos los datos iniciales del dashboard
 */
async function cargarDatosIniciales() {
    // Evitar cargas múltiples simultáneas
    if (dataState.cargando) {
        console.log('⚠️ Carga de datos ya en progreso, evitando duplicación');
        return;
    }
    
    // Verificar autenticación antes de hacer peticiones
    if (!window.AUTH?.verificarAutenticacion()) {
        console.warn('🔐 Usuario no autenticado, evitando peticiones API');
        return;
    }
    
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
        // Solo mostrar error si no es un problema de conexión o autenticación
        if (!error.message?.includes('Failed to fetch') && error.status !== 401) {
            console.error('❌ Error cargando datos iniciales:', error);
        }
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
        // Solo mostrar error si no es un problema de conexión
        if (!resultados.estadoSistema.reason?.message?.includes('Failed to fetch')) {
            console.error('Error cargando estado del sistema:', resultados.estadoSistema.reason);
        }
    }
    
    // Métricas
    if (resultados.metricas.status === 'fulfilled') {
        dataState.metricas = resultados.metricas.value;
    } else {
        // Solo mostrar error si no es un problema de conexión
        if (!resultados.metricas.reason?.message?.includes('Failed to fetch')) {
            console.error('Error cargando métricas:', resultados.metricas.reason);
        }
    }
    
    // Ciclo actual
    if (resultados.cicloActual.status === 'fulfilled') {
        dataState.cicloActual = resultados.cicloActual.value;
    } else {
        // Solo mostrar error si no es un problema de conexión
        if (!resultados.cicloActual.reason?.message?.includes('Failed to fetch')) {
            console.error('Error cargando ciclo actual:', resultados.cicloActual.reason);
        }
    }
    
    // Actividades recientes
    if (resultados.actividades.status === 'fulfilled') {
        dataState.actividadesRecientes = resultados.actividades.value || [];
    } else {
        // Solo mostrar error si no es un problema de conexión
        if (!resultados.actividades.reason?.message?.includes('Failed to fetch')) {
            console.error('Error cargando actividades:', resultados.actividades.reason);
        }
    }
    
    // Ciclos disponibles
    if (resultados.ciclos.status === 'fulfilled') {
        dataState.ciclosDisponibles = resultados.ciclos.value || [];
    } else {
        // Solo mostrar error si no es un problema de conexión
        if (!resultados.ciclos.reason?.message?.includes('Failed to fetch')) {
            console.error('Error cargando ciclos disponibles:', resultados.ciclos.reason);
        }
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
 * Ahora con soporte para ciclo académico
 */
async function cargarMetricas(endpoint) {
    if (!endpoint) return obtenerMetricasPorDefecto();
    
    try {
        // Obtener ciclo seleccionado
        const cicloSeleccionado = obtenerCicloSeleccionado();
        console.log('📅 Ciclo seleccionado para métricas:', cicloSeleccionado);
        
        // Construir URL con parámetros de ciclo
        let url = `${CONFIG.API.ENDPOINTS.DASHBOARD}/estadisticas`;
        if (cicloSeleccionado) {
            url += `?ciclo=${cicloSeleccionado}`;
        }
        
        // Usar el endpoint correcto para estadísticas (probando múltiples endpoints)
        let response;
        try {
            response = await window.apiRequest(url, 'GET');
        } catch (firstError) {
            // Solo mostrar warning si no es un error de conexión
            if (!firstError.message?.includes('Failed to fetch')) {
                console.warn('⚠️ Endpoint /estadisticas no disponible, probando /stats');
            }
            let fallbackUrl = `${CONFIG.API.ENDPOINTS.DASHBOARD}/stats`;
            if (cicloSeleccionado) {
                fallbackUrl += `?ciclo=${cicloSeleccionado}`;
            }
            response = await window.apiRequest(fallbackUrl, 'GET');
        }
        
        console.log('📊 Respuesta de estadísticas:', response);
        
        // Procesar la respuesta estructurada del backend
        if (response && (response.success || response.data)) {
            const data = response.data || response;
            
            // Extraer métricas según la estructura del backend
            const metricas = {
                usuarios: data.usuarios?.total || data.usuarios?.activos || 0,
                carreras: data.carreras?.total || data.carreras?.activas || 0,
                asignaturas: data.asignaturas?.total || data.asignaturas?.activas || 0,
                asignaciones: data.asignaciones?.total || data.asignaciones?.activas || 0,
                verificaciones: data.verificaciones?.total || 0,
                portafolios: data.portafolios?.total || data.portafolios?.activos || 0,
                timestamp: data.timestamp || new Date().toISOString(),
                ciclo: data.ciclo || null,
                sistema: data.sistema || null
            };
            
            console.log('📊 Métricas procesadas:', metricas);
            return metricas;
        }
        
        return obtenerMetricasPorDefecto();
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
        // Solo actualizar si no hay errores de conexión previos
        if (!dataState.servidorOffline) {
            console.log('🔄 Actualizando datos automáticamente...');
            try {
                await cargarDatosIniciales();
                if (window.UITablero?.actualizarInterfaz) {
                    window.UITablero.actualizarInterfaz();
                }
                // Marcar servidor como online si la actualización fue exitosa
                dataState.servidorOffline = false;
                    } catch (error) {
            // Marcar servidor como offline tras error
            dataState.servidorOffline = true;
            // Solo mostrar mensaje si no es un error de conexión común
            if (!error.message?.includes('Failed to fetch')) {
                console.log('📡 Servidor no disponible, pausando actualizaciones automáticas');
            }
        }
        } else {
            console.log('⚠️ Servidor offline, omitiendo actualización automática');
        }
    }, INTERVALO_ACTUALIZACION * 2); // Duplicar intervalo a 60s
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
// GESTIÓN DE CICLO SELECCIONADO
// ================================================

/**
 * Obtener ciclo seleccionado desde el selector en la página
 */
function obtenerCicloSeleccionado() {
    // Intentar obtener desde diferentes selectores posibles
    const selectores = [
        '#selectCiclo',
        '#selectorCiclo select',
        'select[name="ciclo"]',
        '#cicloAcademico'
    ];
    
    console.log('🔍 Buscando ciclo seleccionado en selectores...');
    
    for (const selector of selectores) {
        const elemento = document.querySelector(selector);
        if (elemento) {
            console.log(`📋 Selector ${selector} encontrado:`, {
                value: elemento.value,
                selectedIndex: elemento.selectedIndex,
                options: Array.from(elemento.options).map(opt => ({ value: opt.value, text: opt.text, selected: opt.selected }))
            });
            
            if (elemento.value && elemento.value !== '') {
                console.log(`✅ Ciclo seleccionado encontrado: ${elemento.value}`);
                // Guardar en almacenamiento para consistencia
                localStorage.setItem('cicloSeleccionado', elemento.value);
                return elemento.value;
            }
        } else {
            console.log(`❌ Selector ${selector} no encontrado`);
        }
    }
    
    // Fallback: obtener desde almacenamiento local o sesión
    const cicloAlmacenado = localStorage.getItem('cicloSeleccionado') || sessionStorage.getItem('cicloSeleccionado');
    if (cicloAlmacenado) {
        console.log(`📦 Ciclo recuperado del almacenamiento: ${cicloAlmacenado}`);
        return cicloAlmacenado;
    }
    
    console.log('⚠️ No se encontró ningún ciclo seleccionado');
    return null;
}

/**
 * Establecer ciclo seleccionado y actualizar datos
 */
async function establecerCicloSeleccionado(cicloId) {
    console.log('📅 Estableciendo ciclo seleccionado:', cicloId);
    
    // Guardar en almacenamiento
    if (cicloId) {
        localStorage.setItem('cicloSeleccionado', cicloId);
        sessionStorage.setItem('cicloSeleccionado', cicloId);
    } else {
        localStorage.removeItem('cicloSeleccionado');
        sessionStorage.removeItem('cicloSeleccionado');
    }
    
    // Actualizar estado interno
    dataState.cicloActual = dataState.ciclosDisponibles.find(c => c.id == cicloId) || null;
    
    // Recargar datos con el nuevo ciclo
    await actualizarDatos();
    
    // Emitir evento personalizado para que otros módulos puedan reaccionar
    const evento = new CustomEvent('cicloSeleccionado', {
        detail: { cicloId, ciclo: dataState.cicloActual }
    });
    document.dispatchEvent(evento);
}

// ================================================
// INTEGRACIÓN CON SISTEMAS EXTERNOS
// ================================================

/**
 * Configurar integración con el sistema de sincronización de ciclos
 */
function configurarIntegracionCiclos() {
    console.log('🔗 Configurando integración con sistema de ciclos...');
    
    // Escuchar cambios de ciclo del sistema de sincronización
    document.addEventListener('ciclo-cambiado', async (event) => {
        const { ciclo } = event.detail;
        console.log('🔄 Ciclo cambiado detectado en datos, actualizando...', ciclo);
        
        if (ciclo && ciclo.id) {
            // Actualizar datos con el nuevo ciclo
            await actualizarDatos();
        }
    });
    
    console.log('✅ Integración con sistema de ciclos configurada');
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
    
    // Gestión de ciclo
    obtenerCicloSeleccionado,
    establecerCicloSeleccionado,
    
    // Acciones
    actualizarDatos,
    limpiarCache,
    
    // Control de actualización
    configurarActualizacionAutomatica,
    detenerActualizacionAutomatica
};

console.log('✅ Módulo Data del Tablero cargado'); 