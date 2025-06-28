/**
 * CICLOS - COORDINADOR PRINCIPAL
 * Inicialización y coordinación de todos los módulos
 */

import { CiclosCore } from './core.js';
import { CiclosData } from './data.js';
import { CiclosUI } from './ui.js';
import { CiclosEventos } from './eventos.js';

class CiclosManager {
    constructor() {
        this.debug = window.ciclosDebug || false;
        this.inicializado = false;
        this.modulos = {};
        
        this.log('CiclosManager creado');
    }

    /**
     * Inicializar sistema completo de ciclos
     */
    async inicializar() {
        if (this.inicializado) {
            this.log('Sistema ya inicializado');
            return;
        }

        try {
            this.log('Iniciando inicialización del sistema de ciclos...');
            
            // Fase 1: Crear módulos
            await this.crearModulos();
            
            // Fase 2: Verificar dependencias
            await this.verificarDependencias();
            
            // Fase 3: Configurar componentes
            await this.configurarComponentes();
            
            // Fase 4: Cargar datos iniciales
            await this.cargarDatosIniciales();
            
            // Fase 5: Configurar eventos
            this.configurarEventos();
            
            // Fase 6: Configurar verificación periódica
            this.configurarVerificacionPeriodica();
            
            this.inicializado = true;
            this.log('✅ Sistema de ciclos inicializado exitosamente');
            
            // Emitir evento de inicialización completa
            this.emitirEventoInicializacion();
            
        } catch (error) {
            console.error('❌ Error crítico al inicializar sistema de ciclos:', error);
            this.manejarErrorInicializacion(error);
        }
    }

    /**
     * Crear instancias de todos los módulos
     */
    async crearModulos() {
        this.log('Creando módulos...');
        
        // Orden de creación importante para dependencias
        this.modulos.core = new CiclosCore();
        this.modulos.data = new CiclosData(this.modulos.core);
        this.modulos.ui = new CiclosUI(this.modulos.core, this.modulos.data);
        this.modulos.eventos = new CiclosEventos(this.modulos.core, this.modulos.data, this.modulos.ui);
        
        this.log('Módulos creados:', Object.keys(this.modulos));
    }

    /**
     * Verificar dependencias necesarias
     */
    async verificarDependencias() {
        this.log('Verificando dependencias...');
        
        const dependencias = {
            jquery: typeof $ !== 'undefined',
            datatables: typeof $.fn.DataTable !== 'undefined',
            bootstrap: typeof $.fn.modal !== 'undefined',
            moment: typeof moment !== 'undefined',
            toastr: typeof toastr !== 'undefined',
            swal: typeof Swal !== 'undefined',
            config: typeof CONFIG !== 'undefined' && CONFIG.API?.BASE_URL
        };

        const faltantes = Object.entries(dependencias)
            .filter(([_, disponible]) => !disponible)
            .map(([nombre]) => nombre);

        if (faltantes.length > 0) {
            console.warn('⚠️ Dependencias faltantes:', faltantes);
            
            // Solo toastr y swal son opcionales
            const criticas = faltantes.filter(dep => !['toastr', 'swal'].includes(dep));
            if (criticas.length > 0) {
                throw new Error(`Dependencias críticas faltantes: ${criticas.join(', ')}`);
            }
        }

        this.log('✅ Verificación de dependencias completada');
    }

    /**
     * Configurar componentes de UI
     */
    async configurarComponentes() {
        this.log('Configurando componentes...');
        
        // Configurar toastr
        this.modulos.core.configurarToastr();
        
        // Inicializar DataTable
        const dataTableInicializada = this.modulos.ui.inicializarDataTable();
        if (!dataTableInicializada) {
            throw new Error('No se pudo inicializar la tabla de ciclos');
        }
        
        // Configurar modal
        this.modulos.ui.configurarModalCiclo();
        
        this.log('✅ Componentes configurados');
    }

    /**
     * Cargar datos iniciales
     */
    async cargarDatosIniciales() {
        this.log('Cargando datos iniciales...');
        
        const datosIniciales = await this.modulos.data.obtenerDatosIniciales();
        
        if (datosIniciales.errores.length > 0) {
            console.warn('⚠️ Algunos datos no se pudieron cargar:', datosIniciales.errores);
        }
        
        // Actualizar UI con datos cargados
        if (datosIniciales.ciclos.length > 0) {
            this.modulos.ui.tablaCiclos.clear();
            this.modulos.ui.tablaCiclos.rows.add(datosIniciales.ciclos);
            this.modulos.ui.tablaCiclos.draw();
            
            this.modulos.ui.actualizarEstadisticas(datosIniciales.ciclos);
        }
        
        // Actualizar interfaz de ciclo activo
        this.modulos.ui.actualizarInterfazCicloActivo();
        
        this.log('✅ Datos iniciales cargados');
    }

