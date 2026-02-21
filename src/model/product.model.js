import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    keywords: [String], // SEO keywords

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

    purpose: {
      type: String,
      enum: ["sell", "rent"],
      required: true
    },

    bhk: {
      type: Number,
      required: function () {
        return this.type === "property";
      }
    },

    // ================= TYPE =================
    type: {
      type: String,
      enum: ["stationery", "machinery", "property"],
      required: true
    },

    // ================= MEDIA =================
    productImg: [String],

    // ================= RATINGS =================
    ratings: {
      type: Number,
      default: 0
    },

    reviewsCount: {
      type: Number,
      default: 0
    },

    featured: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);



// ================= INDEXES FOR SEO & SEARCH =================

// Full text search index
productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  category: "text",
  keywords: "text"
});

// Fast filter indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ type: 1 });
productSchema.index({ price: 1 });

export default mongoose.model("Products", productSchema);
