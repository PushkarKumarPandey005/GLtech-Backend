import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({

    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: {
        type: Number,
        required: function () {
            return this.type !== "property";
        },
    },

    size: { type: String },
    material: { type: String },
    weight: { type: String },
    sku: { type: String },
    productImg: [String],
    color: { type: String },
    brand: { type: String },

    area: { type: String },
    parking: { type: String },
    furnished: { type: String },
    location: { type: String },
    ownerContact: { type: String },
    video: { type: String },
    type: { type: String, enum: ["stationery", "machinery", "property"], required: true, },
    priceNegotiable: Boolean,
    power: { type: String },
    voltage: { type: String },
    warranty: { type: String },
    dimensions: { type: String },


}, { timestamps: true });

export default mongoose.model("Products", productSchema);