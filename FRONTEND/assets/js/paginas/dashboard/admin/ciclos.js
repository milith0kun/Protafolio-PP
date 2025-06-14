/**
 * Gestión de Ciclos Académicos
 * Script para la administración de ciclos académicos del sistema
 */

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
    // Configurar DataTable
    $('#tablaCiclos').DataTable({
        language: {
            url: '../../../assets/js/datatables-es.json'
        },
        columns: [
            { data: 'id' },
            { data: 'nombre' },
            { data: 'descripcion' },
            { 
                data: 'estado',
                render: function(data) {
                    let badge = '';
                    switch(data) {
                        case 'preparacion':
                            badge = '<span class="badge badge-warning">Preparación</span>';
                            break;
                        case 'activo':
                            badge = '<span class="badge badge-success">Activo</span>';
                            break;
                        case 'cerrado':
                            badge = '<span class="badge badge-secondary">Cerrado</span>';
                            break;
                        default:
                            badge = '<span class="badge badge-info">' + data + '</span>';
                    }
                    return badge;
                }
            },
            { 
                data: 'fecha_inicio',
                render: function(data) {
                    return moment(data).format('DD/MM/YYYY');
                }
            },
            { 
                data: 'fecha_fin',
                render: function(data) {
                    return moment(data).format('DD/MM/YYYY');
                }
            },
            {
                data: null,
                render: function(data) {
                    let botones = `
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-info btn-editar" data-id="${data.id}" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-estados" data-id="${data.id}" title="Gestionar Estados">
                                <i class="fas fa-cogs"></i>
                            </button>
                    `;
                    
                    // Solo permitir eliminar ciclos en estado de preparación
                    if (data.estado === 'preparacion') {
                        botones += `
                            <button type="button" class="btn btn-danger btn-eliminar" data-id="${data.id}" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                    }
                    
                    botones += `</div>`;
                    return botones;
                }
            }
        ]
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
    // Evento para abrir modal de nuevo ciclo
    $('#btnNuevoCiclo').on('click', function() {
        limpiarFormularioCiclo();
        $('#modalCicloLabel').text('Nuevo Ciclo Académico');
        $('#modalCiclo').modal('show');
    });

    // Evento para guardar ciclo
    $('#btnGuardarCiclo').on('click', function() {
        guardarCiclo();
    });

    // Evento para editar ciclo
    $('#tablaCiclos').on('click', '.btn-editar', function() {
        const cicloId = $(this).data('id');
        cargarDatosCiclo(cicloId);
    });

    // Evento para gestionar estados
    $('#tablaCiclos').on('click', '.btn-estados', function() {
        const cicloId = $(this).data('id');
        cargarEstadosCiclo(cicloId);
    });

    // Evento para eliminar ciclo
    $('#tablaCiclos').on('click', '.btn-eliminar', function() {
        const cicloId = $(this).data('id');
        confirmarEliminarCiclo(cicloId);
    });

    // Evento para guardar estados
    $('#btnGuardarEstados').on('click', function() {
        guardarEstadosCiclo();
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
            // Limpiar y recargar la tabla
            const tabla = $('#tablaCiclos').DataTable();
            tabla.clear().rows.add(data.data).draw();
        } else {
            toastr.error(data.message || 'Error al cargar los ciclos académicos');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr.error('Error al cargar los ciclos académicos');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Limpia el formulario de ciclo académico
 */
function limpiarFormularioCiclo() {
    $('#cicloId').val('');
    $('#nombre').val('');
    $('#descripcion').val('');
    $('#estado').val('preparacion');
    $('#fechaInicio').val('');
    $('#fechaFin').val('');
    $('#semestreActual').val('');
    $('#anioActual').val(new Date().getFullYear());
}

/**
 * Guarda un ciclo académico (nuevo o existente)
 */
function guardarCiclo() {
    // Validar formulario
    if (!validarFormularioCiclo()) {
        return;
    }

    // Obtener datos del formulario
    const cicloId = $('#cicloId').val();
    const ciclo = {
        nombre: $('#nombre').val(),
        descripcion: $('#descripcion').val(),
        estado: $('#estado').val(),
        fecha_inicio: $('#fechaInicio').val(),
        fecha_fin: $('#fechaFin').val(),
        semestre_actual: $('#semestreActual').val(),
        anio_actual: $('#anioActual').val()
    };

    // Determinar si es creación o actualización
    const esNuevo = !cicloId;
    const url = esNuevo ? `${CONFIG.API.BASE_URL}/ciclos` : `${CONFIG.API.BASE_URL}/ciclos/${cicloId}`;
    const metodo = esNuevo ? 'POST' : 'PUT';

    mostrarCargando();

    fetch(url, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(ciclo)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al guardar el ciclo académico');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            $('#modalCiclo').modal('hide');
            toastr.success(data.message || 'Ciclo académico guardado exitosamente');
            cargarCiclos();
        } else {
            toastr.error(data.message || 'Error al guardar el ciclo académico');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr.error('Error al guardar el ciclo académico');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Valida el formulario de ciclo académico
 * @returns {boolean} - Indica si el formulario es válido
 */
function validarFormularioCiclo() {
    // Validar campos requeridos
    if (!$('#nombre').val()) {
        toastr.error('El nombre del ciclo es requerido');
        return false;
    }

    if (!$('#fechaInicio').val()) {
        toastr.error('La fecha de inicio es requerida');
        return false;
    }

    if (!$('#fechaFin').val()) {
        toastr.error('La fecha de fin es requerida');
        return false;
    }

    if (!$('#semestreActual').val()) {
        toastr.error('El semestre actual es requerido');
        return false;
    }

    if (!$('#anioActual').val()) {
        toastr.error('El año actual es requerido');
        return false;
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    const fechaInicio = new Date($('#fechaInicio').val());
    const fechaFin = new Date($('#fechaFin').val());

    if (fechaFin <= fechaInicio) {
        toastr.error('La fecha de fin debe ser posterior a la fecha de inicio');
        return false;
    }

    return true;
}

/**
 * Carga los datos de un ciclo académico para edición
 * @param {number} cicloId - ID del ciclo académico
 */
function cargarDatosCiclo(cicloId) {
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/ciclos/${cicloId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los datos del ciclo académico');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const ciclo = data.data;
            
            // Llenar formulario
            $('#cicloId').val(ciclo.id);
            $('#nombre').val(ciclo.nombre);
            $('#descripcion').val(ciclo.descripcion);
            $('#estado').val(ciclo.estado);
            $('#fechaInicio').val(moment(ciclo.fecha_inicio).format('YYYY-MM-DD'));
            $('#fechaFin').val(moment(ciclo.fecha_fin).format('YYYY-MM-DD'));
            $('#semestreActual').val(ciclo.semestre_actual);
            $('#anioActual').val(ciclo.anio_actual);

            // Mostrar modal
            $('#modalCicloLabel').text('Editar Ciclo Académico');
            $('#modalCiclo').modal('show');
        } else {
            toastr.error(data.message || 'Error al cargar los datos del ciclo académico');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr.error('Error al cargar los datos del ciclo académico');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Confirma la eliminación de un ciclo académico
 * @param {number} cicloId - ID del ciclo académico
 */
function confirmarEliminarCiclo(cicloId) {
    Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción eliminará el ciclo académico y no podrá ser revertida',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarCiclo(cicloId);
        }
    });
}

/**
 * Elimina un ciclo académico
 * @param {number} cicloId - ID del ciclo académico
 */
function eliminarCiclo(cicloId) {
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/ciclos/${cicloId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar el ciclo académico');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            toastr.success(data.message || 'Ciclo académico eliminado exitosamente');
            cargarCiclos();
        } else {
            toastr.error(data.message || 'Error al eliminar el ciclo académico');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr.error('Error al eliminar el ciclo académico');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Carga los estados del sistema para un ciclo académico
 * @param {number} cicloId - ID del ciclo académico
 */
function cargarEstadosCiclo(cicloId) {
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/ciclos/${cicloId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los estados del ciclo académico');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const ciclo = data.data;
            
            // Guardar ID del ciclo
            $('#estadoCicloId').val(ciclo.id);
            
            // Limpiar checkboxes
            $('#moduloCargaDatos').prop('checked', false);
            $('#moduloGestionDocumentos').prop('checked', false);
            $('#moduloVerificacion').prop('checked', false);
            $('#moduloReportes').prop('checked', false);
            
            // Marcar estados habilitados
            if (ciclo.estados && ciclo.estados.length > 0) {
                ciclo.estados.forEach(estado => {
                    switch(estado.modulo) {
                        case 'carga_datos':
                            $('#moduloCargaDatos').prop('checked', estado.habilitado === 1);
                            break;
                        case 'gestion_documentos':
                            $('#moduloGestionDocumentos').prop('checked', estado.habilitado === 1);
                            break;
                        case 'verificacion':
                            $('#moduloVerificacion').prop('checked', estado.habilitado === 1);
                            break;
                        case 'reportes':
                            $('#moduloReportes').prop('checked', estado.habilitado === 1);
                            break;
                    }
                });
            }
            
            // Mostrar modal
            $('#modalEstadosLabel').text(`Gestionar Estados - ${ciclo.nombre}`);
            $('#modalEstados').modal('show');
        } else {
            toastr.error(data.message || 'Error al cargar los estados del ciclo académico');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr.error('Error al cargar los estados del ciclo académico');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Guarda los estados del sistema para un ciclo académico
 */
function guardarEstadosCiclo() {
    const cicloId = $('#estadoCicloId').val();
    const modulos = [
        {
            modulo: 'carga_datos',
            habilitado: $('#moduloCargaDatos').is(':checked'),
            observaciones: $('#observaciones').val()
        },
        {
            modulo: 'gestion_documentos',
            habilitado: $('#moduloGestionDocumentos').is(':checked'),
            observaciones: $('#observaciones').val()
        },
        {
            modulo: 'verificacion',
            habilitado: $('#moduloVerificacion').is(':checked'),
            observaciones: $('#observaciones').val()
        },
        {
            modulo: 'reportes',
            habilitado: $('#moduloReportes').is(':checked'),
            observaciones: $('#observaciones').val()
        }
    ];
    
    // Actualizar cada módulo
    const promesas = modulos.map(item => {
        return fetch(`${CONFIG.API.BASE_URL}/ciclos/${cicloId}/modulos/${item.modulo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify({
                habilitado: item.habilitado,
                observaciones: item.observaciones
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al actualizar el módulo ${item.modulo}`);
            }
            return response.json();
        });
    });
    
    mostrarCargando();
    
    Promise.all(promesas)
        .then(() => {
            $('#modalEstados').modal('hide');
            toastr.success('Estados del sistema actualizados exitosamente');
        })
        .catch(error => {
            console.error('Error:', error);
            toastr.error('Error al actualizar los estados del sistema');
        })
        .finally(() => {
            ocultarCargando();
        });
}

/**
 * Muestra el indicador de carga
 */
function mostrarCargando() {
    // Implementar según el diseño de la aplicación
    // Por ejemplo, mostrar un spinner o deshabilitar botones
}

/**
 * Oculta el indicador de carga
 */
function ocultarCargando() {
    // Implementar según el diseño de la aplicación
    // Por ejemplo, ocultar un spinner o habilitar botones
}
