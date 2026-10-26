import express from "express";
import { createBlog, getAllBlogs, getBlogBySlug, getBlogCategories, updateBlog, deleteBlog } from "../controllers/BlogController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/blog", upload.fields([{ name: "coverImage", maxCount: 1 }]), createBlog);

router.get("/get-blogs", getAllBlogs);
router.get("/blog-categories", getBlogCategories);
router.get("/blog/:slug", getBlogBySlug);

router.patch("/update-blog/:id", upload.fields([{ name: "coverImage", maxCount: 1 }]), updateBlog);

router.delete("/delete-blog/:id", deleteBlog);

export default router;
