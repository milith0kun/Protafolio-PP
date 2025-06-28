const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  name: process.env.DB_NAME || 'portafolio_docente_carga_academica',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306
};

console.log('🔧 Configuración de Base de Datos:');
console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`Database: ${dbConfig.name}`);
console.log(`User: ${dbConfig.user}`);

// Configuración de Sequelize con opciones optimizadas
const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      // acquireTimeout y timeout se manejan en pool
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000, // Tiempo máximo para obtener conexión
      idle: 10000,    // Tiempo antes de cerrar conexión inactiva
      evict: 1000,    // Tiempo de verificación de conexiones
      handleDisconnects: true
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  }
);

// Función para probar la conexión con reintentos
const testConnection = async (reintentos = 3) => {
  for (let i = 0; i < reintentos; i++) {
    try {
      console.log(`🔍 Intento de conexión ${i + 1}/${reintentos}...`);
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida correctamente');
      return true;
    } catch (error) {
      console.error(`❌ Error en intento ${i + 1}:`, error.message);
      
      if (i === reintentos - 1) {
        console.log('💡 Sugerencias:');
        console.log('1. Verificar que MySQL esté ejecutándose');
        console.log('2. Verificar las credenciales en el archivo .env');
        console.log('3. Verificar que la base de datos exista');
        console.log('4. Intentar con contraseña vacía: DB_PASSWORD=');
        return false;
      }
      
      // Esperar 2 segundos antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
};

module.exports = {
  sequelize,
  testConnection
};
