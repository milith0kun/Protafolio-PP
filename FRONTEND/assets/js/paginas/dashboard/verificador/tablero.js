/**
 * Dashboard del Verificador
 * Funcionalidad específica para el tablero del verificador
 */

/**
 * Inicializar página de verificador
 */
async function inicializarPaginaVerificador() {
  try {
    console.log('🚀 Iniciando tablero de verificador...');
    
    // Verificar que el sistema AUTH esté disponible
    if (typeof AUTH === 'undefined') {
      console.error('❌ Sistema AUTH no disponible');
      alert('Error: Sistema de autenticación no cargado');
      return;
    }

    // Verificar autenticación
    if (!await AUTH.verificarAutenticacion()) {
      console.log('❌ No autenticado, redirigiendo...');
      window.location.href = '../../autenticacion/login.html';
      return;
    }

    // Actualizar información del usuario en el header
    actualizarInformacionUsuarioHeader();
    
    // Configurar selector de roles
    const roleSelect = document.getElementById('userRoleSelect');
    if (roleSelect) {
      // Cargar roles disponibles
      cargarRolesDisponibles();
      
      // Configurar evento de cambio
      roleSelect.addEventListener('change', function() {
        const nuevoRol = this.value;
        if (nuevoRol && nuevoRol !== AUTH.obtenerRolActivo()) {
          cambiarRolDirecto(nuevoRol);
        }
      });
    }
    
    // Inicializar componentes específicos del verificador
    inicializarDashboardVerificador();
    
    console.log('✅ Página de verificador inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar página de verificador:', error);
  }
}

/**
 * Actualizar información del usuario en el header
 */
function actualizarInformacionUsuarioHeader() {
  const usuario = AUTH.obtenerUsuario();
  
  if (usuario) {
    // Actualizar nombre de usuario
    const nombreUsuario = document.getElementById('nombreUsuario');
    if (nombreUsuario) {
      const nombreCompleto = usuario.nombre_completo || usuario.nombres || usuario.nombre || 'Verificador Sistema';
      nombreUsuario.textContent = nombreCompleto;
    }
    
    // Actualizar rol de usuario
    const rolUsuario = document.getElementById('rolUsuario');
    if (rolUsuario) {
      rolUsuario.textContent = 'VERIFICADOR';
    }
    
    // Actualizar información en el dropdown
    const dropdownUserName = document.getElementById('dropdownUserName');
    if (dropdownUserName) {
      const nombreCompleto = usuario.nombre_completo || usuario.nombres || usuario.nombre || 'Verificador Sistema';
      dropdownUserName.textContent = nombreCompleto;
    }
    
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    if (dropdownUserEmail) {
      dropdownUserEmail.textContent = usuario.email || usuario.correo || 'verificador@unsaac.edu.pe';
    }
    
    // Actualizar icono de usuario
    const userIcon = document.querySelector('.user-icon i');
    if (userIcon) {
      userIcon.className = 'fas fa-user-check';
    }
    
    const dropdownUserIcon = document.querySelector('.dropdown-user-icon i');
    if (dropdownUserIcon) {
      dropdownUserIcon.className = 'fas fa-user-check';
    }
    
    console.log('✅ Información del usuario actualizada en el header:', {
      nombre: nombreUsuario?.textContent,
      rol: rolUsuario?.textContent,
      email: dropdownUserEmail?.textContent
    });
  } else {
    console.warn('⚠️ No se pudo obtener la información del usuario');
    
    // Mostrar valores por defecto
    const nombreUsuario = document.getElementById('nombreUsuario');
    if (nombreUsuario) {
      nombreUsuario.textContent = 'Verificador Sistema';
    }
    
    const rolUsuario = document.getElementById('rolUsuario');
    if (rolUsuario) {
      rolUsuario.textContent = 'VERIFICADOR';
    }
  }
}

/**
 * Configurar funcionalidad del dropdown de usuario
 */
