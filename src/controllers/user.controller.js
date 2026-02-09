import bcrypt from "bcrypt"
import userModel from "../model/user.model.js"
import jwt from "jsonwebtoken"
import verifymail from "../Emailaverify/emaiVerify.js"
import sendOtpMail from "../Emailaverify/sendOtpMail.js"
import session from "../model/model.session.js"


export const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const alreadyExist = await userModel.findOne({ email });
    if (alreadyExist) {
      return res.status(400).json({ success: false, message: "User Already Exist" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      userName,
      email,
      password: hashedPass,
      role: "user", // always user
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );

    newUser.token = token;
    await newUser.save();

    await verifymail(token, email);

    res.status(201).json({
      success: true,
      message: "Registered Successfully. Verify Email.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}



export const verification = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}



export const login = async (req, res, expectedRole) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Verify email first" });
    }

    // ROLE CHECK
    if (user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `Not authorized as ${expectedRole}`,
      });
    }

    await session.deleteMany({ userId: user._id });
    await session.create({ userId: user._id });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "10d" }
    );

    user.isLogedIn = true;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      data: {
        id: user._id,
        userName: user.userName,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ================= ROUTE WRAPPERS =================
export const userLogin = (req, res) => login(req, res, "user");
export const adminLogin = (req, res) => login(req, res, "admin");


export const logoutUser = async (req, res) => {
  try {
    await session.deleteMany({ userId: req.userId });
    await userModel.findByIdAndUpdate(req.userId, { isLogedIn: false });

    res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpMail(email, otp);

    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;

    const user = await userModel.findOne({ email });

    if (otp !== user.otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


export const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.params;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await userModel.findOne({ email });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}




