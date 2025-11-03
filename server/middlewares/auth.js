import User from "../models/User.js";
import jwt from "jsonwebtoken";

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        // 1. Get the token (Standard practice is to look in the Authorization header)
        // If the client sends it in a custom 'token' header, this is correct:
        const token = req.headers.token; 
        
        // --- CRITICAL FIXES START HERE ---
        
        // 2. Check for Token Presence
        if (!token) {
            // 401 is the standard status code for missing authentication
            return res.status(401).json({ success: false, message: "Access Denied: No token provided." });
        }
        
        // 3. Verify the Token
        // This will throw an error if the token is invalid, expired, or tampered with.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Find the User
        // The token payload should be consistent with how you generate it (e.g., using '_id').
        // Assuming your token payload key is 'userId' (from your existing code)
        const user = await User.findById(decoded._id).select("-password"); // ⚠️ Note: Corrected to decoded._id, as tokens usually store '_id'

        // 5. Check if User Exists
        if (!user) {
            // Use 401 if the token points to a user that no longer exists
            return res.status(401).json({ success: false, message: "Access Denied: Invalid token or user not found." });
        }

        // 6. Attach User to Request and proceed
        req.user = user;
        next();
        
    } catch (error) {
        // --- CRITICAL FIX: Proper error handling for JWT failures ---
        
        console.error("JWT Verification Error:", error.message);
        
        // Handle specific JWT errors (e.g., expired token, invalid signature)
        // JWT errors should always result in a 401 status.
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized: Invalid or expired token." 
        });
    }
};