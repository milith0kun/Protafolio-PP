/**
 * USUARIOS ADMIN - COORDINADOR PRINCIPAL
 * Punto de entrada que coordina todos los módulos de usuarios
 */

// ================================================
// INFORMACIÓN DEL SISTEMA MODULAR
// ================================================

console.log(`
🚀 SISTEMA GESTIÓN DE USUARIOS MODULAR
================================================
📂 Módulos disponibles:
   • Core     → Autenticación y configuración
   • Data     → Operaciones CRUD y API
   • UI       → Interfaz de usuario y DataTable
   • Eventos  → Manejo de eventos e interacciones
================================================
`);

// ================================================
// ESTADO DE INICIALIZACIÓN
// ================================================

const sistemaUsuarios = {
    modulos: {
        core: false,
        data: false,
        ui: false,
        eventos: false
    },
    inicializado: false,
    inicializando: false,
    errores: []
};

// ================================================
// INICIALIZACIÓN PRINCIPAL
// ================================================

/**
 * Función principal de inicialización del sistema
 */
async function inicializarSistemaUsuarios() {
    if (sistemaUsuarios.inicializando || sistemaUsuarios.inicializado) {
        console.warn('⚠️ Sistema usuarios ya está inicializando o inicializado');
        return;
    }
    
    sistemaUsuarios.inicializando = true;
    console.log('🔧 Iniciando sistema modular de usuarios...');
    
    try {
        // 1. Verificar disponibilidad de módulos
        await verificarModulosDisponibles();
        
        // 2. Inicializar módulos en orden de dependencia
        await inicializarModulos();
        
        // 3. Cargar datos iniciales
        await cargarDatosIniciales();
        
        // 4. Configurar manejo de errores global
        configurarManejoErrores();
        
        sistemaUsuarios.inicializado = true;
        console.log('✅ Sistema usuarios inicializado completamente');
        
        // 5. Emitir evento de sistema listo
        emitirEventoSistemaListo();
        
    } catch (error) {
        console.error('❌ Error fatal en inicialización del sistema usuarios:', error);
        sistemaUsuarios.errores.push(error);
        mostrarErrorFatal(error);
    } finally {
        sistemaUsuarios.inicializando = false;
    }
}

// ================================================
// VERIFICACIÓN DE MÓDULOS
// ================================================

async function verificarModulosDisponibles() {
    console.log('🔍 Verificando disponibilidad de módulos usuarios...');
    
    const modulos = [
        { nombre: 'UsuariosCore', archivo: 'core.js' },
        { nombre: 'DataUsuarios', archivo: 'data.js' },
        { nombre: 'UIUsuarios', archivo: 'ui.js' },
        { nombre: 'EventosUsuarios', archivo: 'eventos.js' }
    ];
    
    const modulosFaltantes = [];
    
    modulos.forEach(modulo => {
        if (!window[modulo.nombre]) {
            modulosFaltantes.push(modulo);
            console.error(`❌ Módulo ${modulo.nombre} no disponible (${modulo.archivo})`);
        } else {
            console.log(`✅ Módulo ${modulo.nombre} disponible`);
        }
    });
    
    if (modulosFaltantes.length > 0) {
        throw new Error(`Módulos usuarios faltantes: ${modulosFaltantes.map(m => m.nombre).join(', ')}`);
    }
}

// ================================================
// INICIALIZACIÓN DE MÓDULOS
// ================================================

async function inicializarModulos() {
    console.log('🔄 Inicializando módulos usuarios en orden de dependencia...');
    
    // Orden de inicialización basado en dependencias
    const ordenInicializacion = [
        { nombre: 'core', modulo: window.UsuariosCore, descripcion: 'Core del sistema usuarios' },
        { nombre: 'data', modulo: window.DataUsuarios, descripcion: 'Manejo de datos usuarios' },
        { nombre: 'ui', modulo: window.UIUsuarios, descripcion: 'Interfaz de usuario' },
        { nombre: 'eventos', modulo: window.EventosUsuarios, descripcion: 'Eventos del sistema' }
    ];
    
    for (const { nombre, modulo, descripcion } of ordenInicializacion) {
        try {
            console.log(`🔧 Inicializando ${descripcion}...`);
            
            if (modulo && typeof modulo.initialize === 'function') {
                await modulo.initialize();
                sistemaUsuarios.modulos[nombre] = true;
                console.log(`✅ ${descripcion} inicializado`);
            } else {
                console.warn(`⚠️ Módulo ${nombre} no tiene método initialize`);
                sistemaUsuarios.modulos[nombre] = 'sin-initialize';
            }
            
        } catch (error) {
            console.error(`❌ Error inicializando ${descripcion}:`, error);
            sistemaUsuarios.errores.push({ modulo: nombre, error });
            
            // Core es crítico, otros módulos pueden fallar
            if (nombre === 'core') {
                throw error;
            }
        }
    }
}

// ================================================
// CARGA DE DATOS INICIALES
// ================================================

