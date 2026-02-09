import express from 'express';
import cors from 'cors';
import productsRoutes from './routes/product.router.js';
import userRoutes from "./routes/user.router.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // <-- THIS FIXES PREFLIGHT
  }

  next();
});

app.use(express.json());

app.use("/api/products", productsRoutes);
app.use("/user", userRoutes);

export default app;
