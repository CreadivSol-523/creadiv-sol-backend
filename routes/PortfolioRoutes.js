import express from "express";
import {
  createPortfolio,
  handleDeletePortfolio,
  handleGetCategories,
  handleGetPortfolio,
  handleUpdatePortfolio,
  removeGalleryImageById
} from "../controllers/PortfolioController.js";
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

router.patch(
  "/update-portfolio/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 10 }
  ]),
  handleUpdatePortfolio
);

router.delete("/delete-portfolio/:id", handleDeletePortfolio);

router.delete(
  "/portfolio/:id/gallery/image/:imageId",
  removeGalleryImageById
);


export default router;
