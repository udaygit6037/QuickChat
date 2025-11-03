import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' // 👈 FIX: Import createRoot
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'

// Get the root element
const container = document.getElementById('root');

// Create the root object
const root = createRoot(container);

// Render the application
root.render(
  // Use StrictMode for development checks
  <StrictMode> 
    <BrowserRouter>
      {/* AuthProvider wraps the whole app to provide context */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// ❌ The original issue was that the createRoot call was incomplete:
// createRoot(document.getElementById('root')).render( /* ... JSX ... */ )