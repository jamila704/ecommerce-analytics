const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/db');
const routes = require('./src/routes/index');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: '✅ API E-commerce Analytics',
        endpoints: {
            stats:               'GET /api/revenue/stats',
            monthly_revenue:     'GET /api/revenue/monthly?year=2024',
            revenue_by_city:     'GET /api/revenue/by-city',
            revenue_trend:       'GET /api/revenue/trend',
            top_products:        'GET /api/products/top?limit=10',
            revenue_by_category: 'GET /api/products/by-category',
            all_products:        'GET /api/products/list',
            segmentation:        'GET /api/customers/segmentation',
            segments_summary:    'GET /api/customers/segments-summary',
            delivery:            'GET /api/customers/delivery-performance'
        }
    });
});

// Route test MongoDB
app.get('/test-db', async (req, res) => {
    try {
        const { getDB } = require('./src/config/db');
        const db = getDB();
        const collections = await db.listCollections().toArray();
        res.json({
            status: '✅ MongoDB connecté',
            collections: collections.map(c => c.name)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toutes les routes API
app.use('/api', routes);

// Gestion des erreurs
app.use(errorHandler);

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}`);
        console.log(`📡 API disponible sur http://localhost:${PORT}`);
    });
}

startServer();