import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/Language";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="404 - Page Not Found" />
      <Header />

      <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
        <div className="max-w-md w-full text-center">
          {/* Animated 404 Graphic */}
          <div className="relative mb-8">
            <motion.h1
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0, 0.71, 0.2, 1.01]
              }}
              className="text-[12rem] font-black leading-none tracking-tighter text-foreground/5 select-none"
            >
              404
            </motion.h1>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-2xl"
              >
                <Search className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2">{t('PostNotFound') || 'Lost in Space?'}</h2>
                <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">
                  {t('PostNotFoundText') || "The page you're looking for doesn't exist or has been moved."}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" className="gap-2 group shadow-lg shadow-primary/20" asChild>
              <a href="/">
                <Home className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                {t('BacktoHome') || 'Take me Home'}
              </a>
            </Button>

            <Button size="lg" variant="outline" className="gap-2" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              {t('back') || 'Go Back'}
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

