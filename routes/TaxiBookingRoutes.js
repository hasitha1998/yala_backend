import express from "express";
import taxiBookingController from "../controllers/taxiBookingController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

router.post("/", auth, taxiBookingController.createBooking);
router.get("/", [auth, admin], taxiBookingController.getBookings);

export default router;
