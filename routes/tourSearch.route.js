const express = require("express");
const router = express.Router();
const { searchTours } = require("../controllers/tourSearch.controller");

router.get("/", searchTours);
module.exports = router;
