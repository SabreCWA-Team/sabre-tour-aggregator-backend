const Package = require("../models/tourPackage.model");
const PricingRule = require("../models/distributorPrice.model");

const searchTours = async (req, res) => {
  try {
    const {
      country,
      state,
      city,
      category,
      startDate,
      endDate,
      distributorId,
    } = req.query;

    const filters = {};
    if (country) filters["basicInfo.country"] = country;
    if (state) filters["basicInfo.state"] = state;
    if (city) filters["basicInfo.city"] = city;
    if (category) filters["basicInfo.tour_type"] = category;

    let packages = await Package.find(filters).lean();

    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      packages = packages.filter((pkg) =>
        pkg.availability?.some((slot) => {
          const s = new Date(slot.startDate);
          const e = new Date(slot.endDate);
          return s <= to && e >= from && slot.isAvailable;
        })
      );
    }

    if (distributorId) {
      const rules = await PricingRule.find({
        distributor: distributorId,
        isActive: true,
        package: { $in: packages.map((p) => p._id) },
      }).lean();

      const priceMap = new Map(rules.map((r) => [r.package.toString(), r]));

      packages = packages.map((pkg) => {
        const rule = priceMap.get(pkg._id.toString());
        return {
          id: pkg._id,
          title: pkg.basicInfo.tour_name,
          description: pkg.basicInfo.description,
          category: pkg.basicInfo.tour_type,
          location: {
            country: pkg.basicInfo.country,
            state: pkg.basicInfo.state,
            city: pkg.basicInfo.city,
          },
          image: pkg.media?.tourImages?.[0] || "",
          availability: pkg.availability || [],
          price: rule?.finalPrice || pkg.pricing.pricePerPerson,
          currency: rule?.currency || pkg.pricing.currency || "NGN",
        };
      });
    } else {
      packages = packages.map((pkg) => ({
        id: pkg._id,
        title: pkg.basicInfo.tour_name,
        description: pkg.basicInfo.description,
        category: pkg.basicInfo.tour_type,
        location: {
          country: pkg.basicInfo.country,
          state: pkg.basicInfo.state,
          city: pkg.basicInfo.city,
        },
        image: pkg.media?.tourImages?.[0] || "",
        availability: pkg.availability || [],
        price: pkg.pricing.pricePerPerson,
        currency: pkg.pricing.currency || "NGN",
      }));
    }

    res.status(200).json(packages);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

module.exports = { searchTours };
