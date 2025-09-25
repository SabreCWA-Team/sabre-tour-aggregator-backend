const express = require("express");
const router = express.Router();
const {
  createBooking,
  getOwnerBookings,
  updateBookingStatus,
  getDistributorBookings,
} = require("../controllers/booking.controller");

router.post("/", createBooking);
router.get("/owner/:ownerId", getOwnerBookings);
router.get("/distributor/:distributorId", getDistributorBookings);
router.patch("/:bookingId/status", updateBookingStatus);

module.exports = router;
