import React, { useContext } from 'react' // 👈 FIX: Import useContext
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import './index.css'
import {Toaster} from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext.jsx'

const App = () => {
  // Use useContext, which is now imported
  const { authUser } = useContext(AuthContext) 
  
  return (
    <div className='bg-[url("./src/assets/bgImage.svg")] bg-cover bg-no-repeat bg-center min-h-screen'>
      <Toaster/>
      <Routes>
        {/* Protected Route: Home */}
        <Route 
          path='/' 
          element={authUser ? <HomePage /> : <Navigate to="/login"/>} 
        />
        
        {/* Public Route: Login/Signup (Redirect if authenticated) */}
        <Route 
          path='/login' 
          element={!authUser ? <LoginPage /> : <Navigate to="/" />} 
        />
        
        {/* Protected Route: Profile */}
        <Route 
          path='/profile' 
          element={authUser ? <ProfilePage /> : <Navigate to="/login"/>} 
        />
        
        {/* Catch-all 404 Route */}
        <Route 
          path='*' 
          element={<div className="text-center text-red-500 mt-10">404 - Page Not Found</div>} 
        />
      </Routes>
    </div>
  )
}

export default App