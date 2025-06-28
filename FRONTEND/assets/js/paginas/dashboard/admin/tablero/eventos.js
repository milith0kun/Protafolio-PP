/**
 * TABLERO ADMIN - MÓDULO EVENTOS
 * Manejo de eventos e interacciones del usuario
 */

// ================================================
// CONFIGURACIÓN DE EVENTOS
// ================================================

const eventosConfig = {
    // Selectores de elementos
    selectores: {
        botonesNavegacion: '.nav-link[data-page]',
        botonesAccion: '[data-action]',
        formularios: 'form[data-form]',
        tablas: 'table[data-table]',
        modales: '.modal[data-modal]',
        cards: '.card[data-card]',
        filtros: '[data-filter]',
        busqueda: '[data-search]'
    },
    
    // Tipos de eventos personalizados
    eventosCustom: {
        tableroIniciado: 'tablero:iniciado',
        datosActualizados: 'tablero:datos-actualizados',
        errorOcurrido: 'tablero:error',
        navegacionCambiada: 'tablero:navegacion-cambiada'
    }
};

// ================================================
// ESTADO DE EVENTOS
// ================================================

const eventosState = {
    eventosActivos: new Set(),
    ultimoEvento: null,
    navegacionActual: null,
    modalActivo: null
};

// ================================================
// INICIALIZACIÓN DEL MÓDULO
// ================================================

async function initialize() {
    console.log('🎯 Inicializando módulo de eventos del tablero...');
    
    try {
        configurarEventosGlobales();
        configurarEventosNavegacion();
        configurarEventosFormularios();
        configurarEventosTablas();
        configurarEventosModales();
        configurarEventosTeclado();
        configurarEventosCustom();
        
        // Emitir evento de inicialización
        emitirEvento(eventosConfig.eventosCustom.tableroIniciado);
        
        console.log('✅ Módulo de eventos inicializado');
    } catch (error) {
        console.error('❌ Error en inicialización de eventos:', error);
        throw error;
    }
}

// ================================================
// CONFIGURACIÓN DE EVENTOS GLOBALES
// ================================================

function configurarEventosGlobales() {
    // Prevenir comportamientos por defecto en enlaces sin href
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && (!link.href || link.href === '#')) {
            event.preventDefault();
        }
    });
    
    // Configurar evento específico para el botón de inicializar portafolios
    document.addEventListener('click', (event) => {
        const btnInicializarPortafolios = event.target.closest('#btnInicializarPortafolios');
        if (btnInicializarPortafolios) {
            event.preventDefault();
            manejarInicializacionPortafolios(btnInicializarPortafolios);
        }
    });
    
    // Manejar errores de JavaScript no capturados
    window.addEventListener('error', (event) => {
        console.error('❌ Error no capturado:', event.error);
        emitirEvento(eventosConfig.eventosCustom.errorOcurrido, {
            mensaje: event.message,
            archivo: event.filename,
            linea: event.lineno
        });
    });
    
    // Manejar errores de promesas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Promesa rechazada no capturada:', event.reason);
        emitirEvento(eventosConfig.eventosCustom.errorOcurrido, {
            tipo: 'promise',
            razon: event.reason
        });
    });
    
    console.log('✅ Eventos globales configurados');
}

// ================================================
// EVENTOS DE NAVEGACIÓN
// ================================================

function configurarEventosNavegacion() {
    // Navegación entre páginas
    document.addEventListener('click', (event) => {
        const botonNav = event.target.closest(eventosConfig.selectores.botonesNavegacion);
        if (botonNav) {
            event.preventDefault();
            manejarNavegacion(botonNav);
        }
    });
    
    // Navegación del breadcrumb
    document.addEventListener('click', (event) => {
        const breadcrumbItem = event.target.closest('.breadcrumb-item a');
        if (breadcrumbItem) {
            event.preventDefault();
            manejarNavegacionBreadcrumb(breadcrumbItem);
        }
    });
    
    console.log('✅ Eventos de navegación configurados');
}

function manejarNavegacion(boton) {
    const pagina = boton.dataset.page;
    const titulo = boton.textContent.trim();
    
    console.log('🔄 Navegando a:', pagina);
    
    // Actualizar estado
    eventosState.navegacionActual = pagina;
    
    // Actualizar UI
    actualizarNavegacionActiva(boton);
    
    // Emitir evento custom
    emitirEvento(eventosConfig.eventosCustom.navegacionCambiada, {
        pagina,
        titulo,
        boton
    });
    
    // Aquí se implementaría la lógica real de navegación
    // Por ahora solo actualizamos la interfaz
    actualizarContenidoPagina(pagina);
}

