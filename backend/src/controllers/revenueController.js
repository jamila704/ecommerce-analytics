const { getDB } = require('../config/db');
const {
    revenueByMonthPipeline,
    revenueByCityPipeline,
    revenueTrendPipeline
} = require('../aggregations/revenuePipelines');

// GET /api/revenue/monthly?year=2024
const getMonthlyRevenue = async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : null;
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(revenueByMonthPipeline(year))
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/revenue/by-city
const getRevenueByCity = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(revenueByCityPipeline())
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/revenue/trend
const getRevenueTrend = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(revenueTrendPipeline())
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/revenue/stats — chiffres globaux
const getGlobalStats = async (req, res) => {
    try {
        const db = getDB();

        const [stats] = await db.collection('orders').aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: null,
                    total_revenue:  { $sum: '$payment.total_amount' },
                    total_orders:   { $sum: 1 },
                    avg_basket:     { $avg: '$payment.total_amount' },
                    total_customers:{ $addToSet: '$customer.customer_id' }
                }
            },
            {
                $project: {
                    _id: 0,
                    total_revenue:   { $round: ['$total_revenue', 2] },
                    total_orders:    1,
                    avg_basket:      { $round: ['$avg_basket', 2] },
                    total_customers: { $size: '$total_customers' }
                }
            }
        ]).toArray();

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getMonthlyRevenue,
    getRevenueByCity,
    getRevenueTrend,
    getGlobalStats
};