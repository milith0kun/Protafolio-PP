/**
 * TABLERO ADMIN - COORDINADOR PRINCIPAL
 * Punto de entrada que coordina todos los módulos
 */

// ================================================
// INFORMACIÓN DEL SISTEMA MODULAR
// ================================================

console.log(`
🚀 SISTEMA TABLERO ADMINISTRADOR MODULAR
================================================
📂 Módulos disponibles:
   • Core     → Inicialización y autenticación
   • Data     → Manejo de datos y API
   • UI       → Interfaz de usuario y renderizado  
   • Eventos  → Manejo de eventos e interacciones
================================================
`);

// ================================================
// ESTADO DE INICIALIZACIÓN
// ================================================

const sistemaTablero = {
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
async function inicializarSistemaTablero() {
    if (sistemaTablero.inicializando || sistemaTablero.inicializado) {
        console.warn('⚠️ Sistema ya está inicializando o inicializado');
        return;
    }
    
    sistemaTablero.inicializando = true;
    console.log('🔧 Iniciando sistema modular del tablero...');
    
    try {
        // 1. Verificar disponibilidad de módulos
        await verificarModulosDisponibles();
        
        // 2. Inicializar módulos en orden de dependencia
        await inicializarModulos();
        
        // 3. Verificar inicialización completa
        verificarInicializacionCompleta();
        
        // 4. Configurar manejo de errores global
        configurarManejoErrores();
        
        sistemaTablero.inicializado = true;
        console.log('✅ Sistema tablero inicializado completamente');
        
        // 5. Emitir evento de sistema listo
        emitirEventoSistemaListo();
        
    } catch (error) {
        console.error('❌ Error fatal en inicialización del sistema:', error);
        sistemaTablero.errores.push(error);
        mostrarErrorFatal(error);
    } finally {
        sistemaTablero.inicializando = false;
    }
}

// ================================================
// VERIFICACIÓN DE MÓDULOS
// ================================================

async function verificarModulosDisponibles() {
    console.log('🔍 Verificando disponibilidad de módulos...');
    
    const modulos = [
        { nombre: 'TableroCore', archivo: 'core.js' },
        { nombre: 'DataTablero', archivo: 'data.js' },
        { nombre: 'UITablero', archivo: 'ui.js' },
        { nombre: 'EventosTablero', archivo: 'eventos.js' }
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
        throw new Error(`Módulos faltantes: ${modulosFaltantes.map(m => m.nombre).join(', ')}`);
    }
}

// ================================================
// INICIALIZACIÓN DE MÓDULOS
// ================================================

async function inicializarModulos() {
    console.log('🔄 Inicializando módulos en orden de dependencia...');
    
    // Orden de inicialización basado en dependencias
    const ordenInicializacion = [
        { nombre: 'core', modulo: window.TableroCore, descripcion: 'Core del sistema' },
        { nombre: 'data', modulo: window.DataTablero, descripcion: 'Manejo de datos' },
        { nombre: 'ui', modulo: window.UITablero, descripcion: 'Interfaz de usuario' },
        { nombre: 'eventos', modulo: window.EventosTablero, descripcion: 'Eventos del sistema' }
    ];
    
    for (const { nombre, modulo, descripcion } of ordenInicializacion) {
        try {
            console.log(`🔧 Inicializando ${descripcion}...`);
            
            if (modulo && typeof modulo.initialize === 'function') {
                await modulo.initialize();
                sistemaTablero.modulos[nombre] = true;
                console.log(`✅ ${descripcion} inicializado`);
            } else {
                console.warn(`⚠️ Módulo ${nombre} no tiene método initialize`);
                sistemaTablero.modulos[nombre] = 'sin-initialize';
            }
            
        } catch (error) {
            console.error(`❌ Error inicializando ${descripcion}:`, error);
            sistemaTablero.errores.push({ modulo: nombre, error });
            
            // Continuar con otros módulos en caso de error no crítico
            if (nombre === 'core') {
                throw error; // Core es crítico
            }
        }
    }
}

// ================================================
// VERIFICACIONES POST-INICIALIZACIÓN
// ================================================

function verificarInicializacionCompleta() {
    console.log('🔍 Verificando estado de inicialización...');
    
    const estadoModulos = Object.entries(sistemaTablero.modulos)
        .map(([nombre, estado]) => ({ nombre, estado }));
    
    console.table(estadoModulos);
    
    const modulosExitosos = estadoModulos.filter(m => m.estado === true).length;
    const totalModulos = estadoModulos.length;
    
    console.log(`📊 Resumen: ${modulosExitosos}/${totalModulos} módulos inicializados correctamente`);
    
    if (modulosExitosos === 0) {
        throw new Error('Ningún módulo se inicializó correctamente');
    }
    
    if (sistemaTablero.errores.length > 0) {
        console.warn(`⚠️ Se encontraron ${sistemaTablero.errores.length} errores durante la inicialización`);
    }
}

// ================================================
// MANEJO DE ERRORES GLOBAL
// ================================================

function configurarManejoErrores() {
    // Manejar errores no capturados del sistema
    window.addEventListener('error', (event) => {
        if (event.filename?.includes('tablero/')) {
            console.error('❌ Error en módulo del tablero:', {
                mensaje: event.message,
                archivo: event.filename,
                linea: event.lineno,
                columna: event.colno,
                error: event.error
            });
            
            sistemaTablero.errores.push({
                tipo: 'runtime',
                evento: event,
                timestamp: Date.now()
            });
        }
    });
    
    // Manejar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Promesa rechazada en sistema tablero:', event.reason);
        
        sistemaTablero.errores.push({
            tipo: 'promise',
            razon: event.reason,
            timestamp: Date.now()
        });
    });
    
    console.log('✅ Manejo de errores global configurado');
}

