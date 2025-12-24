import PortfolioModel from "../models/PortfolioSchema.js";
import Portfolio from "../models/PortfolioSchema.js";
import { uploadToCloudinary } from "../utils/CloudinaryUpload.js";
import SearchQuery from "../utils/SearchQuery.js"

export const createPortfolio = async (req, res) => {
    try {
        const {
            title,
            slug,
            description,
            shortDescription,
            category,
            projectUrl,
            tags,
            featured,
            status
        } = req.body;

        if (!req.files?.coverImage) {
            return res.status(400).json({ message: "Cover image is required" });
        }

        // Upload cover image
        const coverUpload = await uploadToCloudinary(
            req.files.coverImage[0],
            "portfolio/cover"
        );

        // Upload gallery images
        let gallery = [];
        if (req.files.gallery) {
            const galleryUploads = await Promise.all(
                req.files.gallery.map((file) =>
                    uploadToCloudinary(file, "portfolio/gallery")
                )
            );

            gallery = galleryUploads.map((img) => ({
                src: img.secure_url
            }));
        }

        const portfolio = await Portfolio.create({
            title,
            slug,
            description,
            shortDescription,
            category,
            projectUrl,
            coverImage: coverUpload.secure_url,
            gallery,
          
            tags: tags ? tags.split(",") : [],
            featured,
            status
        });

        res.status(201).json({
            message: "Portfolio created successfully",
            data: portfolio
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create portfolio",
            error: error.message
        });
    }
};

export const handleGetPortfolio = async (req, res, next) => {
    try {
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || {};
        const matchStage = SearchQuery(search);

        const pipeline = []

        if (matchStage) pipeline.push(matchStage);
        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });
  
        const countPipeline = [];
        if (matchStage) countPipeline.push(matchStage);
        countPipeline.push({ $count: "totalItems" });
  
        const projects = await PortfolioModel.aggregate(pipeline);
  
        const countResult = await PortfolioModel.aggregate(countPipeline);
        const totalItems = countResult.length > 0 ? countResult[0].totalItems : 0;
        const totalPages = Math.ceil(totalItems / limit);
        res.status(200).json({
          projects,
          meta: {
            totalItems,
            totalPages,
            page,
            limit,
          },
        });

    } catch (error) {
        next(error)
        console.log(error)
    }
}


export const handleGetCategories = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const search = req.query.search || {};
      const matchStage = SearchQuery(search);
  
      const pipeline = [];
  
      if (matchStage) pipeline.push(matchStage);
  
      // 🔑 GROUP TO REMOVE DUPLICATES
      pipeline.push({
        $group: {
          _id: "$category",
          category: { $first: "$category" },
          createdAt: { $first: "$createdAt" }
        }
      });
  
      pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
  
      const categories = await PortfolioModel.aggregate(pipeline);
  
      // -------- COUNT UNIQUE CATEGORIES ----------
      const countPipeline = [];
      if (matchStage) countPipeline.push(matchStage);
  
      countPipeline.push({
        $group: { _id: "$category" }
      });
  
      countPipeline.push({
        $count: "totalItems"
      });
  
      const countResult = await PortfolioModel.aggregate(countPipeline);
  
      const totalItems = countResult[0]?.totalItems || 0;
      const totalPages = Math.ceil(totalItems / limit);
  
      res.status(200).json({
        categories,
        meta: {
          totalItems,
          totalPages,
          page,
          limit
        }
      });
  
    } catch (error) {
      next(error);
    }
  };
  