function manejarNavegacionBreadcrumb(elemento) {
    const href = elemento.getAttribute('href');
    console.log('🍞 Navegación breadcrumb:', href);
    
    // Implementar lógica de navegación breadcrumb
    if (href && href !== '#') {
        window.location.href = href;
    }
}

function actualizarNavegacionActiva(botonActivo) {
    // Remover clase activa de todos los botones de navegación
    document.querySelectorAll(eventosConfig.selectores.botonesNavegacion)
        .forEach(btn => btn.classList.remove('active'));
    
    // Agregar clase activa al botón seleccionado
    botonActivo.classList.add('active');
}

function actualizarContenidoPagina(pagina) {
    // Mostrar indicador de carga
    if (window.UITablero?.mostrarIndicadorCarga) {
        window.UITablero.mostrarIndicadorCarga(true);
    }
    
    // Simular carga de contenido
    setTimeout(() => {
        console.log(`📄 Contenido de ${pagina} cargado`);
        
        if (window.UITablero?.mostrarIndicadorCarga) {
            window.UITablero.mostrarIndicadorCarga(false);
        }
    }, 500);
}

// ================================================
// EVENTOS DE FORMULARIOS
// ================================================

function configurarEventosFormularios() {
    // Submit de formularios
    document.addEventListener('submit', (event) => {
        const form = event.target.closest(eventosConfig.selectores.formularios);
        if (form) {
            event.preventDefault();
            manejarSubmitFormulario(form);
        }
    });
    
    // Validación en tiempo real
    document.addEventListener('input', (event) => {
        const input = event.target;
        if (input.closest(eventosConfig.selectores.formularios)) {
            validarCampoEnTiempoReal(input);
        }
    });
    
    // Limpiar formularios
    document.addEventListener('click', (event) => {
        const botonLimpiar = event.target.closest('[data-action="clear-form"]');
        if (botonLimpiar) {
            event.preventDefault();
            limpiarFormulario(botonLimpiar);
        }
    });
    
    console.log('✅ Eventos de formularios configurados');
}

function manejarSubmitFormulario(form) {
    const tipoForm = form.dataset.form;
    const datos = new FormData(form);
    
    console.log('📝 Submit de formulario:', tipoForm);
    
    // Validar formulario
    if (!validarFormulario(form)) {
        console.warn('⚠️ Formulario no válido');
        return;
    }
    
    // Mostrar loading en botón submit
    const botonSubmit = form.querySelector('[type="submit"]');
    if (botonSubmit) {
        const textoOriginal = botonSubmit.textContent;
        botonSubmit.disabled = true;
        botonSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        // Restaurar botón después de un tiempo
        setTimeout(() => {
            botonSubmit.disabled = false;
            botonSubmit.textContent = textoOriginal;
        }, 2000);
    }
    
    // Procesar formulario según tipo
    procesarFormulario(tipoForm, datos);
}

function validarFormulario(form) {
    const campos = form.querySelectorAll('input[required], select[required], textarea[required]');
    let valido = true;
    
    campos.forEach(campo => {
        if (!campo.value.trim()) {
            marcarCampoInvalido(campo, 'Este campo es requerido');
            valido = false;
        } else {
            marcarCampoValido(campo);
        }
    });
    
    return valido;
}

function validarCampoEnTiempoReal(input) {
    const valor = input.value.trim();
    
    // Validaciones específicas por tipo
    switch (input.type) {
        case 'email':
            if (valor && !esEmailValido(valor)) {
                marcarCampoInvalido(input, 'Email no válido');
            } else {
                marcarCampoValido(input);
            }
            break;
            
        case 'number':
            if (valor && isNaN(valor)) {
                marcarCampoInvalido(input, 'Debe ser un número');
            } else {
                marcarCampoValido(input);
            }
            break;
            
        default:
            if (input.required && !valor) {
                marcarCampoInvalido(input, 'Campo requerido');
            } else {
                marcarCampoValido(input);
            }
    }
}

function marcarCampoInvalido(campo, mensaje) {
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
    
    // Mostrar mensaje de error
    let feedbackElement = campo.parentNode.querySelector('.invalid-feedback');
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.className = 'invalid-feedback';
        campo.parentNode.appendChild(feedbackElement);
    }
    feedbackElement.textContent = mensaje;
}

function marcarCampoValido(campo) {
    campo.classList.remove('is-invalid');
    campo.classList.add('is-valid');
    
    // Remover mensaje de error
    const feedbackElement = campo.parentNode.querySelector('.invalid-feedback');
    if (feedbackElement) {
        feedbackElement.remove();
    }
}

