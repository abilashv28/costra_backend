const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

const signToken = user => {
  const secret = process.env.JWT_SECRET || "secret-key";
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    {
      expiresIn: "7d",
    }
  );
};

const sanitizeUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  company_id: user.company_id,
  created_by: user.created_by,
  onboarding_step: user.onboarding_step,
  is_tour_completed: user.onboarding_step > 0,
});

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

exports.register = async ({ name, email, password, company_name, company_id, role }) => {
  if (!name || !email || !password) {
    throw createError("Name, email, and password are required");
  }

  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw createError("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.sequelize.transaction(async (transaction) => {
    let user = await db.User.create(
      {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        company_id: company_id || null,
      },
      { transaction }
    );

    let company = null;
    if (company_name && company_name.trim()) {
      company = await db.Company.create(
        { name: company_name.trim() },
        { transaction }
      );
      user = await user.update(
        { company_id: company.id },
        { transaction }
      );
    } else if (company_id) {
      const existingCompany = await db.Company.findByPk(company_id, { transaction });
      if (!existingCompany) {
        throw createError("Company not found");
      }
    }

    user = await user.update(
      { created_by: user.id },
      { transaction }
    );

    return { user, company };
  });

  const { user, company } = result;

  // 🔥 RAW QUERY to get all tables (PostgreSQL / MySQL supported with small tweak)
  const tables = await db.sequelize.query(
    `SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public'`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
    }
  );

  return {
    success: true,
    message: "Registration successful",
    user: sanitizeUser(user),
    token: signToken(user),
    company: company
      ? {
          id: company.id,
          name: company.name,
          created_at: company.created_at,
        }
      : undefined,
    debug: {
      database: db.sequelize.config.database,
      tables,
    },
  };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw createError("Email and password are required");
  }

  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw createError("Invalid email or password");
  }

  if (user.role === "user" && !user.is_active) {
    throw createError("Account not activated. Please check your email for activation instructions.");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw createError("Invalid email or password");
  }

  const sanitizedUser = sanitizeUser(user);

  return {
    success: true,
    message: "Login successful",
    user: sanitizedUser,
    token: signToken(user)
  };
};

exports.getUserDetails = async (userId) => {
  const user = await db.User.findByPk(userId);
  if (!user) {
    throw createError("User not found", 404);
  }

  return {
    success: true,
    message: "User details retrieved successfully",
    user: sanitizeUser(user)
  };
};

exports.updateOnboarding = async (userId, { onboarding_step, is_tour_completed }) => {
  const user = await db.User.findByPk(userId);
  if (!user) {
    throw createError("User not found", 404);
  }

  const updateData = {};
  if (onboarding_step !== undefined) {
    updateData.onboarding_step = onboarding_step;
  }
  if (is_tour_completed !== undefined) {
    updateData.onboarding_step = is_tour_completed ? 100 : 0;
  }

  await user.update(updateData);

  return {
    success: true,
    message: "Onboarding step updated successfully",
    user: sanitizeUser(user)
  };
};

exports.getAllUsers = async () => {
  const users = await db.User.findAll();
  return {
    success: true,
    message: "Users retrieved successfully",
    users: users.map(sanitizeUser)
  };
};
