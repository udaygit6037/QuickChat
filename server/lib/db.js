import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Use the Atlas URI from the environment variable
        await mongoose.connect(process.env.MONGODB_URI, { 
            dbName: 'chat-app' // 👈 FIX: Explicitly set the database name here
        }); 

        console.log("MongoDB connected successfully to database: chat-app");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); 
    }
};