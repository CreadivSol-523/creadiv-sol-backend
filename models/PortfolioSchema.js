import mongoose from "mongoose";
const { Schema } = mongoose;

const PortfolioItemSchema = new Schema(
  {
    title: {
      type: String,
      trim: true
    },

    description: {
      type: String
    },

    shortDescription: {
      type: String,
      maxlength: 200
    },

    category: {
      type: String,
      required: true,

    },

    projectUrl: {
      type: String
    },

    coverImage: {
      type: String,
      required: true
    },

    coverImagePublicId: {
      type: String,
      required: true
    },

    gallery: [
      {
        src: String,
        public_id: String,
        alt: String
      }
    ],

    tags: [
      {
        type: String
      }
    ],

    featured: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    }
  },
  { timestamps: true }
);

const PortfolioModel = mongoose.model("Portfolio", PortfolioItemSchema);

export default PortfolioModel;
