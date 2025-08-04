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

const getOwnerBookings = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const ownerPackages = await Package.find({ createdBy: ownerId }).select(
      "_id"
    );
    const packageIds = ownerPackages.map((pkg) => pkg._id);

    const bookings = await Booking.find({ tourId: { $in: packageIds } })
      .populate("tourId")
      .populate("distributorId", "name email");

    res.json(bookings);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

const updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
};

module.exports = { createBooking, getOwnerBookings, updateBookingStatus };
