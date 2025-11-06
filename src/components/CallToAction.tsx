import { Store, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 gradient-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-60 sm:w-80 h-60 sm:h-80 bg-primary-foreground rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-primary-foreground rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 md:space-y-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl bg-primary-foreground/20 backdrop-blur-sm hover:scale-110 transition-smooth">
            <Store className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight px-2">
            هل أنت صاحب متجر؟
            <br />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-5xl">انضم لمنصة لا تشتتني الآن</span>
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/95 max-w-3xl mx-auto leading-relaxed px-4">
            احصل على عملاء جدد من منطقتك. أضف متجرك ومنتجاتك وعروضك الحصرية وابدأ بزيادة مبيعاتك اليوم
          </p>

          {/* Features List */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto text-primary-foreground/95 pt-2 sm:pt-3 md:pt-4">
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-smooth">
              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🎯</div>
              <h3 className="font-bold text-base sm:text-lg md:text-xl">وصول مباشر للعملاء</h3>
              <p className="text-xs sm:text-sm md:text-base text-primary-foreground/85 leading-relaxed">
                اعرض متجرك للعملاء في منطقتك مباشرة
              </p>
            </div>
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-smooth">
              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">📊</div>
              <h3 className="font-bold text-base sm:text-lg md:text-xl">لوحة تحكم احترافية</h3>
              <p className="text-xs sm:text-sm md:text-base text-primary-foreground/85 leading-relaxed">
                أدر متجرك ومنتجاتك بسهولة
              </p>
            </div>
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-smooth sm:col-span-2 md:col-span-1">
              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">💰</div>
              <h3 className="font-bold text-base sm:text-lg md:text-xl">زيادة المبيعات</h3>
              <p className="text-xs sm:text-sm md:text-base text-primary-foreground/85 leading-relaxed">
                حقق المزيد من المبيعات عبر المنصة
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center items-center pt-4 sm:pt-5 md:pt-6">
            <Button
              size="xl"
              onClick={() => navigate("/merchant")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/95 shadow-glow hover:shadow-xl hover:scale-105 transition-smooth group text-sm sm:text-base md:text-lg px-8 sm:px-10 md:px-12 w-full sm:w-auto"
            >
              سجل متجرك مجاناً
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-smooth" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate("/plans")}
              className="border-2 border-orange-400 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:border-orange-500 text-sm sm:text-base md:text-lg px-8 sm:px-10 md:px-12 hover:scale-105 transition-smooth w-full sm:w-auto"
            >
              تعرف على المزايا
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm sm:text-base text-primary-foreground/80 pt-4 sm:pt-5 md:pt-6 font-medium px-4">
            ✨ انضم لأكثر من 500+ متجر سعودي على المنصة
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
