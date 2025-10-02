const Package = require("../models/tourPackage.model");

const getPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, location, category, date } = req.query;
    const query = {};

    if (search) {
      query["basicInfo.tour_name"] = { $regex: search, $options: "i" };
    }

    if (location) {
      query["basicInfo.location"] = { $regex: location, $options: "i" };
    }

    if (category) {
      query["basicInfo.tour_type"] = category;
    }

    if (date) {
      query["availability.startDate"] = { $gte: new Date(date) };
    }

    const totalItems = await Package.countDocuments(query);

    const packages = await Package.find(query)
      .populate("createdBy", "displayName email company")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: packages,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
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

const getOwnerPackages = async (req, res) => {
  try {
    const packages = await Package.find({ createdBy: req.user._id });
    res.status(200).json(packages);
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
  getOwnerPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