function configurarDropdownUsuario() {
  const userDropdownToggle = document.getElementById('userDropdownToggle');
  const userDropdown = document.getElementById('userDropdown');
  const userMenu = document.getElementById('userMenu');

  if (userDropdownToggle && userDropdown && userMenu) {
    console.log('✅ Configurando dropdown de usuario...');
    
    // Asegurar que el dropdown esté cerrado inicialmente
    userDropdown.classList.remove('show');
    userDropdownToggle.classList.remove('active');
    userDropdown.style.display = 'none';
    
    // Toggle del dropdown
    userDropdownToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = userDropdown.classList.contains('show');
      
      if (isOpen) {
        // Cerrar dropdown
        userDropdown.classList.remove('show');
        userDropdownToggle.classList.remove('active');
        userDropdown.style.display = 'none';
        console.log('🔽 Dropdown cerrado');
      } else {
        // Abrir dropdown
        userDropdown.style.display = 'block';
        setTimeout(() => {
          userDropdown.classList.add('show');
          userDropdownToggle.classList.add('active');
        }, 10);
        console.log('🔼 Dropdown abierto');
      }
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
      if (!userMenu.contains(e.target)) {
        userDropdown.classList.remove('show');
        userDropdownToggle.classList.remove('active');
        setTimeout(() => {
          if (!userDropdown.classList.contains('show')) {
            userDropdown.style.display = 'none';
          }
        }, 300);
      }
    });

    // Prevenir que el dropdown se cierre al hacer click dentro
    userDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    // Funcionalidad de los elementos del dropdown
    document.getElementById('logoutOption')?.addEventListener('click', function(e) {
      e.preventDefault();
      cerrarSesionDirecto();
    });

    document.getElementById('profileOption')?.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navegar a perfil');
    });

    document.getElementById('settingsOption')?.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navegar a configuración');
    });

    document.getElementById('helpOption')?.addEventListener('click', function(e) {
      e.preventDefault();
      window.open('../compartidas/ayuda.html', '_blank');
    });
  }
}

/**
 * Cargar roles disponibles para el usuario
 */
