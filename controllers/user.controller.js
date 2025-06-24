const User = require("../models/user.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "No account with that email." });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: '"GetThere Support" <no-reply@getthere.test>',
      to: user.email,
      subject: "Reset Your Password",
      html: `<p>Click below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    res.status(200).json({
      message: "Reset link sent (preview URL printed on server)",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      company,
      role,
      displayName,
      photoURL,
    } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      company,
      role,
      displayName,
      photoURL,
    });
    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ message: "User registered", user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ error: "Invalid email or role" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

    const { password: _, ...safeUser } = user.toObject();
    res.status(200).json({ message: "Login successful", user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
