const PricingRule = require("../models/pricingRule.model");

const setRule = async (req, res) => {
  try {
    const rule = new PricingRule(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().populate({
      path: "package",
      select: "basicInfo.tour_name pricing",
    });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { setRule, getRules };
