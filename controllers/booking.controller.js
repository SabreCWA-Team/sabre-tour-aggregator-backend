const { query } = require("express");
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

const getBookings = async (req, res) => {
  const { role, id } = req.params;
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  try {
    let query = {};

    if (role === "owner") {
      const ownerPackages = await Package.find({ createdBy: id }).select("_id");
      const packageIds = ownerPackages.map((pkg) => pkg._id);
      query.tourId = { $in: packageIds };
    }

    if (role === "distributor") {
      query.distributorId = id;
    }

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { "userDetails.name": { $regex: search, $options: "i" } },
        { "userDetails.email": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate({
        path: "tourId",
        populate: { path: "createdBy", select: "displayName email" },
      })
      .populate("distributorId", "displayName email")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      bookings,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
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
        to: populatedBooking.userDetails.email,
        templateId: process.env.SENDGRID_CANCELLED_TEMPLATE_ID,
        dynamicData: {
          name: populatedBooking.userDetails.name,
          tourName: populatedBooking.tourId?.basicInfo?.tour_name,
          year: new Date().getFullYear(),
        },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
};
