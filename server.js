require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const Package = require("./models/tourPackage.model");
const packageRoute = require("./routes/tourPackage.route");
const userRoutes = require("./routes/user.route");
const pricingRuleRoutes = require("./routes/distributorPrice.route");

const cors = require("cors");
const widgetRoutes = require("./routes/distributorWidget.route");
const bookingRoutes = require("./routes/booking.route");
const uploadRoutes = require("./routes/upload.route");
const paymentRoutes = require("./routes/payment.route");
const tourSearchRoutes = require("./routes/tourSearch.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/packages", packageRoute);
app.use("/api/users", userRoutes);
app.use("/api/pricing-rules", pricingRuleRoutes);
app.use("/api/widget", widgetRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/tours/search", tourSearchRoutes);

app.get("/", (req, res) => {
  res.send("Its running fine");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
