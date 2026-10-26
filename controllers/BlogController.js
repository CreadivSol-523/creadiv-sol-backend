import cloudinary from "../config/cloudinary.js";
import BlogModel from "../models/BlogSchema.js";
import { uploadToCloudinary } from "../utils/CloudinaryUpload.js";
import SearchQuery from "../utils/SearchQuery.js";

// ============================================================
// POST /api/blog
// ============================================================
export const createBlog = async (req, res) => {
   try {
      const { title, slug, excerpt, content, coverImageAlt, category, tags, status, author, seo } = req.body;
      console.log({ title, slug, excerpt, content, coverImageAlt, category, tags, status, author, seo });
      // ☁️ Upload cover image (optional)
      let coverImage;
      if (req.files?.coverImage?.length) {
         const upload = await uploadToCloudinary(req.files.coverImage[0], "blog/cover");
         coverImage = upload.secure_url;
      }

      const blog = await BlogModel.create({
         title,
         slug,
         excerpt,
         content,
         coverImage,
         coverImageAlt,
         category,
         tags: tags ? tags.split(",").map((t) => t.trim()) : [],
         status,
         author: author ? JSON.parse(author) : undefined,
         seo: seo ? JSON.parse(seo) : undefined,
      });

      res.status(201).json({
         message: "Blog created successfully",
         data: blog,
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({
         message: "Failed to create blog",
         error: error.message,
      });
   }
};

// ============================================================
// GET /api/get-blogs  (paginated, filterable, searchable)
// ============================================================
export const getAllBlogs = async (req, res, next) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const search = req.query.search || {};
      const matchStage = SearchQuery(search);

      const pipeline = [];
      if (matchStage) pipeline.push(matchStage);
      pipeline.push({ $sort: { publishedAt: -1, createdAt: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const countPipeline = [];
      if (matchStage) countPipeline.push(matchStage);
      countPipeline.push({ $count: "totalItems" });

      const blogs = await BlogModel.aggregate(pipeline);

      const countResult = await BlogModel.aggregate(countPipeline);
      const totalItems = countResult[0]?.totalItems || 0;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
         blogs,
         meta: { totalItems, totalPages, page, limit },
      });
   } catch (error) {
      next(error);
      console.log(error);
   }
};

// ============================================================
// GET /api/blog/:slug
// ============================================================
export const getBlogBySlug = async (req, res, next) => {
   try {
      const blog = await BlogModel.findOne({ slug: req.params.slug });

      if (!blog) {
         return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ data: blog });
   } catch (error) {
      next(error);
   }
};

// ============================================================
// GET /api/blog-categories  (unique, paginated)
// ============================================================
export const getBlogCategories = async (req, res, next) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const pipeline = [{ $group: { _id: "$category", category: { $first: "$category" }, createdAt: { $first: "$createdAt" } } }, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }];

      const countPipeline = [{ $group: { _id: "$category" } }, { $count: "totalItems" }];

      const categories = await BlogModel.aggregate(pipeline);
      const countResult = await BlogModel.aggregate(countPipeline);

      const totalItems = countResult[0]?.totalItems || 0;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
         categories,
         meta: { totalItems, totalPages, page, limit },
      });
   } catch (error) {
      next(error);
   }
};

// ============================================================
// PATCH /api/update-blog/:id
// ============================================================
export const updateBlog = async (req, res) => {
   try {
      const { id } = req.params;

      console.log(id);
      const { title, slug, excerpt, content, coverImageAlt, category, tags, status, author, seo } = req.body || {};

      const blog = await BlogModel.findOne({ slug: id });

      if (!blog) {
         return res.status(404).json({ message: "Blog not found" });
      }

      // ☁️ Replace cover image (optional)
      if (req.files?.coverImage?.length) {
         // Delete old image from Cloudinary if public_id stored
         if (blog.coverImagePublicId) {
            await cloudinary.uploader.destroy(blog.coverImagePublicId);
         }

         const upload = await uploadToCloudinary(req.files.coverImage[0], "blog/cover");
         blog.coverImage = upload.secure_url;
         blog.coverImagePublicId = upload.public_id;
      }

      // 📝 Update only provided fields
      if (title !== undefined) blog.title = title;
      if (slug !== undefined) blog.slug = slug;
      if (excerpt !== undefined) blog.excerpt = excerpt;
      if (content !== undefined) blog.content = content;
      if (coverImageAlt !== undefined) blog.coverImageAlt = coverImageAlt;
      if (category !== undefined) blog.category = category;
      if (tags !== undefined) {
         blog.tags = Array.isArray(tags) ? tags : [tags];
      }
      if (status !== undefined) blog.status = status;
      if (author !== undefined) blog.author = JSON.parse(author);
      if (seo !== undefined) blog.seo = JSON.parse(seo);

      await blog.save();

      res.status(200).json({
         message: "Blog updated successfully",
         data: blog,
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({
         message: "Failed to update blog",
         error: error.message,
      });
   }
};

// ============================================================
// DELETE /api/delete-blog/:id
// ============================================================
export const deleteBlog = async (req, res) => {
   try {
      const { id } = req.params;

      const blog = await BlogModel.findById(id);
      if (!blog) {
         return res.status(404).json({ message: "Blog not found" });
      }
      console.log(blog);
      // ☁️ Delete cover image from Cloudinary if exists
      if (blog.coverImagePublicId) {
         await cloudinary.uploader.destroy(blog.coverImagePublicId);
      }

      await BlogModel.findByIdAndDelete(id);

      res.status(200).json({ message: "Blog deleted successfully" });
   } catch (error) {
      console.error(error);
      res.status(500).json({
         message: "Failed to delete blog",
         error: error.message,
      });
   }
};
