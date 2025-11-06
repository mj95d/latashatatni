import { MapPin, Store, Percent, Search, Clock, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import storeIcon from "@/assets/store-icon.png";
import locationIcon from "@/assets/location-icon.png";
import offersIcon from "@/assets/offers-icon.png";

const features = [
  {
    icon: locationIcon,
    title: "اكتشف القريب منك",
    description: "خريطة تفاعلية تعرض لك جميع المتاجر والعروض في منطقتك بدقة عالية",
    color: "from-primary to-primary-glow",
  },
  {
    icon: storeIcon,
    title: "آلاف المتاجر المحلية",
    description: "تصفح مئات المتاجر المحلية والمنتجات من موقع واحد بدون تشتت",
    color: "from-secondary to-accent",
  },
  {
    icon: offersIcon,
    title: "عروض حصرية يومياً",
    description: "احصل على أفضل العروض والخصومات من المتاجر القريبة منك",
    color: "from-primary-glow to-primary",
  },
];

const additionalFeatures = [
  {
    Icon: Search,
    title: "بحث ذكي",
    description: "ابحث بسهولة عن أي منتج أو متجر في ثوانٍ",
  },
  {
    Icon: Clock,
    title: "توفير الوقت",
    description: "لا داعي للبحث في أماكن متعددة",
  },
  {
    Icon: Shield,
    title: "متاجر موثوقة",
    description: "جميع المتاجر معتمدة ومراجعة",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 gradient-hero">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 px-2">
            <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              لماذا لا تشتتني؟
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            كل ما تحتاجه في مكان واحد - سهولة وسرعة ودقة في الوصول للمتاجر القريبة منك
          </p>
        </div>

        {/* Main Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-5 sm:p-6 md:p-8 text-center hover:shadow-glow transition-smooth border-2 hover:border-primary/30 bg-card group cursor-pointer"
            >
              <div className="mb-5 sm:mb-6 md:mb-8 flex justify-center">
                <div className="relative">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain transition-smooth group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-smooth" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-blue-500 group-hover:text-blue-400 transition-smooth">{feature.title}</h3>
              <p className="text-blue-300/90 leading-relaxed text-sm sm:text-base md:text-lg">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.Icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-7 rounded-xl sm:rounded-2xl bg-card/60 backdrop-blur-sm border-2 border-border/50 hover:border-primary/40 transition-smooth group cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth shadow-soft">
                  <Icon className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg mb-1.5 sm:mb-2 text-blue-500 group-hover:text-blue-400 transition-smooth">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-blue-300/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
