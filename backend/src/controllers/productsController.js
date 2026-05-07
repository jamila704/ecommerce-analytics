const { getDB } = require('../config/db');
const {
    topProductsPipeline,
    revenueByCategoryPipeline
} = require('../aggregations/productsPipelines');

// GET /api/products/top?limit=10
const getTopProducts = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(topProductsPipeline(limit))
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/products/by-category
const getRevenueByCategory = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(revenueByCategoryPipeline())
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/products/list — liste tous les produits
const getAllProducts = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('products')
            .find({})
            .sort({ popularity_score: -1 })
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getTopProducts,
    getRevenueByCategory,
    getAllProducts
};