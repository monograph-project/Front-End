import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/themContext";
import Applayout from "./layout/AppLayout";
import AppSidebar from "./layout/AppSideBar";
import Sidebar from "./layout/Sidebar";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Unauthorized from "./pages/Unauthorized";
import WriteStory from "./pages/blog/WriteStory";
import ReaderLibrary from "./pages/blog/ReaderLibrary";
import TopicFeed from "./pages/blog/TopicFeed";
import StoryDetailPage from "./pages/blog/StoryDetailPage";
import Profile from "./pages/blog/Profile";
import Dashboard from "./pages/admin/Dashboard";
import Reports from "./pages/admin/Reports";
import Projects from "./pages/admin/Projects";
import Users from "./pages/admin/Users";
import Student from "./pages/admin/Students";
import Teacher from "./pages/admin/Teachers";
import Employee from "./pages/admin/Employee";
import Notification from "./pages/admin/Notification";
import Department from "./pages/admin/Departments";
import Blog from "./pages/admin/Blogs";
import BlogDetailPage from "./pages/admin/BlogDetailPage";
import Setting from "./pages/admin/Setting";
import StudentProjects from "./pages/student/Projects";
import StudentRepositories from "./pages/student/Repositories";
import StudentTasks from "./pages/student/Tasks";
import StudentContributors from "./pages/student/Contributors";
import StudentNotifications from "./pages/student/Notifications";
import StudentDashboard from "./pages/admin/Dashboard";
import Home from "./pages/blog/Home";
import UserProfile from "./pages/admin/Profile";
import NotificationDetail from "./pages/admin/NotificationDetail";
import ProjectWorkspace from "./pages/admin/ProjectWorkspace";
export default function App() {
  // Sidebar layout and responsiveness handled inside `Applayout` via SidebarContext
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Medium-style public surface — everyone can read/write stories here */}
          <Route
            path="/"
            element={
              <Applayout>
                <Sidebar />
              </Applayout>
            }
          >
            <Route index element={<Home />} />
            <Route path="write" element={<WriteStory />} />
            <Route path="library" element={<ReaderLibrary />} />
            <Route path="topic/:topic" element={<TopicFeed />} />
            <Route path="story/:id" element={<StoryDetailPage />} />
            <Route path="/writer/profile" element={<Profile />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Applayout>
                  <AppSidebar />
                </Applayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserProfile />} />
            <Route path="student" element={<Student />} />
            <Route path="teacher" element={<Teacher />} />
            <Route path="employee" element={<Employee />} />
            <Route path="notification" element={<Notification />} />
            <Route path="notification/:id" element={<NotificationDetail />} />
            <Route path="department" element={<Department />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectWorkspace />} />
            <Route path="blogs" element={<Blog />} />
            <Route path="blogs/:id" element={<BlogDetailPage />} />
            <Route path="setting" element={<Setting />} />
            <Route path="report" element={<Reports />} />
          </Route>

          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Applayout>
                  <AppSidebar />
                </Applayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Applayout>
                  <AppSidebar />
                </Applayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="projects" element={<StudentProjects />} />
            <Route path="repositories" element={<StudentRepositories />} />
            <Route path="tasks" element={<StudentTasks />} />
            <Route path="contributors" element={<StudentContributors />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <Applayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          <Route
            path="/dean"
            element={
              <ProtectedRoute allowedRoles={["dean"]}>
                <Applayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GooeyToaster position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}
