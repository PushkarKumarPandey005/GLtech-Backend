import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const verifymail = async (token, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const verifyLink = `http://localhost:4000/user/verify/${token}`;

    const mailConfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `
        <h2>Verify your Email</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `,
    };

    const info = await transporter.sendMail(mailConfigurations);

    console.log("Verification email sent:", info.response);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

export default verifymail;
