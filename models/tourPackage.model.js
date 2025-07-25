const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
  {
    discountType: { type: Number },
    minGroupSize: { type: Number },
  },
  { _id: false }
);

const AvailabilitySchema = new mongoose.Schema(
  {
    start_date: { type: Date },
    end_date: { type: Date },
    is_available: { type: Boolean, default: true },
    min_guests: { type: Number },
    max_guests: { type: Number },
  },
  { _id: false }
);

const PricingSchema = new mongoose.Schema(
  {
    pricePerPerson: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    discount: DiscountSchema,
  },
  { _id: false }
);

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  { _id: false }
);

const ItinerarySchema = new mongoose.Schema(
  {
    day: { type: String },
    title: { type: String },
    description: { type: String },
    location: { type: String },
    startTime: { type: String },
    endTime: { type: String },
  },
  { _id: false }
);

const TourPackageSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    basicInfo: {
      tour_name: { type: String, required: true },
      description: { type: String },
      tour_type: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      duration: { type: String },
    },
    itinerary: [ItinerarySchema],
    pricing: PricingSchema,
    availability: [AvailabilitySchema],

    booking: {
      cancellationPolicy: { type: String },
      paymentMethods: [
        {
          name: { type: String, required: true },
          type: {
            type: String,
            enum: ["local", "international"],
            required: true,
          },
        },
      ],
    },
    media: {
      tourImages: [{ type: String }],
      tourVideos: [{ type: String }],
      additionalFiles: [{ type: String }],
    },
    additional: {
      requirements: { type: String },
      contact: ContactSchema,
      tags: [{ type: String }],
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", TourPackageSchema);

module.exports = Package;
