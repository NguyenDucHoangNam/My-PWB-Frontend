import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MasterLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-[rgb(var(--bg))] dark:text-[rgb(var(--text))] transition-colors">
      <header className="sticky top-0 z-50 shadow-md ">
        <Header />
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-[rgb(var(--border))] bg-gray-50 dark:bg-[rgb(var(--surface))] py-4">
        <Footer />
      </footer>
    </div>
  );
};

export default MasterLayout;
