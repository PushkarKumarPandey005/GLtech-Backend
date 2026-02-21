import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true
    },
    customer: {
      fullName: String,
      email: String,
      phone: String
    },
    address: {
      fullAddress: String,
      city: String,
      state: String,
      pincode: String
    },
    items: [
      {
        title: String,
        image: String,
        quantity: Number,
        price: Number,
        total: Number
      }
    ],
    pricing: {
      subtotal: Number,
      shipping: Number,
      tax: Number,
      total: Number
    },
    payment: {
      method: String,
      status: String
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    status: {
      type: String,
      enum: ["draft", "issued", "sent", "viewed", "paid", "cancelled"],
      default: "issued"
    },
    notes: String,
    termsAndConditions: String,
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    },
    downloadedAt: Date,
    printedAt: Date
  },
  { timestamps: true }
);

// Generate invoice number before saving
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const latestInvoice = await mongoose
      .model("Invoice")
      .findOne()
      .sort({ createdAt: -1 });
    const latestNumber = latestInvoice ? latestInvoice.invoiceNumber : "INV000000";
    const nextNumber = parseInt(latestNumber.substring(3)) + 1;
    this.invoiceNumber = `INV${String(nextNumber).padStart(6, "0")}`;
  }
  next();
});

export default mongoose.model("Invoice", invoiceSchema);
