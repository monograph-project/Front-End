import { SidebarProvider } from "../context/SidebarContext";
import LayoutContent from "./LayoutContent";
import AppSidebar from "./AppSideBar";

export default function Applayout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
