const express = require("express");
const router = express.Router();
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/tourPackage.controller");
const authenticateUser = require("../middleware/auth.middleware");

router.get("/", getPackages);
router.get("/:id", getPackage);

router.post("/", authenticateUser, createPackage);
router.put("/:id", authenticateUser, updatePackage);
router.delete("/:id", authenticateUser, deletePackage);

module.exports = router;
