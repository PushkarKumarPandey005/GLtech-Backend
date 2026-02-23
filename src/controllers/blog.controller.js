import Blog from "../model/blog.model.js";

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

    /* ---------- ⭐ FIX: tags normalize ---------- */
    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [tags];
      }
    }

    if (!Array.isArray(tags)) {
      tags = [];
    }

    /* ---------- ⭐ FIX: image URL build ---------- */
    let featuredImage = "";

    if (req.file) {
      featuredImage = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    /* ---------- slug auto ---------- */
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
    const {
      page = 1,
      limit = 10,
      category,
      search,
      language = "en",
    } = req.query;

    const query = {
      status: "published",
      language,
    };

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-content"),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================================
    GET BLOG BY SLUG
================================ */
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({
      slug,
      status: "published",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================================
    UPDATE BLOG
================================ */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    /* ---------- tags normalize ---------- */
    if (typeof updates.tags === "string") {
      try {
        updates.tags = JSON.parse(updates.tags);
      } catch {
        updates.tags = [updates.tags];
      }
    }

    /* ---------- image update ---------- */
    if (req.file) {
      updates.featuredImage = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    if (updates.title && !updates.slug) {
      updates.slug = generateSlug(updates.title);
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
      message: error.message,
    });
  }
};

/* ================================
    DELETE BLOG
================================ */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};