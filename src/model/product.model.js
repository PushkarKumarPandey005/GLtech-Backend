import mongoose from "mongoose";

/* ================= SLUG GENERATOR ================= */
const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/* ================= SCHEMA ================= */
const productSchema = new mongoose.Schema(
  {
    //================= BASIC INFO =================
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    //slug ONLY for stationery (auto-generated)
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      required: function () {
        return this.type === "blogs";
      },
    },

    keywords: [String],

    // ================= PRICING =================
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    priceNegotiable: Boolean,

    // ================= INVENTORY =================
    stock: {
      type: Number,
      required: function () {
        return this.type !== "property";
      },
    },

    sku: { type: String },

    // ================= PRODUCT DETAILS =================
    size: String,
    material: String,
    weight: String,
    color: String,
    brand: String,
    dimensions: String,
    warranty: String,

    // ================= PROPERTY DETAILS =================
    area: String,
    parking: String,
    furnished: String,
    location: String,
    ownerContact: String,
    video: String,

    //  ONLY for property
    purpose: {
      type: String,
      enum: ["sell", "rent"],
      required: function () {
        return this.type === "property";
      },
    },

    //  ONLY for property
    bhk: {
      type: Number,
      required: function () {
        return this.type === "property";
      },
    },

    // ================= TYPE =================
    type: {
      type: String,
      enum: ["stationery", "machinery", "property"],
      required: true,
    },

    // ================= MEDIA =================
    productImg: [String],

    // ================= RATINGS =================
    ratings: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ================= AUTO SLUG MIDDLEWARE ================= */
productSchema.pre("save", async function () {
  // only for stationery
  if (this.type !== "stationery") return;

  // if slug already exists, skip
  if (this.slug) return;

  // generate base slug
  const baseSlug = generateSlug(this.title);
  let finalSlug = baseSlug;

  // duplicate protection
  let counter = 1;
  while (await this.constructor.findOne({ slug: finalSlug })) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  this.slug = finalSlug;
});
/* ================= INDEXES ================= */

// text search
productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  category: "text",
  keywords: "text",
});

// ⚡ fast filters
productSchema.index({ slug: 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1 });
productSchema.index({ type: 1 });
productSchema.index({ price: 1 });

export default mongoose.model("Products", productSchema);