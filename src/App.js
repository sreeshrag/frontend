import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";

import { store } from "./store";
import theme from "./theme";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SuperAdminPanel from "./pages/dashboard/SuperAdminPanel";
import CompanyPanel from "./pages/dashboard/CompanyPanel";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { CategoryProvider } from "./contexts/CategoryContext";

// Make store available globally for API interceptors
window.__REDUX_STORE__ = store;

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <ProjectProvider>
            <CategoryProvider>
              <ProgressProvider>
                <Router>
                  <div className="App">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/auth/login" element={<Login />} />
                      <Route path="/auth/register" element={<Register />} />

                      {/* Protected Routes */}
                      <Route
                        path="/dashboard/super-admin/*"
                        element={
                          <ProtectedRoute roles={["super_admin"]}>
                            <SuperAdminPanel />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/dashboard/company/*"
                        element={
                          <ProtectedRoute roles={["company_admin", "staff"]}>
                            <CompanyPanel />
                          </ProtectedRoute>
                        }
                      />

                      {/* Default Redirects */}
                      <Route
                        path="/"
                        element={<Navigate to="/auth/login" replace />}
                      />
                      <Route
                        path="*"
                        element={<Navigate to="/auth/login" replace />}
                      />
                    </Routes>
                  </div>
                </Router>
              </ProgressProvider>
            </CategoryProvider>
          </ProjectProvider>
        </AuthProvider>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1F2937",
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            },
          }}
        />
      </ChakraProvider>
    </Provider>
  );
}

export default App;
