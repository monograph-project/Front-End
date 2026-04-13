// Removed unused AppContent and AuthWrapper

import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/themContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Applayout from "./layout/AppLayout";
import Projects from "./pages/Projects";
import Dashboard from "./pages/Dashboard";
import Deals from "./pages/Deals";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import Menu from "./components/Menu";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";
import StudentManagement from "./pages/StudentManagement";
export default function App() {
  const { user, isAuthenticated } = useAuth();
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={`/${user.role}/dashboard`} replace />
              ) : (
                <Login />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Applayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="deals" element={<Deals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
            <Route path="students" element={<StudentManagement />} />
          </Route>
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Applayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="deals" element={<Deals />} />
           
          </Route>
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Applayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="deals" element={<Deals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GooeyToaster position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}
