import express from "express";
import { getAvailability } from "../Controllers/DateController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/availability", auth, getAvailability);

export default router;
