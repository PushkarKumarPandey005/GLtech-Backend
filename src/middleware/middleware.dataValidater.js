
import Joi from "joi";


export const validateProduct = (req, res, next) => {

  console.log("REQ BODY:", req.body);
  console.log("TYPE VALUE:", req.body.type);
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(""),

    price: Joi.number().required(),
    discountPrice: Joi.number().allow(null, ""),
    stock: Joi.number().when("type", {
      is: "stationery",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

    size: Joi.string().allow("", null),
    material: Joi.string().allow("", null),
    weight: Joi.string().allow("", null),
    color: Joi.string().allow("", null),
    brand: Joi.string().allow("", null),

    type: Joi.string()
      .valid("stationery", "machinery", "property")
      .required(),


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


    priceNegotiable: Joi.when("type", {
      is: "property",
      then: Joi.boolean().required(),
      otherwise: Joi.optional(),
    }),



    ownerContact: Joi.when("type", {
      is: "property",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),

    purpose: Joi.string().when("type", {
      is: "property",
      then: Joi.valid("sell", "rent").required(),
      otherwise: Joi.optional(),
    }),


    existingImages: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ),

    newImages: Joi.any(),

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
