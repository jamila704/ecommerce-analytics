const { getDB } = require('./db');

async function createIndexes() {
    const db = getDB();

    console.log('📊 Création des index...');

    // INDEX 1 — sur le statut (très souvent filtré dans nos pipelines)
    await db.collection('orders').createIndex(
        { status: 1 },
        { name: 'idx_status' }
    );

    // INDEX 2 — sur la date (pour les analyses temporelles)
    await db.collection('orders').createIndex(
        { date: 1 },
        { name: 'idx_date' }
    );

    // INDEX 3 — index composé statut + date (nos requêtes filtrent souvent les deux)
    await db.collection('orders').createIndex(
        { status: 1, date: -1 },
        { name: 'idx_status_date' }
    );

    // INDEX 4 — sur la ville du client (pour l'analyse géographique)
    await db.collection('orders').createIndex(
        { 'customer.location.city': 1 },
        { name: 'idx_city' }
    );

    // INDEX 5 — sur le segment client
    await db.collection('orders').createIndex(
        { 'customer.segment': 1 },
        { name: 'idx_segment' }
    );

    // INDEX 6 — sur le montant total (pour les analyses financières)
    await db.collection('orders').createIndex(
        { 'payment.total_amount': -1 },
        { name: 'idx_amount' }
    );

    // INDEX 7 — sur les catégories produits dans le tableau items
    await db.collection('orders').createIndex(
        { 'items.category': 1 },
        { name: 'idx_items_category' }
    );

    // INDEX 8 — sur le transporteur
    await db.collection('orders').createIndex(
        { 'delivery.carrier': 1 },
        { name: 'idx_carrier' }
    );

    console.log('✅ Tous les index créés !');

    // Affiche la liste des index créés
    const indexes = await db.collection('orders').indexes();
    console.log('📋 Index existants :');
    indexes.forEach(idx => console.log(`   - ${idx.name}`));
}

module.exports = { createIndexes };