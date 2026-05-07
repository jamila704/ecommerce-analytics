const { getDB } = require('../config/db');
const {
    customerSegmentationPipeline,
    segmentSummaryPipeline,
    deliveryPerformancePipeline
} = require('../aggregations/customersPipelines');

// GET /api/customers/segmentation
const getCustomerSegmentation = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(customerSegmentationPipeline())
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/customers/segments-summary
const getSegmentSummary = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(segmentSummaryPipeline())
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/customers/delivery-performance
const getDeliveryPerformance = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('orders')
            .aggregate(deliveryPerformancePipeline())
            .toArray();
        res.json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getCustomerSegmentation,
    getSegmentSummary,
    getDeliveryPerformance
};