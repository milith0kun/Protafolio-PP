/**
 * Carga Masiva de Datos
 * Script para la carga masiva de usuarios, asignaturas y asignaciones
 */

// Variables globales para los dropzones
let dropzoneUsuarios;
let dropzoneAsignaturas;
let dropzoneAsignaciones;

// Asegurar que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!verificarAutenticacion(['administrador'])) {
        return;
    }

    // Inicializar componentes
    inicializarComponentes();
    cargarCiclos();

    // Configurar eventos
    configurarEventos();
});

/**
 * Inicializa los componentes de la página
 */
function inicializarComponentes() {
    // Configurar Dropzone para usuarios
    Dropzone.autoDiscover = false;
    
    dropzoneUsuarios = new Dropzone("#dropzoneUsuarios", {
        url: `${CONFIG.API.BASE_URL}/carga-masiva/usuarios`,
        maxFilesize: 5, // MB
        maxFiles: 1,
        acceptedFiles: ".xlsx,.xls",
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: "Arrastre un archivo Excel aquí o haga clic para seleccionar",
        dictRemoveFile: "Eliminar archivo",
        dictFileTooBig: "El archivo es demasiado grande ({{filesize}}MB). Tamaño máximo: {{maxFilesize}}MB.",
        dictInvalidFileType: "No puede cargar archivos de este tipo. Solo se permiten archivos Excel (.xlsx, .xls).",
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    });

    // Configurar Dropzone para asignaturas
    dropzoneAsignaturas = new Dropzone("#dropzoneAsignaturas", {
        url: `${CONFIG.API.BASE_URL}/carga-masiva/asignaturas`,
        maxFilesize: 5, // MB
        maxFiles: 1,
        acceptedFiles: ".xlsx,.xls",
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: "Arrastre un archivo Excel aquí o haga clic para seleccionar",
        dictRemoveFile: "Eliminar archivo",
        dictFileTooBig: "El archivo es demasiado grande ({{filesize}}MB). Tamaño máximo: {{maxFilesize}}MB.",
        dictInvalidFileType: "No puede cargar archivos de este tipo. Solo se permiten archivos Excel (.xlsx, .xls).",
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    });

    // Configurar Dropzone para asignaciones
    dropzoneAsignaciones = new Dropzone("#dropzoneAsignaciones", {
        url: `${CONFIG.API.BASE_URL}/carga-masiva/asignaciones`,
        maxFilesize: 5, // MB
        maxFiles: 1,
        acceptedFiles: ".xlsx,.xls",
        autoProcessQueue: false,
        addRemoveLinks: true,
        dictDefaultMessage: "Arrastre un archivo Excel aquí o haga clic para seleccionar",
        dictRemoveFile: "Eliminar archivo",
        dictFileTooBig: "El archivo es demasiado grande ({{filesize}}MB). Tamaño máximo: {{maxFilesize}}MB.",
        dictInvalidFileType: "No puede cargar archivos de este tipo. Solo se permiten archivos Excel (.xlsx, .xls).",
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    });

    // Configurar toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        positionClass: "toast-top-right",
        timeOut: 5000
    };
}

/**
 * Configura los eventos de la página
 */
function configurarEventos() {
    // Evento para procesar usuarios
    $('#btnProcesarUsuarios').on('click', function() {
        procesarCargaUsuarios();
    });

    // Evento para procesar asignaturas
    $('#btnProcesarAsignaturas').on('click', function() {
        procesarCargaAsignaturas();
    });

    // Evento para procesar asignaciones
    $('#btnProcesarAsignaciones').on('click', function() {
        procesarCargaAsignaciones();
    });

    // Eventos para descargar plantillas
    $('#btnDescargarPlantillaUsuarios').on('click', function() {
        descargarPlantilla('usuarios');
    });

    $('#btnDescargarPlantillaAsignaturas').on('click', function() {
        descargarPlantilla('asignaturas');
    });

    $('#btnDescargarPlantillaAsignaciones').on('click', function() {
        descargarPlantilla('asignaciones');
    });

    // Eventos para los dropzones
    configurarEventosDropzone(dropzoneUsuarios, 'usuarios');
    configurarEventosDropzone(dropzoneAsignaturas, 'asignaturas');
    configurarEventosDropzone(dropzoneAsignaciones, 'asignaciones');
}

/**
 * Configura los eventos para un dropzone específico
 * @param {Dropzone} dropzone - Instancia de Dropzone
 * @param {string} tipo - Tipo de carga (usuarios, asignaturas, asignaciones)
 */
