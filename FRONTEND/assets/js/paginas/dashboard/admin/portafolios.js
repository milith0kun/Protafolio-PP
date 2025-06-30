/**
 * GESTIÓN DE PORTAFOLIOS - MÓDULO ADMIN
 * Sistema para gestionar portafolios docentes
 */

// ================================================
// ESTADO GLOBAL
// ================================================

const PortafoliosAdmin = {
    // Datos
    todosLosPortafolios: [],
    ciclosDisponibles: [],
    cargando: false,
    
    // Elementos DOM
    elementos: {
        cuerpoTablaPortafolios: null,
        filtroCiclo: null,
        filtroEstado: null,
        filtroDocente: null,
        btnRefrescar: null,
        btnGenerarPortafolios: null
    },
    
    // Estado
    inicializado: false
};

// ================================================
// INICIALIZACIÓN
// ================================================

/**
 * Inicialización principal del módulo
 */
function inicializar() {
    console.log('📁 Inicializando Gestión de Portafolios...');
    
            // Verificar autenticación usando el sistema unificado
    if (!verificarAutenticacionRapida()) {
        return; // La función ya maneja redirección
    }
    
    // Inicializar elementos DOM
    inicializarElementosDOM();
    
    // Configurar eventos
    configurarEventos();
            
            // Cargar datos iniciales
    setTimeout(() => {
        cargarDatosIniciales();
    }, 100);
    
    PortafoliosAdmin.inicializado = true;
    console.log('✅ Gestión de Portafolios inicializada');
    }

    /**
     * Verificar autenticación usando el sistema unificado
     */
function verificarAutenticacionRapida() {
    // Verificar disponibilidad del sistema AUTH
    if (!window.AUTH?.verificarAutenticacion?.()) {
        console.warn('⚠️ Autenticación fallida, redirigiendo...');
        window.location.href = '../../autenticacion/login.html';
        return false;
    }

    // Verificar rol de administrador
    const rolActual = window.AUTH.obtenerRolActivo();
    if (!['administrador', 'admin'].includes(rolActual?.toLowerCase())) {
        console.warn('⚠️ Sin permisos de administrador');
        alert('No tienes permisos para acceder a esta sección');
        window.location.href = '../../autenticacion/selector-roles.html';
            return false;
        }

    console.log('✅ Autenticación verificada - Rol:', rolActual);
    return true;
}

/**
 * Inicializar referencias a elementos DOM
 */
function inicializarElementosDOM() {
    PortafoliosAdmin.elementos = {
        cuerpoTablaPortafolios: document.getElementById('cuerpoTablaPortafolios'),
        filtroCiclo: document.getElementById('filtroCiclo'),
        filtroEstado: document.getElementById('filtroEstado'),
        filtroDocente: document.getElementById('filtroDocente'),
        btnRefrescar: document.getElementById('btnRefrescar'),
        btnGenerarPortafolios: document.getElementById('btnGenerarPortafolios')
    };
}

/**
 * Configurar todos los eventos
 */
function configurarEventos() {
    const { elementos } = PortafoliosAdmin;
    
    // Eventos de botones
    elementos.btnRefrescar?.addEventListener('click', cargarPortafolios);
    elementos.btnGenerarPortafolios?.addEventListener('click', generarPortafolios);
    
    // Eventos de filtros
    elementos.filtroCiclo?.addEventListener('change', aplicarFiltros);
    elementos.filtroEstado?.addEventListener('change', aplicarFiltros);
    elementos.filtroDocente?.addEventListener('input', debounce(aplicarFiltros, 500));
    
    // Escuchar cambios de ciclo desde el sistema global
    document.addEventListener('cicloSeleccionado', (event) => {
        console.log('📅 Ciclo seleccionado cambió en portafolios:', event.detail);
        // Recargar portafolios automáticamente
        setTimeout(() => {
            cargarPortafolios();
        }, 100);
    });
}

/**
 * Cargar datos iniciales
 */
