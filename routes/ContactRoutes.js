import express from "express";
import { createContactMessage } from "../controllers/ContactController.js";

const router = express.Router();

router.post("/contact-us", createContactMessage);

export default router