// ================================================
// EVENTOS DEL SISTEMA
// ================================================

function emitirEventoSistemaListo() {
    const evento = new CustomEvent('tablero:sistema-listo', {
        detail: {
            modulos: sistemaTablero.modulos,
            errores: sistemaTablero.errores,
            timestamp: Date.now()
        },
        bubbles: true
    });
    
    document.dispatchEvent(evento);
    console.log('📡 Evento sistema-listo emitido');
}

// ================================================
// FUNCIONES DE UTILIDAD PÚBLICA
// ================================================

/**
 * Obtener estado actual del sistema
 */
function obtenerEstadoSistema() {
    return {
        ...sistemaTablero,
        version: '1.0.0',
        timestamp: Date.now()
    };
}

/**
 * Reinicializar sistema (para debugging)
 */
async function reinicializarSistema() {
    console.log('🔄 Reinicializando sistema...');
    
    // Resetear estado
    Object.keys(sistemaTablero.modulos).forEach(key => {
        sistemaTablero.modulos[key] = false;
    });
    sistemaTablero.inicializado = false;
    sistemaTablero.errores = [];
    
    // Reinicializar
    await inicializarSistemaTablero();
}

/**
 * Verificar salud del sistema
 */
function verificarSaludSistema() {
    const modulosActivos = Object.values(sistemaTablero.modulos)
        .filter(estado => estado === true).length;
    
    const totalModulos = Object.keys(sistemaTablero.modulos).length;
    const porcentajeSalud = (modulosActivos / totalModulos) * 100;
    
    const salud = {
        porcentaje: porcentajeSalud,
        estado: porcentajeSalud === 100 ? 'excelente' : 
                porcentajeSalud >= 75 ? 'bueno' : 
                porcentajeSalud >= 50 ? 'regular' : 'crítico',
        modulos: sistemaTablero.modulos,
        errores: sistemaTablero.errores.length,
        inicializado: sistemaTablero.inicializado
    };
    
    console.log('🏥 Estado de salud del sistema:', salud);
    return salud;
}

// ================================================
// MANEJO DE ERRORES FATALES
// ================================================

function mostrarErrorFatal(error) {
    console.error('💀 ERROR FATAL DEL SISTEMA:', error);
    
    // Intentar mostrar error en la interfaz si está disponible
    if (window.UITablero?.mostrarErrorEnInterfaz) {
        window.UITablero.mostrarErrorEnInterfaz('Error fatal del sistema. Recarga la página.');
    } else {
        // Fallback: mostrar alerta
        setTimeout(() => {
            alert(`Error fatal del sistema: ${error.message}\n\nPor favor, recarga la página.`);
        }, 100);
    }
}

// ================================================
// FUNCIONES DE DEBUGGING
// ================================================

function habilitarModoDebug() {
    window.TABLERO_DEBUG = true;
    console.log('🐛 Modo debug habilitado');
    
    // Exponer funciones de debugging
    window.tableroDebug = {
        estado: obtenerEstadoSistema,
        reinicializar: reinicializarSistema,
        salud: verificarSaludSistema,
        errores: () => sistemaTablero.errores
    };
}

// ================================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaTablero);
} else {
    // DOM ya está listo
    inicializarSistemaTablero();
}

// ================================================
// EXPORTACIÓN GLOBAL
// ================================================

window.SistemaTablero = {
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

console.log('✅ Coordinador principal del tablero cargado'); 