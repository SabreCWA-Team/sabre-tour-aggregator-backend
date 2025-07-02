const express = require("express");
const router = express.Router();
const {
  getWidgetToursForDistributor,
} = require("../controllers/distributorWidget.controller");

router.get("/:distributorId", getWidgetToursForDistributor);

module.exports = router;
