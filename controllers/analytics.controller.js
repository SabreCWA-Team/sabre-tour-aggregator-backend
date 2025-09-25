const Booking = require("../models/booking.model");
const Package = require("../models/tourPackage.model");
const mongoose = require("mongoose");

const getBookingAnalytics = async (req, res) => {
  try {
    const { ownerId, distributorId, months = 6, period = "month" } = req.query;
    console.log("Query Params:", req.query);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const match = { createdAt: { $gte: startDate } };

    if (distributorId) {
      match.distributorId = new mongoose.Types.ObjectId(distributorId);
    }

    if (ownerId) {
      const ownerPackages = await Package.find({
        createdBy: new mongoose.Types.ObjectId(ownerId),
      }).select("_id");
      const packageIds = ownerPackages.map((p) => p._id);
      match.tourId = { $in: packageIds };
    }

    const groupBy =
      period === "week"
        ? {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
            status: "$status",
          }
        : {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status",
          };

    const secondGroup =
      period === "week"
        ? { year: "$_id.year", week: "$_id.week" }
        : { year: "$_id.year", month: "$_id.month" };

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: secondGroup,
          counts: {
            $push: { status: "$_id.status", count: "$count" },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          ...(period === "week" ? { "_id.week": 1 } : { "_id.month": 1 }),
        },
      },
    ];

    const results = await Booking.aggregate(pipeline);
    const labels = [];
    const initiated = [];
    const paid = [];
    const cancelled = [];
    let totalBookings = 0;

    results.forEach((r) => {
      const label =
        period === "week"
          ? `${r._id.year}-W${String(r._id.week).padStart(2, "0")}`
          : `${r._id.year}-${String(r._id.month).padStart(2, "0")}`;
      labels.push(label);
      totalBookings += r.total;

      const statusCounts = r.counts.reduce((acc, c) => {
        acc[c.status] = c.count;
        return acc;
      }, {});

      initiated.push(statusCounts.pending || 0);
      paid.push(statusCounts.confirmed || 0);
      cancelled.push(statusCounts.cancelled || 0);
    });

    let percentageChange = 0;
    if (labels.length >= 2) {
      const last = initiated.at(-1) + paid.at(-1) + cancelled.at(-1);
      const prev = initiated.at(-2) + paid.at(-2) + cancelled.at(-2);
      if (prev > 0) {
        percentageChange = (((last - prev) / prev) * 100).toFixed(1);
      }
    }

    res.json({
      totalBookings,
      labels,
      initiated,
      paid,
      cancelled,
      percentageChange: Number(percentageChange),
    });
  } catch (error) {
    console.error("Booking Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch booking analytics" });
  }
};

module.exports = { getBookingAnalytics };
