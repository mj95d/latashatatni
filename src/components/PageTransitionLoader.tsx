import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageTransitionLoader = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loader when route changes
    setLoading(true);

    // Hide loader after a short delay to ensure content is ready
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-fade-in">
      {/* Progress Bar */}
      <div className="h-1 bg-primary/20 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary via-primary-glow to-primary animate-progress"
          style={{
            animation: "progress 0.3s ease-in-out"
          }}
        />
      </div>
      
      {/* Subtle backdrop with spinner */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm px-6 py-4 rounded-full shadow-glow border-2 border-primary/20 flex items-center gap-3">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" 
               style={{ animationDuration: "1s" }} />
          <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
        </div>
        <span className="text-sm font-semibold text-foreground">جاري التحميل...</span>
      </div>
    </div>
  );
};

export default PageTransitionLoader;
