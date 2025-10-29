import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SimpleBlog from "@/pages/SimpleBlog";
import BlogPost from "@/pages/BlogPost";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";
import Head from "./components/Head";
import MarkdownPage from "@/pages/MarkdownPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleBlog} />
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
          <Head />
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
