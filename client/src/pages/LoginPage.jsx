import React, { useState } from 'react';
import assets from '../assets/assets';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState('signup'); // signup | login
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const {login}= useContext(AuthContext)
  // ... (inside the component)

// ...
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password || (currState === 'signup' && (!fullName || !bio))) {
            alert('Please fill all required fields.');
            return;
        }
        setIsDataSubmitted(true);
        // 🐛 CRITICAL FIX APPLIED HERE: Compare currState against the lowercase string 'signup'
        const authState = currState === 'signup' ? 'signup' : 'login';
        
        // Pass only required data: bio/fullName are only needed for signup
        const credentials = { 
            email, 
            password, 
            ...(authState === 'signup' && { fullName, bio }) // Spread if signing up
        };
        
        login(authState, credentials);
    };
// ...

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* Left */}
      <img src={assets.logo_big} alt="Logo" className='w-[min(30vw,250px)]' />

      {/* Right */}
      <form onSubmit={handleSubmit} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center capitalize'>
          {currState}
          <img src={assets.arrow_icon} alt="Arrow" />
        </h2>

        {currState === 'signup' && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className='p-2 border border-gray-500 rounded-md focus:outline-none'
            placeholder='Full Name'
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              placeholder='Email'
              required
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              placeholder='Password'
              required
            />
          </>
        )}

        {currState === 'signup' && !isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 ring-indigo-500'
            placeholder='Bio'
            required
          ></textarea>
        )}

        <button type='submit' className='py-3 bg-gradient-to-t from-purple-600 to-purple-400 text-white rounded-md cursor-pointer'>
          {currState === 'signup' ? (isDataSubmitted ? 'Go to Login' : 'Sign Up') : 'Login'}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" id="terms" />
          <label htmlFor="terms">Agree to the terms of use & privacy policy.</label>
        </div>

        <p className="text-sm text-center">
          {currState === 'signup' ? "Already have an account?" : "Don't have an account?"}
          <span
            className="text-purple-400 cursor-pointer ml-1 underline"
            onClick={() => {
              setCurrState(currState === 'signup' ? 'login' : 'signup');
              setIsDataSubmitted(false);
              setFullName('');
              setEmail('');
              setPassword('');
              setBio('');
            }}
          >
            {currState === 'signup' ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;