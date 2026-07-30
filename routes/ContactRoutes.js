import express from "express";
import { createContactMessage } from "../controllers/ContactController.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const router = express.Router();

router.post("/contact-us", createContactMessage);

export default router;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
