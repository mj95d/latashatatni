import { Store, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 gradient-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-80 h-80 bg-primary-foreground rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm hover:scale-110 transition-smooth">
            <Store className="w-12 h-12 text-primary-foreground" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
            هل أنت صاحب متجر؟
            <br />
            <span className="text-3xl md:text-5xl">انضم لمنصة لا تشتتني الآن</span>
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-primary-foreground/95 max-w-3xl mx-auto leading-relaxed">
            احصل على عملاء جدد من منطقتك. أضف متجرك ومنتجاتك وعروضك الحصرية وابدأ بزيادة مبيعاتك اليوم
          </p>

          {/* Features List */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-primary-foreground/95 pt-4">
            <div className="space-y-3 p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-smooth">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-bold text-xl">وصول مباشر للعملاء</h3>
              <p className="text-base text-primary-foreground/85 leading-relaxed">
                اعرض متجرك للعملاء في منطقتك مباشرة
              </p>
            </div>
            <div className="space-y-3 p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-smooth">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold text-xl">لوحة تحكم احترافية</h3>
              <p className="text-base text-primary-foreground/85 leading-relaxed">
                أدر متجرك ومنتجاتك بسهولة
              </p>
            </div>
            <div className="space-y-3 p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-smooth">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="font-bold text-xl">زيادة المبيعات</h3>
              <p className="text-base text-primary-foreground/85 leading-relaxed">
                حقق المزيد من المبيعات عبر المنصة
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
            <Button
              size="xl"
              onClick={() => navigate("/auth")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/95 shadow-glow hover:shadow-xl hover:scale-105 transition-smooth group text-lg px-12"
            >
              سجل متجرك مجاناً
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-smooth" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate("/plans")}
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/15 text-lg px-12 hover:scale-105 transition-smooth"
            >
              تعرف على المزايا
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-base text-primary-foreground/80 pt-6 font-medium">
            ✨ انضم لأكثر من 500+ متجر سعودي على المنصة
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
