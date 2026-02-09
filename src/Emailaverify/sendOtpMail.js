import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendOtpMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOption = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h3>Password Reset Request</h3>
        <p>Your OTP for password reset is:</p>
        <h2 style="letter-spacing:2px;">${otp}</h2>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOption);
    console.log("OTP email sent:", info.response);
  } catch (error) {
    console.error("OTP email failed:", error.message);
  }
};

export default sendOtpMail;
