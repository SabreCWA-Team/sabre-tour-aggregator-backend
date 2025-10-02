const express = require("express");
const router = express.Router();
const {
  createBooking,
  updateBookingStatus,
  getBookings,
} = require("../controllers/booking.controller");

router.post("/", createBooking);
router.get("/:role/:id", getBookings);
router.patch("/:bookingId/status", updateBookingStatus);

module.exports = router;
