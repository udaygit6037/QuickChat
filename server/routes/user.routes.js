import { protectRoute } from '../middlewares/auth.js'
import express from "express";
import {checkAuth, login, signup, updateProfile} from "../controllers/userController.js"


const userRouter = express.Router();

// Public Routes (No authentication required)
userRouter.post("/signup", signup);
userRouter.post("/login", login);

// Protected Routes (Authentication required)
// 💡 SUGGESTION: Use '/me' for endpoints that operate on the logged-in user resource
userRouter.put("/update-profile", protectRoute, updateProfile); // Works fine, but could be '/me'
userRouter.get("/check", protectRoute, checkAuth);           // Works fine, but could be '/me'

export default userRouter;