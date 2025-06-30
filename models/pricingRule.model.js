const mongoose = require("mongoose");

const pricingRuleSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingRule", pricingRuleSchema);
