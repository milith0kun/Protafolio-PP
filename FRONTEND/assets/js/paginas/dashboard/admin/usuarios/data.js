/**
 * USUARIOS ADMIN - MÓDULO DATA
 * Operaciones CRUD y manejo de datos de la API
 */

// ================================================
// CONFIGURACIÓN DE ENDPOINTS
// ================================================

const endpoints = {
    usuarios: '/usuarios',
    verificadores: '/usuarios/verificadores',
    asignaciones: '/usuarios/asignaciones'
};

// ================================================
// INICIALIZACIÓN DEL MÓDULO
// ================================================

async function initialize() {
    console.log('📊 Inicializando módulo de datos de usuarios...');
    
    try {
        // Verificar que el core esté inicializado
        if (!window.UsuariosCore?.estaInicializado()) {
            throw new Error('Módulo core no inicializado');
        }
        
        console.log('✅ Módulo de datos de usuarios inicializado');
        return true;
        
    } catch (error) {
        console.error('❌ Error en inicialización de datos usuarios:', error);
        throw error;
    }
}

// ================================================
// OPERACIONES CRUD DE USUARIOS
// ================================================

/**
 * Cargar todos los usuarios
 */
async function cargarUsuarios() {
    console.log('📋 Cargando usuarios...');
    
    try {
        const baseUrl = CONFIG.API.BASE_URL;
        const url = `${baseUrl}${endpoints.usuarios}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'GET'
        });
        
        if (response.success && Array.isArray(response.data)) {
            console.log(`✅ ${response.data.length} usuarios cargados`);
            return response.data;
        } else {
            console.error('❌ Respuesta inválida del servidor:', response);
            throw new Error('Formato de respuesta inválido');
        }
        
    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
        window.UsuariosCore.mostrarError('Error al cargar usuarios: ' + error.message);
        throw error;
    }
}

/**
 * Cargar un usuario específico por ID
 */
async function cargarUsuario(id) {
    console.log('👤 Cargando usuario ID:', id);
    
    if (!id) {
        throw new Error('ID de usuario requerido');
    }
    
    try {
        const baseUrl = CONFIG.API.BASE_URL;
        const url = `${baseUrl}${endpoints.usuarios}/${id}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'GET'
        });
        
        if (response.success && response.data) {
            console.log('✅ Usuario cargado:', response.data.nombres);
            return response.data;
        } else {
            throw new Error('Usuario no encontrado');
        }
        
    } catch (error) {
        console.error('❌ Error cargando usuario:', error);
        window.UsuariosCore.mostrarError('Error al cargar usuario: ' + error.message);
        throw error;
    }
}

/**
 * Guardar usuario (crear o actualizar)
 */
async function guardarUsuario(datosUsuario, esEdicion = false) {
    console.log('💾 Guardando usuario...', { esEdicion, nombres: datosUsuario.nombres });
    
    try {
        // Validar datos básicos
        if (!datosUsuario.nombres || !datosUsuario.correo) {
            throw new Error('Nombre y correo son requeridos');
        }
        
        const baseUrl = CONFIG.API.BASE_URL;
        const method = esEdicion ? 'PUT' : 'POST';
        const url = esEdicion 
            ? `${baseUrl}${endpoints.usuarios}/${datosUsuario.id}`
            : `${baseUrl}${endpoints.usuarios}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: method,
            body: JSON.stringify(datosUsuario)
        });
        
        if (response.success) {
            const accion = esEdicion ? 'actualizado' : 'creado';
            console.log(`✅ Usuario ${accion} exitosamente`);
            window.UsuariosCore.mostrarExito(`Usuario ${accion} exitosamente`);
            return response.data;
        } else {
            throw new Error(response.message || 'Error al guardar usuario');
        }
        
    } catch (error) {
        console.error('❌ Error guardando usuario:', error);
        window.UsuariosCore.mostrarError('Error al guardar usuario: ' + error.message);
        throw error;
    }
}

/**
 * Eliminar usuario
 */
async function eliminarUsuario(id) {
    console.log('🗑️ Eliminando usuario ID:', id);
    
    if (!id) {
        throw new Error('ID de usuario requerido');
    }
    
    try {
        const baseUrl = CONFIG.API.BASE_URL;
        const url = `${baseUrl}${endpoints.usuarios}/${id}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'DELETE'
        });
        
        if (response.success) {
            console.log('✅ Usuario eliminado exitosamente');
            window.UsuariosCore.mostrarExito('Usuario eliminado exitosamente');
            return true;
        } else {
            throw new Error(response.message || 'Error al eliminar usuario');
        }
        
    } catch (error) {
        console.error('❌ Error eliminando usuario:', error);
        window.UsuariosCore.mostrarError('Error al eliminar usuario: ' + error.message);
        throw error;
    }
}

// ================================================
// OPERACIONES DE VERIFICADORES
// ================================================

/**
 * Cargar verificadores disponibles
 */
