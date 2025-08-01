const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    date: { type: Date, required: true },
    travelers: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    reference: { type: String, unique: true, sparse: true },
    paymentMethod: {
      type: String,
      enum: ["Paystack", "Flutterwave", "Bank Transfer"],
      default: "Paystack",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
