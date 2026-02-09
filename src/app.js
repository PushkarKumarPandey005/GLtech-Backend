import express from 'express';
import productsRoutes from './routes/product.router.js';
import userRoutes from "./routes/user.router.js";

const app = express();

// ---- CORS (robust for preflight) ----
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
// -------------------------------------

app.use(express.json());

app.use("/api/products", productsRoutes);
app.use("/user", userRoutes);

export default app;
