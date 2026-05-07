const express = require('express');
const router = express.Router();
const {
    getCustomerSegmentation,
    getSegmentSummary,
    getDeliveryPerformance
} = require('../controllers/customersController');

router.get('/segmentation',         getCustomerSegmentation);
router.get('/segments-summary',     getSegmentSummary);
router.get('/delivery-performance', getDeliveryPerformance);

module.exports = router;