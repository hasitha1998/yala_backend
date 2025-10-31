import express from "express";
import Contact from "../models/Contact.js";
import {
  sendAdminNotification,
  sendThankYouEmail,
} from "../utils/emailService.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// Handle contact form submission
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields",
      });
    }

    // Create new contact
    const newContact = new Contact({
      name,
      email,
      phone: phone || "",
      subject: subject || "",
      message,
    });

    // Save to database
    await newContact.save();

    // Send emails (in parallel)
    await Promise.all([
      sendAdminNotification(newContact),
      sendThankYouEmail(newContact),
    ]);

    res.status(201).json({
      success: true,
      message: "Thank you for your message! We will contact you soon.",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
});

export default router;
