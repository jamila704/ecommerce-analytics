const { MongoClient } = require('mongodb');

// L'URL vient du fichier .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ecommerce';

let db = null;

async function connectDB() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log(`✅ Connecté à MongoDB — base: ${DB_NAME}`);
        return db;
    } catch (error) {
        console.error('❌ Erreur connexion MongoDB:', error);
        process.exit(1); // Arrête le serveur si pas de connexion
    }
}

function getDB() {
    if (!db) {
        throw new Error('❌ Base de données non connectée !');
    }
    return db;
}

module.exports = { connectDB, getDB };