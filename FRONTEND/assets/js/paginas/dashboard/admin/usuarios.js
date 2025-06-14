/**
 * Gestión de Usuarios
 * Script para la administración de usuarios del sistema
 */

// Variable global para la tabla de usuarios
let tablaUsuarios;
let modoEdicion = false;

// Asegurar que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!verificarAutenticacion(['administrador'])) {
        return;
    }

    // Inicializar componentes
    inicializarComponentes();
    
    // Cargar datos iniciales
    cargarUsuarios();

    // Configurar eventos
    configurarEventos();
});

/**
 * Inicializa los componentes de la página
 */
function inicializarComponentes() {
    // Inicializar DataTable
    tablaUsuarios = $('#tablaUsuarios').DataTable({
        language: {
            url: '../../../assets/js/datatables-es.json'
        },
        columns: [
            { data: 'id' },
            { data: 'nombres' },
            { data: 'apellidos' },
            { data: 'correo' },
            { data: 'dni' },
            { 
                data: 'rolesAsignados',
                render: function(data, type, row) {
                    let roles = [];
                    if (row.rolesAsignados && row.rolesAsignados.length > 0) {
                        roles = row.rolesAsignados.map(r => {
                            let badge = 'badge-secondary';
                            if (r.rol === 'administrador') badge = 'badge-danger';
                            if (r.rol === 'docente') badge = 'badge-primary';
                            if (r.rol === 'verificador') badge = 'badge-info';
                            return `<span class="badge ${badge} mr-1">${r.rol}</span>`;
                        });
                        return roles.join(' ');
                    }
                    
                    return '<span class="badge badge-secondary">Sin rol</span>';
                }
            },
            { 
                data: 'estado',
                render: function(data) {
                    let badge = data === 'activo' ? 'badge-success' : 'badge-danger';
                    return `<span class="badge ${badge}">${data}</span>`;
                }
            },
            { 
                data: 'fecha_registro',
                render: function(data) {
                    return moment(data).format('DD/MM/YYYY');
                }
            },
            { 
                data: null,
                render: function(data, type, row) {
                    let btns = `
                        <button class="btn btn-sm btn-info btn-editar" data-id="${row.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${row.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    
                    // Agregar botón de asignar verificador solo para docentes
                    const esDocente = row.rolesAsignados && row.rolesAsignados.some(r => r.rol === 'docente');
                    if (esDocente) {
                        btns += `
                            <button class="btn btn-sm btn-primary btn-asignar-verificador" data-id="${row.id}" title="Asignar Verificador">
                                <i class="fas fa-user-check"></i>
                            </button>
                        `;
                    }
                    
                    return btns;
                }
            }
        ]
    });

    // Configurar Select2
    $('#selectVerificador').select2({
        dropdownParent: $('#modalAsignarVerificador'),
        placeholder: 'Seleccione un verificador'
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
    // Evento para abrir modal de nuevo usuario
    $('#btnNuevoUsuario').on('click', function() {
        resetearFormularioUsuario();
        $('#modalUsuarioLabel').text('Nuevo Usuario');
        $('#password').prop('required', true);
        $('#confirmarPassword').prop('required', true);
        $('.password-required').show();
        modoEdicion = false;
        $('#modalUsuario').modal('show');
    });

    // Evento para guardar usuario
    $('#btnGuardarUsuario').on('click', function() {
        guardarUsuario();
    });

    // Evento para editar usuario
    $(document).on('click', '.btn-editar', function() {
        const id = $(this).data('id');
        cargarUsuario(id);
    });

    // Evento para eliminar usuario
    $(document).on('click', '.btn-eliminar', function() {
        const id = $(this).data('id');
        confirmarEliminarUsuario(id);
    });

    // Evento para asignar verificador
    $(document).on('click', '.btn-asignar-verificador', function() {
        const id = $(this).data('id');
        $('#docenteId').val(id);
        cargarVerificadores();
        $('#modalAsignarVerificador').modal('show');
    });

    // Evento para guardar asignación de verificador
    $('#btnGuardarAsignacion').on('click', function() {
        guardarAsignacionVerificador();
    });

    // Evento para aplicar filtros
    $('#btnAplicarFiltros').on('click', function() {
        cargarUsuarios();
    });

    // Evento para limpiar filtros
    $('#btnLimpiarFiltros').on('click', function() {
        $('#filtroRol').val('');
        $('#filtroEstado').val('');
        $('#filtroBusqueda').val('');
        cargarUsuarios();
    });

    // Evento para validar formulario
    $('#formUsuario').on('submit', function(e) {
        e.preventDefault();
        guardarUsuario();
    });
}

/**
 * Carga la lista de usuarios con los filtros aplicados
 */
function cargarUsuarios() {
    // Obtener filtros
    const rol = $('#filtroRol').val();
    const estado = $('#filtroEstado').val();
    const busqueda = $('#filtroBusqueda').val();
    
    // Construir URL con filtros
    let url = `${CONFIG.API.BASE_URL}/usuarios`;
    const params = [];
    
    if (rol) params.push(`rol=${rol}`);
    if (estado) params.push(`estado=${estado}`);
    if (busqueda) params.push(`busqueda=${encodeURIComponent(busqueda)}`);
    
    if (params.length > 0) {
        url += '?' + params.join('&');
    }
    
    // Mostrar indicador de carga
    mostrarCargando();

    // Realizar petición
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los usuarios');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Limpiar y recargar tabla
            tablaUsuarios.clear();
            tablaUsuarios.rows.add(data.data).draw();
            
            // Mostrar mensaje de éxito si hay datos
            if (data.data && data.data.length > 0) {
                mostrarMensajeExito(`Se cargaron ${data.data.length} usuarios correctamente`);
            }
        } else {
            // Usar la función global APP.mostrarNotificacion
            APP.mostrarNotificacion(data.message || 'Error al cargar los usuarios', 'error');
            mostrarMensajeError(data.message || 'Error al cargar los usuarios');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Usar la función global APP.mostrarNotificacion
        APP.mostrarNotificacion('Error al cargar los usuarios', 'error');
        mostrarMensajeError('Error al cargar los usuarios. Verifique su conexión o inténtelo más tarde.');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Carga los datos de un usuario para edición
 * @param {number} id - ID del usuario a cargar
 */
function cargarUsuario(id) {
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/usuarios/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los datos del usuario');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Llenar formulario con datos del usuario
            $('#usuarioId').val(data.data.id);
            $('#nombres').val(data.data.nombres);
            $('#apellidos').val(data.data.apellidos);
            $('#correo').val(data.data.correo);
            $('#dni').val(data.data.dni);
            $('#estado').val(data.data.activo ? 'activo' : 'inactivo');
            
            // Configurar roles
            const roles = data.data.rolesAsignados || [];
            const rolActivo = roles.find(r => r.activo);
            if (rolActivo) {
                $('#rol').val(rolActivo.rol);
            }
            
            // Marcar checkboxes de roles adicionales
            $('#rolDocente').prop('checked', roles.some(r => r.rol === 'docente'));
            $('#rolVerificador').prop('checked', roles.some(r => r.rol === 'verificador'));
            $('#rolAdministrador').prop('checked', roles.some(r => r.rol === 'administrador'));
            
            // Configurar modo edición
            modoEdicion = true;
            $('#modalUsuarioLabel').text('Editar Usuario');
            $('#password').prop('required', false);
            $('#confirmarPassword').prop('required', false);
            $('.password-required').hide();
            
            // Mostrar modal
            $('#modalUsuario').modal('show');
        } else {
            toastr.error(data.message || 'Error al cargar los datos del usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr.error('Error al cargar los datos del usuario');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Guarda los datos de un usuario (creación o edición)
 */
function guardarUsuario() {
    // Validar formulario
    if (!validarFormularioUsuario()) {
        return;
    }
    
    // Preparar datos
    const id = $('#usuarioId').val();
    const usuario = {
        nombres: $('#nombres').val(),
        apellidos: $('#apellidos').val(),
        correo: $('#correo').val(),
        dni: $('#dni').val(),
        rol: $('#rol').val(),
        activo: $('#estado').val() === 'activo'
    };
    
    // Agregar contraseña solo si es nuevo usuario o si se ha ingresado una nueva
    if (!modoEdicion || $('#password').val()) {
        usuario.contrasena = $('#password').val();
    }
    
    // Configurar petición
    const url = modoEdicion ? `${CONFIG.API.BASE_URL}/usuarios/${id}` : `${CONFIG.API.BASE_URL}/usuarios`;
    const method = modoEdicion ? 'PUT' : 'POST';
    
    mostrarCargando();

    // Realizar petición
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(usuario)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al guardar el usuario');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Cerrar modal y recargar datos
            $('#modalUsuario').modal('hide');
            cargarUsuarios();
            
            // Mostrar mensaje de éxito
            const mensaje = modoEdicion ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente';
            APP.mostrarNotificacion(mensaje, 'exito');
            mostrarMensajeExito(mensaje);
        } else {
            APP.mostrarNotificacion(data.message || 'Error al guardar el usuario', 'error');
            mostrarMensajeError(data.message || 'Error al guardar el usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        APP.mostrarNotificacion('Error al guardar el usuario', 'error');
        mostrarMensajeError('Error al guardar el usuario. Verifique su conexión o inténtelo más tarde.');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Confirma la eliminación de un usuario
 * @param {number} id - ID del usuario a eliminar
 */
function confirmarEliminarUsuario(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción no se puede revertir. El usuario será eliminado lógicamente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarUsuario(id);
        }
    });
}

/**
 * Elimina un usuario (eliminación lógica)
 * @param {number} id - ID del usuario a eliminar
 */
function eliminarUsuario(id) {
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Recargar datos
            cargarUsuarios();
            
            // Mostrar mensaje de éxito
            APP.mostrarNotificacion('Usuario eliminado correctamente', 'exito');
            mostrarMensajeExito('Usuario eliminado correctamente');
        } else {
            APP.mostrarNotificacion(data.message || 'Error al eliminar el usuario', 'error');
            mostrarMensajeError(data.message || 'Error al eliminar el usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        APP.mostrarNotificacion('Error al eliminar el usuario', 'error');
        mostrarMensajeError('Error al eliminar el usuario. Verifique su conexión o inténtelo más tarde.');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Carga la lista de verificadores disponibles
 */
function cargarVerificadores() {
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/usuarios/rol/verificador`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los verificadores');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Limpiar select
            $('#selectVerificador').empty();
            $('#selectVerificador').append('<option value="">Seleccione un verificador...</option>');
            
            // Agregar opciones
            data.data.forEach(verificador => {
                $('#selectVerificador').append(`<option value="${verificador.id}">${verificador.nombres} ${verificador.apellidos}</option>`);
            });
            
            // Refrescar Select2
            $('#selectVerificador').trigger('change');
        } else {
            toastr.error(data.message || 'Error al cargar los verificadores');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr.error('Error al cargar los verificadores');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Guarda la asignación de verificador a un docente
 */
function guardarAsignacionVerificador() {
    const docenteId = $('#docenteId').val();
    const verificadorId = $('#selectVerificador').val();
    
    if (!verificadorId) {
        toastr.error('Debe seleccionar un verificador');
        return;
    }
    
    mostrarCargando();

    fetch(`${CONFIG.API.BASE_URL}/usuarios/docente/${docenteId}/verificador/${verificadorId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al asignar el verificador');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Cerrar modal y recargar datos
            $('#modalAsignarVerificador').modal('hide');
            cargarUsuarios();
            
            // Mostrar mensaje de éxito
            APP.mostrarNotificacion('Verificador asignado correctamente', 'exito');
            mostrarMensajeExito('Verificador asignado correctamente');
        } else {
            APP.mostrarNotificacion(data.message || 'Error al asignar el verificador', 'error');
            mostrarMensajeError(data.message || 'Error al asignar el verificador');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        APP.mostrarNotificacion('Error al asignar el verificador', 'error');
        mostrarMensajeError('Error al asignar el verificador. Verifique su conexión o inténtelo más tarde.');
    })
    .finally(() => {
        ocultarCargando();
    });
}

/**
 * Valida el formulario de usuario
 * @returns {boolean} - true si el formulario es válido, false en caso contrario
 */
function validarFormularioUsuario() {
    // Validar campos requeridos
    if (!$('#nombres').val() || !$('#apellidos').val() || !$('#correo').val() || !$('#dni').val() || !$('#rol').val()) {
        toastr.error('Todos los campos marcados con * son obligatorios');
        return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test($('#correo').val())) {
        toastr.error('El formato del email no es válido');
        return false;
    }
    
    // Validar formato de DNI
    const dniRegex = /^[0-9]{8}$/;
    if (!dniRegex.test($('#dni').val())) {
        toastr.error('El DNI debe contener 8 dígitos numéricos');
        return false;
    }
    
    // Validar contraseña si es nuevo usuario o si se ha ingresado una nueva
    if (!modoEdicion || $('#password').val()) {
        // Validar que la contraseña tenga al menos 8 caracteres
        if ($('#password').val().length < 8) {
            toastr.error('La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        
        // Validar que las contraseñas coincidan
        if ($('#password').val() !== $('#confirmarPassword').val()) {
            toastr.error('Las contraseñas no coinciden');
            return false;
        }
    }
    
    return true;
}

/**
 * Resetea el formulario de usuario
 */
function resetearFormularioUsuario() {
    $('#formUsuario')[0].reset();
    $('#rolAdministrador').prop('checked', false);
    $('#rolDocente').prop('checked', false);
    $('#rolVerificador').prop('checked', false);
}

/**
 * Muestra un indicador de carga
 */
function mostrarCargando() {
    document.body.classList.add('loading');
}

/**
 * Oculta el indicador de carga
 */
function ocultarCargando() {
    document.body.classList.remove('loading');
}

/**
 * Muestra un mensaje de error en el contenedor de alertas
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarMensajeError(mensaje) {
    const alertaError = document.getElementById('alertaError');
    const mensajeError = document.getElementById('mensajeError');
    
    if (alertaError && mensajeError) {
        mensajeError.textContent = mensaje;
        alertaError.style.display = 'block';
        alertaError.classList.add('show');
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            alertaError.classList.remove('show');
            setTimeout(() => {
                alertaError.style.display = 'none';
            }, 300);
        }, 5000);
    }
}

/**
 * Muestra un mensaje de éxito en el contenedor de alertas
 * @param {string} mensaje - Mensaje de éxito a mostrar
 */
function mostrarMensajeExito(mensaje) {
    const alertaExito = document.getElementById('alertaExito');
    const mensajeExito = document.getElementById('mensajeExito');
    
    if (alertaExito && mensajeExito) {
        mensajeExito.textContent = mensaje;
        alertaExito.style.display = 'block';
        alertaExito.classList.add('show');
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            alertaExito.classList.remove('show');
            setTimeout(() => {
                alertaExito.style.display = 'none';
            }, 300);
        }, 5000);
    }
}