function procesarFormulario(tipo, datos) {
    console.log(`🔄 Procesando formulario tipo: ${tipo}`);
    
    // Aquí se implementaría la lógica específica para cada tipo de formulario
    switch (tipo) {
        case 'crear-usuario':
            console.log('👤 Creando usuario...');
            break;
        case 'editar-perfil':
            console.log('✏️ Editando perfil...');
            break;
        case 'cambiar-password':
            console.log('🔒 Cambiando contraseña...');
            break;
        default:
            console.log('📄 Procesando formulario genérico...');
    }
}

// ================================================
// EVENTOS DE TABLAS
// ================================================

function configurarEventosTablas() {
    // Acciones en filas de tabla
    document.addEventListener('click', (event) => {
        const accionBtn = event.target.closest('[data-table-action]');
        if (accionBtn) {
            event.preventDefault();
            manejarAccionTabla(accionBtn);
        }
    });
    
    // Selección de filas
    document.addEventListener('change', (event) => {
        const checkbox = event.target;
        if (checkbox.type === 'checkbox' && checkbox.closest('table')) {
            manejarSeleccionFila(checkbox);
        }
    });
    
    console.log('✅ Eventos de tablas configurados');
}

function manejarAccionTabla(boton) {
    const accion = boton.dataset.tableAction;
    const fila = boton.closest('tr');
    const tabla = boton.closest('table');
    
    console.log('📊 Acción de tabla:', accion);
    
    switch (accion) {
        case 'ver':
            verRegistro(fila);
            break;
        case 'editar':
            editarRegistro(fila);
            break;
        case 'eliminar':
            eliminarRegistro(fila);
            break;
        case 'activar':
            activarRegistro(fila);
            break;
        case 'desactivar':
            desactivarRegistro(fila);
            break;
        default:
            console.log('Acción no reconocida:', accion);
    }
}

function manejarSeleccionFila(checkbox) {
    const fila = checkbox.closest('tr');
    
    if (checkbox.checked) {
        fila.classList.add('table-active');
    } else {
        fila.classList.remove('table-active');
    }
    
    // Actualizar contador de seleccionados
    actualizarContadorSeleccionados();
}

// ================================================
// EVENTOS DE MODALES
// ================================================

function configurarEventosModales() {
    // Abrir modales
    document.addEventListener('click', (event) => {
        const modalTrigger = event.target.closest('[data-bs-toggle="modal"]');
        if (modalTrigger) {
            const modalId = modalTrigger.dataset.bsTarget;
            eventosState.modalActivo = modalId;
            console.log('📱 Abriendo modal:', modalId);
        }
    });
    
    // Eventos de Bootstrap modals
    document.addEventListener('shown.bs.modal', (event) => {
        console.log('📱 Modal mostrado:', event.target.id);
        configurarModalActivo(event.target);
    });
    
    document.addEventListener('hidden.bs.modal', (event) => {
        console.log('📱 Modal cerrado:', event.target.id);
        eventosState.modalActivo = null;
        limpiarModalActivo(event.target);
    });
    
    console.log('✅ Eventos de modales configurados');
}

function configurarModalActivo(modal) {
    // Enfocar primer input del modal
    const primerInput = modal.querySelector('input, select, textarea');
    if (primerInput) {
        setTimeout(() => primerInput.focus(), 100);
    }
}

function limpiarModalActivo(modal) {
    // Limpiar formularios del modal
    const formularios = modal.querySelectorAll('form');
    formularios.forEach(form => form.reset());
    
    // Remover clases de validación
    const campos = modal.querySelectorAll('.is-valid, .is-invalid');
    campos.forEach(campo => {
        campo.classList.remove('is-valid', 'is-invalid');
    });
}

// ================================================
// EVENTOS DE TECLADO
// ================================================

function configurarEventosTeclado() {
    document.addEventListener('keydown', (event) => {
        // Shortcuts globales
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    event.preventDefault();
                    enfocarBusqueda();
                    break;
                case 'n':
                    event.preventDefault();
                    abrirModalNuevo();
                    break;
                case 'r':
                    event.preventDefault();
                    actualizarDatos();
                    break;
            }
        }
        
        // Escape para cerrar modales
        if (event.key === 'Escape' && eventosState.modalActivo) {
            cerrarModalActivo();
        }
    });
    
    console.log('✅ Eventos de teclado configurados');
}

// ================================================
// EVENTOS CUSTOM
// ================================================

