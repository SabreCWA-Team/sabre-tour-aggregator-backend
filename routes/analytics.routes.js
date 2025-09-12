const express = require("express");
const { getBookingAnalytics } = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/bookings", getBookingAnalytics);

module.exports = router;
