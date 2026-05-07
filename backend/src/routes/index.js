const express = require('express');
const router = express.Router();
const { measurePerformance } = require('../config/performance');
const { createIndexes }      = require('../config/indexes');

router.use('/revenue',   require('./revenue'));
router.use('/products',  require('./products'));
router.use('/customers', require('./customers'));

// Route pour mesurer les performances
router.get('/performance', async (req, res) => {
    try {
        const results = await measurePerformance();
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route pour créer les index
router.post('/indexes/create', async (req, res) => {
    try {
        await createIndexes();
        res.json({ success: true, message: '✅ Index créés avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route pour lister les index existants
router.get('/indexes', async (req, res) => {
    try {
        const { getDB } = require('../config/db');
        const db = getDB();
        const indexes = await db.collection('orders').indexes();
        res.json({ success: true, count: indexes.length, data: indexes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;