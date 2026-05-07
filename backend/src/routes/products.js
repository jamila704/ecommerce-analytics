const express = require('express');
const router = express.Router();
const {
    getTopProducts,
    getRevenueByCategory,
    getAllProducts
} = require('../controllers/productsController');

router.get('/top',          getTopProducts);
router.get('/by-category',  getRevenueByCategory);
router.get('/list',         getAllProducts);

module.exports = router;