    /**
     * Configurar eventos
     */
    configurarEventos() {
        this.log('Configurando eventos...');
        this.modulos.eventos.configurarEventos();
        this.log('✅ Eventos configurados');
    }

    /**
     * Configurar verificación periódica del ciclo activo
     */
    configurarVerificacionPeriodica() {
        // Verificar ciclo activo cada 5 minutos
        setInterval(async () => {
            try {
                await this.modulos.data.verificarCicloActivoSilencioso();
            } catch (error) {
                this.log('Error en verificación periódica:', error.message);
            }
        }, 5 * 60 * 1000);
        
        this.log('✅ Verificación periódica configurada');
    }

    /**
     * Emitir evento de inicialización completa
     */
    emitirEventoInicializacion() {
        const evento = new CustomEvent('ciclosSistemaInicializado', {
            detail: {
                timestamp: Date.now(),
                modulos: Object.keys(this.modulos),
                cicloActivo: this.modulos.core.cicloActivo
            }
        });
        
        document.dispatchEvent(evento);
        this.log('🎉 Evento de inicialización emitido');
    }

    /**
     * Manejar error de inicialización
     */
    manejarErrorInicializacion(error) {
        // Mostrar error en interfaz si es posible
        if (typeof toastr !== 'undefined') {
            toastr.error('Error al inicializar el sistema de ciclos académicos');
        }
        
        // Mostrar mensaje de error en la página
        const container = document.getElementById('ciclosContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error de Inicialización</h4>
                    <p>No se pudo inicializar correctamente el sistema de ciclos académicos.</p>
                    <hr>
                    <p class="mb-0">
                        <strong>Error:</strong> ${error.message}<br>
                        <small>Recargue la página o contacte al administrador del sistema.</small>
                    </p>
                </div>
            `;
        }
        
        this.log('❌ Error de inicialización manejado');
    }

    /**
     * Reinicializar sistema (para desarrollo)
     */
    async reinicializar() {
        this.log('🔄 Reinicializando sistema...');
        
        // Destruir módulos existentes
        this.destruir();
        
        // Reinicializar
        await this.inicializar();
        
        this.log('🔄 Sistema reinicializado');
    }

    /**
     * Destruir sistema y limpiar recursos
     */
    destruir() {
        this.log('🧹 Destruyendo sistema...');
        
        try {
            // Destruir módulos en orden inverso
            if (this.modulos.eventos) {
                this.modulos.eventos.destruir();
            }
            
            if (this.modulos.ui) {
                this.modulos.ui.destruir();
            }
            
            // Limpiar referencias
            this.modulos = {};
            this.inicializado = false;
            
            this.log('🧹 Sistema destruido');
        } catch (error) {
            console.error('Error al destruir sistema:', error);
        }
    }

    /**
     * Obtener información de estado del sistema
     */
    obtenerEstado() {
        return {
            inicializado: this.inicializado,
            modulos: Object.keys(this.modulos),
            cicloActivo: this.modulos.core?.cicloActivo,
            estadosModulos: this.modulos.core?.estadosModulos,
            saludModulos: {
                core: this.modulos.core?.verificarSalud(),
                ui: this.modulos.ui?.verificarEstado()
            }
        };
    }

    /**
     * Logging para desarrollo
     */
    log(...args) {
        if (this.debug) {
            console.log('[CiclosManager]', ...args);
        }
    }
}

// Crear instancia global
const ciclosManager = new CiclosManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticación antes de inicializar
    if (typeof verificarAutenticacion === 'function') {
        if (!verificarAutenticacion(['administrador'])) {
            console.log('Usuario no autorizado para acceder a ciclos académicos');
            return;
        }
    }
    
    // Inicializar sistema
    await ciclosManager.inicializar();
});

// Exponer funciones para debugging en desarrollo
if (typeof window !== 'undefined') {
    window.ciclosDebug = window.ciclosDebug || false;
    
    if (window.ciclosDebug) {
        window.CiclosManager = ciclosManager;
        console.log('🔧 Modo debug activado para Ciclos');
        console.log('Acceso: window.CiclosManager');
    }
}

// Exportar para uso en otros módulos si es necesario
export default ciclosManager; 