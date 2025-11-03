import express from 'express';
import "dotenv/config"
import cors from 'cors'
import http from 'http'
import {connectDB} from './lib/db.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server} from 'socket.io';


// create experss app and HTTP
const app = express(); 
const server= http.createServer(app)

// inirtialize socket.io server
export const io = new Server(server,{
    cors:{origin:"*"}
})

// Store onlin Users
export const userSocketMap ={};// {userId: socketid}

// 🐛 FIX 1: The callback function MUST receive the socket object (conventionally named 'socket')
io.on("connection", (socket)=>{ 
    // 🐛 FIX 2: Correctly reference the socket object using the received 'socket' variable
    const userId = socket.handshake.query.userId;
    
    console.log("User Connected", userId);
    
    if(userId)
        // 🐛 FIX 3: Store the correct socket ID
        userSocketMap[userId]= socket.id; 
    
    // Notify everyone about the updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle user disconnect
    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        
        // 🐛 FIX 4: Only delete the user if they were successfully mapped
        if(userId) {
            delete userSocketMap[userId];
        }
        
        // 🐛 FIX 5: Ensure the correct event name is emitted (consistent with client: "getOnlineUsers")
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

//middlesware
app.use(express.json({limit: "4mb"}));
app.use(cors());

// routes setup
app.use("/api/status",(req,res)=> res.send("Server is live"));

app.use("/api/auth",userRouter)
app.use("/api/message",messageRouter)

// ⚠️ IMPORTANT: Run connectDB before starting the server
await connectDB();

const PORT =process.env.PORT || 5000;
server.listen(PORT, ()=> console.log("Server is listening on port:"+PORT));