/**
 * CICLOS - MÓDULO EVENTOS
 * Manejo de eventos e interacciones del usuario
 */

export class CiclosEventos {
    constructor(core, data, ui) {
        this.core = core;
        this.data = data;
        this.ui = ui;
        this.debug = window.ciclosDebug || false;
        this.log('Módulo Eventos inicializado');
    }

    /**
     * Configurar todos los eventos
     */
    configurarEventos() {
        this.configurarEventosFormulario();
        this.configurarEventosTabla();
        this.configurarEventosModales();
        this.configurarEventosPersonalizados();
        this.log('Eventos configurados');
    }

    /**
     * Configurar eventos del formulario
     */
    configurarEventosFormulario() {
        // Botón guardar ciclo
        $(document).on('click', '#btnGuardarCiclo', async () => {
            await this.manejarGuardarCiclo();
        });

        // Botón nuevo ciclo
        $(document).on('click', '#btnNuevoCiclo', () => {
            this.ui.mostrarModalNuevoCiclo();
        });

        // Validación de fechas en tiempo real
        $(document).on('change', '#fechaInicio, #fechaFin', () => {
            this.core.validarFechas();
        });

        // Validación de campos requeridos
        $(document).on('blur', '.form-control[required]', (e) => {
            this.validarCampo(e.target);
        });

        // Botón guardar estados
        $(document).on('click', '#btnGuardarEstados', async () => {
            await this.manejarGuardarEstados();
        });

        this.log('Eventos de formulario configurados');
    }

    /**
     * Configurar eventos de la tabla
     */
    configurarEventosTabla() {
        // Botón editar
        $(document).on('click', '.btn-editar', async (e) => {
            const cicloId = $(e.currentTarget).data('id');
            await this.ui.mostrarModalEditarCiclo(cicloId);
        });

        // Botón activar
        $(document).on('click', '.btn-activar', (e) => {
            const cicloId = $(e.currentTarget).data('id');
            this.confirmarActivarCiclo(cicloId);
        });

        // Botón cerrar
        $(document).on('click', '.btn-cerrar', (e) => {
            const cicloId = $(e.currentTarget).data('id');
            this.confirmarCerrarCiclo(cicloId);
        });

        // Botón eliminar
        $(document).on('click', '.btn-eliminar', (e) => {
            const cicloId = $(e.currentTarget).data('id');
            this.confirmarEliminarCiclo(cicloId);
        });

        // Botón gestionar estados
        $(document).on('click', '.btn-estados', async (e) => {
            const cicloId = $(e.currentTarget).data('id');
            await this.ui.mostrarModalEstados(cicloId);
        });

        this.log('Eventos de tabla configurados');
    }

    /**
     * Configurar eventos de modales
     */
    configurarEventosModales() {
        // Limpiar formulario al cerrar modal
        $('#modalCiclo').on('hidden.bs.modal', () => {
            this.core.limpiarFormularioCiclo();
        });

        // Actualizar tabla al cerrar modal de estados
        $('#modalEstados').on('hidden.bs.modal', async () => {
            await this.ui.actualizarTabla();
        });

        this.log('Eventos de modales configurados');
    }

    /**
     * Configurar eventos personalizados
     */
    configurarEventosPersonalizados() {
        // Escuchar cambios en el ciclo activo
        document.addEventListener('cicloActivoCambiado', (e) => {
            this.log('Ciclo activo cambió:', e.detail.ciclo);
            this.ui.actualizarInterfazCicloActivo();
        });

        // Escuchar pérdida de ciclo activo
        document.addEventListener('cicloActivoPerdido', () => {
            this.log('Ciclo activo perdido');
            this.ui.actualizarInterfazCicloActivo();
        });

        // Escuchar cambios en estados
        document.addEventListener('ciclosEstadosCargados', (e) => {
            this.log('Estados cargados:', e.detail);
        });

        document.addEventListener('ciclosEstadosGuardados', (e) => {
            this.log('Estados guardados:', e.detail);
            if (typeof toastr !== 'undefined') {
                toastr.success('Estados del ciclo actualizados correctamente');
            }
        });

        this.log('Eventos personalizados configurados');
    }