async function cargarDatosIniciales() {
    try {
        PortafoliosAdmin.cargando = true;
        
        // Cargar datos en paralelo
        await Promise.all([
            cargarCiclosAcademicos(),
            cargarPortafolios()
        ]);
        
        } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        mostrarNotificacion('error', 'Error al cargar los datos iniciales');
        } finally {
        PortafoliosAdmin.cargando = false;
    }
}

// ================================================
// GESTIÓN DE DATOS
// ================================================

/**
 * Cargar ciclos académicos desde el API
 */
async function cargarCiclosAcademicos() {
    console.log('📅 Cargando ciclos académicos...');
    
    try {
        const data = await window.apiRequest('/ciclos', 'GET');
        console.log('✅ Ciclos cargados:', data);

        if ((data.exito && data.datos) || (data.success && data.data)) {
            PortafoliosAdmin.ciclosDisponibles = data.datos || data.data;
            renderizarSelectorCiclos();
        }
        
    } catch (error) {
        console.error('❌ Error al cargar ciclos:', error);
        }
    }

    /**
 * Cargar portafolios desde el API
 * Ahora con soporte para filtrado por ciclo académico
 */
async function cargarPortafolios() {
    console.log('🔄 Cargando portafolios...');
    const tbody = PortafoliosAdmin.elementos.cuerpoTablaPortafolios;
    
    if (!tbody) return;
    
    try {
        // Mostrar loading
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i> Cargando portafolios...
                    </div>
                </td>
            </tr>
        `;
        
        // Obtener ciclo seleccionado
        const cicloSeleccionado = obtenerCicloSeleccionado();
        console.log('📅 Ciclo seleccionado para portafolios:', cicloSeleccionado);
        
        // Construir URL con parámetros
        let url = '/portafolios';
        const params = new URLSearchParams();
        
        if (cicloSeleccionado) {
            params.append('ciclo', cicloSeleccionado);
        }
        
        // Agregar otros filtros activos
        const filtroEstado = PortafoliosAdmin.elementos.filtroEstado?.value;
        const filtroDocente = PortafoliosAdmin.elementos.filtroDocente?.value;
        
        if (filtroEstado) {
            params.append('estado', filtroEstado);
        }
        
        if (filtroDocente) {
            params.append('docente', filtroDocente);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        console.log('🔍 URL de petición:', url);
        
        // Usar el sistema unificado de peticiones
        const data = await window.apiRequest(url, 'GET');
        console.log('✅ Respuesta de portafolios:', data);

        // Manejar ambos formatos de respuesta
        const exito = data.exito || data.success;
        const responseData = data.datos || data.data;
        
        // Extraer portafolios de la respuesta (puede estar en responseData.portafolios o directamente en responseData)
        const portafolios = responseData?.portafolios || responseData || [];

        if (!exito || !portafolios || portafolios.length === 0) {
            PortafoliosAdmin.todosLosPortafolios = [];
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-folder-open"></i> No hay portafolios disponibles para el ciclo seleccionado
                    </td>
                </tr>
            `;
            return;
        }

        // Almacenar datos en variable global
        PortafoliosAdmin.todosLosPortafolios = portafolios;
        
        // Aplicar filtros (que llamará a renderizarPortafolios)
        aplicarFiltros();
        
    } catch (error) {
        console.error('❌ Error al cargar portafolios:', error);
        PortafoliosAdmin.todosLosPortafolios = [];
        
        if (error.status === 401) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-warning">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Sesión expirada. Será redirigido al login en 3 segundos...
                    </td>
                </tr>
            `;
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                window.AUTH?.cerrarSesion();
            }, 3000);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Error al cargar portafolios: ${error.message}
                    </td>
                </tr>
            `;
            }
        }
    }

    /**
 * Generar portafolios automáticamente
 */
