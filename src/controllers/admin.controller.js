import bcrypt from "bcrypt"
import userModel from "../model/user.model.js"
import jwt from "jsonwebtoken"
import session from "../model/model.session.js"

export const getAdminProfile = async (req, res) => {
  const admin = await userModel.findById(req.userId);
  res.json(admin);
};

export const updateAdminProfile = async (req, res) => {
  const { userName, phone, address } = req.body;

  const updated = await userModel.findByIdAndUpdate(
    req.userId,
    { userName, phone, address },
    { new: true }
  );

  res.json(updated);
};


export const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await userModel.findById(req.userId).select("+password");

  const match = await bcrypt.compare(currentPassword, admin.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.json({ message: "Password updated" });
};
