/**
 * Módulo para el selector de roles
 * Maneja la carga y selección de roles disponibles para el usuario
 */

document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  if (!APP.estaAutenticado()) {
    APP.redirigirALogin();
    return;
  }
  
  // Obtener datos del usuario
  const usuario = APP.obtenerUsuario();
  if (!usuario) {
    APP.redirigirALogin();
    return;
  }
  
  // Mostrar nombre del usuario
  const nombreUsuarioElement = document.getElementById('nombreUsuario');
  const nombreCompletoUsuarioElement = document.getElementById('nombreCompletoUsuario');
  
  if (nombreUsuarioElement) {
    nombreUsuarioElement.textContent = usuario.nombre || 'Usuario';
  }
  
  if (nombreCompletoUsuarioElement) {
    nombreCompletoUsuarioElement.textContent = `${usuario.nombre} ${usuario.apellido}` || 'Usuario';
  }
  
  // Cargar roles disponibles
  cargarRolesDisponibles();
  
  // Configurar botón de cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      window.autenticacion.cerrarSesion();
    });
  }
});

/**
 * Carga los roles disponibles para el usuario
 * Actualizado para usar los roles almacenados en el objeto usuario
 */
function cargarRolesDisponibles() {
  const contenedorRoles = document.getElementById('contenedor-roles');
  const spinnerCarga = document.getElementById('spinner-carga');
  const alertaError = document.getElementById('alerta-error');
  const textoError = document.getElementById('texto-error');
  
  if (!contenedorRoles) return;
  
  try {
    // Mostrar spinner de carga
    spinnerCarga.classList.remove('d-none');
    
    // Ocultar alerta de error si estaba visible
    alertaError.classList.add('d-none');
    
    // Obtener roles del objeto usuario almacenado
    const usuario = APP.obtenerUsuario();
    const roles = usuario?.roles || [];
    console.log('DEBUG - Roles obtenidos del usuario:', roles);
    
    // Ocultar spinner de carga
    spinnerCarga.classList.add('d-none');
    
    // Si no hay roles disponibles
    if (roles.length === 0) {
      textoError.textContent = 'No tiene roles asignados. Contacte al administrador.';
      alertaError.classList.remove('d-none');
      return;
    }
    
    // Limpiar contenedor
    contenedorRoles.innerHTML = '';
    
    // Crear tarjetas de roles
    roles.forEach(rol => {
      const rolCard = document.createElement('div');
      rolCard.className = 'rol-card';
      rolCard.dataset.rolId = rol.id;
      
      // Determinar icono según el rol
      let icono = 'user';
      const rolNombre = rol.rol ? rol.rol.toLowerCase() : '';
      
      if (rolNombre === 'administrador') {
        icono = 'user-shield';
      } else if (rolNombre === 'verificador') {
        icono = 'user-check';
      } else if (rolNombre === 'docente') {
        icono = 'user-graduate';
      }
      
      rolCard.innerHTML = `
        <div class="rol-icon">
          <i class="fas fa-${icono}"></i>
        </div>
        <div class="rol-info">
          <h3>${rol.rol}</h3>
          <p>${getDescripcionRol(rol.rol)}</p>
        </div>
        <div class="rol-action">
          <button class="btn btn-primary" onclick="window.selectorRoles.seleccionarRol(${rol.id}, '${rol.rol}')">Seleccionar</button>
        </div>
      `;
      
      // Agregar al contenedor
      contenedorRoles.appendChild(rolCard);
    });
    
  } catch (error) {
    console.error('Error al cargar roles:', error);
    
    // Ocultar spinner de carga
    spinnerCarga.classList.add('d-none');
    
    // Mostrar mensaje de error
    textoError.textContent = 'Error al cargar roles. Intente nuevamente.';
    alertaError.classList.remove('d-none');
  }
}

/**
 * Obtiene la descripción de un rol
 * @param {string} nombreRol - Nombre del rol
 * @returns {string} Descripción del rol
 */
function getDescripcionRol(nombreRol) {
  if (!nombreRol) return '';
  
  const rolLower = typeof nombreRol === 'string' ? nombreRol.toLowerCase() : nombreRol;
  
  switch (rolLower) {
    case 'administrador':
      return 'Acceso completo al sistema y gestión de usuarios';
    case 'docente':
      return 'Gestión de portafolios y documentación académica';
    case 'verificador':
      return 'Revisión y validación de portafolios docentes';
    default:
      return 'Rol del sistema';
  }
}

/**
 * Selecciona un rol y redirige al dashboard correspondiente
 * @param {number} rolId - ID del rol seleccionado
 * @param {string} nombreRol - Nombre del rol seleccionado
 */
async function seleccionarRol(rolId, nombreRol) {
  if (!rolId || !nombreRol) {
    console.error('ID o nombre de rol no proporcionados');
    return;
  }
  
  console.log(`Seleccionando rol: ${nombreRol} (ID: ${rolId})`);
  
  // Mostrar indicador de carga
  const boton = document.querySelector(`.rol-card[data-rol-id="${rolId}"] button`);
  const textoOriginal = boton ? boton.innerHTML : '';
  if (boton) {
    boton.disabled = true;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
  }
  
  try {
    // Intentar actualizar el rol en el backend (pero no bloquear si falla)
    try {
      await APP.apiRequest('/cambiar-rol', 'POST', {
        rolId: rolId
      }, true);
    } catch (error) {
      console.warn('No se pudo actualizar el rol en el backend, continuando con la actualización local:', error);
      // Continuamos con la actualización local aunque falle la llamada al backend
    }
    
    // Actualizar el rol actual en el almacenamiento local
    const usuario = APP.obtenerUsuario();
    if (usuario) {
      usuario.rolActual = nombreRol.toLowerCase();
      APP.guardarUsuario(usuario);
      console.log('Rol actualizado en almacenamiento local:', usuario.rolActual);
    }
    
    // Redirigir al dashboard correspondiente
    console.log('Redirigiendo a dashboard para rol:', nombreRol.toLowerCase());
    redirigirSegunRol(nombreRol.toLowerCase());
    
  } catch (error) {
    console.error('Error al seleccionar rol:', error);
    alert('Error al seleccionar rol. Intente nuevamente.');
    
    // Restaurar el botón
    if (boton) {
      boton.disabled = false;
      boton.innerHTML = textoOriginal;
    }
  }
}

/**
 * Redirige al usuario al dashboard correspondiente según su rol
 * @param {string} rol - Rol del usuario
 */
function redirigirSegunRol(rol) {
  if (!rol) {
    console.error('No se especificó un rol para la redirección');
    return;
  }
  
  console.log('Redirigiendo según rol:', rol);
  
  // Normalizar el rol a minúsculas para comparación
  const rolLower = typeof rol === 'string' ? rol.toLowerCase() : rol;
  
  // Definir rutas según el rol
  let rutaDestino;
  
  switch (rolLower) {
    case 'administrador':
      rutaDestino = window.CONFIG.ROUTES.DASHBOARD_ADMIN;
      break;
    case 'docente':
      rutaDestino = window.CONFIG.ROUTES.DASHBOARD_DOCENTE;
      break;
    case 'verificador':
      rutaDestino = window.CONFIG.ROUTES.DASHBOARD_VERIFICADOR;
      break;
    default:
      console.error('Rol no reconocido:', rol);
      alert('Rol no reconocido. Contacte al administrador.');
      return;
  }
  
  console.log('Redirigiendo a:', rutaDestino);
  window.location.href = rutaDestino;
}

// Exportar funciones para uso global si es necesario
window.selectorRoles = {
  cargarRolesDisponibles,
  seleccionarRol
};