import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export default async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );

    // Check if the user is an admin
    const admin = await Admin.findOne({ email: decoded.email });
    if (admin) {
      req.user = {
        email: admin.email,
        isAdmin: true,
        _id: admin._id,
      };
    } else {
      // For now, we only support admin users
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
