import SidebarAdmin from "./SidebarAdmin";
import NavbarAdmin from "./NavbarAdmin";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../../component/useTheme";
import AnimatedBackgroundAdmin from "../../../component/background/AnimatedBackdroundAdmin";
import { NotificationProvider } from "../../../contexts/NotificationContext";

export default function AdminLayout() {
  const { isDark } = useTheme();

  return (
    <NotificationProvider>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background nằm dưới tất cả */}
        <div className="absolute inset-0 -z-10">
          <AnimatedBackgroundAdmin isDark={isDark} />
        </div>

        {/* Navbar cố định */}
        <NavbarAdmin />

        {/* Sidebar cố định */}
        <SidebarAdmin />

        {/* Nội dung chính */}
        <main className="ml-64 pt-14 p-6 transition-all duration-500 relative z-10 bg-transparent">
          <Outlet />
        </main>
      </div>
    </NotificationProvider>
  );
}
