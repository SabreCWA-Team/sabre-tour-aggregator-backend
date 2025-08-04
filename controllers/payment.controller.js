const axios = require("axios");
const Booking = require("../models/booking.model");
const Package = require("../models/tourPackage.model");
const PricingRule = require("../models/distributorPrice.model");
const sendEmail = require("../utils/sendEmail");

const initializePayment = async (req, res) => {
  const { name, email, phone, date, travelers, tourId, distributorId } =
    req.body;

  try {
    const pricingRule = await PricingRule.findOne({
      package: tourId,
      distributor: distributorId,
      isActive: true,
    });

    if (!pricingRule || !pricingRule.finalPrice) {
      return res.status(400).json({ error: "Distributor price not found" });
    }

    const amount = pricingRule.finalPrice * 100;

    const tour = await Package.findById(tourId);
    if (!tour) return res.status(404).json({ error: "Tour not found" });

    const booking = await Booking.create({
      tourId,
      distributorId,
      userDetails: { name, email, phone },
      date,
      travelers,
      status: "pending",
      paymentMethod: "Paystack",
    });

    await sendEmail({
      to: email,
      subject: "Booking Initiated",
      html: `<p>Hello ${name},</p><p>Your booking for <strong>${tour.basicInfo?.tour_name}</strong> has been initiated. Please complete your payment to confirm it.</p>`,
    });

    const paystackReference = booking._id.toString();

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        reference: paystackReference,
        callback_url: `http://localhost:3001/payment-success`,
        metadata: { bookingId: booking._id },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    booking.reference = paystackReference;
    await booking.save();

    res.status(200).json({ authUrl: response.data.data.authorization_url });
  } catch (err) {
    console.error(err.message || err);
    return res
      .status(400)
      .json({ error: err.message || "Payment init failed" });
  }
};

const verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;
    if (data.status === "success") {
      const booking = await Booking.findById(reference).populate("tourId");
      if (!booking)
        return res.status(404).json({ message: "Booking not found" });

      booking.status = "confirmed";
      await booking.save();

      await sendEmail({
        to: booking.userDetails.email,
        subject: "Payment Confirmed",
        html: `<p>Hi ${booking.userDetails.name},</p><p>Your payment for <strong>${booking.tourId?.basicInfo?.tour_name}</strong> has been received. Your booking is now confirmed.</p>`,
      });

      return res.status(200).json({ message: "Payment verified" });
    }
    res.status(400).json({ message: "Verification failed" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying payment" });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
};
