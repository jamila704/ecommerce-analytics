const express = require('express');
const router = express.Router();
const {
    getMonthlyRevenue,
    getRevenueByCity,
    getRevenueTrend,
    getGlobalStats
} = require('../controllers/revenueController');

router.get('/monthly',  getMonthlyRevenue);
router.get('/by-city',  getRevenueByCity);
router.get('/trend',    getRevenueTrend);
router.get('/stats',    getGlobalStats);

module.exports = router;