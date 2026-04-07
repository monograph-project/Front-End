import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppHeader from "./AppHeader";
import Sidebar from "./AppSideBar";

export default function Applayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setCollapsed((c) => !c);
    }
  };

  return (
    <>
      {/* Outer shell — the grey app background with padding */}
      <div className="w-full h-screen bg-app dark:bg-dark-app flex">
        {/* Mobile menu overlay */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Unified card */}
        <div className="flex-1 flex rounded-2xl overflow-hidden shadow-badge">
          {/* Sidebar - hidden on mobile when closed */}
          <div
            className={`
            ${isMobile ? "fixed z-50" : "relative"} 
            ${isMobile && !mobileMenuOpen ? "hidden" : ""}
            ${isMobile ? "h-full" : ""}
          `}
          >
            <Sidebar
              collapsed={isMobile ? false : collapsed}
              onToggle={handleSidebarToggle}
              isMobile={isMobile}
              mobileMenuOpen={mobileMenuOpen}
              onCloseMobileMenu={() => setMobileMenuOpen(false)}
            />
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-shell dark:bg-dark-shell min-w-0">
            <AppHeader onMenuToggle={() => setMobileMenuOpen(true)} />

            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