async function cargarVerificadores() {
    console.log('🔍 Cargando verificadores...');
    
    try {
        const baseUrl = CONFIG.API.BASE_URL;
        const url = `${baseUrl}${endpoints.verificadores}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'GET'
        });
        
        if (response.success && Array.isArray(response.data)) {
            console.log(`✅ ${response.data.length} verificadores cargados`);
            return response.data;
        } else {
            console.warn('⚠️ No se encontraron verificadores o respuesta inválida');
            return [];
        }
        
    } catch (error) {
        console.error('❌ Error cargando verificadores:', error);
        window.UsuariosCore.mostrarError('Error al cargar verificadores: ' + error.message);
        return [];
    }
}

/**
 * Guardar asignación de verificador
 */
async function guardarAsignacionVerificador(datosAsignacion) {
    console.log('🔗 Guardando asignación de verificador...', datosAsignacion);
    
    try {
        // Validar datos
        if (!datosAsignacion.docenteId || !datosAsignacion.verificadorId) {
            throw new Error('ID de docente y verificador son requeridos');
        }
        
        const baseUrl = CONFIG.API.BASE_URL;
        const url = `${baseUrl}${endpoints.asignaciones}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'POST',
            body: JSON.stringify(datosAsignacion)
        });
        
        if (response.success) {
            console.log('✅ Asignación de verificador guardada exitosamente');
            window.UsuariosCore.mostrarExito('Asignación guardada exitosamente');
            return response.data;
        } else {
            throw new Error(response.message || 'Error al guardar asignación');
        }
        
    } catch (error) {
        console.error('❌ Error guardando asignación:', error);
        window.UsuariosCore.mostrarError('Error al guardar asignación: ' + error.message);
        throw error;
    }
}

// ================================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ================================================

/**
 * Buscar usuarios por criterio
 */
async function buscarUsuarios(criterio, valor) {
    console.log('🔍 Buscando usuarios:', { criterio, valor });
    
    try {
        const baseUrl = CONFIG.API.BASE_URL;
        const params = new URLSearchParams();
        params.append(criterio, valor);
        const url = `${baseUrl}${endpoints.usuarios}?${params}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'GET'
        });
        
        if (response.success && Array.isArray(response.data)) {
            console.log(`✅ ${response.data.length} usuarios encontrados`);
            return response.data;
        } else {
            return [];
        }
        
    } catch (error) {
        console.error('❌ Error buscando usuarios:', error);
        return [];
    }
}

/**
 * Obtener estadísticas de usuarios
 */
async function obtenerEstadisticasUsuarios() {
    console.log('📊 Obteniendo estadísticas de usuarios...');
    
    try {
        const baseUrl = CONFIG.API.BASE_URL;
        const url = `${baseUrl}${endpoints.usuarios}/estadisticas`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'GET'
        });
        
        if (response.success && response.data) {
            console.log('✅ Estadísticas obtenidas');
            return response.data;
        } else {
            return {
                totalUsuarios: 0,
                usuariosActivos: 0,
                verificadores: 0,
                administradores: 0
            };
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        return {
            totalUsuarios: 0,
            usuariosActivos: 0,
            verificadores: 0,
            administradores: 0
        };
    }
}

// ================================================
// FUNCIONES DE VALIDACIÓN DE DATOS
// ================================================

/**
 * Validar email único
 */
async function validarEmailUnico(email, idUsuarioExcluir = null) {
    console.log('✅ Validando email único:', email);
    
    try {
        const baseUrl = CONFIG.API.BASE_URL;
        const params = new URLSearchParams();
        params.append('email', email);
        if (idUsuarioExcluir) {
            params.append('excluir_id', idUsuarioExcluir);
        }
        
        const url = `${baseUrl}${endpoints.usuarios}/validar-email?${params}`;
        
        const response = await window.UsuariosCore.realizarPeticionSegura(url, {
            method: 'GET'
        });
        
        return response.success && response.data?.esUnico;
        
    } catch (error) {
        console.error('❌ Error validando email:', error);
        return false;
    }
}

/**
 * Validar formato de datos de usuario
 */
function validarDatosUsuario(datos) {
    const errores = [];
    
    // Validaciones básicas
    if (!datos.nombres || datos.nombres.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!datos.correo || !validarFormatoEmail(datos.correo)) {
        errores.push('El correo electrónico no es válido');
    }
    
    if (!datos.rol_id) {
        errores.push('Debe seleccionar un rol');
    }
    
    // Validación de contraseña solo para nuevos usuarios
    if (!datos.id && (!datos.password || datos.password.length < 6)) {
        errores.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    return {
        esValido: errores.length === 0,
        errores
    };
}

/**
 * Validar formato de email
 */
function validarFormatoEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ================================================
// FUNCIONES DE UTILIDAD
// ================================================

/**
 * Formatear datos de usuario para la tabla
 */
function formatearUsuarioParaTabla(usuario) {
    return {
        id: usuario.id,
        nombres: usuario.nombres || 'Sin nombre',
        correo: usuario.correo || '',
        rol: usuario.rol?.nombre || 'Sin rol',
        estado: usuario.activo ? 'Activo' : 'Inactivo',
        fechaCreacion: formatearFecha(usuario.created_at),
        acciones: generarBotonesAccion(usuario.id)
    };
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    try {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
}

/**
 * Generar botones de acción para la tabla
 */
function generarBotonesAccion(usuarioId) {
    return `
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-primary btn-editar" data-id="${usuarioId}" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-outline-danger btn-eliminar" data-id="${usuarioId}" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// ================================================
// EXPORTACIÓN DEL MÓDULO
// ================================================

window.DataUsuarios = {
    // Inicialización
    initialize,
    
    // CRUD Usuarios
    cargarUsuarios,
    cargarUsuario,
    guardarUsuario,
    eliminarUsuario,
    
    // Verificadores
    cargarVerificadores,
    guardarAsignacionVerificador,
    
    // Búsqueda y filtrado
    buscarUsuarios,
    obtenerEstadisticasUsuarios,
    
    // Validación
    validarEmailUnico,
    validarDatosUsuario,
    validarFormatoEmail,
    
    // Utilidades
    formatearUsuarioParaTabla,
    formatearFecha,
    generarBotonesAccion
};

console.log('✅ Módulo Data de Usuarios cargado'); 