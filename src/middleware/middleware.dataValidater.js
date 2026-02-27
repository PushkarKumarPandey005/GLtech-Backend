import Joi from "joi";

export const validateProduct = (req, res, next) => {


  const schema = Joi.object({

    title: Joi.string().required(),
    description: Joi.string().required(),

    type: Joi.string()
      .valid("stationery", "machinery", "property")
      .required(),

    price: Joi.number().required(),

    discountPrice: Joi.number().allow(null, ""),


    stock: Joi.when("type", {
      is: "property",
      then: Joi.optional(),
      otherwise: Joi.number().required(),
    }),

    // ================= PRODUCT DETAILS =================
    size: Joi.string().allow("", null),
    material: Joi.string().allow("", null),
    weight: Joi.string().allow("", null),
    color: Joi.string().allow("", null),
    brand: Joi.string().allow("", null),

    // ================= MACHINERY =================
    power: Joi.when("type", {
      is: "machinery",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    voltage: Joi.when("type", {
      is: "machinery",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    // ================= PROPERTY =================
    bhk: Joi.when("type", {
      is: "property",
      then: Joi.number().min(1).max(8).required(),
      otherwise: Joi.optional(),
    }),

    area: Joi.when("type", {
      is: "property",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    location: Joi.when("type", {
      is: "property",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    parking: Joi.when("type", {
      is: "property",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    furnished: Joi.when("type", {
      is: "property",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    ownerContact: Joi.when("type", {
      is: "property",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    purpose: Joi.when("type", {
      is: "property",
      then: Joi.string().valid("sell", "rent").required(),
      otherwise: Joi.optional(),
    }),

    // boolean safe 
    priceNegotiable: Joi.boolean()
      .truthy("true")
      .falsy("false")
      .optional(),

    // ================= IMAGES =================
    existingImages: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ),

    newImages: Joi.any(),
  });

  const { error } = schema.validate(req.body, {
    abortEarly: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};