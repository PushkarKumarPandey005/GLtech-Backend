import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

  
    profilePhoto: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    
    isVerified: {
      type: Boolean,
      default: false,
    },

    isLogedIn: {
      type: Boolean,
      default: false,
    },

    token: {
      type: String,
      default: null,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
