import { Store, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20 gradient-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
            <Store className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
            هل أنت صاحب متجر؟
            <br />
            انضم لمنصة لا تشتتني الآن
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            احصل على عملاء جدد من منطقتك. أضف متجرك ومنتجاتك وعروضك الحصرية وابدأ بزيادة مبيعاتك اليوم
          </p>

          {/* Features List */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-primary-foreground/90">
            <div className="space-y-2">
              <div className="font-bold text-lg">🎯</div>
              <h3 className="font-bold">وصول مباشر للعملاء</h3>
              <p className="text-sm text-primary-foreground/80">
                اعرض متجرك للعملاء في منطقتك مباشرة
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-lg">📊</div>
              <h3 className="font-bold">لوحة تحكم احترافية</h3>
              <p className="text-sm text-primary-foreground/80">
                أدر متجرك ومنتجاتك بسهولة
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-lg">💰</div>
              <h3 className="font-bold">زيادة المبيعات</h3>
              <p className="text-sm text-primary-foreground/80">
                حقق المزيد من المبيعات عبر المنصة
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-glow group"
            >
              سجل متجرك مجاناً
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-smooth" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              تعرف على المزايا
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-primary-foreground/70 pt-4">
            انضم لأكثر من 500+ متجر سعودي على المنصة
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
