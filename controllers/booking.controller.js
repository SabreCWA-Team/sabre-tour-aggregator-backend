const Booking = require("../models/booking.model");
const Package = require("../models/tourPackage.model");
const User = require("../models/user.model");

const createBooking = async (req, res) => {
  try {
    const { tourId, distributorId, userDetails, date, travelers } = req.body;
    if (!tourId || !distributorId || !userDetails || !date || !travelers) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tourExists = await Package.findById(tourId);
    const distributorExists = await User.findById(distributorId);

    if (!tourExists || !distributorExists) {
      return res.status(404).json({ error: "Tour or distributor not found" });
    }

    const booking = new Booking({
      tourId,
      distributorId,
      userDetails,
      date,
      travelers,
    });

    await booking.save();

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error("Booking Error:", error);
    +res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createBooking };