async function generarPortafolios() {
    console.log('🔧 Generando portafolios automáticamente...');
    
    try {
        const btnGenerar = PortafoliosAdmin.elementos.btnGenerarPortafolios;
        if (!btnGenerar) return;
        
        btnGenerar.disabled = true;
        btnGenerar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        
        // Usar el sistema unificado de peticiones
        const data = await window.apiRequest('/portafolios/generar', 'POST');
        console.log('✅ Portafolios generados:', data);
        
        // Manejar ambos formatos de respuesta
        const exito = data.exito || data.success;
        const datos = data.datos || data.data;
        const mensaje = data.mensaje || data.message;
        
        if (exito) {
            // Mostrar mensaje de éxito
            const portafoliosCreados = datos?.portafoliosCreados || 0;
            mostrarNotificacion('success', `${portafoliosCreados} portafolios generados exitosamente`);
            
            // Recargar la tabla
            setTimeout(() => {
                cargarPortafolios();
            }, 1000);
            } else {
            throw new Error(mensaje || 'Error al generar portafolios');
            }
        
        } catch (error) {
        console.error('❌ Error al generar portafolios:', error);
        
        if (error.status === 401) {
            mostrarNotificacion('warning', 'Sesión expirada. Será redirigido al login...');
            setTimeout(() => {
                window.AUTH?.cerrarSesion();
            }, 3000);
        } else {
            mostrarNotificacion('error', `Error al generar portafolios: ${error.message}`);
        }
        } finally {
        const btnGenerar = PortafoliosAdmin.elementos.btnGenerarPortafolios;
        if (btnGenerar) {
            btnGenerar.disabled = false;
            btnGenerar.innerHTML = '<i class="fas fa-plus"></i> Generar Portafolios';
        }
    }
}

// ================================================
// RENDERIZADO Y FILTROS
// ================================================

/**
 * Renderizar selector de ciclos
 */
function renderizarSelectorCiclos() {
    const select = PortafoliosAdmin.elementos.filtroCiclo;
    if (!select) return;
    
    // Limpiar opciones existentes excepto la primera
    select.innerHTML = '<option value="">Todos los ciclos</option>';
    
    // Agregar ciclos
    PortafoliosAdmin.ciclosDisponibles.forEach(ciclo => {
        const option = document.createElement('option');
        option.value = ciclo.id;
        option.textContent = `${ciclo.nombre} (${ciclo.estado})`;
        
        // Marcar como seleccionado si es el ciclo activo
        if (ciclo.estado === 'activo') {
            option.selected = true;
        }
        
        select.appendChild(option);
    });
}

/**
 * Aplicar filtros a los portafolios
 */
function aplicarFiltros() {
    console.log('🔍 Aplicando filtros...');
    
    const elementos = PortafoliosAdmin.elementos;
    const filtroCiclo = elementos.filtroCiclo?.value || '';
    const filtroEstado = elementos.filtroEstado?.value || '';
    const filtroDocente = elementos.filtroDocente?.value.toLowerCase() || '';
    
    let portafoliosFiltrados = PortafoliosAdmin.todosLosPortafolios;
    
    // Filtrar por ciclo
    if (filtroCiclo) {
        portafoliosFiltrados = portafoliosFiltrados.filter(p => 
            p.ciclo && p.ciclo.id == filtroCiclo
        );
    }
    
    // Filtrar por estado
    if (filtroEstado) {
        portafoliosFiltrados = portafoliosFiltrados.filter(p => 
            p.estado === filtroEstado
        );
    }
    
    // Filtrar por docente
    if (filtroDocente) {
        portafoliosFiltrados = portafoliosFiltrados.filter(p => {
            const docente = p.docente || {};
            const nombreCompleto = `${docente.nombres || ''} ${docente.apellidos || ''}`.toLowerCase();
            return nombreCompleto.includes(filtroDocente);
        });
    }
    
    // Renderizar portafolios filtrados
    renderizarPortafolios(portafoliosFiltrados);
    
    console.log(`✅ Mostrando ${portafoliosFiltrados.length} de ${PortafoliosAdmin.todosLosPortafolios.length} portafolios`);
}

/**
 * Renderizar portafolios en la tabla
 */
