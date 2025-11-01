import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
            الشروط والأحكام
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            قواعد وشروط استخدام منصة لا تشتتني
          </p>
        </div>

        {/* Content */}
        <Card className="max-w-4xl mx-auto p-8 md:p-12 shadow-elegant border-2">
          <div className="space-y-8 text-right">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">1. القبول بالشروط</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                باستخدامك لمنصة "لا تشتتني"، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">2. وصف الخدمة</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                "لا تشتتني" هي منصة إلكترونية تربط بين المستخدمين والمتاجر المحلية في المملكة العربية السعودية. نوفر معلومات عن المتاجر والعروض ولا نتحمل مسؤولية المعاملات التي تتم بين المستخدمين والمتاجر.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">3. التسجيل والحساب</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>يجب أن تكون لديك الأهلية القانونية لاستخدام المنصة</li>
                  <li>يجب تقديم معلومات دقيقة وصحيحة عند التسجيل</li>
                  <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك</li>
                  <li>يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                  <li>نحتفظ بالحق في تعليق أو إنهاء الحسابات المخالفة</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">4. التزامات التجار</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <p>على التجار المسجلين في المنصة الالتزام بما يلي:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>تقديم معلومات دقيقة وحديثة عن المتجر والعروض</li>
                  <li>الالتزام بالعروض المعلن عنها على المنصة</li>
                  <li>عدم نشر محتوى مخالف أو مضلل</li>
                  <li>الالتزام بخطة الاشتراك المختارة</li>
                  <li>احترام حقوق الملكية الفكرية للآخرين</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">5. السلوك المحظور</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <p>يُحظر على المستخدمين:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>استخدام المنصة لأي أغراض غير قانونية</li>
                  <li>نشر محتوى مسيء أو مضلل أو غير لائق</li>
                  <li>التلاعب بنظام التقييمات أو المراجعات</li>
                  <li>محاولة اختراق أو تعطيل المنصة</li>
                  <li>جمع معلومات المستخدمين الآخرين دون إذن</li>
                  <li>انتحال شخصية الآخرين أو تقديم معلومات كاذبة</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">6. الملكية الفكرية</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                جميع المحتويات والعلامات التجارية والشعارات والتصاميم الموجودة على المنصة هي ملكية "لا تشتتني" أو مرخصة لها. يُحظر استخدامها دون إذن كتابي مسبق.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">7. الاشتراكات والمدفوعات</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>تتم المدفوعات وفقاً لخطة الاشتراك المختارة</li>
                  <li>جميع الأسعار شاملة ضريبة القيمة المضافة</li>
                  <li>يتم تجديد الاشتراكات تلقائياً ما لم يتم الإلغاء</li>
                  <li>لا تُسترد المبالغ المدفوعة إلا وفقاً لسياسة الاسترداد</li>
                  <li>نحتفظ بالحق في تغيير الأسعار مع إشعار مسبق</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">8. إخلاء المسؤولية</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>المنصة توفر معلومات فقط ولا تتحمل مسؤولية المعاملات</li>
                  <li>لا نضمن دقة أو اكتمال المعلومات المقدمة من التجار</li>
                  <li>لا نتحمل مسؤولية أي أضرار ناتجة عن استخدام المنصة</li>
                  <li>قد تحتوي المنصة على روابط لمواقع خارجية لا نتحكم فيها</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">9. إنهاء الحساب</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة انتهاك هذه الشروط أو لأي سبب آخر نراه مناسباً. يمكنك أيضاً إنهاء حسابك في أي وقت من خلال إعدادات الحساب.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">10. تعديل الشروط</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعارك بأي تغييرات جوهرية، واستمرارك في استخدام المنصة يعني موافقتك على الشروط المحدثة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">11. القانون الحاكم</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                تخضع هذه الشروط والأحكام لأنظمة وقوانين المملكة العربية السعودية. أي نزاع ينشأ عن هذه الشروط يخضع للاختصاص القضائي للمحاكم السعودية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">12. تواصل معنا</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                للاستفسارات حول هذه الشروط والأحكام، يمكنك التواصل معنا عبر:
              </p>
              <ul className="list-none space-y-2 mt-3 text-muted-foreground text-lg">
                <li>البريد الإلكتروني: info@latashatini.sa</li>
                <li>الهاتف: +966 50 000 0000</li>
              </ul>
            </section>

            <div className="pt-8 border-t-2 border-border/50 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                آخر تحديث: يناير 2025
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
