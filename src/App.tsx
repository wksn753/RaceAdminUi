import React, { useEffect, useState, ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Button, Box } from "@mui/material";
import axios from "axios";
import UsersPage from "./pages/UsersPage";
import RacesPage from "./pages/RacesPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import LoginPage from "./pages/LoginPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import "./App.css";


interface ProtectedRouteProps {
  element: ReactElement;
  requiredRole?: string;
}

// Get user from localStorage
const getUser = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Protected route component with optional role check
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = getUser();
  
  // Redirect to login if no token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If requiredRole is specified, check if user has that role
  if (requiredRole && (!user || user.type !== requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');
  
  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    const user = getUser();
    
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthenticated(true);
      
      if (user && user.type) {
        setUserRole(user.type);
      }
    }
  }, []);
  
  const handleLogout = (): void => {
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setAuthenticated(false);
    setUserRole('');
    // Force page reload to reset any app state
    window.location.href = '/login';
  };

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Racer Admin Dashboard
          </Typography>
          
          {authenticated && (
            <>
              {/* All users can see Users page */}
              <Button color="inherit" component={Link} to="/">
                Users
              </Button>
              
              {/* All users can see Races page */}
              <Button color="inherit" component={Link} to="/races">
                Races
              </Button>
              
              {/* All users can see Live Tracking page */}
              <Button color="inherit" component={Link} to="/live-tracking">
                Live Tracking
              </Button>

              {/* All users can see Leader Board*/}
              <Button color="inherit" component={Link} to="/leader-Board">
                Leader Board
              </Button>

              {/* Admin-specific navigation items could go here */}
              {isAdmin && (
                <Button color="inherit" component={Link} to="/admin-dashboard">
                  Admin Dashboard
                </Button>
              )}
              
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          
          {!authenticated && (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={authenticated ? <Navigate to="/" /> : <LoginPage />} />
          
          {/* Basic protected routes accessible to all authenticated users */}
          <Route path="/" element={<ProtectedRoute element={<UsersPage />} />} />
          <Route path="/races" element={<ProtectedRoute element={<RacesPage />} />} />
          <Route path="/live-tracking" element={<ProtectedRoute element={<LiveTrackingPage />} />} />
          <Route path="/leader-Board" element={<ProtectedRoute element={<LeaderboardPage />} />} />
          

          {/* Admin-only routes */}
          {/* Example: <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboardPage />} requiredRole="admin" />} /> */}
          
          {/* Redirect any unknown routes to login or dashboard based on auth state */}
          <Route path="*" element={
            authenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;