import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../model/user.model.js";

dotenv.config({ path: "./.env" });


await mongoose.connect(process.env.MONGO_URI);

const run = async () => {
  const email = "admin@gmail.com";
  const password = "Admin@123";

  const exist = await User.findOne({ email });
  if (exist) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    userName: "Super Admin",
    email,
    password: hashed,
    role: "admin",
    isVerified: true,
  });

  console.log("Admin created successfully");
  process.exit();
};

run();
