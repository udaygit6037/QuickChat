import { generateToken } from '../lib/utils.js';
import User from '../models/User.js'; // The updated model
import cloudinary from '../lib/cloudinary.js';
import bcrypt from 'bcryptjs'; // Keep this for clarity, though technically only needed in the model now

// --- Signup New User ---
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    
    try {
        // 1. Input Validation
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "Missing required details: Full Name, Email, Password, or Bio." });
        }
        
        // 2. Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({ success: false, message: "Account already exists with this email." }); 
        }

        // 🛑 REMOVED: Hashing logic (const salt = await bcrypt.genSalt(10); const hashedPassword = await bcrypt.hash(password, salt);)

        // 3. Create new user (The model's 'pre-save' hook handles hashing automatically)
        const newUser = await User.create({
            fullName, 
            email, 
            password, // Save the plain text password, the model will hash it
            bio
        });

        // 4. Generate token
        const token = generateToken(newUser._id);
        
        res.status(201).json({ 
            success: true, 
            userData: newUser.toObject({ getters: true, virtuals: false }),
            token, 
            message: "Account created successfully"
        });
        
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error during signup." });
    }
};

// --- Controller to Login User ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user
        const userData = await User.findOne({ email });

        // 2. Check if user exists (User not found)
        if (!userData) {
            return res.status(401).json({ success: false, message: "Invalid Credentials (User not found)." });
        }
        
        // 3. Compare password using the method defined in the Mongoose model
        // This is cleaner and ensures the logic is tied to the User object.
        const isPasswordCorrect = await userData.matchPassword(password); 

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid Credentials (Incorrect password)." });
        }
        
        // 4. Generate token
        const token = generateToken(userData._id);
        
        res.status(200).json({ 
            success: true, 
            userData: userData.toObject({ getters: true, virtuals: false }), 
            token, 
            message: "Login Successful"
        });
        
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error during login." });
    }
};

// ... (checkAuth and updateProfile controllers remain unchanged)
// authentication function
export const checkAuth =(req, res)=>{
    res.json({success: true, user: req.user});
}

// controller to update user profile details
export const updateProfile = async (req,res)=>{
    try {
         const {profilePic, bio, fullName}= req.body;
         const userID = req.user._id
         let updatedUser;
         if(!profilePic)
         {
            updatedUser = await User.findByIdAndUpdate(userID,{bio,fullName},{new: true});
            
         }
         else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate({profilePic: upload.secure_url, bio, fullName },{ new: true})
         }

         res.json ({success: true, user:updatedUser})
    } catch (error) {
         res.json({success: false, message: error.message})
    }
}