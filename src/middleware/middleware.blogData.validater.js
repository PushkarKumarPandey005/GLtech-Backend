export const validate = (schema) => (req, res, next) => {
  try {
    // ⭐ IMPORTANT: tags string → array
    if (req.body.tags && typeof req.body.tags === "string") {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch {
        req.body.tags = [req.body.tags];
      }
    }

    // ⭐ IMPORTANT: multer case — featuredImage ignore if file exists
    if (req.file) {
      req.body.featuredImage = req.body.featuredImage || "";
    }

    const { error } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};