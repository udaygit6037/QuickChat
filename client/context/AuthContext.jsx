import { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client"; // CRITICAL FIX: Use client-side socket.io-client

// The server's main URL, correctly referencing the Vite environment variable
const backendUrl = import.meta.env.VITE_BACKEND_URL; 
axios.defaults.baseURL = backendUrl; // Set the base URL for Axios

export const AuthContext = createContext({
    // Default values for better IDE support
    authUser: null,
    onlineUsers: [],
    socket: null,
    login: () => {},
    logout: () => {},
    updateProfile: () => {},
});

export const AuthProvider = ({ children }) => { // 1. Use lowercase 'children'
    
    // 2. Corrected 'useState' destructuring
    const [authUser, setAuthUser] = useState(null); 
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // --- Utility Functions ---

    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return; 

        // CRITICAL FIX: Instantiate socket.io-client
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            },
            transports: ['websocket', 'polling'] 
        });

        setSocket(newSocket);
        
        // Listen for the online users update
        newSocket.on("getOnlineUsers", (userIds) => { 
            setOnlineUsers(userIds); // 3. Correctly receives 'userIds'
        });

        // Cleanup function for useEffect
        return () => {
            newSocket.close();
            setSocket(null); 
        };
    };

    const login = async (state, credential) => {
        try {
            // CRITICAL FIX: Use template literals correctly with backticks
            const { data } = await axios.post(`/api/auth/${state}`, credential);

            if (data.success) {
                setAuthUser(data.userData);
                localStorage.setItem("token", data.token);
                setToken(data.token);
                axios.defaults.headers.common["token"] = data.token;
                connectSocket(data.userData); 
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed.");
        }
    };

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        
        if (socket) {
            socket.disconnect();
        }
        
        delete axios.defaults.headers.common["token"];
        
        toast.success("Logged out successfully");
    };
    
    // 4. CRITICAL FIX: Re-insert the missing 'updateProfile' function
    const updateProfile = async (body) => { 
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            console.error("Profile update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update profile.");
        }
    };

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user); 
            } else {
                localStorage.removeItem("token");
                setToken(null);
                delete axios.defaults.headers.common["token"];
            }
        } catch (error) {
            console.error("Auth check failed:", error.message);
            localStorage.removeItem("token");
            setToken(null);
        }
    };

    // --- useEffect Hooks ---

    // Initial token setup and auth check
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth(); 
        }
    }, []); 
    
    // Socket connection management based on authUser state
    useEffect(() => {
        let cleanup;
        if (authUser) {
             cleanup = connectSocket(authUser);
        } else if (socket) {
            // Disconnect if authUser is cleared
            socket.close();
            setSocket(null);
        }
        return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]); 
    
    // Use useMemo to prevent unnecessary re-renders of consuming components
    const value = useMemo(() => ({
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile // 5. Now available and resolves the ReferenceError!
    }), [authUser, onlineUsers, socket, login, logout, updateProfile]);

    return (
        <AuthContext.Provider value={value}>
            <Toaster /> 
            {children} 
        </AuthContext.Provider>
    );
};