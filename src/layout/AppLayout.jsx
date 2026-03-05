import { useState } from "react";
import Sidebar from "./AppSideBar";
import AppHeader from "./AppHeader";
import ActionHeader from "./ActionHeader";
import { Outlet } from "react-router";

export default function Applayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      {/* Outer shell — the grey app background with padding */}
      <div className=" w-full h-screen bg-app  dark:bg-dark-app flex ">
        {/* Unified card */}
        <div className=" flex-1 flex rounded-2xl overflow-hidden  shadow-badge">
          {/* Sidebar */}
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />

          {/* Main area */}
          <div className=" flex-1 flex flex-col overflow-hidden bg-shell dark:bg-dark-shell">
            <AppHeader />
            <ActionHeader />
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
