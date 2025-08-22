const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const { default: mongoose } = require("mongoose");
const packageRoutes = require("./routes/PackageRoutes");
const blogRoutes = require("./routes/BlogRoutes");
const contactRoutes = require("./routes/ContactRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const dashboardRoutes = require("./routes/DashboardRoutes");
const imageRoutes = require("./routes/imageRoutes");
const path = require("path");
const AvailableJeepsRoutes = require("./routes/routes/AvailableJeepsRoutes");
const bookingRoutes = require("./routes/BookingRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'], // Add your frontend URLs
  credentials: true
}));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Static file serving (note: this won't work the same way on Vercel)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/packages", packageRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/images", imageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", AvailableJeepsRoutes);
app.use("/api", bookingRoutes);

app.get("/", (req, res) => {
  res.send("Server is running on Vercel!");
});

app.get("/api", (req, res) => {
  res.json({ message: "API is working!" });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;