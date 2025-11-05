import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 animate-fade-in">
        <h1 className="text-8xl font-bold bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">404</h1>
        <h2 className="text-3xl font-bold">الصفحة غير موجودة</h2>
        <p className="text-xl text-muted-foreground">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <Link to="/">
          <Button size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
