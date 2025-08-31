import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./components/auth/LoginPage";
import SignupFlow from "./components/auth/SignupFlow";
import { VendorDashboard } from "./components/dashboards/VendorDashboard";
import CenterDashboard from "./components/dashboards/CenterDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import { PaymentDemo } from "./components/payment/PaymentDemo";
import { Toaster } from "./components/ui/Toaster";
import { User } from "./types/index";
import SignupSuccessPage from "./components/auth/SignupSuccessPage";
import axiosInstance from "./utils/axios";

// Define UserRole type locally based on the User interface
type UserRole = User["role"]; // This will be "admin" | "vendor" | "user"

type AuthView = "login" | "signup" | "signup-success";

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>("login");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem("vrs_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axiosInstance.get("/api/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.data;

        if (response.status === 200 && data.success) {
          // Fix: Access user directly from data, not data.data.user
          const user = data.user;
          if (user?.role) {
            user.role = user.role.toLowerCase() as UserRole;
          }
          setCurrentUser(user);
        } else {
          localStorage.removeItem("vrs_token");
          localStorage.removeItem("vrs_user");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        // Clear invalid tokens
        localStorage.removeItem("vrs_token");
        localStorage.removeItem("vrs_user");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogin = (user: User, token: string) => {
    // Map backend roles to frontend roles
    if (user?.role) {
      const roleMapping: { [key: string]: UserRole } = {
        ADMIN: "admin",
        VENDOR: "vendor",
        CENTER: "user", // Map CENTER to 'user' for CenterDashboard
        admin: "admin",
        vendor: "vendor",
        center: "user", // Handle lowercase roles as well
      };

      user.role =
        roleMapping[user.role] ||
        roleMapping[user.role.toUpperCase()] ||
        (user.role.toLowerCase() as UserRole);
    }
    setCurrentUser(user);
    localStorage.setItem("vrs_user", JSON.stringify(user));
    localStorage.setItem("vrs_token", token);
    setAuthView("login");
  };

  const handleLogout = () => {
    console.log("App handleLogout called - clearing user state");

    // Clear React state
    setCurrentUser(null);

    // Clear localStorage (using correct token keys)
    localStorage.removeItem("vrs_user");
    localStorage.removeItem("vrs_token"); // This is the token the app uses

    // Reset auth view to login
    setAuthView("login");

    console.log("Logout complete - user should see login page");
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
            <SignupFlow
              onShowLogin={() => setAuthView("login")}
              onSignupSuccess={() => setAuthView("signup-success")}
            />
          );
        case "signup-success":
          return <SignupSuccessPage onContinue={() => setAuthView("login")} />;
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
    // Type-safe role access
    const userRole = currentUser.role;

    switch (userRole) {
      case "admin":
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      case "vendor":
        return <VendorDashboard user={currentUser} onLogout={handleLogout} />;
      case "user": // Assuming 'user' represents center role
        return <CenterDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        // Handle any unmapped roles by logging and redirecting to login
        console.error("Invalid user role:", userRole);
        handleLogout();
        return <LoginPage onLogin={handleLogin} onShowSignup={() => setAuthView("signup")} />;
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
