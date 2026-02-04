const { MongoClient } = require('mongodb');

let db = null;

async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URL, {
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db(process.env.DB_NAME);
    
    console.log(`✅ MongoDB conectado: ${process.env.DB_NAME}`);
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database não inicializado. Chame connectDB() primeiro.');
  }
  return db;
}

module.exports = { connectDB, getDB };
