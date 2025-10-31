import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Admin from "./models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin credentials
    const adminEmail = "admin@yalasafari.com";
    const adminPassword = "admin123";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log("\n⚠️  Admin user already exists!");
      console.log("📧 Email:", adminEmail);
      console.log("🔑 Password: admin123");
      
      // Generate token for existing admin
      const token = jwt.sign(
        { email: existingAdmin.email, isAdmin: true },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );
      
      console.log("\n🎫 Test Token (Valid for 24 hours):");
      console.log(token);
      console.log("\n💡 Use this token in Postman header:");
      console.log("x-auth-token:", token);
      
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = new Admin({
      email: adminEmail,
      password: hashedPassword,
    });

    await admin.save();

    console.log("\n✅ Admin user created successfully!");
    console.log("=".repeat(50));
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("=".repeat(50));

    // Generate JWT token for the new admin
    const token = jwt.sign(
      { email: admin.email, isAdmin: true },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    console.log("\n🎫 JWT Token Generated (Valid for 24 hours):");
    console.log(token);
    console.log("\n💡 Use this token in Postman header:");
    console.log("x-auth-token:", token);
    console.log("\n📝 How to use:");
    console.log("1. Copy the token above");
    console.log("2. In Postman, go to Headers tab");
    console.log("3. Add key: x-auth-token");
    console.log("4. Add value: [paste token]");
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();