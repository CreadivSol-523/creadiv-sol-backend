import express from "express";

import validate from "../middlewares/ValidationHandler.js";

import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AccessMiddleware from "../middlewares/AccessMiddleware.js";
import { handleAddNews } from "../controllers/NewsUpdateController.js";

const router = express.Router();

router.post("/add-news", AuthMiddleware, AccessMiddleware(["Admin"]), handleAddNews);

export default router;