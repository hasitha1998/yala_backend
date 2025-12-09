import express from "express";
import { getAvailability } from "../controllers/DateController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/availability", auth, getAvailability);

export default router;