function renderizarPortafolios(portafolios) {
    const tbody = PortafoliosAdmin.elementos.cuerpoTablaPortafolios;
    if (!tbody) return;
    
    if (!portafolios || portafolios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-search"></i> No se encontraron portafolios con los filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = portafolios.map(portafolio => {
        const docente = portafolio.docente || {};
        const asignatura = portafolio.asignatura || {};
        const ciclo = portafolio.ciclo || {};
        
        // Calcular progreso (simulado por ahora)
        const progreso = Math.floor(Math.random() * 100);
        const estadoBadge = getEstadoBadge(portafolio.estado || 'activo');
        
        return `
            <tr>
                <td><strong>${docente.nombres || 'N/A'} ${docente.apellidos || ''}</strong></td>
                <td>
                    <div>${asignatura.nombre || 'Sin asignatura'}</div>
                    <small class="text-muted">${asignatura.codigo || ''} - ${asignatura.carrera || ''}</small>
                </td>
                <td><span class="badge bg-info">${ciclo.nombre || 'N/A'}</span></td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar ${getProgressColor(progreso)}" style="width: ${progreso}%;">${progreso}%</div>
                    </div>
                </td>
                <td>${estadoBadge}</td>
                <td>${formatearFecha(portafolio.actualizado_en)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" title="Ver portafolio" onclick="PortafoliosAdmin.verPortafolio(${portafolio.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Editar" onclick="PortafoliosAdmin.editarPortafolio(${portafolio.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

/**
 * Obtener badge de estado
 */
function getEstadoBadge(estado) {
    const estados = {
        'activo': '<span class="badge bg-success">Activo</span>',
        'inactivo': '<span class="badge bg-secondary">Inactivo</span>',
        'completado': '<span class="badge bg-primary">Completado</span>',
        'en_revision': '<span class="badge bg-warning">En Revisión</span>',
        'observado': '<span class="badge bg-danger">Observado</span>'
    };
    return estados[estado] || '<span class="badge bg-secondary">Desconocido</span>';
}

/**
 * Obtener color de progreso
 */
function getProgressColor(progreso) {
    if (progreso >= 80) return 'bg-success';
    if (progreso >= 60) return 'bg-info';
    if (progreso >= 40) return 'bg-warning';
    return 'bg-danger';
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
}

/**
 * Obtener ciclo seleccionado desde el selector o almacenamiento
 */
function obtenerCicloSeleccionado() {
    // Intentar obtener desde diferentes selectores posibles
    const selectores = [
        '#selectCiclo',
        '#filtroCiclo',
        '#selectorCiclo select',
        'select[name="ciclo"]',
        '#cicloAcademico'
    ];
    
    for (const selector of selectores) {
        const elemento = document.querySelector(selector);
        if (elemento && elemento.value) {
            return elemento.value;
        }
    }
    
    // Fallback: obtener desde almacenamiento local o sesión
    return localStorage.getItem('cicloSeleccionado') || sessionStorage.getItem('cicloSeleccionado') || null;
}

/**
 * Función debounce para optimizar búsquedas
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(tipo, mensaje) {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    
    // Usar la función global si está disponible
    if (typeof window.mostrarNotificacion === 'function' && window.mostrarNotificacion !== mostrarNotificacion) {
        window.mostrarNotificacion(mensaje, tipo);
        return;
    }
    
    // Crear notificación simple como fallback
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass[tipo]} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// ================================================
// ACCIONES DE PORTAFOLIOS
// ================================================

/**
 * Ver portafolio
 */
function verPortafolio(id) {
    console.log('👁️ Ver portafolio:', id);
    // TODO: Implementar vista detallada del portafolio
    mostrarNotificacion('info', 'Funcionalidad en desarrollo');
}

/**
 * Editar portafolio
 */
function editarPortafolio(id) {
    console.log('✏️ Editar portafolio:', id);
    // TODO: Implementar edición del portafolio
    mostrarNotificacion('info', 'Funcionalidad en desarrollo');
}

// ================================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);

// Exponer funciones globalmente para el HTML
window.PortafoliosAdmin = {
    inicializar,
    cargarPortafolios,
    generarPortafolios,
    aplicarFiltros,
    verPortafolio,
    editarPortafolio,
    
    // Getters para acceso a datos
    get todosLosPortafolios() { return PortafoliosAdmin.todosLosPortafolios; },
    get ciclosDisponibles() { return PortafoliosAdmin.ciclosDisponibles; },
    get cargando() { return PortafoliosAdmin.cargando; }
};
