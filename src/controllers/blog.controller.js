import mongoose from "mongoose";
import Blog from "../model/blog.model.js";
import cloudinary from "../config/config.cloudinary.js"
import fs from "fs";
/* ================================
        Helper: slug generator
================================ */
const generateSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/* ================================
        CREATE BLOG
================================ */


export const createBlog = async (req, res) => {
  try {
    let {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      metaTitle,
      metaDescription,
      language,
      status,
      author,
    } = req.body;

    /* ---------- Required check ---------- */
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    /* ---------- tags normalize ---------- */
    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [tags];
      }
    }
    if (!Array.isArray(tags)) tags = [];

    /* ---------- CLOUDINARY UPLOAD (UPDATED) ---------- */
    let featuredImage = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
      });

      featuredImage = result.secure_url;

      // ✅ local file delete (important)
      fs.unlinkSync(req.file.path);
    }

    /* ---------- slug ---------- */
    let finalSlug = slug || generateSlug(title);

    const existing = await Blog.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    /* ---------- create blog ---------- */
    const blog = await Blog.create({
      title,
      slug: finalSlug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      language: language || "en",
      status: status || "published",
      author,
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================================
    GET ALL BLOGS (PUBLIC)
================================ */
export const getBlogs = async (req, res) => {
  try {
    /* ---------- safe query parsing ---------- */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // max 50
    const { category, search } = req.query;
    const language = req.query.language || "en";

    /* ---------- base query ---------- */
    const query = {
      status: "published",
      language,
    };

    /* ---------- category filter ---------- */
    if (category) {
      query.category = category;
    }

    /* ---------- safe search ---------- */
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { excerpt: { $regex: safeSearch, $options: "i" } },
      ];
    }

    /* ---------- pagination ---------- */
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content"),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

/* ================================
    GET BLOG BY SLUG
================================ */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    /* ---------- basic slug validation ---------- */
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid slug",
      });
    }

    /* ---------- atomic find + increment ---------- */
    const blog = await Blog.findOneAndUpdate(
      {
        slug,
        status: "published",
      },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get Blog Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
    });
  }
};

/* ================================
    UPDATE BLOG
================================ */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    /* ---------- ObjectId validation ---------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id",
      });
    }

    const updates = { ...req.body };

    /* ---------- tags normalize ---------- */
    if (typeof updates.tags === "string") {
      try {
        updates.tags = JSON.parse(updates.tags);
      } catch {
        updates.tags = [updates.tags];
      }
    }

    if (updates.tags && !Array.isArray(updates.tags)) {
      updates.tags = [];
    }

    /* ---------- ⭐ CLOUDINARY IMAGE UPDATE ---------- */
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "blogs" }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          })
          .end(req.file.buffer);
      });

      updates.featuredImage = uploadResult.secure_url;
    }

    /* ---------- slug regenerate ---------- */
    if (updates.title && !updates.slug) {
      updates.slug = generateSlug(updates.title);
    }

    /* ---------- empty update guard ---------- */
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
    }

    const blog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
    });
  }
};

/* ================================
    DELETE BLOG
================================ */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    /* ---------- ObjectId validation ---------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id",
      });
    }

    /* ---------- find blog first ---------- */
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    /* ---------- ⭐ Cloudinary image delete ---------- */
    if (blog.featuredImage) {
      try {
        // extract public_id from URL
        const parts = blog.featuredImage.split("/");
        const filename = parts[parts.length - 1];
        const publicId = `blogs/${filename.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Cloudinary delete failed:", err.message);
      }
    }

    /* ---------- delete blog ---------- */
    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
    });
  }
};