import mongoose from "mongoose";
import bcrypt from 'bcryptjs'; // 👈 Needed for the pre-save hook

const UserSchema = new mongoose.Schema({
    // ... (email, fullName, profile, bio fields are unchanged)
    email: {
        type: String,
        required: true,
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    profile: {
        type: String,
        default: "", 
    },
    bio: {
        type: String,
        default: "",
        maxlength: 500
    },
    // ... (rest of the schema options)
}, {
    timestamps: true
});

// 1. Mongoose Pre-Save Hook for Hashing (Guarantees hashing on create/update)
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 2. Add an Instance Method for Password Comparison (CLEANER Login Logic)
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;