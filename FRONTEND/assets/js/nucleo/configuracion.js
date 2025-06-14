/**
 * Configuración global del sistema
 * Contiene constantes y configuraciones utilizadas en toda la aplicación
 */

const CONFIG = {
    // Configuración de la API
    API: {
        BASE_URL: 'http://localhost:4000/api',
        TIMEOUT: 30000, // 30 segundos
        RETRY_ATTEMPTS: 3
    },
    
    // Claves para almacenamiento local
    STORAGE: {
        TOKEN: 'portafolio_docente_token',
        USER: 'portafolio_docente_user',
        PREFERENCES: 'portafolio_docente_preferences'
    },
    
    // Roles del sistema
    ROLES: {
        ADMIN: 'administrador',
        VERIFICADOR: 'verificador',
        DOCENTE: 'docente'
    },
    
    // Rutas de la aplicación
    ROUTES: {
        LOGIN: '/paginas/autenticacion/login.html',
        SELECTOR_ROLES: '/paginas/autenticacion/selector-roles.html',
        // Rutas directas para compatibilidad con redirigirSegunRol
        DASHBOARD_ADMIN: '/paginas/dashboard/admin/tablero.html',
        DASHBOARD_VERIFICADOR: '/paginas/dashboard/verificador/tablero.html',
        DASHBOARD_DOCENTE: '/paginas/dashboard/docente/tablero.html',
        // Mantener estructura anidada para compatibilidad con código existente
        DASHBOARD: {
            ADMIN: '/paginas/dashboard/admin/tablero.html',
            VERIFICADOR: '/paginas/dashboard/verificador/tablero.html',
            DOCENTE: '/paginas/dashboard/docente/tablero.html'
        }
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        DURATION: 5000, // 5 segundos
        POSITION: 'top-right'
    },
    
    // Formatos de fecha
    DATE_FORMATS: {
        FULL: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        SHORT: { year: 'numeric', month: 'short', day: 'numeric' },
        TIME: { hour: '2-digit', minute: '2-digit' }
    }
};

// Exportar configuración
window.CONFIG = CONFIG;