    /**
     * Manejar guardado de ciclo
     */
    async manejarGuardarCiclo() {
        if (!this.core.validarFormularioCiclo()) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('Por favor, corrija los errores en el formulario');
            }
            return;
        }

        const cicloId = document.getElementById('cicloId').value;
        const datos = {
            nombre: document.getElementById('nombre').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            fecha_inicio: document.getElementById('fechaInicio').value,
            fecha_fin: document.getElementById('fechaFin').value,
            semestre_actual: document.getElementById('semestreActual').value.trim(),
            anio_actual: parseInt(document.getElementById('anioActual').value)
        };

        // Si es edición, agregar estado si se cambió
        if (cicloId) {
            const estadoSeleccionado = document.getElementById('estado').value;
            if (estadoSeleccionado) {
                datos.estado = estadoSeleccionado;
            }
        }

        try {
            this.core.mostrarCargando();
            const response = await this.data.guardarCiclo(datos, cicloId || null);

            if (typeof toastr !== 'undefined') {
                toastr.success(response.message || 'Ciclo académico guardado exitosamente');
            }

            $('#modalCiclo').modal('hide');
            await this.ui.actualizarTabla();
            await this.data.cargarCicloActivo(); // Recargar ciclo activo por si cambió

        } catch (error) {
            console.error('Error al guardar ciclo:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error(error.message || 'Error al guardar el ciclo académico');
            }
        } finally {
            this.core.ocultarCargando();
        }
    }

    /**
     * Manejar guardado de estados
     */
    async manejarGuardarEstados() {
        const cicloId = document.getElementById('estadosCicloId').value;
        const modulos = ['carga_docentes', 'carga_asignaturas', 'carga_verificadores', 'generacion_portafolios'];
        
        const estados = {};
        modulos.forEach(modulo => {
            const checkbox = document.getElementById(modulo);
            if (checkbox) {
                estados[modulo] = checkbox.checked;
            }
        });

        try {
            this.core.mostrarCargando();
            await this.data.guardarEstadosCiclo(cicloId, estados);
            $('#modalEstados').modal('hide');

        } catch (error) {
            console.error('Error al guardar estados:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error(error.message || 'Error al guardar los estados del ciclo');
            }
        } finally {
            this.core.ocultarCargando();
        }
    }

    /**
     * Confirmar activación de ciclo
     */
    confirmarActivarCiclo(cicloId) {
        const mensaje = `
            <p>Al activar este ciclo:</p>
            <ul class="text-left">
                <li>Se desactivará cualquier ciclo activo actual</li>
                <li>Se habilitará el módulo de carga de datos</li>
                <li>Los usuarios podrán comenzar a cargar información</li>
            </ul>
            <p><strong>¿Está seguro de continuar?</strong></p>
        `;

        this.ui.mostrarConfirmacion(
            '¿Activar Ciclo Académico?',
            mensaje,
            () => this.activarCiclo(cicloId),
            'question'
        );
    }

    /**
     * Confirmar cierre de ciclo
     */
    confirmarCerrarCiclo(cicloId) {
        const mensaje = `
            <p>Al cerrar este ciclo:</p>
            <ul class="text-left">
                <li>Se bloqueará la carga de nuevos datos</li>
                <li>Se mantendrá la información existente</li>
                <li>Los usuarios no podrán realizar cambios</li>
            </ul>
            <p><strong>¿Está seguro de continuar?</strong></p>
        `;

        this.ui.mostrarConfirmacion(
            '¿Cerrar Ciclo Académico?',
            mensaje,
            () => this.cerrarCiclo(cicloId),
            'warning'
        );
    }

    /**
     * Confirmar eliminación de ciclo
     */
    confirmarEliminarCiclo(cicloId) {
        const mensaje = `
            <p><strong>¡ATENCIÓN!</strong> Esta acción eliminará permanentemente:</p>
            <ul class="text-left">
                <li>Todos los datos del ciclo académico</li>
                <li>Información de portafolios asociados</li>
                <li>Registros de carga de datos</li>
            </ul>
            <p><strong>Esta acción NO se puede deshacer.</strong></p>
        `;

        this.ui.mostrarConfirmacion(
            '¿Eliminar Ciclo Académico?',
            mensaje,
            () => this.eliminarCiclo(cicloId),
            'error'
        );
    }

    /**
     * Activar ciclo
     */
    async activarCiclo(cicloId) {
        try {
            this.core.mostrarCargando();
            const response = await this.data.activarCiclo(cicloId);

            if (typeof toastr !== 'undefined') {
                toastr.success(response.message || 'Ciclo académico activado exitosamente');
            }

            await this.ui.actualizarTabla();
            await this.data.cargarCicloActivo();

        } catch (error) {
            console.error('Error al activar ciclo:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error(error.message || 'Error al activar el ciclo académico');
            }
        } finally {
            this.core.ocultarCargando();
        }
    }

    /**
     * Cerrar ciclo
     */
    async cerrarCiclo(cicloId) {
        try {
            this.core.mostrarCargando();
            const response = await this.data.cerrarCiclo(cicloId);

            if (typeof toastr !== 'undefined') {
                toastr.success(response.message || 'Ciclo académico cerrado exitosamente');
            }

            await this.ui.actualizarTabla();
            await this.data.cargarCicloActivo();

        } catch (error) {
            console.error('Error al cerrar ciclo:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error(error.message || 'Error al cerrar el ciclo académico');
            }
        } finally {
            this.core.ocultarCargando();
        }
    }

    /**
     * Eliminar ciclo
     */
    async eliminarCiclo(cicloId) {
        try {
            this.core.mostrarCargando();
            const response = await this.data.eliminarCiclo(cicloId);

            if (typeof toastr !== 'undefined') {
                toastr.success(response.message || 'Ciclo académico eliminado exitosamente');
            }

            await this.ui.actualizarTabla();
            await this.data.cargarCicloActivo();

        } catch (error) {
            console.error('Error al eliminar ciclo:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error(error.message || 'Error al eliminar el ciclo académico');
            }
        } finally {
            this.core.ocultarCargando();
        }
    }

    /**
     * Validar campo individual
     */
    validarCampo(campo) {
        const valor = campo.value.trim();
        const esRequerido = campo.hasAttribute('required');

        if (esRequerido && !valor) {
            campo.classList.add('is-invalid');
            campo.classList.remove('is-valid');
        } else if (valor) {
            campo.classList.add('is-valid');
            campo.classList.remove('is-invalid');
        } else {
            campo.classList.remove('is-invalid', 'is-valid');
        }
    }

    /**
     * Logging para desarrollo
     */
    log(...args) {
        if (this.debug) {
            console.log('[CiclosEventos]', ...args);
        }
    }

    /**
     * Limpiar eventos
     */
    destruir() {
        // Remover listeners de eventos personalizados
        document.removeEventListener('cicloActivoCambiado', this.manejarCambiosCiclo);
        document.removeEventListener('cicloActivoPerdido', this.manejarPerdiaCiclo);
        document.removeEventListener('ciclosEstadosCargados', this.manejarEstadosCargados);
        document.removeEventListener('ciclosEstadosGuardados', this.manejarEstadosGuardados);
        
        this.log('Eventos destruidos');
    }
} 