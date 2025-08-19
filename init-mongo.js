// init-mongo.js - Script para inicializar MongoDB con usuario personalizado

// Este script se ejecuta automáticamente cuando MongoDB inicia por primera vez
// Se debe colocar en la carpeta del proyecto y montar en /docker-entrypoint-initdb.d/

// Usar las variables de entorno definidas en docker-compose
const username = process.env.MONGO_INITDB_ROOT_USERNAME;
const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
const dbName = process.env.MONGO_INITDB_DATABASE;

print('=== Iniciando configuración de MongoDB ===');
print('Database:', dbName);
print('Username:', username);

// Validar que las variables de entorno estén configuradas
if (!username || !password || !dbName) {
  print('❌ ERROR: Variables de entorno faltantes');
  print('MONGO_INITDB_ROOT_USERNAME:', username ? '✓' : '✗');
  print('MONGO_INITDB_ROOT_PASSWORD:', password ? '✓' : '✗');
  print('MONGO_INITDB_DATABASE:', dbName ? '✓' : '✗');
  quit(1);
}

// CAMBIO: Primero crear en admin (para usuario root), luego en la base específica
print('--- Configurando usuario root en admin ---');
db = db.getSiblingDB('admin');

// Verificar si ya existe el usuario root
let rootUserExists = false;
try {
  const users = db.getUsers();
  rootUserExists = users.some(user => user.user === username);
} catch (error) {
  print('⚠️ No se pudo verificar usuarios en admin:', error.message);
}

if (!rootUserExists) {
  try {
    db.createUser({
      user: username,
      pwd: password,
      roles: [
        { role: 'root', db: 'admin' }
      ]
    });
    print('✅ Usuario root creado en admin');
  } catch (error) {
    print('⚠️ Error al crear usuario root:', error.message);
  }
} else {
  print('ℹ️ Usuario root ya existe en admin');
}

// CAMBIO: Ahora configurar usuario específico para la base de datos de la aplicación
print('--- Configurando usuario para base de datos específica ---');
db = db.getSiblingDB(dbName);

// Verificar usuario específico
let appUserExists = false;
try {
  const users = db.getUsers();
  appUserExists = users.some(user => user.user === username);
} catch (error) {
  print('⚠️ No se pudo verificar usuarios en', dbName, ':', error.message);
}

if (!appUserExists) {
  try {
    db.createUser({
      user: username,
      pwd: password,
      roles: [
        { role: 'readWrite', db: dbName },
        { role: 'dbAdmin', db: dbName }
      ]
    });
    print('✅ Usuario creado para base de datos:', dbName);
  } catch (error) {
    print('⚠️ Error al crear usuario específico:', error.message);
  }
} else {
  print('ℹ️ Usuario ya existe en la base de datos:', dbName);
}

// Verificar autenticación en ambas bases
print('--- Verificando autenticaciones ---');

// Test 1: Autenticación como root
try {
  db.getSiblingDB('admin').auth(username, password);
  print('✅ Autenticación root exitosa');
} catch (error) {
  print('❌ Error autenticación root:', error.message);
}

// Test 2: Autenticación en base específica
try {
  db.getSiblingDB(dbName).auth(username, password);
  print('✅ Autenticación en', dbName, 'exitosa');
  
  // Crear colección de prueba
  db.getSiblingDB(dbName).test.insertOne({ 
    message: 'MongoDB inicializado correctamente', 
    timestamp: new Date(),
    database: dbName 
  });
  print('✅ Colección de prueba creada en', dbName);
  
} catch (error) {
  print('❌ Error en verificación de', dbName, ':', error.message);
}

print('=== Configuración de MongoDB completada ===');