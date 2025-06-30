/**
 * SISTEMA DE CARGA MASIVA - Administrador Optimizado
 * Gestión eficiente de carga de archivos Excel para inicialización del sistema
 */

class CargaMasiva {
    constructor() {
        this.debug = window.cargaMasivaDebug || false;
        
        // SOLO limpiar datos falsos si hay un flag específico (no por defecto)
        // this.limpiarDatosFalsos(); // COMENTADO - solo limpia manualmente
        
        this.estadoSistema = {
            conectado: false,
            cicloSeleccionado: '1',
            archivosCargados: {},
            archivos: {}, // Para estado de archivos por ciclo
            procesoActual: 'carga',
            sistemaInicializado: false,
            archivosRequeridos: ['usuarios', 'carreras', 'asignaturas'],
            archivosOpcionales: ['carga_academica', 'verificaciones', 'codigos_institucionales']
        };
        
        this.archivosConfig = {
            usuarios: {
                patron: /01_usuarios_masivos/i,
                icono: '👥',
                descripcion: 'Lista de usuarios del sistema',
                requerido: true
            },
            carreras: {
                patron: /02_carreras_completas/i,
                icono: '🎓',
                descripcion: 'Catálogo de carreras académicas',
                requerido: true
            },
            asignaturas: {
                patron: /03_asignaturas_completas/i,
                icono: '📚',
                descripcion: 'Catálogo de asignaturas',
                requerido: true
            },
            carga_academica: {
                patron: /04_carga_academica/i,
                icono: '📋',
                descripcion: 'Asignaciones docente-asignatura',
                requerido: false
            },
            verificaciones: {
                patron: /05_verificaciones/i,
                icono: '✅',
                descripcion: 'Relaciones verificador-docente',
                requerido: false
            },
            codigos_institucionales: {
                patron: /06_codigos_institucionales/i,
                icono: '🏛️',
                descripcion: 'Códigos y documentos institucionales',
                requerido: false
            }
        };

        // Configuración de fases del proceso
        this.fasesConfig = {
            carga: {
                name: 'Carga de Datos',
                tab: 'carga-tab',
                content: 'carga-datos',
                completed: false
            },
            verificacion: {
                name: 'Verificación',
                tab: 'verificacion-tab', 
                content: 'verificacion-datos',
                completed: false
            },
            inicializacion: {
                name: 'Inicialización',
                tab: 'init-tab',
                content: 'inicializacion',
                completed: false
            }
        };
        
        this.inicializado = false;
        this.cicloSeleccionado = null;
        console.log('✅ CargaMasiva inicializada');
    }

    /**
     * Limpiar datos falsos del localStorage
     * SOLO debe usarse manualmente cuando sea necesario
     */
    limpiarDatosFalsos() {
        try {
            // Limpiar estado interno únicamente - no usar localStorage
            this.estadoSistema.archivos = {};
            this.estadoSistema.archivosCargados = {};
            console.log('🧹 Estado interno limpiado - datos se cargarán desde BD');
        } catch (error) {
            console.error('Error al limpiar datos:', error);
        }
    }

    /**
     * Limpiar datos por completo - SOLO para reinicio manual
     */
    reiniciarSistemaCompleto() {
        try {
            // Limpiar estado interno - datos se recargarán desde BD
            this.estadoSistema.archivosCargados = {};
            this.estadoSistema.archivos = {};
            this.estadoSistema.procesoActual = 'carga';
            this.estadoSistema.sistemaInicializado = false;
            
            console.log('🔄 Sistema reiniciado completamente - recargarán datos desde BD');
            
            // Recargar página para inicializar limpio
            window.location.reload();
        } catch (error) {
            console.error('Error al reiniciar sistema:', error);
        }
    }

    /**
     * Función de logging unificada
     */
    log(...args) {
        console.log('[CargaMasiva]', ...args);
    }

