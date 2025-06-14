/**
 * Archivo núcleo - Contiene funciones de utilidad globales
 * Se carga en todas las páginas de la aplicación
 */

// Usamos la configuración global definida en configuracion.js
// Verificamos que esté disponible
if (!window.CONFIG) {
    console.error('La configuración global no está disponible. Asegúrese de cargar configuracion.js antes que nucleo.js');
}

/**
 * Almacena el token JWT en el almacenamiento local
 * @param {string} token - Token JWT
 */
const guardarToken = (token) => {
    localStorage.setItem(window.CONFIG.STORAGE.TOKEN, token);
};

/**
 * Obtiene el token JWT del almacenamiento local
 * @returns {string|null} Token JWT o null si no existe
 */
const obtenerToken = () => {
    return localStorage.getItem(window.CONFIG.STORAGE.TOKEN);
};

/**
 * Elimina el token JWT del almacenamiento local
 */
const eliminarToken = () => {
    localStorage.removeItem(window.CONFIG.STORAGE.TOKEN);
};

/**
 * Almacena la información del usuario en el almacenamiento local
 * @param {Object} usuario - Datos del usuario
 */
const guardarUsuario = (usuario) => {
    localStorage.setItem(window.CONFIG.STORAGE.USER, JSON.stringify(usuario));
};

/**
 * Obtiene la información del usuario del almacenamiento local
 * @returns {Object|null} Datos del usuario o null si no existe
 */
const obtenerUsuario = () => {
    const usuario = localStorage.getItem(window.CONFIG.STORAGE.USER);
    return usuario ? JSON.parse(usuario) : null;
};

/**
 * Elimina la información del usuario del almacenamiento local
 */
const eliminarUsuario = () => {
    localStorage.removeItem(window.CONFIG.STORAGE.USER);
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario está autenticado, false en caso contrario
 */
const estaAutenticado = () => {
    const token = obtenerToken();
    console.log('DEBUG - Verificando autenticación en:', window.location.pathname);
    console.log('DEBUG - Token existe:', !!token);
    return !!token;
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} rol - Rol a verificar
 * @returns {boolean} true si el usuario tiene el rol, false en caso contrario
 */
const tieneRol = (rol) => {
    const usuario = obtenerUsuario();
    return usuario && usuario.rol === rol;
};

/**
 * Redirige al usuario a la página de inicio de sesión
 */
const redirigirALogin = () => {
    console.log('DEBUG - Redirigiendo a login desde:', window.location.pathname);
    console.log('DEBUG - Traza de pila:', new Error().stack);
    // Mostrar alerta antes de redirigir para facilitar depuración
    if (!window.location.pathname.includes('login.html')) {
        alert('Redirigiendo a login desde: ' + window.location.pathname + '\nRevise la consola para más detalles');
    }
    window.location.href = window.CONFIG.ROUTES.LOGIN;
};

/**
 * Realiza una petición HTTP a la API
 * @param {string} endpoint - Endpoint de la API (sin la URL base)
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {Object} [data] - Datos a enviar en el cuerpo de la petición
 * @param {boolean} [auth=true] - Indica si se debe incluir el token de autenticación
 * @returns {Promise<Object>} Respuesta de la API
 */
const apiRequest = async (endpoint, method = 'GET', data = null, auth = true) => {
    const url = `${window.CONFIG.API.BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json'
    };

    // Añadir token de autenticación si es necesario
    if (auth) {
        const token = obtenerToken();
        if (!token) {
            redirigirALogin();
            throw new Error('No se encontró el token de autenticación');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        credentials: 'same-origin'
    };

    // Añadir cuerpo de la petición si es necesario
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        
        // Si la respuesta no es exitosa, lanzar un error
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.mensaje || 'Error en la petición');
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        // Si la respuesta no tiene contenido, devolver null
        if (response.status === 204) {
            return null;
        }

        // Devolver los datos de la respuesta
        return await response.json();
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

/**
 * Muestra un mensaje de error en un elemento del DOM
 * @param {string} mensaje - Mensaje de error a mostrar
 * @param {HTMLElement} elemento - Elemento donde se mostrará el mensaje
 */
const mostrarError = (mensaje, elemento) => {
    if (!elemento) return;
    
    elemento.textContent = mensaje;
    elemento.classList.add('show');
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        elemento.classList.remove('show');
    }, 5000);
};

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
};

// Exportar funciones globales
window.APP = {
    guardarToken,
    obtenerToken,
    eliminarToken,
    guardarUsuario,
    obtenerUsuario,
    eliminarUsuario,
    estaAutenticado,
    tieneRol,
    redirigirALogin,
    apiRequest,
    mostrarError,
    formatearFecha
};
