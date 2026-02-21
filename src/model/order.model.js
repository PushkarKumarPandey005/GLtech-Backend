import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // ================= ORDER ID & INFO =================
    orderId: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    // ================= CUSTOMER INFO =================
    customer: {
      fullName: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      }
    },

    // ================= DELIVERY ADDRESS =================
    address: {
      fullAddress: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: String,
        required: true,
        trim: true
      }
    },

    // ================= ORDER ITEMS =================
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        productTitle: {
          type: String,
          required: true
        },
        productImage: String,
        category: String,
        slug: String,
        brand: String,
        price: {
          type: Number,
          required: true
        },
        originalPrice: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        subtotal: {
          type: Number,
          required: true
        }
      }
    ],

    // ================= PRICING =================
    pricing: {
      subtotal: {
        type: Number,
        required: true
      },
      shipping: {
        type: Number,
        default: 0
      },
      tax: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      }
    },

    // ================= PAYMENT =================
    payment: {
      method: {
        type: String,
        enum: ["upi", "card", "netbanking", "wallet", "cod"],
        default: "cod"
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
      },
      transactionId: String,
      paymentDate: Date
    },

    // ================= TIMESTAMPS =================
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ "customer.userId": 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
