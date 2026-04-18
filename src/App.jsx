import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Menu from "./components/Menu";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/themContext";
import Applayout from "./layout/AppLayout";
import AppSidebar from "./layout/AppSideBar";
import Sidebar from "./layout/Sidebar";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import Deals from "./pages/Deals";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import Projects from "./pages/Projects";
import ReaderLibrary from "./pages/ReaderLibrary";
import Signup from "./pages/Signup";
import StoryDetailPage from "./pages/StoryDetailPage";
import StudentManagement from "./pages/StudentManagement";
import TopicFeed from "./pages/TopicFeed";
import Unauthorized from "./pages/Unauthorized";
import WriteStory from "./pages/WriteStory";
import ProjectRepository from "./pages/ProjectRepository";
import Collaboration from "./pages/Collaboration";
import ProjectGroup from "./pages/ProjectGroup";
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
            <Route path="deals" element={<Deals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
            <Route path="students" element={<StudentManagement />} />
            <Route
              path="users"
              element={
                <PlaceholderPage
                  title="Users & roles"
                  description="Manage accounts and assign faculty roles (admin-only)."
                />
              }
            />
            <Route
              path="departments"
              element={
                <PlaceholderPage
                  title="Departments"
                  description="Organize departments and link staff and programs."
                />
              }
            />
            <Route
              path="roles"
              element={
                <PlaceholderPage
                  title="Permissions"
                  description="Configure role capabilities when your API is ready."
                />
              }
            />
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
            <Route path="deals" element={<Deals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
            <Route
              path="students"
              element={
                <PlaceholderPage
                  title="Assigned students"
                  description="Rosters and groups assigned by admin appear here."
                />
              }
            />
            <Route
              path="gradebook"
              element={
                <PlaceholderPage
                  title="Gradebook"
                  description="Grades and rubrics for your assigned groups."
                />
              }
            />
            <Route
              path="lessons"
              element={
                <PlaceholderPage
                  title="Lessons & materials"
                  description="Lesson plans tied to assigned groups."
                />
              }
            />
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
            <Route path="dashboard" element={<Dashboard />} />
            {/* <Route path="deals" element={<Deals />} /> */}
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<ProjectRepository />} />
            <Route path="deals" element={<ProjectGroup/>} />
            <Route
              path="courses"
              element={
                <PlaceholderPage
                  title="Courses"
                  description="Your enrolled courses and materials."
                />
              }
            />
            <Route
              path="grades"
              element={
                <PlaceholderPage
                  title="Grades"
                  description="Scores and feedback from instructors."
                />
              }
            />
            <Route
              path="assignments"
              element={
                <PlaceholderPage
                  title="Assignments"
                  description="Due work and submissions."
                />
              }
            />
            <Route
              path="schedule"
              element={
                <PlaceholderPage
                  title="Schedule"
                  description="Classes and milestones in one place."
                />
              }
            />
            <Route
              path="collaboration"
              element={
                <Collaboration />
              }
            />
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
            <Route path="deals" element={<Deals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
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
            <Route path="deals" element={<Deals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Menu />} />
            <Route path="projects" element={<Projects />} />
            <Route path="students" element={<StudentManagement />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GooeyToaster position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}
