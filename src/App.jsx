import { GooeyToaster } from "goey-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Menu from "./components/Menu";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/themContext";
import "./i18n";
import Applayout from "./layout/AppLayout";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import Deals from "./pages/Deals";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Signup from "./pages/Signup";
import Stories from "./pages/Stories";
import Unauthorized from "./pages/Unauthorized";

function AuthWrapper({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/read" element={<Stories />} />
          <Route path="/stories/write" element={<Stories />} />

          {/* Role-based protected routes */}
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
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
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

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GooeyToaster position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Applayout />}>
            <Route index element={<Dashboard />} />
            <Route path="deals" element={<Deals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
      <GooeyToaster position="top-right" />
    </ThemeProvider>
  );
}
