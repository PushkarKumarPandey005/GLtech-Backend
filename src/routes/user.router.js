import express from "express";
import {registerUser,verification,userLogin,adminLogin,logoutUser,forgetPassword,
  verifyOTP,changePassword,} from "../Controllers/user.controller.js";
import {getAdminProfile, updateAdminProfile, changeAdminPassword } from '../controllers/admin.controller.js'  

import isAuthenticated from "../middleware/middleware.user.isAuthenticated.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verification);

router.post("/login", adminLogin);          
router.post("/admin/login", adminLogin);  

router.delete("/logout", isAuthenticated, logoutUser);

router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyOTP);
router.put("/change-password", changePassword);

router.get("/admin/me", isAuthenticated, getAdminProfile);
router.put("/admin/me", isAuthenticated, updateAdminProfile);
router.put("/admin/change-password", isAuthenticated, changeAdminPassword);


export default router;
