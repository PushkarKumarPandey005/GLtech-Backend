import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    //   Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    excerpt: {
      type: String,
      maxlength: 300,
      default: ""
    },

    content: {
      type: String,
      required: true
    },

    featuredImage: {
      type: String,
      default: ""
    },

    //  Classification
    category: {
      type: String,
      index: true,
      default: ""
    },

    tags: {
      type: [String],
      default: []
    },

    //  SEO Fields (IMPORTANT)
    metaTitle: {
      type: String,
      maxlength: 60
    },

    metaDescription: {
      type: String,
      maxlength: 160
    },

    //  Language (future ready)
    language: {
      type: String,
      enum: ["en", "hi"],
      default: "en",
      index: true
    },

    //  Publish control
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true
    },

    //  Optional author (future)
    author: {
      type: String,
      default: "GL Technology Team"
    },

    // SEO boost
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast queries
BlogSchema.index({ slug: 1, language: 1 });
BlogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Blog ||
  mongoose.model("Blog", BlogSchema);