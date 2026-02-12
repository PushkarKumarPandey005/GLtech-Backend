import express from 'express';
import helmet from 'helmet';
import rateLimit from "express-rate-limit";
import mongoSanitize from "mongo-sanitize";

import productsRoutes from './routes/product.router.js';
import userRoutes from "./routes/user.router.js";

const app = express();

/* ---------- SECURITY LAYER 1 : HELMET ---------- */
app.use(helmet());

/* ---------- SECURITY LAYER 2 : RATE LIMIT ---------- */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/* ---------- BODY PARSER ---------- */
app.use(express.json());

/* ---------- SECURITY LAYER 3 : MONGO SANITIZE (Express v5 SAFE) ---------- */
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

/* ---------- SECURITY LAYER 4 : CORS ---------- */
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

/* ---------- ROUTES ---------- */
app.use("/api/products", productsRoutes);
app.use("/user", userRoutes);

export default app;
