import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.MONGO_URI,
};

export default config;
