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
import { ImageModalProvider } from "@/contexts/ImageModal";

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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ImageModalProvider>
            <SEO />
            <TooltipProvider>
              <Toaster />
              <SwipeableRouter>
                <AppRoutes />
              </SwipeableRouter>
            </TooltipProvider>
          </ImageModalProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
export default App;

