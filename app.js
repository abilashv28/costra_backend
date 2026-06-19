// Load environment variables from .env
require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

const app = express();
const db = require("./models");

const { responseWrapper } = require("./utils/response");

// Middleware
const liveFrontendUrl = process.env.FRONTEND_URL || "https://costra.truthordarefun.com";
const localFrontendUrl = process.env.LOCAL_FRONTEND_URL || "http://localhost:5173";

// Build an explicit allowlist. You can override by setting `FRONTEND_URLS` to a
// comma-separated list of allowed origins (e.g. "https://costra.truthordarefun.com,https://www.costra.truthordarefun.com").
let allowedOrigins = [];
if (process.env.FRONTEND_URLS) {
  allowedOrigins = process.env.FRONTEND_URLS.split(",").map(s => s.trim()).filter(Boolean);
} else {
  try {
    const host = new URL(liveFrontendUrl).hostname.replace(/^www\./, "");
    allowedOrigins = [liveFrontendUrl, `https://www.${host}`, localFrontendUrl];
  } catch (e) {
    allowedOrigins = [liveFrontendUrl, localFrontendUrl];
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., server-to-server) when origin is undefined
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // Allow common request headers including browser client hints. If you
  // prefer stricter control, set `FRONTEND_URLS` and enumerate required headers.
  allowedHeaders: [
    "Origin",
    "Accept",
    "Content-Type",
    "Authorization",
    "Referer",
    "User-Agent",
    "sec-ch-ua",
    "sec-ch-ua-platform",
    "sec-ch-ua-mobile",
  ],
  credentials: true,
}));

// Set security HTTP headers
app.use(helmet());

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
// Apply rate limiter to all /api routes
app.use("/api", limiter);

app.use(express.json());

// Prevent HTTP Parameter Pollution
app.use(hpp());

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
const clientRoutes = require("./routes/client.routes");
const auditLogRoutes = require("./routes/auditlog.routes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/payments", projectPaymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/payment-stages", paymentStagesRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/audit-logs", auditLogRoutes);

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
  .sync({ force: false, alter: false })
  .then(() => {
    console.log("DB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });