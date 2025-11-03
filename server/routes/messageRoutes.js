import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/messageController.js";
const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar)
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.post("/send/:is", protectRoute, sendMessage)
export default messageRouter
