import { ThemeProvider } from "@/components/theme-provider"
import React, { ReactElement } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import RacesPage from "./pages/RacesPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import LoginPage from "./pages/LoginPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import { AppSidebar } from "./components/app-sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle"; // Import the ModeToggle component
import './App.css'

interface ProtectedRouteProps {
  element: ReactElement;
  requiredRole?: string;
}

// Protected route component with optional role check
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRole,
}) => {
  const { authenticated, user } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.type !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return element;
};

const AppContent: React.FC = () => {
  const { authenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // Force redirect to login
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        {authenticated && <AppSidebar handleLogout={handleLogout} />}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header with mobile sidebar trigger and theme toggle */}
          <div className="p-4 border-b border-grey flex items-center justify-between">
            {authenticated && (
              <SidebarTrigger className="lg:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SidebarTrigger>
            )}
            
            <h1 className="text-xl font-semibold">Racer Admin Dashboard</h1>
            
            <div className="flex items-center gap-2">
              {/* Add the theme toggle */}
              <ModeToggle />
              
              {!authenticated && (
                <Button asChild variant="outline">
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="p-4 sm:p-6">
            <Routes>
              <Route
                path="/login"
                element={authenticated ? <Navigate to="/" /> : <LoginPage />}
              />
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
              <Route
                path="*"
                element={
                  authenticated ? (
                    <Navigate to="/races" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;