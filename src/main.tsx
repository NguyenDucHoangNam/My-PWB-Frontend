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
import { CosmicToastProvider } from "./component/toast/CosmicToastProvider";
import { AiExplainableContent } from "./component/ai";

function AppWrapper() {
  const [loading, setLoading] = useState(
    () => !sessionStorage.getItem("landingSeen")
  );

  useEffect(() => {
    if (loading) {
      sessionStorage.setItem("landingSeen", "true");
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <ThemeProvider>
      <AuthProvider>
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
                <LoadingPage duration={2000} />
              </motion.div>
            ) : (
              <motion.div
                key="router"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <AiExplainableContent>
                  <RouterCustom />
                </AiExplainableContent>
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
    <CosmicToastProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </CosmicToastProvider>
  );
}

export default App;

createRoot(document.getElementById("root")!).render(<App />);
