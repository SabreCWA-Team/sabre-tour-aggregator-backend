const mongoose = require("mongoose");

const distributorPriceSchema = new mongoose.Schema(
  {
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    ruleName: { type: String, required: true },
    ruleType: { type: String, enum: ["Markup", "Markdown"], required: true },
    markupPercent: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    finalPrice: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingRule", distributorPriceSchema);
