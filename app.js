require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const db = require("./models");

const { responseWrapper } = require("./utils/response");

// Middleware
const liveFrontendUrl = process.env.FRONTEND_URL || "https://costra.truthordarefun.com";
const localFrontendUrl = process.env.LOCAL_FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [liveFrontendUrl, localFrontendUrl];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(responseWrapper);

// Routes
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const projectPaymentRoutes = require("./routes/projectpayment.routes");
const expenseRoutes = require("./routes/expense.routes");
const categoryRoutes = require("./routes/category.routes");
const attachmentRoutes = require("./routes/attachment.routes");
const paymentStagesRoutes = require("./routes/paymentStages.routes");
const companyRoutes = require("./routes/company.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/payments", projectPaymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/payment-stages", paymentStagesRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Costra Backend Running Successfully 🚀");
});

// Error Middleware
app.use(require("./middleware/error.middleware"));

// Port
const PORT = process.env.PORT || 5000;

// DB Sync + Start Server
db.sequelize
  .sync({ force: false, alter: true })
  .then(() => {
    console.log("DB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });