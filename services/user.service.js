const db = require("../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const sanitizeUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  company_id: user.company_id,
  created_by: user.created_by,
  onboarding_step: user.onboarding_step,
  is_tour_completed: user.onboarding_step >= 100,
  is_active: user.is_active,
});

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

exports.getUsers = async (currentUser) => {
  const users = await db.User.findAll({
    where: {
      company_id: currentUser.company_id,
    },
    include: [
      {
        model: db.Company,
        as: "Company",
        attributes: ["id", "name"],
      },
      {
        model: db.User,
        as: "Creator",
        attributes: ["id", "name", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return users.map(user => ({
    ...sanitizeUser(user),
    Company: user.Company,
    Creator: user.Creator,
  }));
};

exports.getUserById = async (id) => {
  const user = await db.User.findByPk(id, {
    include: [
      {
        model: db.Company,
        as: "Company",
        attributes: ["id", "name"],
      },
      {
        model: db.User,
        as: "Creator",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  return {
    ...sanitizeUser(user),
    Company: user.Company,
    Creator: user.Creator,
  };
};

exports.createUser = async ({ email, role, company_id }, creator) => {
  if (!email) {
    throw createError("Email is required");
  }

  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw createError("A user with this email already exists");
  }

  // Generate secure token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  console.log("Generated token for", email, ":", resetToken.substring(0, 10) + "...");
  console.log("Hashed token:", hashedToken.substring(0, 10) + "...");

  // Set expiry to 24 hours from now
  const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await db.User.create({
    name: "", // Will be set when user activates account
    email,
    password: null, // Will be set when user sets password
    role: role || "user",
    company_id: company_id || creator.company_id,
    created_by: creator.id,
    password_reset_token: hashedToken,
    password_reset_expires: resetExpires,
    is_active: false,
  });

  // Send invitation email only if user creation succeeds
  try {
    await this.sendInvitationEmail(email, resetToken);
  } catch (emailError) {
    console.error("Failed to send invitation email for user", email, "error:", emailError.message || emailError);
    // Don't fail the user creation if email fails
  }

  return this.getUserById(user.id);
};

exports.sendInvitationEmail = async (email, token) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw createError("SMTP_USER and SMTP_PASS must be configured in environment variables", 500);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/set-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Welcome! Set your password to activate your account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Expense Tracker!</h2>
        <p>You have been invited to join our expense tracking platform.</p>
        <p>Please click the link below to set your password and activate your account:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Set Password</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this invitation, please ignore this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Invitation email queued for", email, "messageId=", info.messageId);
  return info;
};

exports.validatePasswordResetToken = async (token) => {
  console.log("Validating token:", token ? token.substring(0, 10) + "..." : "null");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log("Hashed token:", hashedToken.substring(0, 10) + "...");

  const user = await db.User.findOne({
    where: {
      password_reset_token: hashedToken,
      password_reset_expires: {
        [db.Sequelize.Op.gt]: new Date(),
      },
      is_active: false,
    },
  });

  console.log("User found:", !!user);
  if (user) {
    console.log("User email:", user.email, "is_active:", user.is_active, "expires:", user.password_reset_expires);
  }

  if (!user) {
    throw createError("Invalid or expired token", 400);
  }

  return user;
};

exports.setPassword = async (token, { name, password }) => {
  if (!name || !password) {
    throw createError("Name and password are required");
  }

  const user = await this.validatePasswordResetToken(token);

  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);

  await user.update({
    name,
    password: hashedPassword,
    password_reset_token: null,
    password_reset_expires: null,
    is_active: true,
    onboarding_step: 0,
  });

  return this.getUserById(user.id);
};

exports.updateUser = async (id, { name, email, role, company_id }) => {
  const user = await db.User.findByPk(id);
  if (!user) {
    throw createError("User not found", 404);
  }

  if (email && email !== user.email) {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw createError("A user with this email already exists");
    }
  }

  await user.update({
    name: name || user.name,
    email: email || user.email,
    role: role || user.role,
    company_id: company_id || user.company_id,
  });

  return this.getUserById(id);
};

exports.deleteUser = async (id) => {
  const user = await db.User.findByPk(id);
  if (!user) {
    throw createError("User not found", 404);
  }

  await user.destroy();
  return { message: "User deleted successfully" };
};

exports.forgotPassword = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    // Don't reveal if email doesn't exist for security
    return { message: "If an account exists with that email, you will receive a password reset link shortly" };
  }

  // Generate secure token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expiry to 1 hour from now
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

  await user.update({
    password_reset_token: hashedToken,
    password_reset_expires: resetExpires,
  });

  // Send password reset email
  try {
    await this.sendPasswordResetEmail(email, resetToken);
  } catch (emailError) {
    console.error("Failed to send password reset email to", email, "error:", emailError.message || emailError);
    // Don't fail the request if email fails, but the token is still valid
  }

  return { message: "If an account exists with that email, you will receive a password reset link shortly" };
};

exports.validatePasswordResetTokenForExistingUser = async (token) => {
  console.log("Validating reset token:", token ? token.substring(0, 10) + "..." : "null");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log("Hashed token:", hashedToken.substring(0, 10) + "...");

  const user = await db.User.findOne({
    where: {
      password_reset_token: hashedToken,
      password_reset_expires: {
        [db.Sequelize.Op.gt]: new Date(),
      },
      is_active: true,
    },
  });

  console.log("User found:", !!user);
  if (user) {
    console.log("User email:", user.email, "is_active:", user.is_active, "expires:", user.password_reset_expires);
  }

  if (!user) {
    throw createError("Invalid or expired reset link", 400);
  }

  return user;
};

exports.resetPasswordToken = async (token, { password }) => {
  if (!password) {
    throw createError("Password is required");
  }

  const user = await this.validatePasswordResetTokenForExistingUser(token);

  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);

  await user.update({
    password: hashedPassword,
    password_reset_token: null,
    password_reset_expires: null,
  });

  return this.getUserById(user.id);
};

exports.sendPasswordResetEmail = async (email, token) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw createError("SMTP_USER and SMTP_PASS must be configured in environment variables", 500);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Password Reset Request - Expense Tracker",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for your Expense Tracker account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Password reset email queued for", email, "messageId=", info.messageId);
  return info;
};