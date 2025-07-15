const express = require("express");
const router = express.Router();
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/tourPackage.controller");

router.get("/", getPackages);
router.get("/:id", getPackage);
router.post("/", createPackage);
router.put("/:id", updatePackage);
router.delete("/:id", deletePackage);

module.exports = router;
