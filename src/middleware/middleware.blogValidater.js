import Joi from "joi";

/* ================================
   📝 CREATE BLOG VALIDATION
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

  featuredImage: Joi.string()
    .uri()
    .allow("")
    .messages({
      "string.uri": "Featured image must be a valid URL"
    }),

  // Classification
  category: Joi.string().allow("").optional(),

  tags: Joi.array()
    .items(Joi.string().trim())
    .optional(),

  // SEO Fields
  metaTitle: Joi.string()
    .max(60)
    .allow("")
    .messages({
      "string.max": "Meta title should be under 60 characters"
    }),

  metaDescription: Joi.string()
    .max(160)
    .allow("")
    .messages({
      "string.max": "Meta description should be under 160 characters"
    }),

  // Language
  language: Joi.string()
    .valid("en", "hi")
    .optional(),

  // Status
  status: Joi.string()
    .valid("draft", "published")
    .optional(),

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