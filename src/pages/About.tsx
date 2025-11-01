import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Heart, Zap, Users, Shield, TrendingUp } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "الرؤية",
    description: "أن نكون المنصة الأولى لربط المتاجر المحلية بالمستهلكين في المملكة"
  },
  {
    icon: Heart,
    title: "الرسالة",
    description: "تسهيل اكتشاف المتاجر المحلية ودعم الاقتصاد المحلي من خلال تقنية مبتكرة"
  },
  {
    icon: Zap,
    title: "السرعة",
    description: "نوفر تجربة سريعة وسلسة للوصول إلى أفضل العروض والمتاجر"
  },
  {
    icon: Users,
    title: "المجتمع",
    description: "نبني جسراً بين التجار والمستهلكين لخلق تجربة تسوق متميزة"
  },
  {
    icon: Shield,
    title: "الثقة",
    description: "نضمن مصداقية المعلومات وجودة الخدمات المقدمة"
  },
  {
    icon: TrendingUp,
    title: "النمو",
    description: "نساعد المتاجر المحلية على النمو والوصول لعملاء جدد"
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                عن منصة لا تشتتني
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              منصة سعودية مبتكرة تهدف إلى تسهيل اكتشاف المتاجر المحلية والعروض الحصرية،
              مع دعم الاقتصاد المحلي وربط التجار بعملائهم بطريقة عصرية وفعالة.
            </p>
          </div>

          {/* Story Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <Card className="border-2 shadow-lg animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle className="text-3xl">قصتنا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  بدأت فكرة "لا تشتتني" من تحدٍ حقيقي يواجهه المستهلكون يومياً: كيف يمكن العثور على 
                  أفضل المتاجر والعروض المحلية بدون تشتت؟ ومن جهة أخرى، كيف يمكن للمتاجر الصغيرة 
                  والمتوسطة الوصول إلى عملاء جدد بطريقة فعالة؟
                </p>
                <p>
                  قررنا إنشاء منصة تجمع كل شيء في مكان واحد: المتاجر، المنتجات، العروض، 
                  والأماكن السياحية القريبة. منصة تساعد المستهلكين على اتخاذ قرارات شراء ذكية، 
                  وتمكّن التجار من الوصول لعملاء مستهدفين بكفاءة عالية.
                </p>
                <p className="text-foreground font-semibold">
                  "لا تشتتني" ليست مجرد منصة للتسوق، بل هي حركة لدعم الاقتصاد المحلي السعودي 
                  وتمكين المتاجر الصغيرة من المنافسة في العصر الرقمي.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Grid */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                قيمنا ومبادئنا
              </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card
                    key={value.title}
                    className="border-2 hover:border-primary/40 transition-smooth hover:shadow-glow animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Difference Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-3xl text-center">
                  لماذا "لا تشتتني" مختلف عن المنصات الأخرى؟
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">✓ تركيز محلي</h3>
                    <p className="text-muted-foreground">
                      نركز على المتاجر المحلية السعودية، ليس منصة عالمية عامة
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">✓ بدون تشتت</h3>
                    <p className="text-muted-foreground">
                      تصميم بسيط ونظيف يساعدك على إيجاد ما تريد بسرعة
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">✓ دعم التجار</h3>
                    <p className="text-muted-foreground">
                      أدوات قوية تساعد التجار على النمو وإدارة أعمالهم
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-primary">✓ شفافية كاملة</h3>
                    <p className="text-muted-foreground">
                      تقييمات حقيقية ومعلومات دقيقة عن كل متجر
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;