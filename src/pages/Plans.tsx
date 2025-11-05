import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    nameAr: "الأساسي",
    price: "مجاني",
    description: "مثالي للمتاجر الصغيرة والمبتدئين",
    icon: Zap,
    color: "text-muted-foreground",
    features: [
      "عرض المتجر في القائمة",
      "حتى 10 منتجات",
      "عرض واحد شهرياً",
      "دعم فني أساسي",
      "إحصائيات بسيطة"
    ]
  },
  {
    name: "Premium",
    nameAr: "المميز",
    price: "199 ريال/شهر",
    description: "الأفضل للمتاجر المتوسطة",
    icon: Sparkles,
    color: "text-primary",
    popular: true,
    features: [
      "جميع مميزات الأساسي",
      "منتجات غير محدودة",
      "5 عروض شهرياً",
      "أولوية في نتائج البحث",
      "صفحة متجر مخصصة",
      "إحصائيات متقدمة",
      "دعم فني مميز"
    ]
  },
  {
    name: "Business",
    nameAr: "الأعمال",
    price: "499 ريال/شهر",
    description: "للمتاجر الكبيرة والعلامات التجارية",
    icon: Crown,
    color: "text-secondary",
    features: [
      "جميع مميزات المميز",
      "عروض غير محدودة",
      "ظهور في الصفحة الرئيسية",
      "شعار في البحث",
      "تقارير تحليلية شاملة",
      "مدير حساب مخصص",
      "دعم فني على مدار الساعة",
      "إعلانات مدفوعة مجانية"
    ]
  }
];

const Plans = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Crown className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">الاشتراكات</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اختر الباقة المناسبة
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              خطط مرنة تناسب جميع أحجام المتاجر مع ضمان أفضل النتائج
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.name}
                  className={`relative overflow-hidden border-2 transition-smooth hover:shadow-glow animate-fade-in ${
                    plan.popular ? 'border-primary/50 shadow-lg scale-105' : 'hover:border-primary/40'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 left-0">
                      <div className="bg-gradient-to-l from-primary via-primary-glow to-primary text-primary-foreground text-center py-2 text-sm font-bold">
                        الأكثر شعبية
                      </div>
                    </div>
                  )}

                  <CardHeader className={plan.popular ? "pt-12" : ""}>
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-12 h-12 ${plan.color}`} />
                      {plan.popular && (
                        <Badge className="bg-secondary text-secondary-foreground">مميز</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{plan.nameAr}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price.split('/')[0]}</span>
                      {plan.price.includes('/') && (
                        <span className="text-muted-foreground text-sm">
                          /{plan.price.split('/')[1]}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      variant={plan.popular ? "default" : "outline"} 
                      className="w-full border-2"
                      asChild
                    >
                      <Link to={plan.price === "مجاني" ? "/merchant" : `/merchant/subscribe?plan=${plan.name.toLowerCase()}`}>
                        {plan.price === "مجاني" ? "البدء مجاناً" : "اشترك الآن"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                الأسئلة الشائعة
              </span>
            </h2>
            <div className="space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">هل يمكنني تغيير الباقة لاحقاً؟</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    نعم، يمكنك الترقية أو التخفيض في أي وقت. سيتم احتساب الرصيد المتبقي عند التغيير.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">ماذا يحدث عند انتهاء الاشتراك؟</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    سيتم تحويل حسابك تلقائياً إلى الباقة الأساسية المجانية مع الاحتفاظ بجميع بياناتك.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">هل توجد عقود طويلة الأجل؟</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    لا، جميع اشتراكاتنا شهرية ويمكنك الإلغاء في أي وقت بدون أي التزامات.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Plans;