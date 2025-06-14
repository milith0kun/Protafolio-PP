/**
 * Dashboard del Verificador
 * Funcionalidad específica para el tablero del verificador
 */

document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  if (!APP.estaAutenticado()) {
    APP.redirigirALogin();
    return;
  }
  
  // Verificar rol correcto
  const usuario = APP.obtenerUsuario();
  if (!usuario || usuario.rolActual !== 'verificador') {
    APP.redirigirASelector();
    return;
  }
  
  // Mostrar nombre del usuario
  const nombreUsuarioElement = document.getElementById('nombreUsuario');
  if (nombreUsuarioElement) {
    nombreUsuarioElement.textContent = usuario.nombre || 'Usuario';
  }
  
  // Configurar botón de cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      APP.cerrarSesion();
    });
  }
  
  // Configurar botón de cambiar rol
  const btnCambiarRol = document.getElementById('btnCambiarRol');
  if (btnCambiarRol) {
    btnCambiarRol.addEventListener('click', function(e) {
      e.preventDefault();
      APP.redirigirASelector();
    });
  }
  
  // Inicializar componentes del dashboard
  inicializarDashboard();
});

/**
 * Inicializa los componentes del dashboard
 */
function inicializarDashboard() {
  console.log('Dashboard de Verificador inicializado');
  
  // Aquí se agregarán las funcionalidades específicas del dashboard de verificador
  // en la Etapa 3 cuando se implemente la verificación de documentos
}
