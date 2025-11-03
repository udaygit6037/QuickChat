import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: {
    // Stores the ObjectId of the User who sent the message
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model
    required: true,
  },
  receiverId: {
    // Stores the ObjectId of the User who receives the message
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000, // Set a reasonable limit for message length
  },
  image:{
    type: String,
  },
  seen: {
    // Tracks if the recipient has read the message
    type: Boolean,
    default: false,
  },
}, {
  // Automatically adds 'createdAt' and 'updatedAt' fields (timestamps)
  timestamps: true 
});

// Create the model and export it
const Message = mongoose.model('Message', MessageSchema);

export default Message;