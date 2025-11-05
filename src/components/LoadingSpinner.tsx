import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner = ({ 
  size = "md", 
  fullScreen = false,
  message 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-primary/20 absolute animate-spin`} 
             style={{ animationDuration: "1.5s" }} />
        
        {/* Inner spinning icon */}
        <Loader2 
          className={`${sizeClasses[size]} text-primary animate-spin`}
          strokeWidth={2.5}
        />
        
        {/* Pulsing glow effect */}
        <div className={`${sizeClasses[size]} rounded-full bg-primary/20 blur-xl absolute top-0 animate-pulse`} />
      </div>
      
      {message && (
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
