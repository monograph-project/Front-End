import { BrowserRouter, Route, Routes } from "react-router";
import Applayout from "./layout/AppLayout";
import { ThemeProvider } from "./context/themContext";
import Dashboard from "./pages/Dashboard";
import Deals from "./pages/Deals";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Projects from "./pages/Projects";
import "./i18n";
import Login from "./pages/Login";
import { GooeyToaster } from "goey-toast";
import Menu from "./components/Menu";

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
        </Routes>
      </BrowserRouter>
      <GooeyToaster position="top-right" />
    </ThemeProvider>
  );
}
