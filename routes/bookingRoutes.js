const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Public route for customer bookings
router.post('/', bookingController.createBooking);

// Note: Admin routes removed as per request to remove login/dashboard methods

module.exports = router;
