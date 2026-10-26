import mongoose from "mongoose";
const { Schema } = mongoose;

const BlogSchema = new Schema(
   {
      title: {
         type: String,
         required: [true, "Title is required"],
         trim: true,
         minlength: [5, "Title must be at least 5 characters"],
         maxlength: [150, "Title cannot exceed 150 characters"],
      },
      // URL me /blog/<slug> aata hai. Title se auto ban jata hai (neeche hook dekho)
      slug: {
         type: String,
         required: [true, "Slug is required"],
         unique: true,
         trim: true,
         lowercase: true,
         index: true,
      },
      excerpt: {
         type: String,
         required: [true, "Excerpt is required"],
         trim: true,
         maxlength: [300, "Excerpt cannot exceed 300 characters"],
      },
      // HTML string (rich text editor se)
      content: {
         type: String,
         required: [true, "Content is required"],
      },
      coverImage: {
         type: String,
         trim: true,
      },
      coverImageAlt: {
         type: String,
         trim: true,
      },
      author: {
         name: {
            type: String,
            required: [true, "Author name is required"],
            trim: true,
         },
         role: { type: String, trim: true },
         avatar: { type: String, trim: true },
      },
      category: {
         type: String,
         trim: true,
         index: true,
      },
      tags: {
         type: [String],
         default: [],
      },
      status: {
         type: String,
         enum: ["draft", "published", "archived"],
         default: "draft",
      },
      publishedAt: {
         type: Date,
      },
      seo: {
         title: { type: String, trim: true },
         description: { type: String, trim: true },
         ogImage: { type: String, trim: true },
      },
   },
   {
      timestamps: true,
      toJSON: {
         // Frontend `/blog/[id]` me id = slug use karta hai
         transform: (_doc, ret) => {
            ret.id = ret.slug;
            delete ret._id;
            delete ret.__v;
            return ret;
         },
      },
   },
);

// Blog list ke liye: published, newest first
BlogSchema.index({ status: 1, publishedAt: -1 });

// Slug nahi diya to title se bana do
BlogSchema.pre("validate", function (next) {
   if (!this.slug && this.title) {
      this.slug = this.title
         .toLowerCase()
         .trim()
         .replace(/[^a-z0-9]+/g, "-")
         .replace(/^-+|-+$/g, "");
   }
   next();
});

// Publish hote hi publishedAt set kar do
BlogSchema.pre("save", function (next) {
   if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
   }
   next();
});

const BlogModel = mongoose.model("blogs", BlogSchema);
export default BlogModel;
