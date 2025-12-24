import express from "express";
import { createPortfolio, handleGetCategories, handleGetPortfolio } from "../controllers/PortfolioController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/portfolio",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  createPortfolio
);
router.get("/get-portfolio", handleGetPortfolio);
router.get("/get-categories", handleGetCategories);

export default router;
