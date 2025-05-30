// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ChatBot from './components/ChatBot';

// Pages
import Welcome from './pages/Welcome';
import OnboardingFlow1 from './pages/OnboardingFlow1';
import OnboardingFlow2 from './pages/OnboardingFlow2';
import OnboardingFlow3 from './pages/OnboardingFlow3';
import Login from './pages/Login';
import Signup from './pages/Signup'; // Import the Signup component
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Calendar from './pages/Calendar';
import Notifications from './pages/Notifications';
import Map from './pages/Map';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Define theme 
const theme = createTheme({
  palette: {
    primary: {
      main: '#F4A7A3',
      light: '#FAD4D4',
      dark: '#F08A8A',
    },
    secondary: {
      main: '#007AFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/onboarding-flow-1" element={<OnboardingFlow1 />} />
            <Route path="/onboarding-flow-2" element={<OnboardingFlow2 />} />
            <Route path="/onboarding-flow-3" element={<OnboardingFlow3 />} />
            
            {/* Protected routes - user must be authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/map" element={<Map />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Redirect root to welcome or home based on auth status */}
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            
            {/* Catch all for non-existent routes */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>

          {/* Add the ChatBot here, so it's available on all pages */}
          <ChatBot />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;