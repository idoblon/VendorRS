import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./components/auth/LoginPage";
import { SignupPage } from "./components/auth/SignupPage";
import { SignupSuccessPage } from "./components/auth/SignupSuccessPage";
import { VendorDashboard } from "./components/dashboards/VendorDashboard";
import { CenterDashboard } from "./components/dashboards/CenterDashboard";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { PaymentDemo } from "./components/payment/PaymentDemo";
import { Toaster } from "./components/ui/Toaster";
import { User, UserRole } from "./types";

type AuthView = "login" | "signup" | "signup-success";

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>("login");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Check for saved token
        const token = localStorage.getItem("vrs_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Verify token with backend
        const response = await fetch("/api/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Ensure role is lowercase to match UserRole enum
          if (data.data.user && data.data.user.role) {
            data.data.user.role = data.data.user.role.toLowerCase();
          }
          setCurrentUser(data.data.user);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem("vrs_token");
          localStorage.removeItem("vrs_user");
        }
      } catch (error) {
        console.error("Token verification error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogin = (user: User, token: string) => {
    // Ensure role is lowercase to match UserRole enum
    if (user && user.role) {
      user.role = user.role.toLowerCase() as UserRole;
    }
    setCurrentUser(user);
    localStorage.setItem("vrs_user", JSON.stringify(user));
    localStorage.setItem("vrs_token", token);
    // Reset auth view to login after successful authentication
    setAuthView("login");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("vrs_user");
    localStorage.removeItem("vrs_token");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    const renderAuthView = () => {
      switch (authView) {
        case "login":
          return (
            <LoginPage
              onLogin={handleLogin}
              onShowSignup={() => setAuthView("signup")}
            />
          );
        case "signup":
          return (
            <SignupPage
              onShowLogin={() => setAuthView("login")}
              onSignupSuccess={() => setAuthView("signup-success")}
            />
          );
        case "signup-success":
          return <SignupSuccessPage onShowLogin={() => setAuthView("login")} />;
        default:
          return (
            <LoginPage
              onLogin={handleLogin}
              onShowSignup={() => setAuthView("signup")}
            />
          );
      }
    };

    return (
      <Router>
        <Routes>
          <Route path="/payment-demo" element={<PaymentDemo />} />
          <Route
            path="/*"
            element={
              <>
                {renderAuthView()}
                <Toaster />
              </>
            }
          />
        </Routes>
      </Router>
    );
  }

  const renderDashboard = () => {
    // Ensure role is lowercase to match UserRole enum
    const userRole = currentUser.role.toLowerCase() as UserRole;

    console.log("Current user role:", userRole);

    switch (userRole) {
      case UserRole.VENDOR:
        return <VendorDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.CENTER:
        return <CenterDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        console.log("No matching role found, defaulting to login page");
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/payment-demo" element={<PaymentDemo />} />
        <Route
          path="/*"
          element={
            <>
              {renderDashboard()}
              <Toaster />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
