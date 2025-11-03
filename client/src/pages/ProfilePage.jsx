import React, { useState, useContext } from 'react'; // 👈 FIX 1: Import useContext
import { Route, useNavigate } from 'react-router-dom';
import assets from '../assets/assets.js';
import { AuthContext } from '../../context/AuthContext.jsx'; // 👈 Import AuthContext

const ProfilePage = () => {
  // 👈 FIX 2: Pass AuthContext object to useContext and correct the spelling
  const { authUser, updateProfile } = useContext(AuthContext); 
  const navigate = useNavigate();

  // 👈 FIX 3: Safely initialize state using optional chaining/ternary operator
  // This prevents crashes if authUser is null while the app is loading.
  const [name, setName] = useState(authUser?.fullName || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [selectedImg, setSelectedImg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in before proceeding (safety)
    if (!authUser) {
      console.error("User not authenticated for profile update.");
      return;
    }

    if (!selectedImg) {
      // 1. Update without new profile picture
      await updateProfile({ fullName: name, bio });
      navigate('/');
      return;
    }
    
    // 2. Update WITH new profile picture (Base64 encoding)
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    
    reader.onload = async () => {
      const base64Image = reader.result;
      
      // Call the corrected updateProfile function
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate('/');
    };
    
    // Handle FileReader error
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      // Optional: Add a toast notification here
    };
  };

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      {/* Fallback while loading user data (optional) */}
      {!authUser && (
        <div className="text-white text-xl">Loading profile...</div>
      )}

      {authUser && ( // Only render the form once authUser is loaded
        <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
            <h3 className='text-lg font-semibold'>Profile Details</h3>

            <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
              <input
                onChange={(e) => setSelectedImg(e.target.files[0])}
                type="file"
                id='avatar'
                accept='.png, .jpg, .jpeg'
                hidden
              />
              <img
                // Use selectedImg or the current authUser profile URL as a fallback
                src={selectedImg ? URL.createObjectURL(selectedImg) : authUser.profile || assets.avatar_icon}
                alt="Profile Preview"
                className={`w-12 h-12 object-cover ${selectedImg || authUser.profile ? 'rounded-full' : ''}`}
              />
              Upload profile image
            </label>

            <label className="flex flex-col">
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border border-gray-500 rounded px-2 py-1 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
                placeholder='Your name'
              />
            </label>

            <label className="flex flex-col">
              Bio:
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-transparent border border-gray-500 rounded px-2 py-1 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
                placeholder='Enter bio'
                rows={4}
              />
            </label>

            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save & Continue
            </button>
          </form>
          <img src={authUser.profile || assets.logo_icon} alt="Logo" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;