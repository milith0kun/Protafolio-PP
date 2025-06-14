require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const http = require('http');
const net = require('net');

// Importar modelos y asociaciones
require('./modelos/asociaciones');

// Importar rutas
const authRoutes = require('./rutas/auth');
const usuarioRoutes = require('./rutas/usuarios');

// Inicializar la aplicación Express
const app = express();
const path = require('path');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS - permitir solicitudes desde cualquier origen durante desarrollo
app.use(cors({
  origin: '*', // Permitir cualquier origen en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging de solicitudes para depuración
app.use((req, res, next) => {
  console.log(`==== SOLICITUD RECIBIDA ====`);
  console.log(`Fecha: ${new Date().toISOString()}`);
  console.log(`Método: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  if (req.method !== 'GET') {
    console.log(`Body: ${JSON.stringify(req.body)}`);
  }
  console.log(`==========================`);
  next();
});

// Configuración de rutas estáticas
const frontendPath = path.join(__dirname, '..', 'FRONTEND');

// Servir archivos estáticos del frontend
app.use(express.static(frontendPath));

// Ruta para los assets
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

// Ruta para el login
app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendPath, 'paginas', 'autenticacion', 'login.html'));
});

// Ruta para la página principal
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Ruta principal - Redirigir a inicio
app.get('/', (req, res) => {
  res.redirect('/inicio');
});

// Ruta de prueba de API
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API del Portafolio Docente UNSAAC' });
});

// Rutas base de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Manejo de rutas no encontradas (404) - IMPORTANTE: debe ir después de todas las rutas definidas
app.use((req, res, next) => {
  console.log(`404 - Ruta no encontrada: ${req.path}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '¡Algo salió mal en el servidor!' });
});

// Puerto de escucha - Configuración desde variables de entorno
const PORT = process.env.PORT || 4000; // Puerto por defecto 5000 si no se especifica en .env

/**
 * Función para verificar si un puerto está en uso
 * @param {number} port - Puerto a verificar
 * @returns {Promise<boolean>} - Promesa que resuelve a true si el puerto está disponible
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Puerto ${port} ya está en uso. Intente cambiar el puerto en el archivo .env`);
        resolve(false);
      } else {
        console.error(`Error al verificar puerto:`, err);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};

/**
 * Iniciar el servidor después de verificar la conexión a la base de datos
 * y la disponibilidad del puerto
 */
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    console.log('⏳ Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos con la base de datos
    console.log('⏳ Sincronizando modelos con la base de datos...');
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados correctamente.');
    
    // Verificar disponibilidad del puerto
    const portAvailable = await isPortAvailable(PORT);
    
    if (portAvailable) {
      // Crear servidor HTTP
      const server = http.createServer(app);
      
      // Iniciar servidor
      server.listen(PORT, () => {
        console.log(`✅ Servidor ejecutándose en: http://localhost:${PORT}`);
        console.log(`🔒 Modo: ${process.env.NODE_ENV}`);
        console.log(`📅 ${new Date().toLocaleString()}`);
      });
      
      // Manejar errores del servidor
      server.on('error', (error) => {
        console.error('❌ Error en el servidor:', error);
        process.exit(1);
      });
      
      // Manejar señales de terminación
      process.on('SIGTERM', () => {
        console.log('👋 Servidor terminando graciosamente...');
        server.close(() => {
          console.log('✅ Servidor cerrado.');
          process.exit(0);
        });
      });
    } else {
      console.error(`❌ No se puede iniciar el servidor en el puerto ${PORT}.`);
      console.log(`💡 Sugerencia: Cambie el puerto en el archivo .env o libere el puerto ${PORT}.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

module.exports = app;
