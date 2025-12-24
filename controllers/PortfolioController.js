import cloudinary from "../config/cloudinary.js";
import PortfolioModel from "../models/PortfolioSchema.js";
import Portfolio from "../models/PortfolioSchema.js";
import { uploadToCloudinary } from "../utils/CloudinaryUpload.js";
import SearchQuery from "../utils/SearchQuery.js"

export const createPortfolio = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            category,
            projectUrl,
            tags,
            featured,
            status
        } = req.body;

        if (!req.files?.coverImage?.length) {
            return res.status(400).json({ message: "Cover image is required" });
        }



        // ☁️ Upload cover image
        const coverUpload = await uploadToCloudinary(
            req.files.coverImage[0],
            "portfolio/cover"
        );



        // ☁️ Upload gallery images
        let gallery = [];
        if (req.files?.gallery?.length) {
            const galleryUploads = await Promise.all(
                req.files.gallery.map((file) =>
                    uploadToCloudinary(file, "portfolio/gallery")
                )
            );

            gallery = galleryUploads.map((img) => ({
                src: img.secure_url,
                public_id: img.public_id
            }));
        }
        const portfolio = await Portfolio.create({
            title,
            description,
            shortDescription,
            category,
            projectUrl,
            coverImage: coverUpload.secure_url,
            coverImagePublicId: coverUpload.public_id, // 🔥 optional but recommended
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

export const handleUpdatePortfolio = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            shortDescription,
            category,
            projectUrl,
            tags,
            featured,
            status
        } = req.body || {};

        const portfolio = await Portfolio.findById(id);
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found" });
        }

        // 🔁 Replace cover image (optional)
        if (req.files?.coverImage?.length) {
            const coverUpload = await uploadToCloudinary(
                req.files.coverImage[0],
                "portfolio/cover"
            );

            // ☁️ Optional: delete old cover image
            if (portfolio.coverImagePublicId) {
                await cloudinary.uploader.destroy(
                    portfolio.coverImagePublicId
                );
            }

            portfolio.coverImage = coverUpload.secure_url;
            portfolio.coverImagePublicId = coverUpload.public_id;
        }

        // ✅ APPEND gallery images
        if (req.files?.gallery?.length) {
            const galleryUploads = await Promise.all(
                req.files.gallery.map((file) =>
                    uploadToCloudinary(file, "portfolio/gallery")
                )
            );

            const newGalleryItems = galleryUploads.map((img) => ({
                src: img.secure_url,
                public_id: img.public_id
            }));

            portfolio.gallery.push(...newGalleryItems);
        }

        // 📝 Update fields only if provided
        if (title !== undefined) portfolio.title = title;
        if (description !== undefined) portfolio.description = description;
        if (shortDescription !== undefined)
            portfolio.shortDescription = shortDescription;
        if (category !== undefined) portfolio.category = category;
        if (projectUrl !== undefined) portfolio.projectUrl = projectUrl;
        if (tags !== undefined) portfolio.tags = tags.split(",");
        if (featured !== undefined) portfolio.featured = featured;
        if (status !== undefined) portfolio.status = status;

        await portfolio.save();

        res.status(200).json({
            message: "Portfolio updated successfully",
            data: portfolio
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update portfolio",
            error: error.message
        });
    }
};

export const handleDeletePortfolio = async (req, res) => {
    try {
        const { id } = req.params;

        const portfolio = await Portfolio.findById(id);
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found" });
        }

        await Portfolio.findByIdAndDelete(id);

        res.status(200).json({
            message: "Portfolio deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete portfolio",
            error: error.message
        });
    }
};

export const removeGalleryImageById = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const portfolio = await Portfolio.findById(id);
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found" });
        }

        const image = portfolio.gallery.id(imageId);
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        // ☁️ Delete from Cloudinary
        if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        // 🗑 Remove image
        image.deleteOne();
        await portfolio.save();

        res.status(200).json({
            message: "Gallery image removed successfully",
            data: portfolio.gallery
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to remove image",
            error: error.message
        });
    }
};