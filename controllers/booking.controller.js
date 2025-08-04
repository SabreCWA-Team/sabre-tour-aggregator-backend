const Booking = require("../models/booking.model");
const Package = require("../models/tourPackage.model");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

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
    ).populate("tourId");

    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (status === "cancelled") {
      const populatedBooking = await Booking.findById(updated._id).populate(
        "tourId"
      );
      await sendEmail({
        to: updated.userDetails.email,
        subject: "Booking Cancelled",
        html: `<p>Hi ${updated.userDetails.name},</p><p>We're sorry to inform you that your booking for <strong>${populatedBooking.tourId?.basicInfo?.tour_name}</strong> has been cancelled.</p>`,
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
};

module.exports = { createBooking, getOwnerBookings, updateBookingStatus };
