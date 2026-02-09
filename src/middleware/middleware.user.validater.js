import Joi from "joi";

export const validateUser = (req, res, next) => {
  const schema = Joi.object({
    userName: Joi.string()
      .trim()
      .min(3)
      .required()
      .messages({
        "string.min": "Username must be at least 3 characters",
        "any.required": "Username is required",
      }),

    email: Joi.string().email().required(),

    password: Joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};
