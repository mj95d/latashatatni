import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "أحمد المالكي",
    role: "صاحب مطعم برغر كورنر - جدة",
    content: "المنصة سهلة جداً وساعدتني أوصل لعملاء جدد ما كنت أعرفهم. خلال أسبوع حصلت على 15 طلب جديد! العمولة 1% ممتازة مقارنة بالمنصات الثانية.",
    rating: 5,
    avatar: "أ"
  },
  {
    id: 2,
    name: "فاطمة العتيبي",
    role: "صاحبة قهوتنا المختصة - الرياض",
    content: "التسجيل مجاني والإدارة سهلة. أقدر أضيف عروضي بنفسي وأشوف الإحصائيات مباشرة. العملاء يحبون العروض الحصرية اللي نقدمها عبر المنصة.",
    rating: 5,
    avatar: "ف"
  },
  {
    id: 3,
    name: "خالد الزهراني",
    role: "صاحب متجر التقنية الذكية - الدمام",
    content: "بصراحة منصة واعدة! الدعم ممتاز والفريق متعاون. أول 3 أيام جاني 8 طلبات من منطقتي. أنصح كل تاجر يسجل ويجرب.",
    rating: 5,
    avatar: "خ"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Quote className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              ماذا يقول التجار عنا
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            تجارب حقيقية من تجار انضموا للمنصة في المرحلة التجريبية
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="p-8 hover:shadow-glow transition-smooth border-2 hover:border-primary/30 relative overflow-hidden group"
            >
              {/* Quote Icon Background */}
              <div className="absolute top-4 left-4 opacity-5 group-hover:opacity-10 transition-smooth">
                <Quote className="w-24 h-24 text-primary" />
              </div>

              <div className="relative space-y-6">
                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-secondary text-secondary"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed text-base">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <Avatar className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow">
                    <AvatarFallback className="text-primary-foreground font-bold text-lg">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            هل تريد أن تكون من التجار الناجحين على منصتنا؟
          </p>
          <a href="/merchant">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-glow transition-smooth">
              سجّل متجرك مجاناً
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;