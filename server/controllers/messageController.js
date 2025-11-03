import User from "../models/User.js";
import Message from "../models/Message.js";
import messageRouter from "../routes/messageRoutes.js";
import cloudinary from "../lib/cloudinary.js";
import {io,userSocketMap} from "../server.js"
// --- 1. Get Users for Sidebar (List of contacts + Unread Counts) ---
export const getUsersForSidebar = async (req, res) => {
    try {
        // Input Validation: Ensure the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        
        const userId = req.user._id;

        // Fetch all other users, excluding the current logged-in user, and remove the password field
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select('-password');

        const unseenMessageCounts = {};

        // Use Promise.all to concurrently count unseen messages for all users
        const promises = filteredUsers.map(async (user) => {
            // Count messages sent by 'user' to 'userId' that are unread
            const count = await Message.countDocuments({
                senderId: user._id,       // The user in the loop is the sender
                receiverId: userId,      // The logged-in user is the recipient
                seen: false             // Check for unread messages (using 'read' from your schema)
            });

            if (count > 0) {
                unseenMessageCounts[user._id] = count;
            }
        });

        await Promise.all(promises);

        res.status(200).json({ 
            success: true, 
            users: filteredUsers, 
            unseenMessageCounts 
        });

    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message); 
        res.status(500).json({ success: false, message: "Internal Server Error" }); 
    }
};

// --- 2. Get All Messages for Selected User and Mark them as Read ---
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        
        // Input Validation
        if (!req.user || !req.user._id) {
             return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const myId = req.user._id;

        // 1. Find all messages between the two users
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },       // Messages I sent
                { senderId: selectedUserId, receiverId: myId },       // Messages they sent
            ]
        })
        .sort({ createdAt: 1 }) // Order chronologically
        .populate("sender recipient", "fullname profile"); // Optional: Get user names/profiles for display

        // 2. Mark all *unseen* messages that *I received* from the *selected user* as read
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false }, // Filter
            { seen: true } // Update operation
        );
        
        res.status(200).json({ success: true, messages });

    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//3. Send message to selected user
export const sendMessage= async (req, res) => {
    try {
         const {text, image}= req.body
         const receiverId = req.params.id;
         const senderId= req.user._id;

         let imageUrl;
         if(image)
         {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl= uploadResponse.secure_url;
         }

        const newMessage = Message.create(
            {
                senderId,
                receiverId,
                text,
                image: imageUrl
            }
        )


        // Emit the new message to the receiver's socket
        const receiverSocketId=
        res.json({success: true, newMessage});
        if(receiverSocketId)
                {
                    io.to(receiverSocketId).emit("newMessage", newMessage)
                }

        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
    
}