async function cargarRolesDisponibles() {
  try {
    const usuario = AUTH.obtenerUsuario();
    const roleSelect = document.getElementById('userRoleSelect');
    
    if (!usuario || !roleSelect) {
      console.warn('⚠️ No se puede cargar roles: usuario o selector no disponible');
      return;
    }
    
    // Limpiar opciones
    roleSelect.innerHTML = '';
    
    // Obtener roles del usuario desde diferentes fuentes
    let rolesUsuario = [];
    
    // 1. Intentar obtener desde usuario.roles (array)
    if (usuario.roles && Array.isArray(usuario.roles)) {
      rolesUsuario = usuario.roles.map(r => typeof r === 'string' ? r : r.nombre || r.rol);
    }
    // 2. Intentar obtener desde usuario.UsuarioRols (Sequelize association)
    else if (usuario.UsuarioRols && Array.isArray(usuario.UsuarioRols)) {
      rolesUsuario = usuario.UsuarioRols.map(ur => ur.rol || ur.nombre);
    }
    // 3. Obtener desde localStorage si está disponible
    else {
      const storedRoles = localStorage.getItem('portafolio_docente_roles_disponibles');
      if (storedRoles) {
        try {
          rolesUsuario = JSON.parse(storedRoles);
        } catch (e) {
          console.warn('⚠️ Error al parsear roles del localStorage');
        }
      }
    }
    
    // 4. Si no hay roles, intentar obtener del servidor
    if (rolesUsuario.length === 0) {
      try {
        const token = AUTH.obtenerToken();
        if (token) {
          const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH}/usuario-actual`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.data && userData.data.roles) {
              rolesUsuario = userData.data.roles.map(r => typeof r === 'string' ? r : r.nombre || r.rol);
              localStorage.setItem('portafolio_docente_roles_disponibles', JSON.stringify(rolesUsuario));
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Error al obtener roles del servidor:', error);
      }
    }
    
    // 5. Fallback: roles basados en contexto actual
    if (rolesUsuario.length === 0) {
      rolesUsuario = ['verificador'];
      
      if (usuario.esDocente || usuario.es_docente) {
        rolesUsuario.push('docente');
      }
      if (usuario.esAdministrador || usuario.es_administrador) {
        rolesUsuario.push('administrador');
      }
    }
    
    // Limpiar y validar roles
    rolesUsuario = [...new Set(rolesUsuario.filter(rol => rol && typeof rol === 'string'))];
    
    const rolActivo = AUTH.obtenerRolActivo() || 'verificador';
    
    // Agregar opciones de roles
    rolesUsuario.forEach(rol => {
      const option = document.createElement('option');
      option.value = rol.toLowerCase();
      
      const nombreRol = {
        'administrador': 'Administrador',
        'admin': 'Administrador',
        'docente': 'Docente',
        'verificador': 'Verificador',
        'supervisor': 'Supervisor'
      }[rol.toLowerCase()] || rol.charAt(0).toUpperCase() + rol.slice(1);
      
      option.textContent = nombreRol;
      
      if (rol.toLowerCase() === rolActivo.toLowerCase()) {
        option.selected = true;
      }
      
      roleSelect.appendChild(option);
    });
    
    console.log('✅ Roles cargados:', {
      usuario: usuario.id || usuario.nombre,
      roles: rolesUsuario,
      activo: rolActivo,
      fuente: usuario.roles ? 'usuario.roles' : usuario.UsuarioRols ? 'UsuarioRols' : 'localStorage/fallback'
    });
    
  } catch (error) {
    console.error('❌ Error al cargar roles:', error);
    
    const roleSelect = document.getElementById('userRoleSelect');
    if (roleSelect) {
      roleSelect.innerHTML = '<option value="verificador" selected>Verificador</option>';
    }
  }
}

/**
 * Cambiar rol de forma directa sin confirmaciones
 */
async function cambiarRolDirecto(nuevoRol) {
  try {
    console.log('🔄 Cambiando rol a:', nuevoRol);
    
    const roleSelect = document.getElementById('userRoleSelect');
    if (roleSelect) {
      roleSelect.disabled = true;
    }
    
    // Actualizar rol en AUTH
    if (window.AUTH && typeof window.AUTH.establecerRolActivo === 'function') {
      window.AUTH.establecerRolActivo(nuevoRol);
    } else {
      localStorage.setItem('portafolio_docente_rol_activo', nuevoRol);
    }
    
    // Actualizar UI inmediatamente
    const rolUsuario = document.getElementById('rolUsuario');
    if (rolUsuario) {
      rolUsuario.textContent = nuevoRol.toUpperCase();
    }
    
    // Mostrar notificación
    if (typeof toastr !== 'undefined') {
      toastr.success(`Rol cambiado a: ${nuevoRol}`, 'Éxito');
    }
    
    // Redirigir según el rol
    console.log('🔄 Preparando redirección para rol:', nuevoRol);
    setTimeout(() => {
      switch(nuevoRol.toLowerCase()) {
        case 'docente':
          console.log('👨‍🏫 Redirigiendo a tablero de docente');
          window.location.href = '../docente/tablero.html';
          break;
        case 'administrador':
        case 'admin':
          console.log('🔧 Redirigiendo a tablero de administrador');
          window.location.href = '../admin/tablero.html';
          break;
        case 'verificador':
          console.log('✅ Recargando tablero de verificador');
          window.location.reload();
          break;
        default:
          console.warn('⚠️ Rol no reconocido:', nuevoRol);
          window.location.href = '../../autenticacion/selector-roles.html';
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error al cambiar rol:', error);
    
    const roleSelect = document.getElementById('userRoleSelect');
    if (roleSelect) {
      roleSelect.disabled = false;
      const rolActivo = AUTH.obtenerRolActivo();
      roleSelect.value = rolActivo;
    }
    
    if (typeof toastr !== 'undefined') {
      toastr.error('Error al cambiar el rol', 'Error');
    }
  }
}

/**
 * Cerrar sesión de forma directa sin confirmaciones
 */
function cerrarSesionDirecto() {
  try {
    console.log('🚪 Cerrando sesión...');
    
    if (window.AUTH && typeof window.AUTH.limpiarSesion === 'function') {
      window.AUTH.limpiarSesion();
    } else {
      localStorage.removeItem('portafolio_docente_token');
      localStorage.removeItem('portafolio_docente_user');
      localStorage.removeItem('portafolio_docente_rol_activo');
      sessionStorage.clear();
    }
    
    if (typeof toastr !== 'undefined') {
      toastr.info('Sesión cerrada exitosamente', 'Hasta luego');
    }
    
    setTimeout(() => {
      window.location.href = '../../autenticacion/login.html';
    }, 500);
    
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    window.location.href = '../../autenticacion/login.html';
  }
}

/**
 * Inicializar componentes específicos del dashboard de verificador
 */
function inicializarDashboardVerificador() {
  console.log('✅ Dashboard de Verificador inicializado');
  
  // Aquí se agregarán las funcionalidades específicas del dashboard de verificador
  // en la Etapa 3 cuando se implemente la verificación de documentos
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
  await inicializarPaginaVerificador();
  configurarDropdownUsuario();
});
