/**
 * Dashboard del Administrador
 * Funcionalidad específica para el tablero del administrador
 */

document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  if (!APP.estaAutenticado()) {
    APP.redirigirALogin();
    return;
  }
  
  // Verificar rol correcto
  const usuario = APP.obtenerUsuario();
  if (!usuario || usuario.rolActual !== 'administrador') {
    APP.redirigirASelector();
    return;
  }
  
  // Inicializar componentes del dashboard
  inicializarDashboard();
  
  // Configurar eventos
  configurarEventos();
  
  // Cargar datos iniciales
  cargarDatosIniciales();
});

/**
 * Inicializa los componentes del dashboard
 */
function inicializarDashboard() {
  console.log('Dashboard de Administrador inicializado');
  
  // Inicializar tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Inicializar popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

/**
 * Configura los eventos del dashboard
 */
function configurarEventos() {
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
  
  // Configurar botón de inicio de carga masiva
  const startUploadBtn = document.getElementById('startUploadBtn');
  if (startUploadBtn) {
    startUploadBtn.addEventListener('click', iniciarCargaMasiva);
  }
  
  // Configurar filtros de actividad
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover clase active de todos los botones
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Agregar clase active al botón clickeado
      this.classList.add('active');
      
      // Filtrar actividades
      const filter = this.getAttribute('data-filter');
      filtrarActividades(filter);
    });
  });
}

/**
 * Carga los datos iniciales del dashboard
 */
async function cargarDatosIniciales() {
  try {
    // Mostrar loading
    mostrarLoading(true);
    
    // Cargar métricas
    await cargarMetricas();
    
    // Cargar ciclo actual
    await cargarCicloActual();
    
    // Cargar actividades recientes
    await cargarActividadesRecientes();
    
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
    APP.mostrarNotificacion('Error al cargar los datos del dashboard', 'error');
  } finally {
    // Ocultar loading
    mostrarLoading(false);
  }
}

/**
 * Carga las métricas del sistema
 */
async function cargarMetricas() {
  try {
    const response = await fetch(`${CONFIG.API.BASE_URL}/dashboard/metricas`, {
      headers: {
        'Authorization': `Bearer ${APP.obtenerToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar métricas');
    }
    
    const data = await response.json();
    
    // Actualizar métricas de usuarios
    actualizarElemento('totalUsers', data.usuarios.total);
    actualizarElemento('activeUsers', data.usuarios.activos);
    actualizarElemento('pendingUsers', data.usuarios.pendientes);
    
    // Actualizar distribución de roles
    actualizarElemento('teacherCount', data.roles.docentes);
    actualizarElemento('verifierCount', data.roles.verificadores);
    actualizarElemento('adminCount', data.roles.administradores);
    
    // Actualizar estadísticas de documentos
    actualizarElemento('totalDocuments', data.documentos.total);
    actualizarElemento('approvedDocuments', data.documentos.aprobados);
    actualizarElemento('pendingDocuments', data.documentos.pendientes);
    actualizarElemento('observedDocuments', data.documentos.observados);
    
  } catch (error) {
    console.error('Error al cargar métricas:', error);
    throw error;
  }
}

/**
 * Carga la información del ciclo académico actual
 */
async function cargarCicloActual() {
  try {
    const response = await fetch(`${CONFIG.API.BASE_URL}/ciclos/actual`, {
      headers: {
        'Authorization': `Bearer ${APP.obtenerToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar ciclo actual');
    }
    
    const ciclo = await response.json();
    
    if (ciclo) {
      actualizarElemento('currentCycle', ciclo.nombre);
      actualizarElemento('cycleStartDate', new Date(ciclo.fechaInicio).toLocaleDateString());
      actualizarElemento('cycleEndDate', new Date(ciclo.fechaFin).toLocaleDateString());
      
      // Calcular progreso del ciclo
      const hoy = new Date();
      const fechaInicio = new Date(ciclo.fechaInicio);
      const fechaFin = new Date(ciclo.fechaFin);
      const duracionTotal = fechaFin - fechaInicio;
      const diasTranscurridos = hoy - fechaInicio;
      const porcentajeCompletado = Math.min(100, Math.max(0, (diasTranscurridos / duracionTotal) * 100));
      
      // Actualizar barra de progreso
      const progressFill = document.querySelector('.cycle-progress .progress-fill');
      const progressText = document.querySelector('.cycle-progress .progress-text');
      
      if (progressFill && progressText) {
        progressFill.style.width = `${porcentajeCompletado}%`;
        progressText.textContent = `${Math.round(porcentajeCompletado)}% completado`;
      }
    }
    
  } catch (error) {
    console.error('Error al cargar ciclo actual:', error);
    throw error;
  }
}

/**
 * Carga las actividades recientes
 */
async function cargarActividadesRecientes() {
  try {
    const response = await fetch(`${CONFIG.API.BASE_URL}/actividades/recientes`, {
      headers: {
        'Authorization': `Bearer ${APP.obtenerToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar actividades recientes');
    }
    
    const actividades = await response.json();
    const container = document.getElementById('activityList');
    
    if (container && actividades.length > 0) {
      // Limpiar contenedor
      container.innerHTML = '';
      
      // Agregar cada actividad
      actividades.forEach(actividad => {
        const actividadElement = crearElementoActividad(actividad);
        container.appendChild(actividadElement);
      });
    }
    
  } catch (error) {
    console.error('Error al cargar actividades recientes:', error);
    throw error;
  }
}

/**
 * Crea un elemento de actividad para la lista
 */
function crearElementoActividad(actividad) {
  const item = document.createElement('div');
  item.className = `activity-item ${actividad.tipo}`;
  
  // Determinar ícono según el tipo de actividad
  let icono = 'fa-info-circle';
  switch(actividad.tipo) {
    case 'usuario':
      icono = 'fa-user-plus';
      break;
    case 'documento':
      icono = 'fa-file-upload';
      break;
    case 'sistema':
      icono = 'fa-cog';
      break;
  }
  
  // Formatear fecha
  const fecha = new Date(actividad.fecha);
  const fechaFormateada = fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  item.innerHTML = `
    <div class="activity-icon"><i class="fas ${icono}"></i></div>
    <div class="activity-content">
      <div class="activity-title">${actividad.titulo}</div>
      <div class="activity-details">${actividad.descripcion}</div>
      <div class="activity-time">${fechaFormateada}</div>
    </div>
  `;
  
  return item;
}

/**
 * Filtra las actividades según el tipo
 */
function filtrarActividades(filtro) {
  const actividades = document.querySelectorAll('.activity-item');
  
  actividades.forEach(actividad => {
    if (filtro === 'all') {
      actividad.style.display = 'flex';
    } else {
      if (actividad.classList.contains(filtro)) {
        actividad.style.display = 'flex';
      } else {
        actividad.style.display = 'none';
      }
    }
  });
}

/**
 * Inicia el proceso de carga masiva
 */
async function iniciarCargaMasiva() {
  try {
    // Mostrar diálogo de selección de archivos
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.xlsx,.xls';
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      
      // Validar que se hayan seleccionado archivos
      if (files.length === 0) {
        APP.mostrarNotificacion('No se seleccionaron archivos', 'advertencia');
        return;
      }
      
      // Validar extensión de archivos
      const archivosInvalidos = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return !['xlsx', 'xls'].includes(extension);
      });
      
      if (archivosInvalidos.length > 0) {
        APP.mostrarNotificacion(
          `Formato no válido en ${archivosInvalidos.length} archivo(s). Solo se permiten archivos Excel (.xlsx, .xls)`,
          'error'
        );
        return;
      }
      
      // Mostrar confirmación
      const confirmacion = await APP.mostrarConfirmacion(
        'Iniciar carga masiva',
        `¿Está seguro de iniciar la carga masiva con ${files.length} archivo(s)? Esta operación puede tardar varios minutos.`,
        'question',
        'Sí, iniciar',
        'Cancelar'
      );
      
      if (confirmacion) {
        // Iniciar proceso de carga
        await procesarCargaMasiva(files);
      }
    };
    
    // Disparar el diálogo de selección de archivos
    input.click();
    
  } catch (error) {
    console.error('Error al iniciar carga masiva:', error);
    APP.mostrarNotificacion('Error al iniciar la carga masiva', 'error');
  }
}

/**
 * Procesa la carga masiva de archivos
 */
async function procesarCargaMasiva(archivos) {
  const progressBar = document.querySelector('#uploadProgress .progress');
  const progressText = document.querySelector('#uploadProgress .progress-text');
  const uploadSection = document.getElementById('uploadProgress');
  
  try {
    // Mostrar sección de progreso
    if (uploadSection) uploadSection.style.display = 'block';
    
    // Ordenar archivos según el orden de procesamiento requerido
    const archivosOrdenados = ordenarArchivos(archivos);
    
    // Crear FormData para enviar los archivos
    const formData = new FormData();
    archivosOrdenados.forEach((archivo, index) => {
      formData.append('archivos', archivo);
    });
    
    // Configurar la petición fetch con eventos de progreso
    const xhr = new XMLHttpRequest();
    
    // Configurar eventos de progreso
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const porcentaje = Math.round((event.loaded / event.total) * 100);
        if (progressBar) progressBar.style.width = `${porcentaje}%`;
        if (progressText) progressText.textContent = `${porcentaje}% completado`;
      }
    });
    
    // Configurar evento de carga completada
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        APP.mostrarNotificacion('Carga masiva completada con éxito', 'exito');
        
        // Recargar datos del dashboard
        cargarDatosIniciales();
        
      } else {
        const error = JSON.parse(xhr.responseText);
        throw new Error(error.mensaje || 'Error en la carga masiva');
      }
    });
    
    // Configurar evento de error
    xhr.addEventListener('error', () => {
      throw new Error('Error de conexión durante la carga masiva');
    });
    
    // Iniciar la petición
    xhr.open('POST', '/api/inicializacion', true);
    xhr.setRequestHeader('Authorization', `Bearer ${APP.obtenerToken()}`);
    xhr.send(formData);
    
  } catch (error) {
    console.error('Error en carga masiva:', error);
    APP.mostrarNotificacion(`Error: ${error.message}`, 'error');
    
    // Ocultar barra de progreso en caso de error
    if (uploadSection) uploadSection.style.display = 'none';
  }
}

/**
 * Ordena los archivos según el orden de procesamiento requerido
 */
function ordenarArchivos(archivos) {
  // Definir el orden de procesamiento de los archivos
  const ordenArchivos = [
    '01_usuarios',
    '02_ciclos',
    '03_asignaturas',
    '04_docentes',
    '05_verificadores',
    '06_estructura_portafolio',
    '07_asignaciones',
    '08_parametros'
  ];
  
  return archivos.sort((a, b) => {
    const nombreA = a.name.toLowerCase();
    const nombreB = b.name.toLowerCase();
    
    const indiceA = ordenArchivos.findIndex(prefijo => nombreA.startsWith(prefijo));
    const indiceB = ordenArchivos.findIndex(prefijo => nombreB.startsWith(prefijo));
    
    // Si ambos tienen prefijo conocido, ordenar según el orden definido
    if (indiceA !== -1 && indiceB !== -1) {
      return indiceA - indiceB;
    }
    
    // Si solo uno tiene prefijo conocido, ponerlo primero
    if (indiceA !== -1) return -1;
    if (indiceB !== -1) return 1;
    
    // Si ninguno tiene prefijo conocido, ordenar alfabéticamente
    return nombreA.localeCompare(nombreB);
  });
}

/**
 * Muestra u oculta el indicador de carga
 */
function mostrarLoading(mostrar) {
  const loadingElement = document.getElementById('loadingOverlay');
  if (loadingElement) {
    loadingElement.style.display = mostrar ? 'flex' : 'none';
  }
}

/**
 * Actualiza el contenido de un elemento
 */
function actualizarElemento(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}
