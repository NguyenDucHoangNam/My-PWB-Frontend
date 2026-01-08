import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import RouterCustom from "./router";
import { ThemeProvider } from "./component/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ClickSpark from "./component/ClickSpark";
import ScrollToTop from "./component/ScrollToTop";
import LoadingPage from "./component/loading/LoadingPage";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MusicPrompt from "./component/MusicPrompt";
import { Toaster } from "react-hot-toast";
function AppWrapper() {

  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem("landingSeen");
  });

  useEffect(() => {
    if (loading) {
      sessionStorage.setItem("landingSeen", "true");
      const timer = setTimeout(() => setLoading(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <MusicPrompt />
        <ClickSpark>
          <AnimatePresence mode="sync">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <LoadingPage />
              </motion.div>
            ) : (
              <motion.div
                key="router"
                initial={{ opacity: 0}}
                animate={{ opacity: 1}}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: 0 }}
              >
                <RouterCustom />
              </motion.div>
            )}
          </AnimatePresence>
          <ScrollToTop />
        </ClickSpark>
      </AuthProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;

createRoot(document.getElementById("root")!).render(<App />);
