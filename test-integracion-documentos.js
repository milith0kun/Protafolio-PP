/**
 * SCRIPT DE VERIFICACIÓN - Integración Sistema de Documentos
 * Verifica que toda la integración funcione correctamente
 */

const CONFIG_VERIFICACION = {
    servidor: 'http://localhost:3000',
    rutas: {
        auth: '/api/auth/login',
        portafolios: '/api/portafolios/mis-portafolios',
        secciones: '/api/documentos/secciones-portafolio',
        tipos: '/api/documentos/tipos-permitidos'
    },
    usuario_prueba: {
        email: 'docente@test.com',
        password: '123456'
    }
};

class VerificadorIntegracion {
    constructor() {
        this.token = null;
        this.resultados = [];
    }

    log(mensaje, tipo = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icon = tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : tipo === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`[${timestamp}] ${icon} ${mensaje}`);
        this.resultados.push({ timestamp, tipo, mensaje });
    }

    async verificarServidor() {
        this.log('=== VERIFICACIÓN DEL SERVIDOR ===');
        
        try {
            const response = await fetch(`${CONFIG_VERIFICACION.servidor}/api`);
            const data = await response.json();
            
            if (response.ok && data.estado === 'activo') {
                this.log('Servidor activo y respondiendo', 'success');
                return true;
            } else {
                this.log('Servidor no responde correctamente', 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error al conectar con servidor: ${error.message}`, 'error');
            return false;
        }
    }

    async verificarAutenticacion() {
        this.log('=== VERIFICACIÓN DE AUTENTICACIÓN ===');
        
        try {
            const response = await fetch(`${CONFIG_VERIFICACION.servidor}${CONFIG_VERIFICACION.rutas.auth}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(CONFIG_VERIFICACION.usuario_prueba)
            });

            const data = await response.json();
            
            if (response.ok && data.token) {
                this.token = data.token;
                this.log('Autenticación exitosa', 'success');
                this.log(`Token obtenido: ${this.token.substring(0, 20)}...`, 'info');
                return true;
            } else {
                this.log(`Error de autenticación: ${data.mensaje || 'Sin mensaje'}`, 'error');
                return false;
            }
        } catch (error) {
            this.log(`Error en autenticación: ${error.message}`, 'error');
            return false;
        }
    }

    async verificarRutasProtegidas() {
        this.log('=== VERIFICACIÓN DE RUTAS PROTEGIDAS ===');
        
        if (!this.token) {
            this.log('No hay token disponible para pruebas', 'error');
            return false;
        }

        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };

        const rutas = [
            { nombre: 'Portafolios', url: CONFIG_VERIFICACION.rutas.portafolios },
            { nombre: 'Secciones', url: CONFIG_VERIFICACION.rutas.secciones },
            { nombre: 'Tipos permitidos', url: CONFIG_VERIFICACION.rutas.tipos }
        ];

        let exitosos = 0;

        for (const ruta of rutas) {
            try {
                const response = await fetch(`${CONFIG_VERIFICACION.servidor}${ruta.url}`, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    this.log(`✓ ${ruta.nombre}: Respuesta exitosa`, 'success');
                    exitosos++;
                } else {
                    this.log(`✗ ${ruta.nombre}: Error ${response.status}`, 'error');
                }
            } catch (error) {
                this.log(`✗ ${ruta.nombre}: ${error.message}`, 'error');
            }
        }

        this.log(`Rutas verificadas: ${exitosos}/${rutas.length}`, exitosos === rutas.length ? 'success' : 'warning');
        return exitosos === rutas.length;
    }

    async verificarEstructuraArchivos() {
        this.log('=== VERIFICACIÓN DE ESTRUCTURA DE ARCHIVOS ===');
        
        const archivos = [
            'FRONTEND/paginas/dashboard/docente/gestion-documentos.html',
            'FRONTEND/assets/js/paginas/dashboard/docente/gestion-documentos.js',
            'FRONTEND/assets/css/paginas/docente/gestion-documentos.css',
            'BACKEND/controladores/documentosController.js',
            'BACKEND/rutas/documentos.js',
            'BACKEND/rutas/portafolios.js'
        ];

        let existentes = 0;

        for (const archivo of archivos) {
            try {
                const fs = require('fs');
                if (fs.existsSync(archivo)) {
                    this.log(`✓ ${archivo}: Existe`, 'success');
                    existentes++;
                } else {
                    this.log(`✗ ${archivo}: No encontrado`, 'error');
                }
            } catch (error) {
                this.log(`✗ ${archivo}: Error al verificar`, 'error');
            }
        }

        this.log(`Archivos verificados: ${existentes}/${archivos.length}`, existentes === archivos.length ? 'success' : 'warning');
        return existentes === archivos.length;
    }

    async verificarEstructuraUNSAAC() {
        this.log('=== VERIFICACIÓN DE ESTRUCTURA UNSAAC ===');
        
        if (!this.token) {
            this.log('No hay token para verificar estructura', 'error');
            return false;
        }

        try {
            const response = await fetch(`${CONFIG_VERIFICACION.servidor}${CONFIG_VERIFICACION.rutas.secciones}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (!response.ok) {
                this.log('Error al obtener estructura de secciones', 'error');
                return false;
            }

            const data = await response.json();
            const secciones = data.data;

            const seccionesEsperadas = [
                'presentacion_portafolio',
                'silabos',
                'avance_academico',
                'material_ensenanza',
                'asignaciones',
                'examenes',
                'trabajos_estudiantiles',
                'archivos_portafolio'
            ];

            let encontradas = 0;
            for (const seccion of seccionesEsperadas) {
                if (secciones[seccion]) {
                    this.log(`✓ Sección ${seccion}: Configurada`, 'success');
                    encontradas++;
                } else {
                    this.log(`✗ Sección ${seccion}: No encontrada`, 'error');
                }
            }

            // Verificar estructura jerárquica
            if (secciones.examenes && secciones.examenes.subcarpetas) {
                this.log('✓ Estructura jerárquica de exámenes: Configurada', 'success');
            } else {
                this.log('✗ Estructura jerárquica de exámenes: No configurada', 'error');
            }

            this.log(`Estructura UNSAAC: ${encontradas}/${seccionesEsperadas.length} secciones`, 
                     encontradas === seccionesEsperadas.length ? 'success' : 'warning');
            
            return encontradas === seccionesEsperadas.length;

        } catch (error) {
            this.log(`Error al verificar estructura UNSAAC: ${error.message}`, 'error');
            return false;
        }
    }

    async ejecutarVerificacion() {
        console.log('\n🔍 INICIANDO VERIFICACIÓN DE INTEGRACIÓN COMPLETA\n');
        
        const verificaciones = [
            { nombre: 'Servidor', metodo: () => this.verificarServidor() },
            { nombre: 'Autenticación', metodo: () => this.verificarAutenticacion() },
            { nombre: 'Rutas Protegidas', metodo: () => this.verificarRutasProtegidas() },
            { nombre: 'Estructura de Archivos', metodo: () => this.verificarEstructuraArchivos() },
            { nombre: 'Estructura UNSAAC', metodo: () => this.verificarEstructuraUNSAAC() }
        ];

        let exitosas = 0;
        const resultados = {};

        for (const verificacion of verificaciones) {
            this.log(`\n--- ${verificacion.nombre.toUpperCase()} ---`);
            try {
                const resultado = await verificacion.metodo();
                resultados[verificacion.nombre] = resultado;
                if (resultado) exitosas++;
            } catch (error) {
                this.log(`Error en ${verificacion.nombre}: ${error.message}`, 'error');
                resultados[verificacion.nombre] = false;
            }
        }

        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE VERIFICACIÓN');
        console.log('='.repeat(60));
        
        Object.entries(resultados).forEach(([nombre, exito]) => {
            const estado = exito ? '✅ EXITOSO' : '❌ FALLIDO';
            console.log(`${nombre.padEnd(25)} : ${estado}`);
        });

        console.log('='.repeat(60));
        console.log(`🎯 RESULTADO GENERAL: ${exitosas}/${verificaciones.length} verificaciones exitosas`);
        
        if (exitosas === verificaciones.length) {
            console.log('🎉 ¡INTEGRACIÓN COMPLETA Y FUNCIONAL!');
        } else {
            console.log('⚠️  Hay problemas que requieren atención');
        }
        
        console.log('='.repeat(60) + '\n');

        return exitosas === verificaciones.length;
    }

    generarReporte() {
        const fecha = new Date().toISOString().split('T')[0];
        const reporte = {
            fecha,
            total_verificaciones: this.resultados.length,
            exitosas: this.resultados.filter(r => r.tipo === 'success').length,
            errores: this.resultados.filter(r => r.tipo === 'error').length,
            advertencias: this.resultados.filter(r => r.tipo === 'warning').length,
            detalles: this.resultados
        };

        console.log('\n📋 REPORTE DETALLADO:');
        console.log(JSON.stringify(reporte, null, 2));
        
        return reporte;
    }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
    const verificador = new VerificadorIntegracion();
    
    verificador.ejecutarVerificacion()
        .then((exito) => {
            verificador.generarReporte();
            process.exit(exito ? 0 : 1);
        })
        .catch((error) => {
            console.error('❌ Error fatal en verificación:', error);
            process.exit(1);
        });
}

module.exports = VerificadorIntegracion; 