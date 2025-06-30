const express = require("express");
const {
  setRule,
  getRules,
  updateRule,
  deleteRule,
} = require("../controllers/pricingRule.controller");
const router = express.Router();

router.post("/", setRule);
router.get("/", getRules);
router.put("/:id", updateRule);
router.delete("/:id", deleteRule);

module.exports = router;
