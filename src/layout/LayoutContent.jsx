import { Outlet } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
function LayoutContent({ children }) {
  const {
    isMobile,
    mobileMenuOpen,
    collapsed,
    handleSidebarToggle,
    setMobileMenuOpen,
  } = useSidebar();
  return (
    <div className="w-full max-w-387 mx-auto h-screen flex">
      {/* Mobile menu overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Unified card */}
      <div className="flex-1 flex  overflow-hidden shadow-badge">
        {/* Sidebar - hidden on mobile when closed */}
        <div
          className={`
            ${isMobile ? "fixed z-50" : "relative"} 
            ${isMobile && !mobileMenuOpen ? "hidden" : ""}
            ${isMobile ? "h-full" : ""}
          `}
        >
          {children}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AppHeader
            collapsed={collapsed}
            isMobile={isMobile}
            handleSidebarToggle={handleSidebarToggle}
            onMenuToggle={() => setMobileMenuOpen(true)}
          />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayoutContent;
