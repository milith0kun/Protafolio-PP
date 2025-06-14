# Backend - Portafolio Docente UNSAAC

Este es el backend del sistema de Portafolio Docente para la Universidad Nacional de San Antonio Abad del Cusco (UNSAAC).

## Configuración del Entorno

1. **Variables de Entorno**
   - Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
     ```
     # Configuración del Servidor
     PORT=4000
     NODE_ENV=development

     # Configuración de la Base de Datos
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=portafolio_docente
     DB_USER=tu_usuario
     DB_PASSWORD=tu_contraseña

     # Configuración de JWT
     JWT_SECRET=tu_clave_secreta_segura
     JWT_EXPIRES_IN=24h
     ```

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

   O para producción:
   ```bash
   npm start
   ```

## Uso

- **URL Base del API**: `http://localhost:4000`
- **Documentación de la API**: Disponible en `http://localhost:4000/api-docs` (si está habilitada)

## Estructura del Proyecto

```
BACKEND/
├── config/           # Configuraciones
├── controladores/    # Lógica de negocio
├── middlewares/      # Middlewares de Express
├── modelos/          # Modelos de la base de datos
├── rutas/            # Rutas de la API
├── util/             # Utilidades
├── .env              # Variables de entorno
├── servidor.js       # Punto de entrada de la aplicación
└── package.json      # Dependencias y scripts
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/registro` - Registro de nuevo usuario

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

## Desarrollo

- **Modo Desarrollo**: `npm run dev` (con recarga automática)
- **Linting**: `npm run lint`
- **Testing**: `npm test`

## Despliegue

1. Construir la aplicación:
   ```bash
   npm run build
   ```

2. Iniciar en producción:
   ```bash
   npm start
   ```

## Solución de Problemas

### Puerto en Uso
Si recibes un error de puerto en uso:
1. Identifica el proceso: `netstat -ano | findstr :4000`
2. Detén el proceso: `taskkill /F /PID <ID_DEL_PROCESO>`

### Problemas de Base de Datos
- Verifica que MySQL esté en ejecución
- Confirma que las credenciales en `.env` sean correctas
- Verifica que la base de datos exista y sea accesible

## Licencia

Este proyecto está bajo la Licencia MIT.
