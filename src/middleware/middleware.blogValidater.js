import Joi from "joi";

/* ================================
    CREATE BLOG VALIDATION
================================ */

export const createBlogSchema = Joi.object({
  // Basic Info
  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 5 characters",
      "string.max": "Title cannot exceed 200 characters"
    }),

  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base":
        "Slug can contain only lowercase letters, numbers and hyphens"
    }),

  excerpt: Joi.string()
    .allow("")
    .max(300)
    .messages({
      "string.max": "Excerpt cannot exceed 300 characters"
    }),

  content: Joi.string()
    .min(20)
    .required()
    .messages({
      "string.empty": "Content is required",
      "string.min": "Content must be at least 20 characters"
    }),

  // ⭐ IMPORTANT FIX — optional string
featuredImage: Joi.any().optional(),
  // Classification
  category: Joi.string().allow("").optional(),

  // ⭐⭐⭐ BIG FIX — accept string OR array
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim()),
      Joi.string() // because FormData sends string
    )
    .optional(),

  // SEO Fields
  metaTitle: Joi.string().max(60).allow("").optional(),

  metaDescription: Joi.string().max(160).allow("").optional(),

  // Language
  language: Joi.string().valid("en", "hi").optional(),

  // Status
  status: Joi.string().valid("draft", "published").optional(),

  // Author
  author: Joi.string().allow("").optional()
});

/* ================================
     UPDATE BLOG VALIDATION
================================ */

export const updateBlogSchema = createBlogSchema.fork(
  ["title", "content"],
  (field) => field.optional()
);