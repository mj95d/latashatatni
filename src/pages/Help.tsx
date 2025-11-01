import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const Help = () => {
  const faqs = [
    {
      question: "ما هي منصة لا تشتتني؟",
      answer: "لا تشتتني هي منصة سعودية محلية تجمع لك المتاجر والعروض القريبة منك في مكان واحد بدون تشتت. نساعدك في اكتشاف أفضل المتاجر والعروض في مدينتك بسهولة."
    },
    {
      question: "كيف يمكنني تسجيل متجري في المنصة؟",
      answer: "يمكنك تسجيل متجرك بسهولة من خلال إنشاء حساب تاجر والذهاب إلى صفحة التسجيل. ستحتاج إلى تقديم معلومات أساسية عن متجرك مثل الاسم، العنوان، الفئة، ورقم التواصل."
    },
    {
      question: "هل استخدام المنصة مجاني للمستخدمين؟",
      answer: "نعم، استخدام المنصة مجاني بالكامل للمستخدمين. يمكنك تصفح المتاجر والعروض والبحث عن ما تحتاجه دون أي رسوم."
    },
    {
      question: "ما هي خطط الاشتراك المتاحة للتجار؟",
      answer: "نوفر عدة خطط اشتراك للتجار تشمل الخطة المجانية والخطة الأساسية والخطة المميزة. كل خطة تقدم مزايا مختلفة مثل عدد العروض المسموح بها وأولوية الظهور في نتائج البحث."
    },
    {
      question: "كيف يمكنني البحث عن متاجر في مدينة معينة؟",
      answer: "يمكنك استخدام خاصية البحث في الصفحة الرئيسية أو صفحة المتاجر لتحديد المدينة التي تريدها. كما يمكنك تصفية النتائج حسب الفئة أو التقييم."
    },
    {
      question: "كيف يتم التواصل مع المتاجر؟",
      answer: "توفر المنصة طرق متعددة للتواصل مع المتاجر: يمكنك الاتصال مباشرة عبر زر الاتصال، أو زيارة موقع المتجر على خرائط جوجل عبر زر الموقع."
    },
    {
      question: "هل يمكنني تقييم المتاجر؟",
      answer: "نعم، يمكن للمستخدمين المسجلين تقييم المتاجر ومشاركة تجربتهم لمساعدة الآخرين في اتخاذ قرارات أفضل."
    },
    {
      question: "كيف أعرف العروض الجديدة؟",
      answer: "يمكنك زيارة صفحة العروض بشكل دوري لمشاهدة أحدث العروض. كما نخطط لإضافة نظام إشعارات لإعلامك بالعروض الجديدة في المستقبل."
    },
    {
      question: "هل المنصة متاحة في جميع مدن المملكة؟",
      answer: "نعمل على التوسع لتغطية جميع مدن المملكة. حالياً نغطي المدن الرئيسية ونضيف مدناً جديدة باستمرار."
    },
    {
      question: "كيف يمكنني التواصل مع الدعم الفني؟",
      answer: "يمكنك التواصل معنا عبر صفحة اتصل بنا أو إرسال بريد إلكتروني إلى info@latashatini.sa أو الاتصال على الرقم +966 50 000 0000"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
            <HelpCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
            الأسئلة الشائعة
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            إجابات على الأسئلة الأكثر شيوعاً حول منصة لا تشتتني
          </p>
        </div>

        {/* FAQ Section */}
        <Card className="max-w-4xl mx-auto p-8 md:p-12 shadow-elegant border-2">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-2 rounded-xl px-6 hover:border-primary/50 transition-smooth"
              >
                <AccordionTrigger className="text-right text-lg font-semibold hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-right text-base text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Contact CTA */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-lg text-muted-foreground">
            لم تجد إجابة لسؤالك؟
          </p>
          <a 
            href="/contact"
            className="inline-block text-primary font-semibold text-lg hover:underline transition-smooth"
          >
            تواصل معنا مباشرة ←
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
