const express = require("express");
const router = express.Router();
const {
  createBooking,
  getOwnerBookings,
  updateBookingStatus,
} = require("../controllers/booking.controller");

router.post("/", createBooking);
router.get("/owner/:ownerId", getOwnerBookings);
router.patch("/:bookingId/status", updateBookingStatus);

module.exports = router;
