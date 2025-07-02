const express = require("express");
const {
  setRule,
  getRules,
  getRule,
  updateRule,
  deleteRule,
} = require("../controllers/pricingRule.controller");
const router = express.Router();

router.post("/", setRule);
router.get("/", getRules);
router.get("/", getRule);
router.put("/:id", updateRule);
router.delete("/:id", deleteRule);

module.exports = router;