function configurarEventosCustom() {
    // Escuchar eventos custom del sistema
    document.addEventListener(eventosConfig.eventosCustom.datosActualizados, (event) => {
        console.log('📊 Datos actualizados, refrescando UI...');
        if (window.UITablero?.renderizarInterfazCompleta) {
            window.UITablero.renderizarInterfazCompleta();
        }
    });
    
    document.addEventListener(eventosConfig.eventosCustom.errorOcurrido, (event) => {
        console.error('❌ Error del sistema:', event.detail);
        mostrarErrorGlobal(event.detail);
    });
    
    console.log('✅ Eventos custom configurados');
}

function emitirEvento(tipoEvento, datos = null) {
    const evento = new CustomEvent(tipoEvento, {
        detail: datos,
        bubbles: true,
        cancelable: true
    });
    
    document.dispatchEvent(evento);
    eventosState.ultimoEvento = { tipo: tipoEvento, datos, timestamp: Date.now() };
}

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function enfocarBusqueda() {
    const busqueda = document.querySelector(eventosConfig.selectores.busqueda);
    if (busqueda) {
        busqueda.focus();
    }
}

function abrirModalNuevo() {
    const modalNuevo = document.querySelector('[data-modal="nuevo"]');
    if (modalNuevo) {
        const modal = new bootstrap.Modal(modalNuevo);
        modal.show();
    }
}

function actualizarDatos() {
    if (window.DataTablero?.actualizarDatos) {
        window.DataTablero.actualizarDatos();
    }
}

function cerrarModalActivo() {
    if (eventosState.modalActivo) {
        const modal = document.querySelector(eventosState.modalActivo);
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    }
}

function mostrarErrorGlobal(error) {
    console.error('🚨 Error global:', error);
    // Implementar notificación de error global
}

/**
 * Maneja la inicialización de portafolios desde el panel de administrador
 */
async function manejarInicializacionPortafolios(boton) {
    console.log('🎯 Iniciando generación de portafolios...');
    
    try {
        // Mostrar indicador de carga
        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        
        // Obtener token de autenticación
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }
        
        // Realizar petición al backend
        const response = await fetch('/api/portafolios/generar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al generar portafolios');
        }
        
        // Mostrar resultado exitoso
        console.log('✅ Portafolios generados exitosamente:', data);
        
        // Notificar al usuario
        if (window.UITablero?.mostrarNotificacion) {
            window.UITablero.mostrarNotificacion(
                'success',
                'Portafolios Generados',
                `Se generaron ${data.data.portafoliosCreados} portafolios correctamente.`
            );
        } else {
            alert(`✅ Éxito: Se generaron ${data.data.portafoliosCreados} portafolios correctamente.`);
        }
        
        // Emitir evento de datos actualizados
        emitirEvento(eventosConfig.eventosCustom.datosActualizados, {
            accion: 'portafolios-generados',
            resultados: data.data
        });
        
    } catch (error) {
        console.error('❌ Error al generar portafolios:', error);
        
        // Notificar error al usuario
        if (window.UITablero?.mostrarNotificacion) {
            window.UITablero.mostrarNotificacion(
                'error',
                'Error al Generar Portafolios',
                error.message
            );
        } else {
            alert(`❌ Error: ${error.message}`);
        }
        
        // Emitir evento de error
        emitirEvento(eventosConfig.eventosCustom.errorOcurrido, {
            accion: 'generar-portafolios',
            error: error.message
        });
        
    } finally {
        // Restaurar botón
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-folder-plus"></i> Inicializar Portafolios';
    }
}

// Funciones placeholder para acciones de tabla
function verRegistro(fila) { console.log('👁️ Ver registro:', fila); }
function editarRegistro(fila) { console.log('✏️ Editar registro:', fila); }
function eliminarRegistro(fila) { console.log('🗑️ Eliminar registro:', fila); }
function activarRegistro(fila) { console.log('✅ Activar registro:', fila); }
function desactivarRegistro(fila) { console.log('❌ Desactivar registro:', fila); }
function actualizarContadorSeleccionados() { console.log('🔢 Actualizando contador'); }
function limpiarFormulario(boton) { 
    const form = boton.closest('form');
    if (form) form.reset();
}

// ================================================
// EXPORTACIÓN DEL MÓDULO
// ================================================

window.EventosTablero = {
    // Inicialización
    initialize,
    
    // Eventos custom
    emitirEvento,
    
    // Estado
    obtenerEstadoEventos: () => eventosState,
    
    // Configuración
    obtenerConfigEventos: () => eventosConfig
};

console.log('✅ Módulo Eventos del Tablero cargado'); 