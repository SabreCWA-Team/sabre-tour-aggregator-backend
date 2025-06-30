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
    const query = {};
    if (req.query.distributor) {
      query.distributor = req.query.distributor;
    }
    const rules = await PricingRule.find(query).populate({
      path: "package",
      select: "basicInfo.tour_name pricing",
    });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRule = async (req, res) => {
  try {
    const updatedRule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(updatedRule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteRule = async (req, res) => {
  try {
    const deletedRule = await PricingRule.findByIdAndDelete(req.params.id);
    if (!deletedRule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json({ message: "Rule deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { setRule, getRules, updateRule, deleteRule };
