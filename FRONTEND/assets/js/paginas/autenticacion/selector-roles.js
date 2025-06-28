/**
 * Script optimizado para el selector de roles
 * Maneja la selección de rol de forma eficiente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎭 Inicializando selector de roles...');
    
    // Inicializar después de un breve delay para asegurar que AUTH esté listo
    setTimeout(() => {
        inicializarSelectorRoles();
    }, 100);
});

/**
 * Función principal de inicialización
 */
function inicializarSelectorRoles() {
    // Verificar autenticación
    if (!AUTH?.verificarAutenticacion()) {
        console.log('❌ Usuario no autenticado, redirigiendo al login');
        window.location.href = 'login.html';
        return;
    }
    
    const usuario = AUTH.obtenerUsuario();
    const rolesDisponibles = AUTH.obtenerRolesDisponibles();
    
    if (!usuario) {
        mostrarError('No se pudo obtener información del usuario');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    // Configurar interfaz
    mostrarInformacionUsuario(usuario);
    cargarRolesDisponibles(rolesDisponibles);
    configurarEventos();
}

/**
 * Mostrar información del usuario en la interfaz
 */
function mostrarInformacionUsuario(usuario) {
    const elementos = {
        nombreUsuario: document.getElementById('nombreUsuario'),
        nombreCompletoUsuario: document.getElementById('nombreCompletoUsuario')
    };
    
    if (elementos.nombreUsuario) {
        elementos.nombreUsuario.textContent = usuario.nombres || 'Usuario';
    }
    
    if (elementos.nombreCompletoUsuario) {
        elementos.nombreCompletoUsuario.textContent = `${usuario.nombres} ${usuario.apellidos}` || 'Usuario';
    }
    
    console.log('✅ Información de usuario mostrada');
}

/**
 * Cargar y mostrar roles disponibles
 */
function cargarRolesDisponibles(roles) {
    const contenedorRoles = document.getElementById('contenedor-roles');
    
    if (!contenedorRoles) {
        console.error('❌ Contenedor de roles no encontrado');
        return;
    }
    
    try {
        mostrarSpinner(true);
        ocultarAlerta();
        
        console.log('DEBUG - Roles obtenidos:', roles);
        
        if (!roles || roles.length === 0) {
            mostrarError('No tiene roles asignados. Contacte al administrador.');
            return;
        }
        
        // Si solo hay un rol, seleccionarlo automáticamente
        if (roles.length === 1) {
            console.log('✅ Solo un rol disponible, seleccionando automáticamente');
            seleccionarRol(roles[0].rol);
            return;
        }
        
        // Generar tarjetas de roles
        generarTarjetasRoles(roles, contenedorRoles);
        
    } catch (error) {
        console.error('❌ Error al cargar roles:', error);
        mostrarError('Error al cargar roles. Intente nuevamente.');
    } finally {
        mostrarSpinner(false);
    }
}

/**
 * Generar tarjetas HTML para los roles
 */
function generarTarjetasRoles(roles, contenedor) {
    contenedor.innerHTML = '';
    
    roles.forEach((rol, index) => {
        const rolCard = document.createElement('div');
        rolCard.className = 'rol-card';
        rolCard.dataset.rolId = rol.id || index;
        rolCard.dataset.rolNombre = rol.rol;
        
        const icono = obtenerIconoRol(rol.rol);
        
        rolCard.innerHTML = `
            <div class="rol-icon">
                <i class="fas fa-${icono}"></i>
            </div>
            <div class="rol-info">
                <h3>${rol.rol}</h3>
                <p>${obtenerDescripcionRol(rol.rol)}</p>
            </div>
            <div class="rol-action">
                <button class="btn btn-primary btn-seleccionar-rol" data-rol="${rol.rol}">
                    <i class="fas fa-check-circle me-2"></i>Seleccionar
                </button>
            </div>
        `;
        
        // Agregar efectos hover
        configurarEfectosHover(rolCard);
        
        contenedor.appendChild(rolCard);
    });
    
    console.log('✅ Tarjetas de roles generadas');
}

/**
 * Configurar efectos hover para las tarjetas de rol
 */
function configurarEfectosHover(rolCard) {
    rolCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    rolCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
    });
}

/**
 * Configurar eventos de la página (una sola vez)
 */
function configurarEventos() {
    // Usar delegación de eventos para evitar múltiples listeners
    document.addEventListener('click', manejadorClicks);
    document.addEventListener('keydown', manejadorTeclado);
    
    console.log('✅ Eventos configurados');
}

/**
 * Manejador unificado de clicks
 */