async function cargarDatosIniciales() {
    console.log('📊 Cargando datos iniciales de usuarios...');
    
    try {
        // Verificar que el módulo UI esté inicializado
        if (sistemaUsuarios.modulos.ui && window.UIUsuarios) {
            await window.UIUsuarios.actualizarTabla();
            console.log('✅ Tabla de usuarios cargada');
        }
        
        // Cargar estadísticas si es necesario
        if (sistemaUsuarios.modulos.data && window.DataUsuarios) {
            const estadisticas = await window.DataUsuarios.obtenerEstadisticasUsuarios();
            console.log('📈 Estadísticas usuarios:', estadisticas);
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        // No es crítico, continuar
    }
}

// ================================================
// MANEJO DE ERRORES GLOBAL
// ================================================

function configurarManejoErrores() {
    // Manejar errores no capturados del sistema usuarios
    window.addEventListener('error', (event) => {
        if (event.filename?.includes('usuarios/')) {
            console.error('❌ Error en módulo usuarios:', {
                mensaje: event.message,
                archivo: event.filename,
                linea: event.lineno,
                error: event.error
            });
            
            sistemaUsuarios.errores.push({
                tipo: 'runtime',
                evento: event,
                timestamp: Date.now()
            });
        }
    });
    
    console.log('✅ Manejo de errores usuarios configurado');
}

// ================================================
// EVENTOS DEL SISTEMA
// ================================================

function emitirEventoSistemaListo() {
    const evento = new CustomEvent('usuarios:sistema-listo', {
        detail: {
            modulos: sistemaUsuarios.modulos,
            errores: sistemaUsuarios.errores,
            timestamp: Date.now()
        },
        bubbles: true
    });
    
    document.dispatchEvent(evento);
    console.log('📡 Evento usuarios:sistema-listo emitido');
}

// ================================================
// FUNCIONES DE UTILIDAD PÚBLICA
// ================================================

/**
 * Obtener estado actual del sistema usuarios
 */
function obtenerEstadoSistema() {
    return {
        ...sistemaUsuarios,
        version: '1.0.0',
        timestamp: Date.now()
    };
}

/**
 * Reinicializar sistema usuarios (para debugging)
 */
async function reinicializarSistema() {
    console.log('🔄 Reinicializando sistema usuarios...');
    
    // Resetear estado
    Object.keys(sistemaUsuarios.modulos).forEach(key => {
        sistemaUsuarios.modulos[key] = false;
    });
    sistemaUsuarios.inicializado = false;
    sistemaUsuarios.errores = [];
    
    // Reinicializar
    await inicializarSistemaUsuarios();
}

/**
 * Verificar salud del sistema usuarios
 */
function verificarSaludSistema() {
    const modulosActivos = Object.values(sistemaUsuarios.modulos)
        .filter(estado => estado === true).length;
    
    const totalModulos = Object.keys(sistemaUsuarios.modulos).length;
    const porcentajeSalud = (modulosActivos / totalModulos) * 100;
    
    const salud = {
        porcentaje: porcentajeSalud,
        estado: porcentajeSalud === 100 ? 'excelente' : 
                porcentajeSalud >= 75 ? 'bueno' : 
                porcentajeSalud >= 50 ? 'regular' : 'crítico',
        modulos: sistemaUsuarios.modulos,
        errores: sistemaUsuarios.errores.length,
        inicializado: sistemaUsuarios.inicializado
    };
    
    console.log('🏥 Estado de salud sistema usuarios:', salud);
    return salud;
}

// ================================================
// MANEJO DE ERRORES FATALES
// ================================================

function mostrarErrorFatal(error) {
    console.error('💀 ERROR FATAL SISTEMA USUARIOS:', error);
    
    // Intentar mostrar error en la interfaz si está disponible
    if (window.UIUsuarios?.mostrarError) {
        window.UIUsuarios.mostrarError('Error fatal del sistema de usuarios. Recarga la página.');
    } else {
        setTimeout(() => {
            alert(`Error fatal del sistema de usuarios: ${error.message}\n\nPor favor, recarga la página.`);
        }, 100);
    }
}

// ================================================
// FUNCIONES DE DEBUGGING
// ================================================

function habilitarModoDebug() {
    window.USUARIOS_DEBUG = true;
    console.log('🐛 Modo debug usuarios habilitado');
    
    // Exponer funciones de debugging
    window.usuariosDebug = {
        estado: obtenerEstadoSistema,
        reinicializar: reinicializarSistema,
        salud: verificarSaludSistema,
        errores: () => sistemaUsuarios.errores,
        recargarTabla: () => window.UIUsuarios?.actualizarTabla(),
        abrirNuevo: () => window.EventosUsuarios?.abrirModalNuevo()
    };
}

// ================================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(inicializarSistemaUsuarios, 500); // Delay para asegurar carga completa
    });
} else {
    // DOM ya está listo
    setTimeout(inicializarSistemaUsuarios, 500);
}

// ================================================
// EXPORTACIÓN GLOBAL
// ================================================

window.SistemaUsuarios = {
    // Estado
    obtenerEstado: obtenerEstadoSistema,
    verificarSalud: verificarSaludSistema,
    
    // Control
    reinicializar: reinicializarSistema,
    habilitarDebug: habilitarModoDebug,
    
    // Información
    version: '1.0.0',
    autor: 'Sistema Portafolio Docente'
};

console.log('✅ Coordinador principal de usuarios cargado'); 