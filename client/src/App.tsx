import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/Theme";
import { LanguageProvider } from "@/contexts/Language";
import Blog from "@/pages/blog/Blog";
import BlogPost from "@/pages/blog/BlogPost";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import SEO from "@/components/layout/SEO";
import MarkdownPage from "@/pages/MarkdownPage";
import SwipeableRouter from "@/components/layout/Router";
import Loader from "@/components/common/Loader";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Blog} />
      <Route path="/post/:id" component={BlogPost} />
      <Route path="/about" component={About} />
      <Route path="/page/:slug" component={MarkdownPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loading, setLoading] = useState(() => {
    // Check if user has already seen the loader in this session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("hasSeenLoader");
    }
    return true;
  });

  useEffect(() => {
    if (!loading) return;

    // Artificial delay to show the creative loader
    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("hasSeenLoader", "true");
    }, 2800);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SEO />
          <TooltipProvider>
            <Toaster />
            <AnimatePresence mode="wait">
              {loading ? (
                <Loader key="loader" />
              ) : (
                <SwipeableRouter key="router">
                  <AppRoutes />
                </SwipeableRouter>
              )}
            </AnimatePresence>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

