const Package = require("../models/tourPackage.model");
const PricingRule = require("../models/distributorPrice.model");

const getWidgetToursForDistributor = async (req, res) => {
  try {
    const { distributorId } = req.params;
    const { tourId, search, location, category, date } = req.query;

    const pricingRules = await PricingRule.find({
      distributor: distributorId,
      isActive: true,
      ...(tourId && { package: tourId }),
    }).populate({
      path: "package",
      select:
        "basicInfo.pricing basicInfo.tour_name basicInfo.description basicInfo.tour_type basicInfo.city basicInfo.state basicInfo.country availability media.tourImages",
    });

    let widgetTours = pricingRules
      .map((rule) => {
        const tour = rule.package;
        if (!tour) return null;

        return {
          id: tour._id,
          title: tour.basicInfo.tour_name,
          description: tour.basicInfo.description,
          category: tour.basicInfo.tour_type,
          location: {
            country: tour.basicInfo.country || "",
            state: tour.basicInfo.state || "",
            city: tour.basicInfo.city || "",
          },
          image: tour.media?.tourImages?.[0] || "",
          price: rule.finalPrice,
          currency: rule.currency || "₦",
          availability: tour.availability || [],
          bookingUrl: `https://yourdomain.com/book/${tour._id}?distributor=${distributorId}`,
        };
      })
      .filter(Boolean);

    if (search) {
      const s = search.toLowerCase();
      widgetTours = widgetTours.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description && t.description.toLowerCase().includes(s))
      );
    }

    if (location) {
      const loc = location.toLowerCase();
      widgetTours = widgetTours.filter(
        (t) =>
          (t.location.city && t.location.city.toLowerCase().includes(loc)) ||
          (t.location.state && t.location.state.toLowerCase().includes(loc)) ||
          (t.location.country && t.location.country.toLowerCase().includes(loc))
      );
    }

    if (category) {
      widgetTours = widgetTours.filter(
        (t) => t.category && t.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (date) {
      const [year, month] = date.split("-");
      const monthStart = new Date(Number(year), Number(month) - 1, 1);
      const monthEnd = new Date(Number(year), Number(month), 0);

      widgetTours = widgetTours.filter((t) =>
        t.availability?.some((slot) => {
          if (!slot.startDate || !slot.endDate) return false;
          const start = new Date(slot.startDate);
          const end = new Date(slot.endDate);
          return start <= monthEnd && end >= monthStart;
        })
      );
    }

    res.status(200).json(widgetTours);
  } catch (err) {
    console.error("Failed to generate widget tours:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getWidgetToursForDistributor,
};
