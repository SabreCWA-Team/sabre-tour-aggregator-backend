const Package = require("../models/tourPackage.model");

const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({});
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.status(200).json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPackage = async (req, res) => {
  try {
    const packageData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const newPackage = await Package.create(packageData);
    res.status(200).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPackage = await Package.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json(updatedPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const package = await Package.findByIdAndDelete(id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
};
