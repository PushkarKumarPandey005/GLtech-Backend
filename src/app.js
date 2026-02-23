import express from 'express';
import helmet from 'helmet';
import rateLimit from "express-rate-limit";
import mongoSanitize from "mongo-sanitize";

import productsRoutes from './routes/product.router.js';
import userRoutes from "./routes/user.router.js";
import orderRoutes from "./routes/order.router.js";
import paymentRoutes from "./routes/payment.router.js";
import invoiceRoutes from "./routes/invoice.router.js";
import blogRoutes from "./routes/blog.router.js";
import uploadRoutes from "./routes/upload.router.js"; 

const app = express();

/* ---------- Security Layer 1 Helmet ---------- */
app.use(helmet());

/* ---------- Security layer 2 Rate Limit ---------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes (much higher for dev)
  message: {
    success: false,
    message: "Too many requests from this IP. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for API property endpoints during development
    if (req.path.includes('/api/products/properties')) {
      return true; // Don't rate limit this endpoint
    }
    return false;
  }
});

app.use(limiter);

/* ---------- Body Parser ---------- */
/* ---------- Body Parser ---------- */
app.use(express.json());

/* ---------- ⭐ ADD THIS HERE ---------- */
app.use("/uploads", express.static("uploads"));

/* ---------- Security Layer 3 : Mongo Senitise ---------- */

/* ---------- Security Layer 3 : Mongo Senitise ---------- */
app.use((req, res, next) => {
  if (req.body) {
    Object.assign(req.body, mongoSanitize(req.body));
  }

  if (req.query) {
    Object.assign(req.query, mongoSanitize(req.query));
  }

  if (req.params) {
    Object.assign(req.params, mongoSanitize(req.params));
  }

  next();
});


/* ---------- Security 4 Layer ---------- */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ---------- Routes ---------- */
app.use("/api/products", productsRoutes);
app.use("/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api", uploadRoutes);

export default app;