function manejadorClicks(e) {
    // Manejar clicks en botones de rol
    if (e.target.classList.contains('btn-seleccionar-rol') || e.target.closest('.btn-seleccionar-rol')) {
        e.preventDefault();
        const boton = e.target.classList.contains('btn-seleccionar-rol') ? e.target : e.target.closest('.btn-seleccionar-rol');
        const rol = boton.dataset.rol;
        
        if (rol && !boton.disabled) {
            seleccionarRol(rol, boton);
        }
        return;
    }
    
    // Manejar click en cerrar sesión
    if (e.target.id === 'btnCerrarSesion' || e.target.closest('#btnCerrarSesion')) {
        e.preventDefault();
        cerrarSesion();
        return;
    }
}

/**
 * Manejador de teclado para accesos rápidos
 */
function manejadorTeclado(e) {
    // Escape para cerrar sesión
    if (e.key === 'Escape') {
        cerrarSesion();
        return;
    }
    
    // Números 1-3 para seleccionar roles rápidamente
    if (['1', '2', '3'].includes(e.key)) {
        const botones = document.querySelectorAll('.btn-seleccionar-rol');
        const indice = parseInt(e.key) - 1;
        
        if (botones[indice] && !botones[indice].disabled) {
            botones[indice].click();
        }
    }
}

/**
 * Seleccionar un rol específico
 */
async function seleccionarRol(rol, botonElemento = null) {
    console.log('🎭 Seleccionando rol:', rol);
    
    // Configurar estado de carga
    if (botonElemento) {
        const textoOriginal = botonElemento.innerHTML;
        botonElemento.disabled = true;
        botonElemento.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Seleccionando...';
        
        // Restaurar botón después de un tiempo
        setTimeout(() => {
            botonElemento.disabled = false;
            botonElemento.innerHTML = textoOriginal;
        }, 3000);
    }
    
    try {
        const resultado = await AUTH.seleccionarRol(rol);
        console.log('📥 Resultado selección rol:', resultado);
        
        if (resultado.exito) {
            mostrarExito('¡Rol seleccionado exitosamente! Redirigiendo...');
            
            setTimeout(() => {
                console.log('🚀 Redirigiendo al dashboard:', resultado.redirigirA);
                window.location.href = resultado.redirigirA;
            }, 1500);
        } else {
            mostrarError(resultado.mensaje || 'Error al seleccionar rol');
        }
        
    } catch (error) {
        console.error('❌ Error al seleccionar rol:', error);
        mostrarError('Error de conexión. Intente nuevamente.');
    }
}

/**
 * Cerrar sesión del usuario
 */
function cerrarSesion() {
    if (AUTH?.cerrarSesion) {
        AUTH.cerrarSesion();
    } else {
        window.location.href = 'login.html';
    }
}

/**
 * Mostrar/ocultar spinner de carga
 */
function mostrarSpinner(mostrar) {
    const spinner = document.getElementById('spinner-carga');
    if (spinner) {
        spinner.classList.toggle('d-none', !mostrar);
    }
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    const alertaError = document.getElementById('alerta-error');
    const textoError = document.getElementById('texto-error');
    
    if (alertaError && textoError) {
        textoError.textContent = mensaje;
        alertaError.classList.remove('d-none');
    }
    
    console.error('❌ Error:', mensaje);
}

/**
 * Mostrar mensaje de éxito
 */
function mostrarExito(mensaje) {
    const alertaExito = document.getElementById('alerta-exito');
    const textoExito = document.getElementById('texto-exito');
    
    if (alertaExito && textoExito) {
        textoExito.textContent = mensaje;
        alertaExito.classList.remove('d-none');
    }
    
    console.log('✅', mensaje);
}

/**
 * Ocultar alertas
 */
function ocultarAlerta() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.classList.add('d-none');
    });
}

/**
 * Obtener icono según el rol
 */
function obtenerIconoRol(rol) {
    const iconos = {
        'administrador': 'cogs',
        'docente': 'graduation-cap',
        'verificador': 'check-circle'
    };
    
    return iconos[rol.toLowerCase()] || 'user';
}

/**
 * Obtener descripción según el rol
 */
function obtenerDescripcionRol(rol) {
    const descripciones = {
        'administrador': 'Gestión completa del sistema, usuarios y configuraciones',
        'docente': 'Gestión de portafolios académicos y documentos',
        'verificador': 'Revisión y validación de documentos académicos'
    };
    
    return descripciones[rol.toLowerCase()] || 'Acceso al sistema con permisos específicos';
}

console.log('✅ Script de selector de roles optimizado inicializado'); 