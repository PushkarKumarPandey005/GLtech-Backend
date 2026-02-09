import express from 'express'
import cors from 'cors'
import productsRoutes from './routes/product.router.js'
import userRoutes from "./routes/user.router.js";




const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

 app.use("/api/products",productsRoutes);
 app.use("/user", userRoutes);

 
export default app