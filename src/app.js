import express from 'express';
import cors from 'cors';
import productsRoutes from './routes/product.router.js';
import userRoutes from "./routes/user.router.js";

const app = express();

// Allowed origins: local + production (Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // set this on Render
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/products", productsRoutes);
app.use("/user", userRoutes);

export default app;