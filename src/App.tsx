import React, { useEffect, useState, ReactElement } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Button, Box } from "@mui/material"; // Import Box
import axios from "axios";
import UsersPage from "./pages/UsersPage";
import RacesPage from "./pages/RacesPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import LoginPage from "./pages/LoginPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import "./App.css";
import { AppSidebar } from "./components/app-sidebar";

interface ProtectedRouteProps {
  element: ReactElement;
  requiredRole?: string;
}

// Get user from localStorage
const getUser = () => {
  const userString = localStorage.getItem("user");
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
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRole,
}) => {
  const token = localStorage.getItem("token");
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    } else if (requiredRole && (!user || user.type !== requiredRole)) {
      navigate("/", { replace: true });
    }
  }, [token, user, requiredRole, navigate]);

  return token ? element : null;
};

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // Check authentication status on mount
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setAuthenticated(true);
      const user = getUser();
      if (user && user.type) {
        setUserRole(user.type);
      }
    }
  }, []);

  const handleLogout = (): void => {
    // Clear token and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setAuthenticated(false);
    setUserRole("");
    // Navigate to login page
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="flex min-h-screen w-full"> {/* Apply flex to the main container */}
        {authenticated && (
          <aside className="w-64 flex-shrink-0"> {/* Fixed width for sidebar, don't shrink */}
            <AppSidebar handleLogout={handleLogout} />
          </aside>
        )}

        <main className="flex-1 overflow-y-auto"> {/* Take remaining space, allow vertical scroll */}
          {!authenticated && (
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Racer Admin Dashboard
                </Typography>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
              </Toolbar>
            </AppBar>
          )}
          <Container sx={{ mt: 4 }}>
            <Routes>
              {/* Public route */}
              <Route
                path="/login"
                element={authenticated ? <Navigate to="/" /> : <LoginPage />}
              />

              {/* Basic protected routes accessible to all authenticated users */}
              <Route
                path="/"
                element={<ProtectedRoute element={<UsersPage />} />}
              />
              <Route
                path="/races"
                element={<ProtectedRoute element={<RacesPage />} />}
              />
              <Route
                path="/live-tracking"
                element={<ProtectedRoute element={<LiveTrackingPage />} />}
              />
              <Route
                path="/leader-Board"
                element={<ProtectedRoute element={<LeaderboardPage />} />}
              />

              {/* Admin-only routes */}
              {/* Example: <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboardPage />} requiredRole="admin" />} /> */}

              {/* Redirect any unknown routes to login or dashboard based on auth state */}
              <Route
                path="*"
                element={
                  authenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </Container>
        </main>
      </div>
    </Router>
  );
};

export default App;