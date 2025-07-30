const Package = require("../models/tourPackage.model");
const PricingRule = require("../models/distributorPrice.model");

const getWidgetToursForDistributor = async (req, res) => {
  try {
    const { distributorId } = req.params;
    const { tourId } = req.query;

    const pricingRules = await PricingRule.find({
      distributor: distributorId,
      isActive: true,
      ...(tourId && { package: tourId }),
    }).populate({
      path: "package",
      select:
        "basicInfo.pricing basicInfo.tour_name basicInfo.description basicInfo.tour_type media.availability media.tourImages",
    });

    const widgetTours = pricingRules
      .map((rule) => {
        const tour = rule.package;
        if (!tour) return null;

        return {
          id: tour._id,
          title: tour.basicInfo.tour_name,
          description: tour.basicInfo.description,
          category: tour.basicInfo.tour_type,
          image: tour.media?.tourImages?.[0] || "",
          price: rule.finalPrice,
          currency: rule.currency || "₦",
          availability: tour.media?.availability || [],
          bookingUrl: `https://yourdomain.com/book/${tour._id}?distributor=${distributorId}`,
        };
      })
      .filter(Boolean);

    res.status(200).json(widgetTours);
  } catch (err) {
    console.error("Failed to generate widget tours:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getWidgetToursForDistributor,
};
