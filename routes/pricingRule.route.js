const express = require("express");
const { setRule, getRules } = require("../controllers/pricingRule.controller");
const router = express.Router();

router.post("/", setRule);
router.get("/", getRules);

module.exports = router;