function configurarEventosDropzone(dropzone, tipo) {
    // Evento cuando se completa la carga
    dropzone.on("success", function(file, response) {
        mostrarResultados(response, tipo);
    });

    // Evento cuando hay un error en la carga
    dropzone.on("error", function(file, errorMessage) {
        let mensaje = typeof errorMessage === 'string' ? errorMessage : 'Error al procesar el archivo';
        
        if (errorMessage.message) {
            mensaje = errorMessage.message;
        }
        
        APP.mostrarError(mensaje);
        dropzone.removeFile(file);
    });

    // Evento cuando se agrega un archivo
    dropzone.on("addedfile", function() {
        if (dropzone.files.length > 1) {
            dropzone.removeFile(dropzone.files[0]);
        }
    });
}

/**
 * Carga la lista de ciclos académicos
 */
function cargarCiclos() {
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/ciclos`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los ciclos académicos');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Limpiar select
            $('#selectCiclo').empty();
            $('#selectCiclo').append('<option value="">Seleccione un ciclo...</option>');
            
            // Agregar opciones
            data.data.forEach(ciclo => {
                $('#selectCiclo').append(`<option value="${ciclo.id}">${ciclo.nombre}</option>`);
            });
            
            // Si hay un ciclo activo, seleccionarlo automáticamente
            const cicloActivo = data.data.find(c => c.estado === 'activo');
            if (cicloActivo) {
                $('#selectCiclo').val(cicloActivo.id);
            }
        } else {
            APP.mostrarError(data.message || 'Error al cargar los ciclos académicos');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        APP.mostrarError('Error al cargar los ciclos académicos');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Procesa la carga de usuarios
 */
function procesarCargaUsuarios() {
    if (dropzoneUsuarios.files.length === 0) {
        APP.mostrarError('Debe seleccionar un archivo para cargar');
        return;
    }

    mostrarCargando();
    dropzoneUsuarios.processQueue();
}

/**
 * Procesa la carga de asignaturas
 */
function procesarCargaAsignaturas() {
    if (dropzoneAsignaturas.files.length === 0) {
        APP.mostrarError('Debe seleccionar un archivo para cargar');
        return;
    }

    const cicloId = $('#selectCiclo').val();
    if (!cicloId) {
        APP.mostrarError('Debe seleccionar un ciclo académico');
        return;
    }

    // Actualizar la URL con el ciclo seleccionado
    dropzoneAsignaturas.options.url = `${CONFIG.API.BASE_URL}/carga-masiva/asignaturas/${cicloId}`;
    
    mostrarCargando();
    dropzoneAsignaturas.processQueue();
}

/**
 * Procesa la carga de asignaciones
 */
function procesarCargaAsignaciones() {
    if (dropzoneAsignaciones.files.length === 0) {
        APP.mostrarError('Debe seleccionar un archivo para cargar');
        return;
    }

    const cicloId = $('#selectCiclo').val();
    if (!cicloId) {
        APP.mostrarError('Debe seleccionar un ciclo académico');
        return;
    }

    // Actualizar la URL con el ciclo seleccionado
    dropzoneAsignaciones.options.url = `${CONFIG.API.BASE_URL}/carga-masiva/asignaciones/${cicloId}`;
    
    mostrarCargando();
    dropzoneAsignaciones.processQueue();
}

/**
 * Muestra los resultados de la carga
 * @param {Object} response - Respuesta del servidor
 * @param {string} tipo - Tipo de carga (usuarios, asignaturas, asignaciones)
 */
function mostrarResultados(response, tipo) {
    ocultarCargando();
    
    // Limpiar dropzone
    switch (tipo) {
        case 'usuarios':
            dropzoneUsuarios.removeAllFiles();
            break;
        case 'asignaturas':
            dropzoneAsignaturas.removeAllFiles();
            break;
        case 'asignaciones':
            dropzoneAsignaciones.removeAllFiles();
            break;
    }
    
    // Verificar si la respuesta es válida
    if (!response || typeof response !== 'object') {
        APP.mostrarError('Error al procesar el archivo');
        return;
    }
    
    // Mostrar mensaje de éxito o error
    if (response.success) {
        $('#alertaExito').show();
        $('#alertaError').hide();
        $('#mensajeExito').text(response.message || 'Archivo procesado exitosamente');
        APP.mostrarNotificacion('Éxito', response.message || 'Archivo procesado exitosamente', 'success');
    } else {
        $('#alertaExito').hide();
        $('#alertaError').show();
        $('#mensajeError').text(response.message || 'Error al procesar el archivo');
        APP.mostrarError(response.message || 'Error al procesar el archivo');
    }
    
    // Mostrar detalles si existen
    if (response.detalles && response.detalles.length > 0) {
        $('#contenedorDetalles').show();
        
        // Limpiar tabla
        $('#tablaResultados tbody').empty();
        
        // Agregar filas
        response.detalles.forEach(detalle => {
            const estado = detalle.estado === 'exito' ? 
                '<span class="badge bg-success">Éxito</span>' : 
                '<span class="badge bg-danger">Error</span>';
                
            $('#tablaResultados tbody').append(`
                <tr>
                    <td>${detalle.fila}</td>
                    <td>${estado}</td>
                    <td>${detalle.mensaje}</td>
                </tr>
            `);
        });
    } else {
        $('#contenedorDetalles').hide();
    }
    
    // Mostrar modal
    const modalResultados = new bootstrap.Modal(document.getElementById('modalResultados'));
    modalResultados.show();
}

/**
 * Descarga una plantilla para la carga masiva
 * @param {string} tipo - Tipo de plantilla (usuarios, asignaturas, asignaciones)
 */
function descargarPlantilla(tipo) {
    let url = `${CONFIG.API.BASE_URL}/carga-masiva/plantilla/${tipo}`;
    
    // Para asignaturas y asignaciones, se requiere un ciclo
    if (tipo === 'asignaturas' || tipo === 'asignaciones') {
        const cicloId = $('#selectCiclo').val();
        if (!cicloId) {
            APP.mostrarError('Debe seleccionar un ciclo académico');
            return;
        }
        url += `/${cicloId}`;
    }
    
    // Abrir en una nueva ventana
    window.open(url, '_blank');
}

/**
 * Muestra el indicador de carga
 */
function mostrarCargando() {
    // Mostrar spinner de carga
    $('#spinnerCarga').show();
    // Deshabilitar botones
    $('.btn-procesar').prop('disabled', true);
}

/**
 * Oculta el indicador de carga
 */
function ocultarCargando() {
    // Ocultar spinner de carga
    $('#spinnerCarga').hide();
    // Habilitar botones
    $('.btn-procesar').prop('disabled', false);
}

/**
 * Inicializa el sistema con los 8 archivos Excel requeridos
 * Esta función es para la inicialización completa del sistema desde el tablero
 */
function inicializarSistema() {
    // Crear un formulario dinámico
    const formData = new FormData();
    
    // Verificar que se hayan seleccionado los 8 archivos
    const archivosInput = document.getElementById('archivosInicializacion');
    if (archivosInput.files.length !== 8) {
        APP.mostrarError('Debe seleccionar exactamente 8 archivos Excel para la inicialización');
        return;
    }
    
    // Agregar los archivos al formulario
    for (let i = 0; i < archivosInput.files.length; i++) {
        formData.append('archivos', archivosInput.files[i]);
    }
    
    // Mostrar progreso
    $('#uploadProgress').show();
    $('.progress-text').text('Iniciando carga...');
    $('.progress-bar').css('width', '10%');
    
    // Enviar al servidor
    fetch(`${CONFIG.API.BASE_URL}/inicializacion`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: formData
    })
    .then(response => {
        // Actualizar progreso
        $('.progress-bar').css('width', '50%');
        $('.progress-text').text('Procesando archivos...');
        
        if (!response.ok) {
            throw new Error('Error en la inicialización del sistema');
        }
        return response.json();
    })
    .then(data => {
        // Actualizar progreso
        $('.progress-bar').css('width', '100%');
        $('.progress-text').text('Completado');
        
        // Mostrar resultado
        if (data.success) {
            APP.mostrarNotificacion('Éxito', 'Sistema inicializado correctamente', 'success');
            
            // Agregar entrada al log
            $('#uploadLog').show();
            $('#uploadLog .log-entries').append(`
                <div class="log-entry success">
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                    <span class="message">Sistema inicializado correctamente</span>
                </div>
            `);
            
            // Recargar la página después de 3 segundos
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            APP.mostrarError(data.message || 'Error en la inicialización del sistema');
            
            // Agregar entrada al log
            $('#uploadLog').show();
            $('#uploadLog .log-entries').append(`
                <div class="log-entry error">
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                    <span class="message">Error: ${data.message || 'Error en la inicialización del sistema'}</span>
                </div>
            `);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Actualizar progreso
        $('.progress-bar').css('width', '100%');
        $('.progress-bar').addClass('bg-danger');
        $('.progress-text').text('Error');
        
        APP.mostrarError('Error en la inicialización del sistema');
        
        // Agregar entrada al log
        $('#uploadLog').show();
        $('#uploadLog .log-entries').append(`
            <div class="log-entry error">
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                <span class="message">Error: ${error.message}</span>
            </div>
        `);
    })
    .finally(() => {
        // Habilitar botón después de completar
        $('#startUploadBtn').prop('disabled', false);
    });
}