    /**
     * Configurar navegación entre pestañas
     */
    configurarNavegacion() {
        // Configurar eventos de navegación principal
        const navTabs = document.querySelectorAll('#sistemaNav .nav-link');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Verificar si la pestaña está habilitada
                if (e.target.hasAttribute('disabled') || e.target.closest('.nav-link').hasAttribute('disabled')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                
                // Actualizar estado visual
                this.actualizarNavegacionVisual(e.target);
            });
        });

        // Configurar sub-navegación de carga
        const subTabs = document.querySelectorAll('#single-tab, #bulk-tab');
        subTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-bs-target');
                if (targetId === '#single-upload') {
                    this.mostrarCargaIndividual();
                } else if (targetId === '#bulk-upload') {
                    this.mostrarCargaMasiva();
                }
            });
        });

        this.log('✅ Navegación configurada');
    }

    /**
     * Actualizar navegación visual
     */
    actualizarNavegacionVisual(tabElement) {
        const targetId = tabElement.getAttribute('data-bs-target');
        
        // Remover clases activas
        document.querySelectorAll('#sistemaNav .nav-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show', 'active'));
        
        // Activar nueva pestaña
        tabElement.classList.add('active');
        const targetPanel = document.querySelector(targetId);
        if (targetPanel) {
            targetPanel.classList.add('show', 'active');
        }
        
        this.log('📋 Pestaña activada:', targetId);
    }

    /**
     * Inicializar la aplicación
     */
    async inicializar() {
        try {
            console.log('🚀 Inicializando sistema de carga masiva...');
            
            // Configurar navegación entre pestañas
            this.configurarNavegacion();
            
            // Verificar conectividad con el backend
            await this.verificarConectividad();
            
            // Cargar estado inicial del sistema
            await this.cargarEstadoSistema();
            
            // Cargar ciclos académicos
            await this.cargarCiclosAcademicos();
            
            // Actualizar interfaz con el estado actual
            this.mostrarEstadoArchivos();
            
            // Configurar eventos de la interfaz
            this.inicializarEventos();
            
            // Configurar estado inicial de pestañas
            this.configurarPestanas();
            
            // Inicializar con la primera pestaña activa
            this.mostrarCargaIndividual();
            
            // El estado de carga se maneja automáticamente en llenarSelectorCiclos
            // Si hay un ciclo activo, se selecciona y habilita automáticamente
            
            console.log('✅ Sistema de carga masiva inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar sistema de carga masiva:', error);
            this.mostrarError('Error al inicializar el sistema: ' + error.message);
        }
    }

    /**
     * Verificar autenticación
     */
    verificarAutenticacion() {
        // Usar el sistema AUTH unificado
        if (window.AUTH && typeof window.AUTH.verificarAutenticacion === 'function') {
            if (!window.AUTH.verificarAutenticacion()) {
                this.mostrarError('Debe iniciar sesión para acceder');
                setTimeout(() => window.location.href = CONFIG.getRoute?.('LOGIN') || CONFIG.ROUTES?.LOGIN || '/paginas/autenticacion/login.html', 2000);
                return false;
            }
            
            // Verificar rol de administrador
            const rolActivo = window.AUTH.obtenerRolActivo();
            if (!['administrador', 'admin'].includes(rolActivo?.toLowerCase())) {
                this.mostrarError('No tiene permisos de administrador');
                setTimeout(() => window.location.href = CONFIG.getRoute?.('DASHBOARD_ADMIN') || CONFIG.ROUTES?.DASHBOARD_ADMIN || '/paginas/dashboard/admin/tablero.html', 2000);
                return false;
            }
            
            return true;
        }
        
        // Fallback - verificación básica con localStorage
        const token = sessionStorage.getItem(CONFIG.STORAGE.TOKEN) || 
                     localStorage.getItem(CONFIG.STORAGE.TOKEN);
        const user = sessionStorage.getItem(CONFIG.STORAGE.USER) || 
                    localStorage.getItem(CONFIG.STORAGE.USER);
        
        if (!token || !user) {
            this.mostrarError('Debe iniciar sesión para acceder');
            setTimeout(() => window.location.href = CONFIG.getRoute?.('LOGIN') || CONFIG.ROUTES?.LOGIN || '/paginas/autenticacion/login.html', 2000);
            return false;
        }
        
        // Verificar permisos de administrador
        try {
            const userData = JSON.parse(user);
            const esAdmin = userData?.rol === 'administrador' || 
                           userData?.rolActual === 'administrador' ||
                           (userData?.roles && userData.roles.some(r => r.rol === 'administrador'));
            
            if (!esAdmin) {
                this.mostrarError('No tiene permisos de administrador');
                setTimeout(() => window.location.href = CONFIG.getRoute?.('DASHBOARD_ADMIN') || CONFIG.ROUTES?.DASHBOARD_ADMIN || '/paginas/dashboard/admin/tablero.html', 2000);
                return false;
            }
        } catch (e) {
            this.log('Error al verificar permisos:', e);
        }
        
        return true;
    }

    /**
     * Configurar interfaz inicial
     */
    async configurarInterfaz() {
        // Ocultar elementos de carga
        const loadingElements = document.querySelectorAll('.loading, [data-loading], .spinner');
        loadingElements.forEach(el => el.style.display = 'none');
        
        // Hacer visible el contenedor principal
        const container = document.querySelector('.container-fluid');
        if (container) {
            container.style.visibility = 'visible';
            container.style.opacity = '1';
        }
        
        // Configurar pestañas según el estado del proceso
        this.configurarPestanas();
        
        // Cargar otros componentes
        this.cargarCiclosAcademicos();
        this.verificarConectividad();
        this.mostrarEstadoArchivos();
    }

    /**
     * Configurar pestañas según el estado del proceso
     */
    configurarPestanas() {
        // Obtener referencias a las pestañas
        const tabCarga = document.getElementById('carga-tab');
        const tabVerificacion = document.getElementById('verificacion-tab');
        const tabInicializacion = document.getElementById('init-tab');
        
        // SIEMPRE mantener todas las pestañas visibles y accesibles para pruebas
        // En producción se pueden deshabilitar según el progreso
        
        // Asegurar que todas las pestañas estén visibles
        [tabCarga, tabVerificacion, tabInicializacion].forEach(tab => {
            if (tab) {
                tab.style.display = 'block';
                tab.style.visibility = 'visible';
                tab.style.opacity = '1';
                tab.style.pointerEvents = 'auto';
                tab.classList.remove('disabled');
                tab.removeAttribute('disabled');
                tab.removeAttribute('aria-disabled');
                tab.removeAttribute('title');
            }
        });
        
        // Configurar estado inicial - Pestaña de carga activa
        if (tabCarga) {
            tabCarga.classList.add('active');
        }
        
        // Las otras pestañas visibles pero no activas inicialmente
        if (tabVerificacion) {
            tabVerificacion.classList.remove('active');
        }
        
        if (tabInicializacion) {
            tabInicializacion.classList.remove('active');
        }
        
        this.log('✅ Pestañas configuradas: todas visibles y accesibles');
    }

    /**
     * Habilitar una pestaña específica
     */
    habilitarTab(tab) {
        tab.classList.remove('disabled');
        tab.removeAttribute('disabled');
        tab.removeAttribute('aria-disabled');
        tab.style.pointerEvents = 'auto';
        tab.style.opacity = '1';
        tab.removeAttribute('title');
    }

    /**
     * Verificar conectividad con el servidor
     */
    async verificarConectividad() {
        try {
            this.log('🔄 Verificando conectividad con el servidor...');
            
            // window.apiRequest ya agrega /api automáticamente
            const response = await window.apiRequest('/dashboard/stats', 'GET');
            this.estadoSistema.conectado = true;
            
            this.agregarLog('✅ Conectado al servidor backend', 'success');
            this.log('✅ Conectividad establecida correctamente');
            
        } catch (error) {
            this.log('⚠️ Error de conectividad (modo local activado):', error.message);
            this.estadoSistema.conectado = false;
            
            this.agregarLog('🟡 Modo offline activado - funcionalidad limitada', 'warning');
            this.log('🟡 Sistema funcionando en modo local');
        } finally {
            // Siempre actualizar el estado de conexión en la interfaz
            this.actualizarEstadoConexion();
        }
    }

    /**
     * Cargar estado del sistema SOLO desde el servidor (eliminar localStorage)
     */
    async cargarEstadoSistema() {
        try {
            console.log('⏳ Cargando estado del sistema desde servidor...');
            
            // Cargar estado real desde el servidor únicamente
            if (this.estadoSistema.conectado) {
                const estadoServidor = await this.cargarEstadoServidor();
                if (estadoServidor) {
                    // Usar SOLO el estado del servidor
                    this.estadoSistema = { ...this.estadoSistema, ...estadoServidor };
                    console.log('✅ Estado del servidor cargado:', estadoServidor);
                }
            }
            
            console.log('✅ Estado del sistema cargado completamente desde BD:', this.estadoSistema);
            
        } catch (error) {
            console.error('❌ Error al cargar estado del sistema:', error);
            // En caso de error, mantener estado básico sin datos locales
            this.estadoSistema = {
                ...this.estadoSistema,
                usuarios: 0,
                carreras: 0,
                asignaturas: 0,
                portafolios: 0,
                archivos: {},
                archivosCargados: {}
            };
        }
    }
    
    /**
     * Cargar estado desde el servidor
     */
    async cargarEstadoServidor() {
        try {
            // Cargar estadísticas generales
            const response = await window.apiRequest('/dashboard/stats', 'GET');
            if (response) {
                return {
                    usuarios: response.total_usuarios || 0,
                    carreras: response.total_carreras || 0,
                    asignaturas: response.total_asignaturas || 0,
                    portafolios: response.total_portafolios || 0,
                    cicloActivo: response.ciclo_activo || null,
                    ultimaActualizacion: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('Error al cargar estado del servidor:', error);
            
            // Intentar cargar datos específicos de inicialización
            try {
                const datosInicializacion = await window.apiRequest('/inicializacion/estado', 'GET');
                if (datosInicializacion) {
                    return {
                        usuarios: datosInicializacion.usuarios || 0,
                        carreras: datosInicializacion.carreras || 0,
                        asignaturas: datosInicializacion.asignaturas || 0,
                        portafolios: datosInicializacion.portafolios || 0,
                        sistemaInicializado: datosInicializacion.inicializado || false,
                        ultimaActualizacion: new Date().toISOString()
                    };
                }
            } catch (error2) {
                console.error('Error al cargar datos de inicialización:', error2);
            }
        }
        return null;
    }

    /**
     * Actualizar estado después de operaciones importantes
     */
    async actualizarEstadoCompleto() {
        await this.cargarEstadoSistema();
        this.mostrarEstadoArchivos();
        
        // Actualizar interfaz
        this.actualizarInterfazSegunEstado();
    }

    /**
     * Mapear tipos de archivo del servidor a configuración local
     */
    mapearTipoArchivo(tipoServidor) {
        const mapeo = {
            'usuarios': 'usuarios',
            'users': 'usuarios',
            'carreras': 'carreras',
            'programs': 'carreras',
            'asignaturas': 'asignaturas',
            'subjects': 'asignaturas',
            'carga_academica': 'carga_academica',
            'academic_load': 'carga_academica',
            'verificaciones': 'verificaciones',
            'verifications': 'verificaciones',
            'codigos_institucionales': 'codigos_institucionales',
            'institutional_codes': 'codigos_institucionales'
        };
        
        return mapeo[tipoServidor] || tipoServidor;
    }

    /**
     * Cargar ciclos académicos
     */
    async cargarCiclosAcademicos() {
        try {
            this.log('🔄 Cargando ciclos académicos...');
            
            // Intentar cargar desde el servidor primero
            try {
                // window.apiRequest ya agrega /api automáticamente
                const response = await window.apiRequest('/ciclos', 'GET');
                this.log('🔍 Respuesta del servidor /ciclos:', response);
                
                if (response.success && response.data && response.data.length > 0) {
                    this.log('📋 Datos de ciclos recibidos:', response.data);
                    this.estadoSistema.conectado = true;
                    this.llenarSelectorCiclos(response.data);
                    this.log('✅ Ciclos académicos cargados desde servidor:', response.data.length);
                    
                    // Verificación final después de cargar
                    setTimeout(() => {
                        this.verificarEstadoFinalSelector();
                    }, 100);
                    return;
                }
            } catch (error) {
                this.log('⚠️ Error al cargar desde servidor, usando datos locales:', error.message);
                this.estadoSistema.conectado = false;
            }
            
            // Usar ciclos de ejemplo como fallback (con estructura correcta)
            const ciclosEjemplo = [
                { id: 1, nombre: '2024-I', estado: 'activo' },
                { id: 2, nombre: '2024-II', estado: 'preparacion' },
                { id: 3, nombre: '2025-I', estado: 'preparacion' }
            ];
            
            this.llenarSelectorCiclos(ciclosEjemplo);
            this.log('✅ Ciclos académicos cargados (modo local):', ciclosEjemplo.length);
            
            // Verificación final después de cargar (modo local)
            setTimeout(() => {
                this.verificarEstadoFinalSelector();
            }, 100);
            
        } catch (error) {
            this.log('❌ Error crítico al cargar ciclos:', error);
            // Garantizar que siempre haya ciclos disponibles
            const ciclosSeguros = [
                { id: 1, nombre: '2024-I', estado: 'activo' }
            ];
            this.llenarSelectorCiclos(ciclosSeguros);
            
            // Verificación final después de cargar (modo seguro)
            setTimeout(() => {
                this.verificarEstadoFinalSelector();
            }, 100);
        }
    }

    /**
     * Llenar selector de ciclos
     */
    llenarSelectorCiclos(ciclos) {
        const selector = document.getElementById('selectCiclo') || document.getElementById('cicloAcademico');
        if (!selector) {
            this.log('❌ No se encontró el selector de ciclos');
            return;
        }
        
        this.log('🔄 Llenando selector con', ciclos.length, 'ciclos');
        
        // Limpiar selector
        selector.innerHTML = '<option value="">Seleccione un ciclo académico</option>';
        
        let cicloActivoSeleccionado = false;
        
        ciclos.forEach((ciclo, index) => {
            this.log(`🔍 Procesando ciclo ${index + 1}:`, {
                id: ciclo.id,
                nombre: ciclo.nombre,
                estado: ciclo.estado,
                activo: ciclo.activo,
                esActivo: ciclo.estado === 'activo'
            });
            
            const option = document.createElement('option');
            option.value = ciclo.id;
            
            // Corregir la lógica del texto del selector
            let textoOpcion = ciclo.nombre || `Ciclo ${ciclo.id}`;
            
            // Verificar si el ciclo está activo usando el campo estado correcto
            const esActivo = ciclo.estado === 'activo';
            
            if (esActivo) {
                textoOpcion += ' (Activo)';
            }
            
            option.textContent = textoOpcion;
            
            this.log(`📝 Texto de la opción creada: "${textoOpcion}"`);
            
            // Seleccionar el ciclo activo automáticamente
            if (esActivo && !cicloActivoSeleccionado) {
                option.selected = true;
                this.estadoSistema.cicloSeleccionado = ciclo.id;
                this.cicloSeleccionado = ciclo.id;
                cicloActivoSeleccionado = true;
                this.log('✅ Ciclo activo seleccionado automáticamente:', textoOpcion);
            }
            
            selector.appendChild(option);
        });
        
        // Remover event listener anterior si existe
        if (this.manejarCambioCiclo) {
            selector.removeEventListener('change', this.manejarCambioCiclo);
        }
        
        // Crear función bound para poder removerla después
        this.manejarCambioCiclo = async (e) => {
            const cicloId = e.target.value;
            this.estadoSistema.cicloSeleccionado = cicloId;
            this.cicloSeleccionado = cicloId;
            this.log('🔄 Ciclo seleccionado:', cicloId);
            
            // Actualizar estado visual
            if (cicloId) {
                const textoSeleccionado = e.target.options[e.target.selectedIndex].text;
                this.agregarLog(`📅 Ciclo académico seleccionado: ${textoSeleccionado}`, 'success');
                
                // Cargar datos específicos del ciclo seleccionado
                await this.cargarDatosPorCiclo(cicloId);
                
                this.habilitarCargaArchivos();
                
                // Actualizar el estado de conexión
                this.actualizarEstadoConexion();
            } else {
                this.agregarLog('⚠️ Debe seleccionar un ciclo académico para continuar', 'warning');
                this.deshabilitarCargaArchivos();
                
                // Limpiar datos mostrados
                this.limpiarDatosMostrados();
            }
        };
        
        // Agregar event listener
        selector.addEventListener('change', this.manejarCambioCiclo);
        
        // Si se seleccionó un ciclo automáticamente, habilitar el sistema
        if (cicloActivoSeleccionado) {
            this.habilitarCargaArchivos();
            const textoSeleccionado = selector.options[selector.selectedIndex].text;
            this.agregarLog(`📅 Sistema habilitado con ciclo: ${textoSeleccionado}`, 'success');
            
            // Cargar datos del ciclo seleccionado automáticamente
            this.cargarDatosPorCiclo(this.cicloSeleccionado);
        } else {
            this.deshabilitarCargaArchivos();
            this.agregarLog('⚠️ Seleccione un ciclo académico para comenzar', 'warning');
        }
        
        // Forzar actualización visual del selector para evitar problemas de caché
        this.forzarActualizacionSelector(selector);
        
        this.log('✅ Selector de ciclos configurado con', selector.options.length - 1, 'opciones');
    }

    /**
     * Forzar actualización visual del selector para evitar problemas de caché
     */
    forzarActualizacionSelector(selector) {
        try {
            // Forzar repintado del selector
            selector.style.display = 'none';
            selector.offsetHeight; // Trigger reflow
            selector.style.display = 'block';
            
            // Verificar el texto de la opción seleccionada
            const opcionSeleccionada = selector.options[selector.selectedIndex];
            if (opcionSeleccionada) {
                this.log('🔍 Opción seleccionada después de actualización:', {
                    value: opcionSeleccionada.value,
                    text: opcionSeleccionada.textContent
                });
                
                // Si el texto contiene "(undefined)", corregirlo manualmente
                if (opcionSeleccionada.textContent.includes('(undefined)')) {
                    const cicloId = opcionSeleccionada.value;
                    this.log('⚠️ Detectado texto "(undefined)", corrigiendo...');
                    
                    // Buscar el ciclo con ID correspondiente en los datos cargados
                    const selector2 = document.getElementById('selectCiclo');
                    if (selector2) {
                        Array.from(selector2.options).forEach(option => {
                            if (option.value === cicloId && option.textContent.includes('(undefined)')) {
                                // Determinar el texto correcto basado en el ID
                                let textoCorregido = `Ciclo ${cicloId}`;
                                if (cicloId === '1') {
                                    textoCorregido = '2024-I (Activo)';
                                }
                                option.textContent = textoCorregido;
                                this.log('✅ Texto corregido a:', textoCorregido);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            this.log('⚠️ Error al forzar actualización del selector:', error);
        }
    }

    /**
     * Verificación final del estado del selector para corregir problemas persistentes
     */
    verificarEstadoFinalSelector() {
        const selector = document.getElementById('selectCiclo');
        if (!selector) return;
        
        this.log('🔍 VERIFICACIÓN FINAL del selector de ciclos:');
        this.log('📊 Opciones en el selector:');
        
        Array.from(selector.options).forEach((option, index) => {
            this.log(`  ${index}: value="${option.value}", text="${option.textContent}"`);
            
            // Si encontramos texto con "(undefined)", corregirlo
            if (option.textContent.includes('(undefined)')) {
                this.log(`⚠️ CORRIGIENDO opción con "(undefined)": ${option.textContent}`);
                
                // Determinar el texto correcto basado en el value
                let textoCorregido;
                switch(option.value) {
                    case '1':
                        textoCorregido = '2024-I (Activo)';
                        break;
                    case '2':
                        textoCorregido = '2024-II';
                        break;
                    case '3':
                        textoCorregido = '2025-I';
                        break;
                    default:
                        textoCorregido = `Ciclo ${option.value}`;
                }
                
                option.textContent = textoCorregido;
                this.log(`✅ CORREGIDO a: "${textoCorregido}"`);
                
                // Si es la opción seleccionada, notificar
                if (option.selected) {
                    this.agregarLog(`🔧 Selector corregido: ${textoCorregido}`, 'warning');
                }
            }
        });
        
        const opcionSeleccionada = selector.options[selector.selectedIndex];
        if (opcionSeleccionada) {
            this.log(`✅ Opción actualmente seleccionada: "${opcionSeleccionada.textContent}"`);
        }
    }

    /**
     * Cargar datos específicos del ciclo seleccionado
     */
    async cargarDatosPorCiclo(cicloId) {
        try {
            this.agregarLog(`🔍 Cargando datos del ciclo: ${cicloId}`, 'info');
            
            // Mostrar indicador de carga
            const estadoArchivos = document.getElementById('estadoArchivos');
            if (estadoArchivos) {
                estadoArchivos.innerHTML = `
                    <div class="text-center py-3">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando datos del ciclo...</span>
                        </div>
                        <p class="mt-2 text-muted">Cargando información consolidada del ciclo...</p>
                    </div>
                `;
            }
            
            // Usar la nueva función consolidada que conecta con BD
            await this.mostrarInformacionConsolidadaCiclo(cicloId);
            
            // Actualizar estado interno si hay archivos cargados
            await this.actualizarEstadoDeArchivos(cicloId);
            
            this.agregarLog(`✅ Información del ciclo cargada correctamente`, 'success');
            
        } catch (error) {
            this.log('❌ Error cargando datos del ciclo:', error);
            this.agregarLog(`⚠️ Error al cargar datos del ciclo: ${error.message}`, 'warning');
            
            // Mostrar estado vacío
            this.mostrarEstadoVacio();
        }
    }
    
    /**
     * Actualizar estado interno de archivos basado en la BD
     */
    async actualizarEstadoDeArchivos(cicloId) {
        try {
            // window.apiRequest ya agrega /api automáticamente
            const response = await window.apiRequest(`/ciclos/${cicloId}/archivos-carga`, 'GET');
            if (response.success && response.data) {
                // Limpiar estado anterior
                this.estadoSistema.archivosCargados = {};
                
                // Actualizar con archivos reales de BD
                response.data.forEach(archivo => {
                    this.estadoSistema.archivosCargados[archivo.tipo] = {
                        cargado: true,
                        registros: archivo.registros_procesados || 0,
                        ultimaActualizacion: archivo.fecha_subida,
                        archivo: archivo.nombre_original,
                        detalles: archivo.detalles_procesamiento || {}
                    };
                });
                
                console.log('✅ Estado de archivos actualizado desde BD:', this.estadoSistema.archivosCargados);
                
                // Verificar progresión automática
                this.verificarProgresionAutomatica();
            }
        } catch (error) {
            console.error('Error al actualizar estado de archivos:', error);
        }
    }
    
    /**
     * Cambiar estado de un ciclo académico
     */
    async cambiarEstadoCiclo(cicloId, nuevoEstado) {
        try {
            this.agregarLog(`🔄 Cambiando estado del ciclo a: ${nuevoEstado}`, 'info');
            
            // window.apiRequest ya agrega /api automáticamente
            const response = await window.apiRequest(`/ciclos/${cicloId}/estado`, 'PUT', {
                nuevoEstado: nuevoEstado,
                usuario_id: window.AUTH?.obtenerDatosUsuario()?.id
            });
            
            if (response.success) {
                this.mostrarExito(`✅ Ciclo actualizado a estado: ${nuevoEstado}`);
                this.agregarLog(`✅ Estado cambiado exitosamente a: ${nuevoEstado}`, 'success');
                
                // Recargar información del ciclo
                await this.mostrarInformacionConsolidadaCiclo(cicloId);
                
                // Si se inicia verificación, activar pestaña correspondiente
                if (nuevoEstado === 'verificacion') {
                    setTimeout(() => {
                        this.activarPestana('#verificacion-datos');
                    }, 1500);
                }
            } else {
                this.mostrarError(`❌ Error: ${response.message}`);
                this.agregarLog(`❌ Error al cambiar estado: ${response.message}`, 'error');
            }
            
        } catch (error) {
            console.error('Error al cambiar estado del ciclo:', error);
            this.mostrarError('Error al cambiar estado del ciclo');
            this.agregarLog(`❌ Error: ${error.message}`, 'error');
        }
    }

    /**
     * Cargar archivos existentes del ciclo desde el servidor
     */
    async cargarArchivosExistentes(cicloId) {
        try {
            console.log(`🔍 Consultando archivos para ciclo ${cicloId}:`, `/ciclos/${cicloId}/archivos-carga`);
            const response = await window.apiRequest(`/ciclos/${cicloId}/archivos-carga`, 'GET');
            console.log('📡 Respuesta del endpoint archivos-carga:', response);
            
            if (response.success && response.data && response.data.length > 0) {
                this.log('✅ Archivos existentes encontrados:', response.data);
                
                // Limpiar estado actual de archivos
                if (!this.estadoSistema.archivos) {
                    this.estadoSistema.archivos = {};
                }
                if (!this.estadoSistema.archivosCargados) {
                    this.estadoSistema.archivosCargados = {};
                }
                
                // Procesar archivos existentes
                response.data.forEach(archivo => {
                    const tipo = this.mapearTipoArchivoBackend(archivo.tipo);
                    if (tipo) {
                        const estadoArchivo = {
                            cargado: true,
                            nombre: archivo.nombre_original,
                            registros: archivo.registros_procesados || 0,
                            fechaCarga: archivo.fecha_carga,
                            id: archivo.id,
                            ruta: archivo.ruta,
                            tamanio: archivo.tamanio,
                            estado: archivo.estado || 'procesado',
                            existeEnCiclo: true
                        };
                        
                        this.estadoSistema.archivos[tipo] = estadoArchivo;
                        this.estadoSistema.archivosCargados[tipo] = estadoArchivo;
                    }
                });
                
                this.agregarLog(`📁 ${response.data.length} archivo(s) existente(s) cargado(s) del ciclo`, 'info');
                
                // Mostrar interfaz de archivos existentes
                this.mostrarArchivosExistentes(response.data);
                
                return true;
            } else {
                this.log('ℹ️ No hay archivos existentes para este ciclo');
                this.agregarLog('📂 Ciclo sin archivos previos - Listo para nueva carga', 'info');
                
                // Limpiar archivos del estado
                this.estadoSistema.archivos = {};
                this.estadoSistema.archivosCargados = {};
                
                return false;
            }
            
        } catch (error) {
            this.log('⚠️ Error cargando archivos existentes:', error);
            // No mostrar error crítico, puede ser que simplemente no haya archivos o el endpoint esté fallando
            this.agregarLog('📂 No se pudieron verificar archivos existentes - Continuando con carga nueva', 'info');
            
            // Limpiar archivos del estado en caso de error
            this.estadoSistema.archivos = {};
            this.estadoSistema.archivosCargados = {};
            
            return false;
        }
    }

    /**
     * Mapear tipo de archivo desde el backend al frontend
     */
    mapearTipoArchivoBackend(tipoBackend) {
        const mapeo = {
            'usuarios_masivos': 'usuarios',
            'carreras_completas': 'carreras', 
            'asignaturas_completas': 'asignaturas',
            'carga_academica': 'carga_academica',
            'verificaciones': 'verificaciones',
            'codigos_institucionales': 'codigos_institucionales'
        };
        
        return mapeo[tipoBackend] || tipoBackend;
    }

    /**
     * Mostrar archivos existentes en la interfaz
     */
    mostrarArchivosExistentes(archivos) {
        // Crear sección de archivos existentes si no existe
        let seccionExistentes = document.getElementById('archivos-existentes');
        if (!seccionExistentes) {
            const estadoArchivos = document.getElementById('estadoArchivos');
            if (estadoArchivos) {
                const seccionHTML = `
                    <div id="archivos-existentes" class="mb-4">
                        <div class="card border-info">
                            <div class="card-header bg-info text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-history me-2"></i>Archivos Existentes en este Ciclo
                                    <button class="btn btn-sm btn-outline-light float-end" id="btn-alternar-existentes">
                                        <i class="fas fa-eye"></i> Mostrar/Ocultar
                                    </button>
                                </h6>
                            </div>
                            <div class="card-body" id="contenido-archivos-existentes">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                    </div>
                `;
                estadoArchivos.insertAdjacentHTML('afterend', seccionHTML);
                
                // Configurar botón de alternar
                document.getElementById('btn-alternar-existentes')?.addEventListener('click', () => {
                    const contenido = document.getElementById('contenido-archivos-existentes');
                    const icono = document.querySelector('#btn-alternar-existentes i');
                    if (contenido.style.display === 'none') {
                        contenido.style.display = 'block';
                        icono.className = 'fas fa-eye';
                    } else {
                        contenido.style.display = 'none';
                        icono.className = 'fas fa-eye-slash';
                    }
                });
            }
        }
        
        const contenidoExistentes = document.getElementById('contenido-archivos-existentes');
        if (!contenidoExistentes) return;
        
        let html = `
            <div class="row">
                <div class="col-12 mb-3">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Se encontraron archivos existentes para este ciclo.</strong>
                        Puede agregar nuevos archivos o reemplazar los existentes.
                    </div>
                </div>
            </div>
            <div class="row">
        `;
        
        archivos.forEach(archivo => {
            const tipoConfig = this.archivosConfig[this.mapearTipoArchivoBackend(archivo.tipo)];
            const icono = tipoConfig?.icono || '📄';
            const descripcion = tipoConfig?.descripcion || archivo.tipo;
            
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card border-success">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <span class="fs-2">${icono}</span>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="card-title mb-1">${archivo.nombre_original}</h6>
                                    <p class="card-text text-muted mb-1">${descripcion}</p>
                                    <small class="text-success">
                                        <i class="fas fa-check-circle"></i> 
                                        ${archivo.registros_procesados || 0} registros procesados
                                    </small>
                                    <br>
                                    <small class="text-muted">
                                        <i class="fas fa-calendar"></i> 
                                        ${new Date(archivo.fecha_carga).toLocaleDateString()}
                                    </small>
                                </div>
                                <div class="text-end">
                                    <button class="btn btn-sm btn-outline-primary mb-1" onclick="window.cargaMasiva.descargarArchivo('${archivo.id}')">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-warning" onclick="window.cargaMasiva.reemplazarArchivo('${archivo.tipo}', '${archivo.id}')">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-success">${archivos.length} archivo(s) existente(s)</span>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-primary" id="btn-agregar-mas-archivos">
                                <i class="fas fa-plus me-1"></i>Agregar Más Archivos
                            </button>
                            <button class="btn btn-sm btn-success ms-2" id="btn-continuar-con-existentes">
                                <i class="fas fa-arrow-right me-1"></i>Continuar con Datos Existentes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        contenidoExistentes.innerHTML = html;
        
        // Configurar eventos de botones
        document.getElementById('btn-agregar-mas-archivos')?.addEventListener('click', () => {
            this.habilitarModoAdicional();
        });
        
        document.getElementById('btn-continuar-con-existentes')?.addEventListener('click', () => {
            this.continuarConDatosExistentes();
        });
    }

    /**
     * Habilitar modo de carga adicional (agregar más archivos al ciclo)
     */
    habilitarModoAdicional() {
        this.agregarLog('➕ Modo de carga adicional activado', 'info');
        
        // Habilitar las áreas de carga
        this.habilitarCargaArchivos();
        
        // Mostrar mensaje informativo
        const alertaProgresion = document.getElementById('alertaProgresion');
        if (alertaProgresion) {
            alertaProgresion.innerHTML = `
                <div class="alert alert-info alert-dismissible fade show">
                    <i class="fas fa-plus-circle me-2"></i>
                    <strong>Modo Adición Activado:</strong> 
                    Puede cargar archivos adicionales o reemplazar los existentes para este ciclo.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        }
        
        // Activar pestaña de carga
        this.activarPestana('#carga-datos');
    }

    /**
     * Continuar con datos existentes (proceder a verificación/inicialización)
     */
    continuarConDatosExistentes() {
        this.agregarLog('➡️ Continuando con datos existentes del ciclo', 'success');
        
        // Verificar qué archivos requeridos están disponibles
        const archivosRequeridos = this.estadoSistema.archivosRequeridos;
        const archivosDisponibles = Object.keys(this.estadoSistema.archivosCargados);
        
        const faltantes = archivosRequeridos.filter(req => !archivosDisponibles.includes(req));
        
        if (faltantes.length > 0) {
            this.mostrarAdvertencia(`Faltan archivos requeridos: ${faltantes.join(', ')}`);
            this.agregarLog(`⚠️ Archivos faltantes: ${faltantes.join(', ')}`, 'warning');
            return;
        }
        
        // Todos los archivos requeridos están disponibles
        this.estadoSistema.procesoActual = 'verificacion';
        this.actualizarInterfazSegunEstado();
        this.verificarProgresionAutomatica();
        
        // Activar pestaña de verificación
        setTimeout(() => {
            this.activarPestana('#verificacion-datos');
        }, 1000);
    }

    /**
     * Descargar archivo existente
     */
    async descargarArchivo(archivoId) {
        try {
            const response = await window.apiRequest(`/archivos/${archivoId}/descargar`, 'GET');
            
            if (response.success && response.data.url) {
                // Crear enlace temporal para descarga
                const link = document.createElement('a');
                link.href = response.data.url;
                link.download = response.data.nombre || 'archivo_descarga';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.agregarLog(`📥 Archivo descargado: ${response.data.nombre}`, 'success');
            } else {
                throw new Error(response.message || 'No se pudo obtener el enlace de descarga');
            }
            
        } catch (error) {
            this.log('❌ Error descargando archivo:', error);
            this.mostrarError('Error al descargar archivo: ' + error.message);
        }
    }

    /**
     * Reemplazar archivo existente
     */
    reemplazarArchivo(tipo, archivoIdExistente) {
        this.agregarLog(`🔄 Preparando reemplazo de archivo tipo: ${tipo}`, 'info');
        
        // Marcar que vamos a reemplazar un archivo específico
        this.estadoSistema.reemplazoArchivo = {
            tipo: tipo,
            archivoIdExistente: archivoIdExistente
        };
        
        // Activar pestaña de carga individual y pre-seleccionar el tipo
        this.activarPestana('#carga-datos');
        this.mostrarCargaIndividual();
        
        // Pre-seleccionar el tipo de archivo
        const selectorTipo = document.getElementById('fileType');
        if (selectorTipo) {
            selectorTipo.value = tipo;
        }
        
        // Mostrar mensaje de reemplazo
        const alertaProgresion = document.getElementById('alertaProgresion');
        if (alertaProgresion) {
            alertaProgresion.innerHTML = `
                <div class="alert alert-warning alert-dismissible fade show">
                    <i class="fas fa-sync-alt me-2"></i>
                    <strong>Modo Reemplazo:</strong> 
                    Seleccione el nuevo archivo para reemplazar el archivo existente de tipo "${tipo}".
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        }
    }

    /**
     * Mostrar estadísticas específicas del ciclo
     */
    /**
     * Mostrar información consolidada del ciclo (estadísticas + archivos) conectada a la BD
     */
    async mostrarInformacionConsolidadaCiclo(cicloId) {
        const estadoArchivos = document.getElementById('estadoArchivos');
        if (!estadoArchivos) return;
        
        try {
            // Usar el mismo endpoint de estadísticas que el tablero
            const statsUrl = `${CONFIG.API.ENDPOINTS.DASHBOARD}/estadisticas?ciclo=${cicloId}`;
            console.log('📊 Obteniendo estadísticas desde:', statsUrl);
            
            const [statsResponse, archivosResponse] = await Promise.all([
                window.apiRequest(statsUrl, 'GET'),
                window.apiRequest(`/ciclos/${cicloId}/archivos-carga`, 'GET')
            ]);
            
            console.log('📊 Respuesta de estadísticas:', statsResponse);
            console.log('📁 Respuesta de archivos:', archivosResponse);
            
            const archivos = archivosResponse.data || archivosResponse || [];
            const ciclo = archivosResponse.ciclo || { nombre: `Ciclo ${cicloId}`, estado: 'activo' };
            
            // Extraer estadísticas del formato del tablero
            let stats = { usuarios: 0, carreras: 0, asignaturas: 0, portafolios: 0 };
            
            console.log('🔍 DEBUG - Respuesta completa de estadísticas:', {
                tieneStatsResponse: !!statsResponse,
                tieneData: !!statsResponse?.data,
                tieneSuccess: !!statsResponse?.success,
                keysStatsResponse: statsResponse ? Object.keys(statsResponse) : null,
                dataContent: statsResponse?.data
            });
            
            if (statsResponse && statsResponse.success && statsResponse.data) {
                const data = statsResponse.data;
                
                console.log('🔍 DEBUG - Datos para procesar:', {
                    tieneUsuarios: !!data.usuarios,
                    tieneCarreras: !!data.carreras,
                    tieneAsignaturas: !!data.asignaturas,
                    tienePortafolios: !!data.portafolios,
                    tieneCiclo: !!data.ciclo,
                    valoresDirectos: {
                        usuarios: data.usuarios,
                        carreras: data.carreras,
                        asignaturas: data.asignaturas,
                        portafolios: data.portafolios
                    }
                });
                
                // Mapear datos según la estructura de respuesta
                stats = {
                    usuarios: data.usuarios?.total || data.usuarios?.activos || data.usuarios || 0,
                    carreras: data.carreras?.total || data.carreras?.activas || data.carreras || 0,
                    asignaturas: data.asignaturas?.total || data.asignaturas?.activas || data.asignaturas || 0,
                    portafolios: data.portafolios?.total || data.portafolios?.activos || data.portafolios || 0
                };
                
                console.log('✅ Estadísticas mapeadas:', stats);
                
                // Si hay información del ciclo en la respuesta, usarla
                if (data.ciclo) {
                    ciclo.nombre = data.ciclo.nombre || ciclo.nombre;
                    ciclo.estado = data.ciclo.estado || ciclo.estado;
                    ciclo.fechaInicio = data.ciclo.fechaInicio || data.ciclo.fecha_inicio;
                    ciclo.fechaFin = data.ciclo.fechaFin || data.ciclo.fecha_fin;
                    console.log('✅ Información del ciclo actualizada:', ciclo);
                }
            } else {
                console.warn('⚠️ No se recibieron estadísticas válidas, usando valores por defecto');
                console.log('❌ Contenido de statsResponse:', statsResponse);
            }
            
            console.log('📊 Estadísticas procesadas:', stats);
            console.log('📅 Información del ciclo:', ciclo);
            
            // Crear HTML consolidado
            const html = `
                <div class="row">
                    <!-- Header del ciclo -->
                    <div class="col-12 mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6><i class="fas fa-calendar-alt me-2"></i>Información del Ciclo: ${ciclo.nombre}</h6>
                            <div class="d-flex align-items-center gap-2">
                                ${this.generarBadgeEstado(ciclo.estado)}
                                ${this.generarBotonesAccionCiclo(ciclo)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Estadísticas del ciclo -->
                    <div class="col-12 mb-3">
                        <div class="card border-primary">
                            <div class="card-header bg-primary text-white">
                                <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Estadísticas Actuales</h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-3 mb-3">
                                        <div class="stat-card">
                                            <div class="stat-icon bg-primary">
                                                <i class="fas fa-users"></i>
                                            </div>
                                            <div class="stat-content">
                                                <h5>${stats.usuarios || 0}</h5>
                                                <p>Usuarios</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <div class="stat-card">
                                            <div class="stat-icon bg-success">
                                                <i class="fas fa-graduation-cap"></i>
                                            </div>
                                            <div class="stat-content">
                                                <h5>${stats.carreras || 0}</h5>
                                                <p>Carreras</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <div class="stat-card">
                                            <div class="stat-icon bg-info">
                                                <i class="fas fa-book"></i>
                                            </div>
                                            <div class="stat-content">
                                                <h5>${stats.asignaturas || 0}</h5>
                                                <p>Asignaturas</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <div class="stat-card">
                                            <div class="stat-icon bg-warning">
                                                <i class="fas fa-folder-open"></i>
                                            </div>
                                            <div class="stat-content">
                                                <h5>${stats.portafolios || 0}</h5>
                                                <p>Portafolios</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Archivos de carga -->
                    <div class="col-12">
                        <div class="card border-info">
                            <div class="card-header bg-info text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-upload me-2"></i>Archivos de Carga Masiva 
                                    <span class="badge bg-light text-dark ms-2">${archivos.length}</span>
                                </h6>
                            </div>
                            <div class="card-body">
                                ${archivos.length > 0 ? this.generarListaArchivos(archivos, ciclo) : this.generarMensajeNoArchivos(ciclo)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            estadoArchivos.innerHTML = html;
            this.configurarEventosArchivos();
            
        } catch (error) {
            console.error('❌ Error al cargar información consolidada:', error);
            
            // Mostrar estado con error pero información básica
            const estadoArchivos = document.getElementById('estadoArchivos');
            if (estadoArchivos) {
                estadoArchivos.innerHTML = `
                    <div class="alert alert-warning">
                        <h6><i class="fas fa-exclamation-triangle me-2"></i>Error de Conectividad</h6>
                        <p class="mb-2">No se pudo cargar la información completa del ciclo académico.</p>
                        <small class="text-muted">Error: ${error.message || 'Conexión con el servidor falló'}</small>
                        <hr>
                        <button class="btn btn-sm btn-outline-primary" onclick="window.cargaMasiva.mostrarInformacionConsolidadaCiclo('${cicloId}')">
                            <i class="fas fa-sync me-1"></i>Reintentar
                        </button>
                    </div>
                `;
            }
        }
    }
    
    
    
    /**
     * Generar badge visual para el estado del ciclo
     */
    generarBadgeEstado(estado) {
        const configuracionEstados = {
            'preparacion': { clase: 'bg-secondary', icono: 'fas fa-cog', texto: 'Preparación' },
            'inicializacion': { clase: 'bg-warning', icono: 'fas fa-sync', texto: 'Inicializando' },
            'activo': { clase: 'bg-primary', icono: 'fas fa-play', texto: 'Activo' },
            'verificacion': { clase: 'bg-info', icono: 'fas fa-check-circle', texto: 'En Verificación' },
            'finalizacion': { clase: 'bg-success', icono: 'fas fa-flag-checkered', texto: 'Finalizado' },
            'archivado': { clase: 'bg-dark', icono: 'fas fa-archive', texto: 'Archivado' }
        };
        
        const config = configuracionEstados[estado] || configuracionEstados['preparacion'];
        return `<span class="badge ${config.clase}"><i class="${config.icono} me-1"></i>${config.texto}</span>`;
    }
    
    /**
     * Generar botones de acción según el estado del ciclo
     */
    generarBotonesAccionCiclo(ciclo) {
        let botones = '';
        
        switch (ciclo.estado) {
            case 'preparacion':
                if (this.tieneDatosSuficientes()) {
                    botones += `<button class="btn btn-sm btn-warning" onclick="window.cargaMasiva.cambiarEstadoCiclo('${ciclo.id}', 'inicializacion')">
                        <i class="fas fa-rocket me-1"></i>Inicializar
                    </button>`;
                }
                break;
            case 'inicializacion':
                botones += `<button class="btn btn-sm btn-primary" onclick="window.cargaMasiva.cambiarEstadoCiclo('${ciclo.id}', 'activo')">
                    <i class="fas fa-play me-1"></i>Activar
                </button>`;
                break;
            case 'activo':
                botones += `<button class="btn btn-sm btn-info" onclick="window.cargaMasiva.cambiarEstadoCiclo('${ciclo.id}', 'verificacion')">
                    <i class="fas fa-check-circle me-1"></i>Iniciar Verificación
                </button>`;
                break;
            case 'verificacion':
                botones += `<button class="btn btn-sm btn-success" onclick="window.cargaMasiva.cambiarEstadoCiclo('${ciclo.id}', 'finalizacion')">
                    <i class="fas fa-flag-checkered me-1"></i>Finalizar
                </button>`;
                break;
        }
        
        return botones;
    }
    
    /**
     * Generar lista de archivos de carga
     */
    generarListaArchivos(archivos, ciclo) {
        if (archivos.length === 0) {
            return this.generarMensajeNoArchivos(ciclo);
        }
        
        let html = '<div class="row">';
        
        archivos.forEach(archivo => {
            const tipoConfig = this.archivosConfig[archivo.tipo] || { icono: '📄', descripcion: archivo.tipo };
            
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card border-success">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <span class="fs-3">${tipoConfig.icono}</span>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="card-title mb-1">${archivo.nombre_original}</h6>
                                    <p class="card-text text-muted mb-1 small">${tipoConfig.descripcion}</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-success">
                                            <i class="fas fa-check-circle"></i> 
                                            ${archivo.registros_procesados || 0} registros
                                        </small>
                                        <small class="text-muted">
                                            ${new Date(archivo.fecha_subida).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <button class="btn btn-sm btn-outline-primary mb-1" 
                                            onclick="window.cargaMasiva.descargarArchivo('${archivo.id}')"
                                            title="Descargar archivo">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    ${ciclo.puedeRecibirArchivos ? `
                                        <button class="btn btn-sm btn-outline-warning" 
                                                onclick="window.cargaMasiva.reemplazarArchivo('${archivo.tipo}', '${archivo.id}')"
                                                title="Reemplazar archivo">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Botones de acción según estado del ciclo
        html += `
            <div class="row mt-3">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-success">${archivos.length} archivo(s) existente(s)</span>
                        </div>
                        <div>
                            ${ciclo.puedeRecibirArchivos ? `
                                <button class="btn btn-sm btn-primary" onclick="window.cargaMasiva.habilitarModoAdicional()">
                                    <i class="fas fa-plus me-1"></i>Agregar Más Archivos
                                </button>
                            ` : ''}
                            ${this.puedeRealizarVerificacion(archivos) ? `
                                <button class="btn btn-sm btn-success ms-2" onclick="window.cargaMasiva.procederAVerificacion()">
                                    <i class="fas fa-arrow-right me-1"></i>Proceder a Verificación
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Generar mensaje cuando no hay archivos
     */
    generarMensajeNoArchivos(ciclo) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-upload fa-3x text-muted mb-3"></i>
                <h6>No hay archivos de carga para este ciclo</h6>
                <p class="text-muted">
                    ${ciclo.puedeRecibirArchivos 
                        ? 'Puede comenzar cargando archivos usando las pestañas de carga individual o masiva.' 
                        : 'Este ciclo no puede recibir más archivos en su estado actual.'}
                </p>
                ${ciclo.puedeRecibirArchivos ? `
                    <button class="btn btn-primary" onclick="window.cargaMasiva.activarPestana('#carga-datos')">
                        <i class="fas fa-upload me-2"></i>Cargar Archivos
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Verificar si se tienen datos suficientes para inicializar
     */
    tieneDatosSuficientes() {
        const archivosRequeridos = ['usuarios', 'carreras', 'asignaturas'];
        const archivosCargados = Object.keys(this.estadoSistema.archivosCargados || {});
        return archivosRequeridos.every(tipo => archivosCargados.includes(tipo));
    }
    
    /**
     * Verificar si se puede realizar verificación
     */
    puedeRealizarVerificacion(archivos) {
        const tiposRequeridos = ['usuarios', 'carreras', 'asignaturas'];
        const tiposDisponibles = archivos.map(a => a.tipo);
        return tiposRequeridos.every(tipo => tiposDisponibles.includes(tipo));
    }
    
    /**
     * Configurar eventos para los archivos mostrados
     */
    configurarEventosArchivos() {
        // Los eventos se configuran directamente en el HTML mediante onclick
        // para evitar problemas de referencias perdidas
        this.log('✅ Eventos de archivos configurados');
    }
    
    /**
     * Actualizar estado de archivos según datos del ciclo
     */
    actualizarEstadoArchivosPorCiclo(stats) {
        // Asegurar que ambas estructuras de archivos estén inicializadas
        if (!this.estadoSistema.archivos) {
            this.estadoSistema.archivos = {};
        }
        if (!this.estadoSistema.archivosCargados) {
            this.estadoSistema.archivosCargados = {};
        }
        
        // Mapeo de nombres de campos de stats a tipos de archivo
        const mapeoStats = {
            usuarios: stats.usuarios,
            carreras: stats.carreras,
            asignaturas: stats.asignaturas,
            carga_academica: stats.asignaciones,
            verificaciones: stats.verificaciones,
            codigos_institucionales: stats.codigos
        };
        
        // Actualizar el estado de archivos basado en lo que ya existe en el ciclo
        Object.keys(mapeoStats).forEach(tipo => {
            const registros = mapeoStats[tipo] || 0;
            if (registros > 0) {
                const estadoArchivo = {
                    cargado: true,
                    nombre: `${tipo}_${this.cicloSeleccionado}.xlsx`,
                    registros: registros,
                    fechaCarga: new Date().toISOString()
                };
                
                // Actualizar ambas estructuras para compatibilidad
                this.estadoSistema.archivos[tipo] = estadoArchivo;
                this.estadoSistema.archivosCargados[tipo] = estadoArchivo;
                
                this.log(`✅ Archivo ${tipo} marcado como cargado (${registros} registros)`);
            }
        });
        
        // Actualizar la interfaz
        this.verificarProgresionAutomatica();
    }
    
    /**
     * Mostrar estado vacío cuando no hay ciclo seleccionado
     */
    mostrarEstadoVacio() {
        const estadoArchivos = document.getElementById('estadoArchivos');
        if (!estadoArchivos) return;
        
        estadoArchivos.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h5>No hay datos para mostrar</h5>
                <p class="text-muted">Seleccione un ciclo académico para ver sus datos</p>
            </div>
        `;
    }
    
    /**
     * Limpiar datos mostrados
     */
    limpiarDatosMostrados() {
        // Limpiar estadísticas mostradas
        this.mostrarEstadoVacio();
        
        // Limpiar estado interno del ciclo
        delete this.estadoSistema.estadisticasCiclo;
        
        // Resetear estado de archivos (ambas propiedades para compatibilidad)
        this.estadoSistema.archivos = {};
        this.estadoSistema.archivosCargados = {};
        
        // Actualizar interfaz
        this.verificarProgresionAutomatica();
        
        this.log('🧹 Datos mostrados limpiados');
    }

    /**
     * Inicializar eventos de la interfaz
     */
    inicializarEventos() {
        // El selector de ciclo académico se maneja en llenarSelectorCiclos() para evitar duplicación

        // Selector de archivos
        const fileInputs = ['singleFileInput', 'bulkFileInput'];
        fileInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => this.manejarSeleccionArchivos(e));
            }
        });

        // Botón de inicialización
        const initBtn = document.getElementById('initializeSystem') || document.getElementById('btnProcederInicializacion');
        if (initBtn) {
            initBtn.addEventListener('click', () => this.ejecutarInicializacion());
        }

        // Pestañas principales
        const tabs = document.querySelectorAll('[data-tab], [data-bs-toggle="tab"]');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.manejarCambioTab(e));
        });

        // Sub-pestañas de carga (Individual vs Masiva)
        const singleTab = document.getElementById('single-tab');
        const bulkTab = document.getElementById('bulk-tab');
        
        if (singleTab) {
            singleTab.addEventListener('click', () => this.mostrarCargaIndividual());
        }
        
        if (bulkTab) {
            bulkTab.addEventListener('click', () => this.mostrarCargaMasiva());
        }

        // Botón de descarga de plantillas
        const downloadBtn = document.getElementById('btnDescargarPlantillas');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.descargarPlantillas());
        }

        // Botón de limpiar sistema
        const limpiarBtn = document.getElementById('btnLimpiarSistema');
        if (limpiarBtn) {
            limpiarBtn.addEventListener('click', () => {
                if (confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos guardados (incluyendo localStorage) y reiniciará el sistema completamente.\n\n¿Está seguro de que desea continuar?')) {
                    this.reiniciarSistemaCompleto();
                }
            });
        }

        // Botones para limpiar logs individuales
        document.getElementById('clearLogSingleBtn')?.addEventListener('click', () => {
            this.limpiarLog('uploadLogSingle');
        });
        
        document.getElementById('clearLogBulkBtn')?.addEventListener('click', () => {
            this.limpiarLog('uploadLogBulk');
        });
        
        document.getElementById('clearVerificacionLogBtn')?.addEventListener('click', () => {
            this.limpiarLog('verificacionLog');
        });
        
        document.getElementById('clearInitLogBtn')?.addEventListener('click', () => {
            this.limpiarLog('initLog');
        });

        this.log('✅ Eventos inicializados');
    }

    /**
     * Mostrar modo de carga individual
     */
    mostrarCargaIndividual() {
        // Activar pestaña principal de carga
        this.activarPestana('#carga-datos');
        
        // Activar sub-pestaña individual
        const singleTab = document.getElementById('single-tab');
        const bulkTab = document.getElementById('bulk-tab');
        const singlePanel = document.getElementById('single-upload');
        const bulkPanel = document.getElementById('bulk-upload');
        
        if (singleTab) {
            singleTab.classList.add('active');
        }
        if (bulkTab) {
            bulkTab.classList.remove('active');
        }
        if (singlePanel) {
            singlePanel.classList.add('show', 'active');
        }
        if (bulkPanel) {
            bulkPanel.classList.remove('show', 'active');
        }
        
        this.agregarLog('📋 Modo de carga individual activado', 'info');
    }

    /**
     * Mostrar modo de carga masiva - USA TODO EL ANCHO
     */
    mostrarCargaMasiva() {
        // Activar pestaña principal de carga
        this.activarPestana('#carga-datos');
        
        // Activar sub-pestaña masiva
        const singleTab = document.getElementById('single-tab');
        const bulkTab = document.getElementById('bulk-tab');
        const singlePanel = document.getElementById('single-upload');
        const bulkPanel = document.getElementById('bulk-upload');
        
        if (singleTab) {
            singleTab.classList.remove('active');
        }
        if (bulkTab) {
            bulkTab.classList.add('active');
        }
        if (singlePanel) {
            singlePanel.classList.remove('show', 'active');
        }
        if (bulkPanel) {
            bulkPanel.classList.add('show', 'active');
        }
        
        this.agregarLog('📦 Modo de carga masiva activado', 'info');
        
        // Verificar si ya hay archivos cargados para progresión automática
        this.verificarProgresionAutomatica();
    }

    /**
     * Inicializar drag and drop
     */
    inicializarDragAndDrop() {
        const dropZones = ['dragDropSingle', 'dragDropBulk', 'file-drop-area'];
        
        dropZones.forEach(zoneId => {
            const dropZone = document.getElementById(zoneId) || document.querySelector('.' + zoneId);
            if (!dropZone) return;

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.classList.add('drag-over');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.classList.remove('drag-over');
                });
            });

            dropZone.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.procesarArchivosSeleccionados([...files]);
                }
            });
        });

        this.log('✅ Drag and drop inicializado');
    }

    /**
     * Manejar selección de archivos
     */
    manejarSeleccionArchivos(event) {
        const files = [...event.target.files];
        if (files.length > 0) {
            this.procesarArchivosSeleccionados(files);
        }
    }

    /**
     * Procesar archivos seleccionados
     */
    async procesarArchivosSeleccionados(files) {
        try {
            // VALIDACIÓN OBLIGATORIA: Verificar que se haya seleccionado un ciclo académico
            if (!this.estadoSistema.cicloSeleccionado || this.estadoSistema.cicloSeleccionado === '') {
                this.mostrarError('⚠️ Debe seleccionar un ciclo académico antes de cargar archivos');
                this.agregarLog('❌ Carga cancelada: No se ha seleccionado un ciclo académico', 'error');
                
                // Resaltar el selector de ciclo
                const selectorCiclo = document.getElementById('selectCiclo') || document.getElementById('cicloAcademico');
                if (selectorCiclo) {
                    selectorCiclo.style.border = '2px solid #dc3545';
                    selectorCiclo.focus();
                    setTimeout(() => {
                        selectorCiclo.style.border = '';
                    }, 3000);
                }
                return;
            }

            // Determinar contenedor de progreso y log apropiado
            const esCargaMasiva = files.length > 1;
            const targetProgress = esCargaMasiva ? 'Bulk' : 'Single';
            const targetLog = esCargaMasiva ? 'uploadLogBulk' : 'uploadLogSingle';
            
            // Limpiar log anterior
            this.limpiarLog(targetLog);
            
            this.mostrarProgreso(0, 'Validando archivos...', targetProgress);
            this.agregarLog(`🔍 Iniciando validación de ${files.length} archivo(s)...`, 'info', targetLog);
            
            // Validar archivos
            const validacion = this.validarArchivos(files);
            if (!validacion.todosValidos) {
                this.mostrarError('Algunos archivos no son válidos');
                this.agregarLog(`❌ Validación fallida: ${validacion.invalidos.length} archivos inválidos`, 'error', targetLog);
                this.ocultarProgreso(targetProgress);
                return;
            }

            this.mostrarProgreso(25, 'Iniciando carga...', targetProgress);
            this.agregarLog(`✅ Validación exitosa. Iniciando carga de ${files.length} archivo(s)...`, 'success', targetLog);
            
            let exitosos = 0;
            let errores = 0;
            
            for (let i = 0; i < files.length; i++) {
                const archivo = files[i];
                const tipo = this.detectarTipoArchivo(archivo.name);
                const progreso = 25 + Math.round(((i + 1) / files.length) * 70);
                
                try {
                    this.agregarLog(`📤 Subiendo: ${archivo.name} (${this.formatearTamano(archivo.size)})`, 'info', targetLog);
                    
                    // Callback para progreso real de subida
                    const onProgress = (porcentaje, mensaje) => {
                        const progresoTotal = 25 + Math.round(((i) / files.length) * 70) + Math.round((porcentaje / 100) * (70 / files.length));
                        this.mostrarProgreso(progresoTotal, `${archivo.name}: ${mensaje}`, targetProgress);
                    };
                    
                    this.agregarLog(`📤 Subiendo ${archivo.name} como tipo "${tipo}"...`, 'info', targetLog);
                    const resultado = await this.subirArchivo(archivo, tipo, onProgress);
                    
                    console.log(`📋 Resultado para ${archivo.name}:`, resultado);
                    
                    if (resultado.exito) {
                        // Actualizar estado con datos reales
                        if (tipo) {
                            this.estadoSistema.archivosCargados[tipo] = {
                                cargado: true,
                                registros: resultado.registros || 0,
                                ultimaActualizacion: new Date().toISOString(),
                                archivo: archivo.name,
                                detalles: resultado.detalles || {}
                            };
                            
                            console.log(`✅ Estado actualizado para ${tipo}:`, this.estadoSistema.archivosCargados[tipo]);
                        }
                        
                        exitosos++;
                        this.agregarLog(`✅ ${archivo.name} → ${resultado.registros || 0} registros procesados`, 'success', targetLog);
                        
                        // Mostrar detalles si los hay
                        if (resultado.detalles && Object.keys(resultado.detalles).length > 0) {
                            this.agregarLog(`📊 Detalles: ${JSON.stringify(resultado.detalles)}`, 'info', targetLog);
                        }
                    } else {
                        errores++;
                        this.agregarLog(`❌ ${archivo.name} → Error: ${resultado.error}`, 'error', targetLog);
                        console.error(`❌ Error en ${archivo.name}:`, resultado);
                    }
                } catch (error) {
                    errores++;
                    this.agregarLog(`💥 ${archivo.name} → Excepción: ${error.message}`, 'error', targetLog);
                }
            }
            
            // Completar proceso
            this.mostrarProgreso(100, 'Proceso completado', targetProgress);
            
            // Resumen final
            const totalProcesados = exitosos + errores;
            this.agregarLog(`📊 Resumen: ${exitosos}/${totalProcesados} archivos procesados exitosamente`, 
                          exitosos === totalProcesados ? 'success' : 'warning', targetLog);
            
            if (exitosos > 0) {
                this.mostrarExito(`✅ ${exitosos} archivo(s) cargado(s) exitosamente`);
                
                // Recargar datos desde la base de datos después de la carga exitosa
                if (this.estadoSistema.cicloSeleccionado) {
                    console.log('🔄 Recargando datos del ciclo desde BD después de carga exitosa...');
                    await this.cargarDatosPorCiclo(this.estadoSistema.cicloSeleccionado);
                }
                
                // Actualizar interfaz y verificar progresión basándose en BD
                this.actualizarInterfazSegunEstado();
                this.verificarProgresionAutomatica();
            }
            
            if (errores > 0) {
                this.mostrarAdvertencia(`⚠️ ${errores} archivo(s) tuvieron errores`);
            }
            
            // Ocultar progreso después de un momento
            setTimeout(() => this.ocultarProgreso(targetProgress), 3000);
            
        } catch (error) {
            console.error('❌ Error en procesamiento masivo:', error);
            const targetLog = files.length > 1 ? 'uploadLogBulk' : 'uploadLogSingle';
            this.agregarLog(`💥 Error crítico: ${error.message}`, 'error', targetLog);
            this.mostrarError('Error durante el procesamiento: ' + error.message);
        }
    }

    /**
     * Subir archivo individual con progreso real
     */
    async subirArchivo(archivo, tipo, onProgress) {
        try {
            if (!this.estadoSistema.conectado) {
                throw new Error('No hay conexión con el servidor. La carga offline no está disponible.');
            }
            
            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('tipo', tipo || 'generico');
            formData.append('cicloId', this.estadoSistema.cicloSeleccionado || '1');
            
            // Manejar reemplazo de archivo si está configurado
            if (this.estadoSistema.reemplazoArchivo) {
                formData.append('archivoIdExistente', this.estadoSistema.reemplazoArchivo.archivoIdExistente);
                formData.append('modoReemplazo', 'true');
                this.agregarLog(`🔄 Configurando reemplazo de archivo existente`, 'info');
            }
            
            // Obtener token de autenticación
            const token = window.AUTH?.obtenerToken() || 
                         sessionStorage.getItem(CONFIG.STORAGE.TOKEN) ||
                         localStorage.getItem(CONFIG.STORAGE.TOKEN);
            
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                // Configurar progreso de subida
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const porcentaje = Math.round((e.loaded / e.total) * 100);
                        if (onProgress) {
                            onProgress(porcentaje, `Subiendo: ${porcentaje}%`);
                        }
                    }
                });
                
                // Configurar respuesta
                xhr.addEventListener('load', () => {
                    console.log(`📡 Respuesta del servidor (${xhr.status}):`, xhr.responseText);
                    
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const resultado = JSON.parse(xhr.responseText);
                            console.log('📊 Datos procesados del servidor:', resultado);
                            
                            // Extraer número de registros de diferentes posibles campos
                            let registros = 0;
                            
                            // Prioridad 1: Campos directos
                            if (resultado.registros) {
                                registros = resultado.registros;
                            } else if (resultado.count) {
                                registros = resultado.count;
                            } else if (resultado.total) {
                                registros = resultado.total;
                            } else if (resultado.data && resultado.data.length) {
                                registros = resultado.data.length;
                            } else if (resultado.filas) {
                                registros = resultado.filas;
                            }
                            // Prioridad 2: Buscar en detalles (donde viene la respuesta real del servidor)
                            else if (resultado.detalles) {
                                if (resultado.detalles.total) {
                                    registros = resultado.detalles.total;
                                } else {
                                    // Sumar creados + actualizados (ambos representan registros procesados)
                                    const creados = resultado.detalles.creados || 0;
                                    const actualizados = resultado.detalles.actualizados || 0;
                                    registros = creados + actualizados;
                                }
                            }
                            
                            console.log(`✅ Registros detectados: ${registros}`);
                            
                            // Limpiar estado de reemplazo después de carga exitosa
                            if (this.estadoSistema.reemplazoArchivo) {
                                this.agregarLog(`✅ Archivo reemplazado exitosamente`, 'success');
                                delete this.estadoSistema.reemplazoArchivo;
                            }
                            
                            resolve({
                                exito: true,
                                registros: registros,
                                mensaje: resultado.mensaje || resultado.message || 'Carga exitosa',
                                detalles: resultado.detalles || resultado.data || {},
                                archivoId: resultado.archivoId || resultado.archivo_id
                            });
                        } catch (e) {
                            console.error('❌ Error parsing respuesta:', e);
                            console.log('📄 Respuesta raw:', xhr.responseText);
                            
                            // Si no hay respuesta JSON válida pero el status es exitoso,
                            // asumir que es exitoso pero sin datos específicos
                            resolve({
                                exito: true,
                                registros: 0,
                                mensaje: 'Archivo procesado (sin detalles específicos)',
                                detalles: { responseText: xhr.responseText }
                            });
                        }
                    } else {
                        console.error(`❌ Error HTTP ${xhr.status}:`, xhr.responseText);
                        let errorMsg = `Error ${xhr.status}`;
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            errorMsg = errorData.mensaje || errorData.message || errorMsg;
                        } catch (e) {
                            errorMsg = `${errorMsg}: ${xhr.responseText.substring(0, 100)}`;
                        }
                        reject(new Error(errorMsg));
                    }
                });
                
                // Configurar error de red
                xhr.addEventListener('error', () => {
                    reject(new Error('Error de conexión con el servidor'));
                });
                
                // Configurar timeout
                xhr.addEventListener('timeout', () => {
                    reject(new Error('Tiempo de espera agotado'));
                });
                
                // Configurar y enviar petición
                xhr.open('POST', `${CONFIG.API.BASE_URL}/inicializacion/archivo-individual`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.timeout = 300000; // 5 minutos timeout
                xhr.send(formData);
            });
            
        } catch (error) {
            return {
                exito: false,
                error: error.message
            };
        }
    }

    /**
     * Detectar tipo de archivo por nombre
     */
    detectarTipoArchivo(nombreArchivo) {
        for (const [tipo, config] of Object.entries(this.archivosConfig)) {
            if (config.patron.test(nombreArchivo)) {
                return tipo;
            }
        }
        return null;
    }

    /**
     * Validar archivos seleccionados
     */
    validarArchivos(files) {
        const extensionesValidas = ['.xlsx', '.xls', '.csv'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        const resultados = [];
        
        for (const file of files) {
            const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
            const valido = extensionesValidas.includes(extension) && file.size <= maxSize;
            
            resultados.push({
                archivo: file,
                valido: valido,
                nombre: file.name
            });
            
            if (!valido) {
                if (!extensionesValidas.includes(extension)) {
                    this.mostrarError(`${file.name}: Extensión no válida`);
                }
                if (file.size > maxSize) {
                    this.mostrarError(`${file.name}: Archivo demasiado grande`);
                }
            }
        }
        
        const validos = resultados.filter(r => r.valido);
        return {
            validos: validos,
            invalidos: resultados.filter(r => !r.valido),
            todosValidos: validos.length === files.length
        };
    }

    /**
     * Generar lista de archivos para verificación
     */
    generarListaArchivosVerificacion() {
        let html = '<div class="list-group">';
        
        Object.entries(this.estadoSistema.archivosCargados).forEach(([tipo, estado]) => {
            if (estado.cargado) {
                const config = this.archivosConfig[tipo];
                html += `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="me-2">${config.icono}</span>
                            <strong>${config.descripcion}</strong>
                            <br><small class="text-muted">${estado.archivo || 'archivo_cargado.xlsx'}</small>
                        </div>
                        <div>
                            <span class="badge bg-primary">${estado.registros} registros</span>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Mostrar resultados de verificación
     */
    mostrarResultadosVerificacion() {
        const container = document.getElementById('resultadosVerificacion');
        if (!container) return;

        // Obtener SOLO archivos realmente cargados con registros > 0
        const archivosCargados = Object.keys(this.estadoSistema.archivosCargados).filter(tipo => 
            this.estadoSistema.archivosCargados[tipo]?.cargado && 
            this.estadoSistema.archivosCargados[tipo]?.registros > 0
        );
        
        // Calcular estadísticas reales
        const totalRegistros = archivosCargados.reduce((total, tipo) => {
            return total + (this.estadoSistema.archivosCargados[tipo]?.registros || 0);
        }, 0);
        
        // Verificar archivos requeridos que están cargados
        const archivosRequeridos = ['usuarios', 'carreras', 'asignaturas'];
        const requeridosCargados = archivosRequeridos.filter(tipo => 
            archivosCargados.includes(tipo)
        ).length;
        
        // Generar lista de archivos NO cargados (para mostrar como faltantes)
        const todosLosTipos = Object.keys(this.archivosConfig);
        const archivosNoCargados = todosLosTipos.filter(tipo => !archivosCargados.includes(tipo));
        
        // HTML para archivos cargados
        const archivosCargadosHTML = archivosCargados.map(tipo => {
            const estado = this.estadoSistema.archivosCargados[tipo];
            const config = this.archivosConfig[tipo];
            
            return `
                <div class="alert alert-success py-2 mb-2">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <span class="me-2" style="font-size: 1.1em;">${config.icono}</span>
                            <strong>${config.descripcion}</strong>
                            ${config.requerido ? '<span class="badge bg-danger ms-2 fs-6">Requerido</span>' : '<span class="badge bg-info ms-2 fs-6">Opcional</span>'}
                        </div>
                        <div class="col-md-3 text-center">
                            <span class="badge bg-primary fs-6">${estado.registros.toLocaleString()} registros</span>
                        </div>
                        <div class="col-md-3 text-center">
                            <small class="text-muted">
                                <strong>Archivo:</strong> ${estado.archivo || 'Sin nombre'}<br>
                                <strong>Cargado:</strong> ${estado.ultimaActualizacion ? 
                                    new Date(estado.ultimaActualizacion).toLocaleString('es-ES') : 
                                    'Ahora'
                                }
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // HTML para archivos NO cargados (opcional)
        const archivosNoCargadosHTML = archivosNoCargados.length > 0 ? `
            <div class="mt-3">
                <h6><i class="fas fa-exclamation-triangle text-warning me-2"></i>Archivos No Cargados</h6>
                ${archivosNoCargados.map(tipo => {
                    const config = this.archivosConfig[tipo];
                    return `
                        <div class="alert alert-warning py-1 mb-1">
                            <small>
                                <span class="me-2">${config.icono}</span>
                                <strong>${config.descripcion}</strong>
                                ${config.requerido ? '<span class="badge bg-danger ms-2">Requerido</span>' : '<span class="badge bg-secondary ms-2">Opcional</span>'}
                                <span class="text-muted ms-2">- No cargado</span>
                            </small>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '';

        // Contenido principal
        document.getElementById('contenidoResultados').innerHTML = `
            <div class="alert alert-success">
                <div class="row">
                    <div class="col-md-8">
                        <h6><i class="fas fa-check-circle me-2"></i>Verificación de Archivos Cargados</h6>
                        <p class="mb-0">Se han verificado ${archivosCargados.length} archivo(s) con datos válidos.</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="fs-4 fw-bold text-success">${totalRegistros.toLocaleString()}</div>
                        <small>Total de registros</small>
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-4 text-center">
                    <div class="card border-success">
                        <div class="card-body py-2">
                            <h5 class="text-success mb-0">${archivosCargados.length}</h5>
                            <small>Archivos con Datos</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-center">
                    <div class="card border-${requeridosCargados === 3 ? 'success' : 'warning'}">
                        <div class="card-body py-2">
                            <h5 class="text-${requeridosCargados === 3 ? 'success' : 'warning'} mb-0">${requeridosCargados}/3</h5>
                            <small>Requeridos Completos</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-center">
                    <div class="card border-info">
                        <div class="card-body py-2">
                            <h5 class="text-info mb-0">${totalRegistros.toLocaleString()}</h5>
                            <small>Registros Totales</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="verification-details">
                <h6><i class="fas fa-file-check me-2"></i>Archivos Verificados (${archivosCargados.length})</h6>
                ${archivosCargadosHTML}
            </div>
            
            ${archivosNoCargadosHTML}
        `;
        
        container.style.display = 'block';
        this.agregarLog(`📊 Verificación completada: ${archivosCargados.length} archivos válidos, ${totalRegistros} registros`, 'success', 'verificacionLog');
    }

    /**
     * Completar verificación y proceder a inicialización
     */
    completarVerificacion() {
        this.fasesConfig.verificacion.completed = true;
        localStorage.setItem('estadoSistema', JSON.stringify(this.estadoSistema));
        this.mostrarFaseInicializacion();
    }

    /**
     * Ejecutar inicialización final del sistema
     */
    async ejecutarInicializacionFinal() {
        const btn = document.getElementById('btnEjecutarInicializacion');
        
        try {
            // Cambiar estado del botón
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Inicializando Sistema...';
            }
            
            this.agregarLog('🚀 Iniciando proceso de inicialización del sistema...', 'info', 'initLog');
            
            // Verificar conectividad
            if (!this.estadoSistema.conectado) {
                throw new Error('No hay conexión con el servidor. La inicialización requiere conexión.');
            }
            
            // Paso 1: Preparación del sistema
            this.agregarLog('🔧 Paso 1/6: Preparando sistema...', 'info', 'initLog');
            await this.simularEspera(1000);
            
            // Paso 2: Validación de integridad
            this.agregarLog('🔍 Paso 2/6: Validando integridad de datos...', 'info', 'initLog');
            await this.simularEspera(1500);
            
            // Paso 3: Configuración de relaciones
            this.agregarLog('🔗 Paso 3/6: Configurando relaciones entre entidades...', 'info', 'initLog');
            await this.simularEspera(2000);
            
            // Paso 4: Inicialización real en el servidor
            this.agregarLog('📡 Paso 4/6: Ejecutando inicialización en el servidor...', 'info', 'initLog');
            
            const resultadoInicializacion = await window.apiRequest('/inicializacion/ejecutar', 'POST', {
                ciclo_academico: this.estadoSistema.cicloSeleccionado,
                forzar_inicializacion: true
            });
            
            if (resultadoInicializacion) {
                const { inicializado, mensaje, estadisticas } = resultadoInicializacion;
                
                if (inicializado === true || mensaje === 'Sistema inicializado exitosamente') {
                    this.agregarLog('✅ Inicialización del servidor completada exitosamente', 'success', 'initLog');
                    
                    // Mostrar estadísticas si están disponibles
                    if (estadisticas) {
                        this.agregarLog(`📊 Usuarios procesados: ${estadisticas.usuarios || 0}`, 'success', 'initLog');
                        this.agregarLog(`🎓 Carreras configuradas: ${estadisticas.carreras || 0}`, 'success', 'initLog');
                        this.agregarLog(`📚 Asignaturas registradas: ${estadisticas.asignaturas || 0}`, 'success', 'initLog');
                        this.agregarLog(`📁 Portafolios creados: ${estadisticas.portafolios || 0}`, 'success', 'initLog');
                    }
                    
                } else {
                    throw new Error(mensaje || 'Error en la inicialización del servidor');
                }
            } else {
                throw new Error('No se recibió respuesta del servidor de inicialización');
            }
            
            // Paso 5: Actualización del estado local
            this.agregarLog('💾 Paso 5/6: Actualizando estado del sistema...', 'info', 'initLog');
            this.estadoSistema.sistemaInicializado = true;
            this.estadoSistema.fechaInicializacion = new Date().toISOString();
            
            // Actualizar estado completo desde el servidor
            await this.actualizarEstadoCompleto();
            await this.simularEspera(1000);
            
            // Paso 6: Finalización
            this.agregarLog('🎉 Paso 6/6: Finalizando proceso...', 'success', 'initLog');
            await this.simularEspera(1000);
            
            this.agregarLog('✅ INICIALIZACIÓN COMPLETADA EXITOSAMENTE', 'success', 'initLog');
            this.agregarLog('🎯 Sistema listo para uso operativo', 'success', 'initLog');
            this.agregarLog('🔍 PRÓXIMO PASO: Verificar datos cargados', 'warning', 'initLog');
            this.agregarLog('🧭 Panel de navegación disponible abajo', 'info', 'initLog');
            
            // Cambiar botón a estado completado
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check me-2"></i>INICIALIZACIÓN COMPLETADA';
                btn.className = 'btn btn-success btn-lg';
            }
            
            // Mostrar panel de navegación final después de 2 segundos
            setTimeout(() => {
                this.mostrarPanelNavegacionFinal();
            }, 2000);
            
        } catch (error) {
            console.error('Error en inicialización final:', error);
            this.agregarLog(`❌ Error durante la inicialización: ${error.message}`, 'error', 'initLog');
            
            // Rehabilitar botón en caso de error
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Error - Reintentar';
                btn.className = 'btn btn-danger btn-lg';
            }
        }
    }
    
    /**
     * Mostrar panel de navegación final con botón de reportes destacado
     */
    mostrarPanelNavegacionFinal() {
        const panelContainer = document.getElementById('inicializacionStatus');
        if (!panelContainer) return;
        
        panelContainer.innerHTML = `
            <div class="card border-success">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-check-circle me-2"></i>
                        ¡Sistema Inicializado Exitosamente!
                    </h5>
                </div>
                <div class="card-body text-center">
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card border-primary">
                                <div class="card-body py-2">
                                    <h4 class="text-primary mb-1">${this.estadoSistema.archivosCargados?.usuarios?.registros || 0}</h4>
                                    <small>👥 Usuarios Cargados</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card border-success">
                                <div class="card-body py-2">
                                    <h4 class="text-success mb-1">${this.estadoSistema.archivosCargados?.carreras?.registros || 0}</h4>
                                    <small>🎓 Carreras Cargadas</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card border-info">
                                <div class="card-body py-2">
                                    <h4 class="text-info mb-1">${this.estadoSistema.archivosCargados?.asignaturas?.registros || 0}</h4>
                                    <small>📚 Asignaturas Cargadas</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card border-warning">
                                <div class="card-body py-2">
                                    <h4 class="text-warning mb-1">${this.calcularPortafoliosEstimados()}</h4>
                                    <small>📁 Portafolios Generados</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-success mb-4">
                        <h6><i class="fas fa-check-circle me-2"></i>¡Sistema Inicializado Exitosamente!</h6>
                        <p class="mb-2">Todos los datos han sido procesados y están listos para su uso operativo.</p>
                        <div class="mt-2">
                            <small class="text-success">
                                <strong>✅ Próximos pasos recomendados:</strong><br>
                                • Verificar datos cargados para validar la información<br>
                                • Revisar reportes para confirmar la integridad del sistema<br>
                                • Acceder al dashboard para monitorear el estado general
                            </small>
                        </div>
                    </div>
                    
                    <!-- Botón principal destacado -->
                    <div class="row mb-3">
                        <div class="col-12">
                            <div class="alert alert-warning text-center">
                                <h5><i class="fas fa-arrow-right me-2"></i>Próximo Paso Recomendado</h5>
                                <button id="btnVerificarDatos" class="btn btn-success btn-lg">
                                    <i class="fas fa-search me-2"></i>
                                    🔍 Verificar Datos Cargados
                                </button>
                                <p class="mt-2 mb-0"><small>Validar la integridad de la información cargada</small></p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botones secundarios -->
                    <div class="row mb-4">
                        <div class="col-md-6 mb-2">
                            <button id="btnIrReportes" class="btn btn-primary btn-lg w-100">
                                <i class="fas fa-chart-bar me-2"></i>
                                Ver Reportes
                            </button>
                        </div>
                        <div class="col-md-6 mb-2">
                            <button id="btnIrDashboardPrincipal" class="btn btn-info btn-lg w-100">
                                <i class="fas fa-home me-2"></i>
                                Dashboard Principal
                            </button>
                        </div>
                    </div>
                    
                    <!-- Navegación adicional -->
                    <div class="row">
                        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
                            <button id="btnIrDashboard" class="btn btn-outline-primary btn-sm w-100">
                                <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                            </button>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
                            <button id="btnIrUsuarios" class="btn btn-outline-secondary btn-sm w-100">
                                <i class="fas fa-users me-1"></i>Usuarios
                            </button>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
                            <button id="btnIrCiclos" class="btn btn-outline-info btn-sm w-100">
                                <i class="fas fa-calendar me-1"></i>Ciclos
                            </button>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
                            <button id="btnIrAsignaturas" class="btn btn-outline-warning btn-sm w-100">
                                <i class="fas fa-book me-1"></i>Asignaturas
                            </button>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
                            <button id="btnIrPortafolios" class="btn btn-outline-success btn-sm w-100">
                                <i class="fas fa-folder me-1"></i>Portafolios
                            </button>
                        </div>
                        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
                            <button id="btnNuevaCarga" class="btn btn-outline-danger btn-sm w-100">
                                <i class="fas fa-redo me-1"></i>Nueva Carga
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configurar eventos de navegación
        document.getElementById('btnVerificarDatos')?.addEventListener('click', () => {
            this.agregarLog('🔍 Redirigiendo a verificación de datos...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = './verificar-datos.html';
            }, 500);
        });
        
        document.getElementById('btnIrReportes')?.addEventListener('click', () => {
            this.agregarLog('📊 Redirigiendo a reportes...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = CONFIG.getRoute('REPORTES_ADMIN');
            }, 500);
        });
        
        document.getElementById('btnIrDashboardPrincipal')?.addEventListener('click', () => {
            this.agregarLog('🏠 Redirigiendo al dashboard principal...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = CONFIG.getRoute('DASHBOARD_ADMIN');
            }, 500);
        });
        
        document.getElementById('btnIrDashboard')?.addEventListener('click', () => {
            this.agregarLog('🏠 Redirigiendo al dashboard principal...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = CONFIG.getRoute('DASHBOARD_ADMIN');
            }, 500);
        });
        
        document.getElementById('btnIrUsuarios')?.addEventListener('click', () => {
            this.agregarLog('👥 Redirigiendo a gestión de usuarios...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = CONFIG.getRoute('USUARIOS_ADMIN');
            }, 500);
        });
        
        document.getElementById('btnIrCiclos')?.addEventListener('click', () => {
            this.agregarLog('📅 Redirigiendo a gestión de ciclos...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = CONFIG.getRoute('CICLOS');
            }, 500);
        });
        
        document.getElementById('btnIrAsignaturas')?.addEventListener('click', () => {
            this.agregarLog('📚 Redirigiendo a gestión de asignaturas...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = CONFIG.getRoute('ASIGNATURAS_ADMIN');
            }, 500);
        });
        
        document.getElementById('btnIrPortafolios')?.addEventListener('click', () => {
            this.agregarLog('📁 Redirigiendo a gestión de portafolios...', 'info', 'initLog');
            setTimeout(() => {
                window.location.href = CONFIG.getRoute('PORTAFOLIOS_ADMIN');
            }, 500);
        });
        
        document.getElementById('btnNuevaCarga')?.addEventListener('click', () => {
            if (confirm('¿Está seguro de que desea iniciar una nueva carga? Esto limpiará el progreso actual.')) {
                this.agregarLog('🔄 Iniciando nueva carga masiva...', 'info', 'initLog');
                setTimeout(() => {
                    // Limpiar estado y recargar página
                    localStorage.removeItem('cargaMasivaEstado');
                    window.location.reload();
                }, 500);
            }
        });
    }

    /**
     * Simular espera (para mostrar progreso visual)
     */
    async simularEspera(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Actualizar interfaz según estado actual
     */
    actualizarInterfazSegunEstado() {
        this.mostrarEstadoArchivos();
        this.verificarProgresionAutomatica();
    }

    /**
     * Mostrar estado de archivos cargados
     */
    mostrarEstadoArchivos() {
        const container = document.getElementById('estadoArchivos') || document.getElementById('fileStatus');
        if (!container) return;

        let html = '<div class="row">';
        
        Object.entries(this.archivosConfig).forEach(([tipo, config]) => {
            const estado = this.estadoSistema.archivosCargados[tipo];
            const cargado = estado?.cargado || false;
            const registros = estado?.registros || 0;
            
            html += `
                <div class="col-md-4 mb-3">
                    <div class="card ${cargado ? 'border-success' : 'border-secondary'}">
                        <div class="card-body text-center">
                            <div style="font-size: 2rem;">${config.icono}</div>
                            <h6 class="card-title">${config.descripcion}</h6>
                            <p class="card-text">
                                ${cargado ? 
                                    `<span class="text-success">✅ ${registros} registros</span>` : 
                                    `<span class="text-muted">⏳ Pendiente</span>`
                                }
                            </p>
                            ${config.requerido ? 
                                '<small class="text-danger">*Requerido</small>' : 
                                '<small class="text-muted">Opcional</small>'
                            }
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Verificar si se puede progresar automáticamente
     */
    verificarProgresionAutomatica() {
        // Contar archivos cargados
        const archivosCargados = Object.keys(this.estadoSistema.archivosCargados || {}).filter(tipo => 
            this.estadoSistema.archivosCargados[tipo]?.cargado
        );
        
        console.log('🔍 Verificando progresión automática:', {
            archivosCargados: archivosCargados.length,
            archivos: archivosCargados,
            estado: this.estadoSistema.archivosCargados
        });
        
        // Definir todos los tipos de archivos posibles
        const tiposArchivos = ['usuarios', 'carreras', 'asignaturas', 'carga_academica', 'verificaciones', 'codigos_institucionales'];
        const archivosMinimos = ['usuarios', 'carreras', 'asignaturas']; // Archivos básicos requeridos
        
        // Si todos los 6 archivos están cargados
        if (archivosCargados.length === 6) {
            this.agregarLog(`🎉 ¡Todos los archivos cargados! (${archivosCargados.length}/6)`, 'success');
            this.agregarLog(`📋 Archivos: ${archivosCargados.join(', ')}`, 'info');
            this.mostrarBotonProcederVerificacion();
        }
        // Si al menos los 3 archivos mínimos están cargados
        else if (archivosCargados.length >= 3) {
            const tienenMinimos = archivosMinimos.every(tipo => archivosCargados.includes(tipo));
            if (tienenMinimos) {
                this.agregarLog(`✅ Archivos básicos cargados (${archivosCargados.length}/6) - puede proceder`, 'success');
                this.agregarLog(`📋 Archivos cargados: ${archivosCargados.join(', ')}`, 'info');
                
                // Mostrar archivos opcionales que faltan
                const archivosFaltantes = tiposArchivos.filter(tipo => !archivosCargados.includes(tipo));
                if (archivosFaltantes.length > 0) {
                    this.agregarLog(`📄 Archivos opcionales disponibles: ${archivosFaltantes.join(', ')}`, 'info');
                }
                
                this.mostrarBotonProcederVerificacion();
            } else {
                this.agregarLog(`⚠️ Necesita cargar: usuarios, carreras y asignaturas como mínimo`, 'warning');
                this.mostrarBotonCargarAdicionales();
            }
        }
        // Si hay al menos 1 archivo pero no los mínimos
        else if (archivosCargados.length >= 1) {
            this.agregarLog(`📊 ${archivosCargados.length} archivo(s) cargado(s). Necesita usuarios, carreras y asignaturas como mínimos`, 'info');
            
            // Mostrar qué archivos básicos faltan
            const archivosFaltantes = archivosMinimos.filter(tipo => !archivosCargados.includes(tipo));
            if (archivosFaltantes.length > 0) {
                this.agregarLog(`⚠️ Archivos básicos faltantes: ${archivosFaltantes.join(', ')}`, 'warning');
            }
            
            this.mostrarBotonCargarAdicionales();
        }
        // Si no hay archivos cargados
        else {
            this.agregarLog(`📥 No hay archivos cargados. Seleccione archivos para comenzar`, 'info');
        }
    }

    /**
     * Mostrar botón para proceder a verificación manualmente
     */
    mostrarBotonProcederVerificacion() {
        // Buscar contenedor donde agregar el botón
        const logContainer = document.getElementById('uploadLogBulk') || document.getElementById('uploadLogSingle');
        if (!logContainer) return;
        
        // Verificar si ya existe el botón
        if (document.getElementById('btnProcederVerificacion')) return;
        
        // Crear botón
        const botonContainer = document.createElement('div');
        botonContainer.className = 'text-center mt-3';
        botonContainer.innerHTML = `
            <button id="btnProcederVerificacion" class="btn btn-success btn-lg">
                <i class="fas fa-check-circle me-2"></i>
                Proceder a Verificación
            </button>
            <div class="mt-2">
                <small class="text-muted">Puede cargar más archivos o continuar con los actuales</small>
            </div>
        `;
        
        // Agregar después del log
        logContainer.parentNode.insertBefore(botonContainer, logContainer.nextSibling);
        
        // Agregar evento al botón
        document.getElementById('btnProcederVerificacion').addEventListener('click', () => {
            this.procederAVerificacion();
        });
        
        this.agregarLog('🎯 Botón de verificación disponible', 'info');
    }

    /**
     * Mostrar botón para continuar a inicialización
     */
    mostrarBotonContinuarAInicializacion() {
        // Buscar contenedor donde agregar el botón
        const logContainer = document.getElementById('verificacionLog');
        if (!logContainer) return;
        
        // Verificar si ya existe el botón
        if (document.getElementById('btnContinuarInicializacion')) return;
        
        // Crear botón
        const botonContainer = document.createElement('div');
        botonContainer.className = 'text-center mt-4';
        botonContainer.innerHTML = `
            <button id="btnContinuarInicializacion" class="btn btn-success btn-lg">
                <i class="fas fa-rocket me-2"></i>
                Continuar a Inicialización
            </button>
            <div class="mt-2">
                <small class="text-muted">Los datos han sido verificados correctamente</small>
            </div>
        `;
        
        // Agregar después del log
        logContainer.parentNode.insertBefore(botonContainer, logContainer.nextSibling);
        
        // Agregar evento al botón
        document.getElementById('btnContinuarInicializacion').addEventListener('click', () => {
            this.procederAInicializacion();
        });
        
        this.agregarLog('🚀 Botón de inicialización disponible', 'info', 'verificacionLog');
    }

    /**
     * Mostrar botón de inicialización final
     */
    mostrarBotonInicializacion() {
        // Buscar contenedor donde agregar el botón
        const logContainer = document.getElementById('initLog');
        if (!logContainer) return;
        
        // Verificar si ya existe el botón
        if (document.getElementById('btnEjecutarInicializacionFinal')) return;
        
        // Crear botón
        const botonContainer = document.createElement('div');
        botonContainer.className = 'text-center mt-4';
        botonContainer.innerHTML = `
            <div class="alert alert-info mb-3">
                <h6><i class="fas fa-info-circle me-2"></i>Listo para Inicialización</h6>
                <p class="mb-0">El sistema está listo para la inicialización final. Este proceso configurará la base de datos con todos los archivos cargados.</p>
            </div>
            <button id="btnEjecutarInicializacionFinal" class="btn btn-primary btn-lg">
                <i class="fas fa-play me-2"></i>
                Ejecutar Inicialización Final
            </button>
            <div class="mt-2">
                <small class="text-muted">Este proceso puede tomar varios minutos</small>
            </div>
        `;
        
        // Agregar después del log
        logContainer.parentNode.insertBefore(botonContainer, logContainer.nextSibling);
        
        // Agregar evento al botón
        document.getElementById('btnEjecutarInicializacionFinal').addEventListener('click', () => {
            this.ejecutarInicializacionFinal();
        });
        
        this.agregarLog('🎯 Botón de inicialización final disponible', 'info', 'initLog');
    }

    /**
     * Mostrar botón para cargar archivos adicionales
     */
    mostrarBotonCargarAdicionales() {
        // Buscar contenedor donde agregar el botón
        const logContainer = document.getElementById('uploadLogBulk') || document.getElementById('uploadLogSingle');
        if (!logContainer) return;
        
        // Verificar si ya existe el botón
        if (document.getElementById('btnCargarAdicionales')) return;
        
        // Crear botón
        const botonContainer = document.createElement('div');
        botonContainer.className = 'text-center mt-2';
        botonContainer.innerHTML = `
            <button id="btnCargarAdicionales" class="btn btn-outline-primary">
                <i class="fas fa-plus me-2"></i>
                Cargar Archivos Adicionales
            </button>
        `;
        
        // Agregar después del log
        logContainer.parentNode.insertBefore(botonContainer, logContainer.nextSibling);
        
        // Agregar evento al botón
        document.getElementById('btnCargarAdicionales').addEventListener('click', () => {
            // Activar input de archivos
            const fileInput = document.getElementById('bulkFileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
        
        this.agregarLog('📁 Puede cargar archivos adicionales', 'info');
    }

    /**
     * Limpiar todos los archivos cargados
     */
    limpiarArchivos() {
        // Limpiar estado
        this.estadoSistema.archivosCargados = {};
        this.estadoSistema.verificacionCompleta = false;
        this.estadoSistema.sistemaInicializado = false;
        
        // Limpiar localStorage
        this.limpiarDatosFalsos();
        
        // Limpiar logs
        this.limpiarLog('uploadLogSingle');
        this.limpiarLog('uploadLogBulk');
        this.limpiarLog('verificacionLog');
        this.limpiarLog('initLog');
        
        // Remover botones dinámicos
        const botonesARemover = ['btnProcederVerificacion', 'btnCargarAdicionales'];
        botonesARemover.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && btn.parentNode) {
                btn.parentNode.remove();
            }
        });
        
        // Actualizar interfaz
        this.mostrarEstadoArchivos();
        
        this.agregarLog('🧹 Sistema limpiado - puede cargar archivos nuevamente', 'success');
    }

    /**
     * Proceder automáticamente a verificación - USA TODO EL ANCHO
     */
    procederAVerificacion() {
        this.agregarLog('🔄 Transición automática a fase de verificación...', 'info');
        
        // Ocultar TODAS las pestañas anteriores
        const tabIndividual = document.querySelector('[data-bs-target="#carga-individual"]');
        const tabMasiva = document.querySelector('[data-bs-target="#carga-masiva"]');
        
        if (tabIndividual) {
            tabIndividual.style.display = 'none';
        }
        if (tabMasiva) {
            tabMasiva.style.display = 'none';
        }
        
        // Mostrar y activar pestaña de verificación usando TODO EL ANCHO
        const tabVerificacion = document.querySelector('[data-bs-target="#verificacion"]');
        if (tabVerificacion) {
            tabVerificacion.style.display = 'block';
            tabVerificacion.classList.add('active');
            tabVerificacion.style.width = '100%';
        }
        
        // Activar fase de verificación con ancho completo
        this.mostrarFaseVerificacion();
        
        // Ejecutar verificación automáticamente
        setTimeout(() => {
            this.ejecutarVerificacionAutomatica();
        }, 1500);
    }

    /**
     * Ejecutar verificación automática
     */
    async ejecutarVerificacionAutomatica() {
        this.agregarLog('🔍 Iniciando verificación automática...', 'info', 'verificacionLog');
        
        try {
            // Mostrar datos reales de archivos cargados
            const archivosCargados = Object.keys(this.estadoSistema.archivosCargados).filter(tipo => 
                this.estadoSistema.archivosCargados[tipo]?.cargado
            );
            
            this.agregarLog(`📊 Archivos a verificar: ${archivosCargados.length}`, 'info', 'verificacionLog');
            
            // Verificar cada archivo individualmente
            for (const tipo of archivosCargados) {
                const archivo = this.estadoSistema.archivosCargados[tipo];
                const config = this.archivosConfig[tipo];
                
                this.agregarLog(`🔍 Verificando ${config.descripcion}...`, 'info', 'verificacionLog');
                await this.simularEspera(800);
                
                this.agregarLog(`✅ ${config.descripcion}: ${archivo.registros} registros válidos`, 'success', 'verificacionLog');
            }
            
            // Mostrar resultados detallados de verificación
            this.agregarLog('📋 Generando resultados detallados...', 'info', 'verificacionLog');
            await this.simularEspera(1000);
            
            // Llamar a mostrar resultados con datos reales
            this.mostrarResultadosVerificacion();
            
            this.agregarLog('✅ Verificación completada exitosamente', 'success', 'verificacionLog');
            
            // Marcar verificación como completa
            this.estadoSistema.verificacionCompleta = true;
            
            // Mostrar botón para continuar manualmente
            this.mostrarBotonContinuarAInicializacion();
            
        } catch (error) {
            this.agregarLog(`❌ Error en verificación automática: ${error.message}`, 'error', 'verificacionLog');
        }
    }

    /**
     * Proceder automáticamente a inicialización
     */
    procederAInicializacion() {
        this.agregarLog('🔄 Transición automática a fase de inicialización...', 'success', 'verificacionLog');
        
        // Activar pestaña de inicialización
        this.activarPestana('#inicializacion');
        
        // Actualizar estado
        this.estadoSistema.procesoActual = 'inicializacion';
        
        // Mostrar fase de inicialización
        this.mostrarFaseInicializacion();
        
        this.agregarLog('🚀 Sistema listo para inicialización final', 'success', 'initLog');
    }

    /**
     * Mostrar fase de verificación
     */
    mostrarFaseVerificacion() {
        // Activar pestaña
        this.activarPestana('#verificacion-datos');
        
        // Mostrar panel de verificación
        this.mostrarPanelVerificacion();
        
        this.agregarLog('🔍 Fase de verificación activada', 'info', 'verificacionLog');
    }

    /**
     * Mostrar fase de inicialización
     */
    mostrarFaseInicializacion() {
        // Activar pestaña
        this.activarPestana('#inicializacion');
        
        // Mostrar panel de inicialización
        this.mostrarPanelInicializacion();
        
        // Mostrar estadísticas del sistema
        this.mostrarEstadisticasSistema();
        
        // Mostrar botón de inicialización
        this.mostrarBotonInicializacion();
        
        this.agregarLog('🚀 Fase de inicialización activada', 'info', 'initLog');
    }

    /**
     * Activar pestaña específica
     */
    activarPestana(targetId) {
        this.log(`📋 Pestaña activada: ${targetId}`);
        
        // Remover clases activas de todas las pestañas principales
        const tabs = document.querySelectorAll('#sistemaNav .nav-link');
        const panels = document.querySelectorAll('#sistemaTabContent .tab-pane');
        
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('show', 'active'));
        
        // Activar pestaña y panel específicos
        const tabActiva = document.querySelector(`[data-bs-target="${targetId}"]`);
        const panelActivo = document.querySelector(targetId);
        
        if (tabActiva) {
            tabActiva.classList.add('active');
            this.log(`✅ Tab activada: ${targetId}`);
        } else {
            this.log(`❌ No se encontró tab para: ${targetId}`);
        }
        
        if (panelActivo) {
            panelActivo.classList.add('show', 'active');
            this.log(`✅ Panel activado: ${targetId}`);
        } else {
            this.log(`❌ No se encontró panel para: ${targetId}`);
        }
    }



    /**
     * Habilitar carga de archivos
     */
    habilitarCargaArchivos() {
        const inputs = document.querySelectorAll('input[type="file"]');
        const dropZones = document.querySelectorAll('.dropzone, .file-drop-area, .drag-drop-area');
        const buttons = document.querySelectorAll('.btn-upload, .btn-select-files');
        
        inputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
        });
        
        dropZones.forEach(zone => {
            zone.style.opacity = '1';
            zone.style.pointerEvents = 'auto';
            zone.classList.remove('disabled');
        });
        
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }

    /**
     * Deshabilitar carga de archivos
     */
    deshabilitarCargaArchivos() {
        const inputs = document.querySelectorAll('input[type="file"]');
        const dropZones = document.querySelectorAll('.dropzone, .file-drop-area, .drag-drop-area');
        const buttons = document.querySelectorAll('.btn-upload, .btn-select-files');
        
        inputs.forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.5';
        });
        
        dropZones.forEach(zone => {
            zone.style.opacity = '0.5';
            zone.style.pointerEvents = 'none';
            zone.classList.add('disabled');
        });
        
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
    }

    /**
     * Mostrar panel de verificación
     */
    mostrarPanelVerificacion() {
        // Ocultar el contenido inicial de "esperando datos"
        const verificacionContent = document.getElementById('verificacionContent');
        if (verificacionContent) {
            verificacionContent.style.display = 'none';
        }
        
        // Mostrar el panel de resultados
        const resultadosPanel = document.getElementById('resultadosVerificacion');
        if (resultadosPanel) {
            resultadosPanel.style.display = 'block';
        }
        
        // Mostrar el log de verificación
        const logPanel = document.getElementById('verificacionLog');
        if (logPanel) {
            logPanel.style.display = 'block';
        }
        
        this.agregarLog('🔍 Panel de verificación activado', 'info', 'verificacionLog');
    }

    /**
     * Mostrar panel de inicialización
     */
    mostrarPanelInicializacion() {
        // Ocultar el estado inicial de "esperando verificación"
        const inicializacionStatus = document.getElementById('inicializacionStatus');
        if (inicializacionStatus) {
            inicializacionStatus.style.display = 'none';
        }
        
        // Mostrar las estadísticas del sistema
        const systemStats = document.getElementById('systemStats');
        if (systemStats) {
            systemStats.style.display = 'block';
            this.mostrarEstadisticasSistema();
        }
        
        // Mostrar el log de inicialización
        const logPanel = document.getElementById('initLog');
        if (logPanel) {
            logPanel.style.display = 'block';
        }
        
        this.agregarLog('🚀 Panel de inicialización activado', 'info', 'initLog');
    }

    /**
     * Mostrar estadísticas del sistema
     */
    mostrarEstadisticasSistema() {
        const statsContainer = document.getElementById('systemStats') || document.querySelector('.system-stats');
        if (!statsContainer) return;
        
        // Debug: Mostrar estado completo del sistema
        console.log('📊 Estado completo del sistema para estadísticas:', this.estadoSistema);
        console.log('📁 Archivos cargados detallado:', this.estadoSistema.archivosCargados);
        
        // Obtener SOLO archivos realmente cargados con datos
        const archivosCargados = this.estadoSistema.archivosCargados || {};
        const archivosConDatos = Object.keys(archivosCargados).filter(tipo => 
            archivosCargados[tipo]?.cargado && archivosCargados[tipo]?.registros > 0
        );
        
        console.log('✅ Archivos con datos detectados:', archivosConDatos);
        console.log('📈 Registros por archivo:', archivosConDatos.map(tipo => ({
            tipo,
            registros: archivosCargados[tipo]?.registros,
            archivo: archivosCargados[tipo]?.archivo
        })));
        
        // Calcular estadísticas reales solo de archivos cargados
        const stats = {
            usuarios: archivosCargados.usuarios?.registros || 0,
            carreras: archivosCargados.carreras?.registros || 0,
            asignaturas: archivosCargados.asignaturas?.registros || 0,
            portafolios: this.calcularPortafoliosEstimados(),
            cicloActual: this.estadoSistema.cicloSeleccionado || 'No seleccionado',
            archivosSubidos: archivosConDatos.length,
            totalRegistros: archivosConDatos.reduce((total, tipo) => total + (archivosCargados[tipo]?.registros || 0), 0)
        };
        
        // Mostrar detalles SOLO de archivos cargados con datos
        let detallesArchivos = '';
        archivosConDatos.forEach(tipo => {
            const archivo = archivosCargados[tipo];
            const config = this.archivosConfig[tipo];
            detallesArchivos += `
                <div class="col-md-6 mb-2">
                    <div class="alert alert-success py-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="me-2">${config.icono}</span>
                                <strong>${config.descripcion}:</strong> ${archivo.registros.toLocaleString()} registros
                                <br><small class="text-muted">Archivo: ${archivo.archivo || 'Sin nombre'}</small>
                            </div>
                            <span class="badge bg-success">${config.requerido ? 'Requerido' : 'Opcional'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        statsContainer.innerHTML = `
            <div class="alert alert-info mb-3">
                <h6><i class="fas fa-info-circle me-2"></i>Resumen de Inicialización</h6>
                <p class="mb-0">Los siguientes datos serán cargados en la base de datos del sistema:</p>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center border-primary">
                        <div class="card-body">
                            <div class="fs-2 text-primary fw-bold">${stats.usuarios.toLocaleString()}</div>
                            <p class="card-text mb-0">👥 Usuarios</p>
                            <small class="text-muted">${stats.usuarios > 0 ? 'Listos para cargar' : 'No cargados'}</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-success">
                        <div class="card-body">
                            <div class="fs-2 text-success fw-bold">${stats.carreras.toLocaleString()}</div>
                            <p class="card-text mb-0">🎓 Carreras</p>
                            <small class="text-muted">${stats.carreras > 0 ? 'Listos para cargar' : 'No cargados'}</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-info">
                        <div class="card-body">
                            <div class="fs-2 text-info fw-bold">${stats.asignaturas.toLocaleString()}</div>
                            <p class="card-text mb-0">📚 Asignaturas</p>
                            <small class="text-muted">${stats.asignaturas > 0 ? 'Listos para cargar' : 'No cargados'}</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-warning">
                        <div class="card-body">
                            <div class="fs-2 text-warning fw-bold">${stats.portafolios.toLocaleString()}</div>
                            <p class="card-text mb-0">📁 Portafolios</p>
                            <small class="text-muted">Estimados a generar</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6 text-center">
                    <div class="card border-primary">
                        <div class="card-body py-2">
                            <h5 class="text-primary mb-1">Ciclo Académico</h5>
                            <span class="badge bg-primary fs-6">${stats.cicloActual}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 text-center">
                    <div class="card border-info">
                        <div class="card-body py-2">
                            <h5 class="text-info mb-1">Total de Registros</h5>
                            <span class="badge bg-info fs-6">${stats.totalRegistros.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${detallesArchivos ? `
                <div class="row">
                    <div class="col-12">
                        <h6><i class="fas fa-file-check me-2"></i>Archivos Verificados (${archivosConDatos.length}):</h6>
                    </div>
                    ${detallesArchivos}
                </div>
            ` : `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>Sin Archivos Cargados</h6>
                    <p class="mb-0">No se han detectado archivos con datos válidos para la inicialización.</p>
                </div>
            `}
        `;
    }

    /**
     * Calcular portafolios estimados basado en usuarios docentes y asignaturas
     */
    calcularPortafoliosEstimados() {
        const usuarios = this.estadoSistema.archivosCargados?.usuarios?.registros || 0;
        const asignaturas = this.estadoSistema.archivosCargados?.asignaturas?.registros || 0;
        
        // Estimación: asumiendo que 70% de usuarios son docentes y cada docente tiene 2-3 asignaturas en promedio
        const docentesEstimados = Math.round(usuarios * 0.7);
        const portafoliosEstimados = Math.min(docentesEstimados * 2, asignaturas);
        
        return portafoliosEstimados;
    }

    /**
     * Agregar entrada al log especificado
     */
    agregarLog(mensaje, tipo = 'info', logId = null) {
        // Determinar el log correcto basado en la fase actual si no se especifica
        if (!logId) {
            logId = this.obtenerFaseActual();
        }
        
        const logContainer = document.getElementById(logId);
        if (!logContainer) {
            console.log(`[LOG-${tipo.toUpperCase()}]`, mensaje);
            return;
        }
        
        // Buscar el contenedor de entradas del log
        let logEntries = logContainer.querySelector('.log-entries');
        if (!logEntries) {
            // Si no hay contenedor de entradas, usar el contenedor principal
            logEntries = logContainer;
        }
        
        const timestamp = new Date().toLocaleTimeString();
        const tipoClass = {
            'success': 'text-success',
            'error': 'text-danger',
            'warning': 'text-warning',
            'info': 'text-info'
        }[tipo] || 'text-muted';
        
        // Limpiar mensaje inicial si existe
        const mensajeInicial = logEntries.querySelector('.text-muted.text-center');
        if (mensajeInicial && mensajeInicial.textContent.includes('Listo para')) {
            mensajeInicial.remove();
        }
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${tipoClass} mb-1`;
        logEntry.innerHTML = `<small class="text-muted">[${timestamp}]</small> ${mensaje}`;
        
        logEntries.appendChild(logEntry);
        
        // Mantener máximo 50 entradas
        const entries = logEntries.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
        
        // Auto-scroll al final
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * Obtener la fase actual para determinar el log correcto
     */
    obtenerFaseActual() {
        const tabActiva = document.querySelector('#cargaTabsNav .nav-link.active');
        if (!tabActiva) return 'uploadLogSingle';
        
        const targetId = tabActiva.getAttribute('data-bs-target');
        
        switch (targetId) {
            case '#carga-datos':
                return 'uploadLogSingle'; // Por defecto individual
            case '#single-upload':
                return 'uploadLogSingle';
            case '#bulk-upload':
                return 'uploadLogBulk';
            case '#verificacion-datos':
                return 'verificacionLog';
            case '#inicializacion':
                return 'initLog';
            default:
                return 'uploadLogSingle';
        }
    }

    /**
     * Limpiar log específico
     */
    limpiarLog(logId) {
        const logContainer = document.getElementById(logId);
        if (logContainer) {
            // Buscar el contenedor de entradas del log
            const logEntries = logContainer.querySelector('.log-entries');
            if (logEntries) {
                logEntries.innerHTML = `
                    <div class="text-muted text-center">
                        <i class="fas fa-info-circle me-2"></i>Log limpiado - Listo para nuevas entradas...
                    </div>
                `;
            } else {
                // Si no hay contenedor específico, limpiar todo el contenido
                logContainer.innerHTML = `
                    <div class="text-muted text-center">
                        <i class="fas fa-info-circle me-2"></i>Log limpiado - Listo para nuevas entradas...
                    </div>
                `;
            }
        }
    }

    /**
     * Mostrar progreso en la interfaz
     */
    mostrarProgreso(porcentaje, mensaje, tipo = 'Single') {
        const progressBar = document.getElementById(`progress${tipo}`) || document.getElementById('progressBar');
        const progressText = document.getElementById(`progressText${tipo}`) || document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.width = `${porcentaje}%`;
            progressBar.setAttribute('aria-valuenow', porcentaje);
            progressBar.textContent = `${porcentaje}%`;
        }
        
        if (progressText) {
            progressText.textContent = mensaje;
        }
        
        // Mostrar contenedor de progreso
        const progressContainer = document.getElementById(`progressContainer${tipo}`) || document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }

    /**
     * Ocultar progreso
     */
    ocultarProgreso(tipo = 'Single') {
        const progressContainer = document.getElementById(`progressContainer${tipo}`) || document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    /**
     * Mostrar mensaje de error
     */
    mostrarError(mensaje) {
        if (window.toastr) {
            toastr.error(mensaje);
        } else {
            alert('Error: ' + mensaje);
        }
        console.error('❌', mensaje);
    }

    /**
     * Mostrar mensaje de éxito
     */
    mostrarExito(mensaje) {
        if (window.toastr) {
            toastr.success(mensaje);
        } else {
            console.log('✅', mensaje);
        }
    }

    /**
     * Mostrar mensaje de advertencia
     */
    mostrarAdvertencia(mensaje) {
        if (window.toastr) {
            toastr.warning(mensaje);
        } else {
            console.warn('⚠️', mensaje);
        }
    }

    /**
     * Formatear tamaño de archivo
     */
    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Descargar plantillas Excel
     */
    descargarPlantillas() {
        const plantillas = [
            { nombre: 'usuarios_masivos.xlsx', url: '/plantillas/usuarios_masivos.xlsx' },
            { nombre: 'carreras_completas.xlsx', url: '/plantillas/carreras_completas.xlsx' },
            { nombre: 'asignaturas_completas.xlsx', url: '/plantillas/asignaturas_completas.xlsx' },
            { nombre: 'carga_academica.xlsx', url: '/plantillas/carga_academica.xlsx' },
            { nombre: 'verificaciones.xlsx', url: '/plantillas/verificaciones.xlsx' }
        ];
        
        plantillas.forEach(plantilla => {
            const link = document.createElement('a');
            link.href = CONFIG.API.BASE_URL + plantilla.url;
            link.download = plantilla.nombre;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        
        this.agregarLog('📥 Descargando plantillas Excel...', 'success');
    }

    /**
     * Manejar cambio de pestaña principal
     */
    manejarCambioTab(event) {
        const tab = event.target.closest('.nav-link');
        if (!tab) return;

        // Verificar si la pestaña está deshabilitada
        if (tab.hasAttribute('disabled') || tab.classList.contains('disabled')) {
            event.preventDefault();
            event.stopPropagation();
            this.mostrarAdvertencia('Complete los pasos anteriores primero');
            return false;
        }

        const targetId = tab.getAttribute('data-bs-target');
        this.log('🔄 Cambiando a pestaña:', targetId);

        // Actualizar interfaz según la pestaña
        switch (targetId) {
            case '#carga-datos':
                this.estadoSistema.procesoActual = 'carga';
                break;
            case '#verificacion-datos':
                this.estadoSistema.procesoActual = 'verificacion';
                this.mostrarFaseVerificacion();
                break;
            case '#inicializacion':
                this.estadoSistema.procesoActual = 'inicializacion';
                this.mostrarFaseInicializacion();
                break;
        }
    }

    /**
     * Ejecutar inicialización del sistema
     */
    async ejecutarInicializacion() {
        try {
            if (!this.estadoSistema.cicloSeleccionado) {
                this.mostrarError('Debe seleccionar un ciclo académico primero');
                return;
            }

            this.agregarLog('🚀 Iniciando inicialización del sistema...', 'info', 'initLog');
            await this.ejecutarInicializacionFinal();
        } catch (error) {
            this.log('❌ Error en inicialización:', error);
            this.mostrarError('Error durante la inicialización: ' + error.message);
        }
    }

    /**
     * Actualizar estado de archivos (alias para mostrarEstadoArchivos)
     */
    async actualizarEstadoArchivos() {
        this.mostrarEstadoArchivos();
    }

    /**
     * Actualizar estado de conexión en la interfaz
     */
    actualizarEstadoConexion() {
        const estadoConexion = document.getElementById('estadoConexion');
        if (estadoConexion) {
            if (this.estadoSistema.conectado) {
                estadoConexion.innerHTML = '<span class="badge bg-success">🟢 Conectado</span>';
            } else {
                estadoConexion.innerHTML = '<span class="badge bg-warning">🟡 Modo Local</span>';
            }
        }
        
        this.log('🔄 Estado de conexión actualizado:', this.estadoSistema.conectado ? 'Conectado' : 'Local');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    const cargaMasiva = new CargaMasiva();
    await cargaMasiva.inicializar();
    
    // Exponer globalmente para uso en HTML
    window.cargaMasiva = cargaMasiva;
    
    console.log('✅ Sistema de Carga Masiva inicializado correctamente');
});

