import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
            سياسة الخصوصية
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            نحن نهتم بخصوصيتك وحماية بياناتك الشخصية
          </p>
        </div>

        {/* Content */}
        <Card className="max-w-4xl mx-auto p-8 md:p-12 shadow-elegant border-2">
          <div className="space-y-8 text-right">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">1. المقدمة</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                تلتزم منصة "لا تشتتني" بحماية خصوصية مستخدميها. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام منصتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">2. المعلومات التي نجمعها</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <p>نقوم بجمع المعلومات التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف</li>
                  <li>معلومات المتجر: اسم المتجر، العنوان، الفئة، الوصف</li>
                  <li>معلومات الاستخدام: سجلات التصفح، التفضيلات، البحث</li>
                  <li>المعلومات التقنية: عنوان IP، نوع المتصفح، نظام التشغيل</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">3. كيفية استخدام المعلومات</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>تقديم وتحسين خدماتنا</li>
                  <li>التواصل معك بشأن حسابك والخدمات</li>
                  <li>إرسال إشعارات حول العروض والتحديثات</li>
                  <li>تحليل استخدام المنصة لتحسين الأداء</li>
                  <li>حماية المنصة من الاحتيال والأنشطة المشبوهة</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">4. مشاركة المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-6 mt-3 text-muted-foreground text-lg">
                <li>مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة</li>
                <li>عند الضرورة القانونية أو الامتثال للقوانين</li>
                <li>لحماية حقوقنا وسلامة مستخدمينا</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">5. أمان المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                نستخدم تدابير أمنية تقنية وإدارية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو الكشف أو التغيير أو التدمير. ومع ذلك، لا يمكن ضمان أمان أي إرسال عبر الإنترنت بنسبة 100%.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">6. ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل استخدام المنصة. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">7. حقوقك</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed text-lg">
                <p>لديك الحق في:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>الوصول إلى معلوماتك الشخصية</li>
                  <li>تصحيح أو تحديث معلوماتك</li>
                  <li>حذف حسابك ومعلوماتك</li>
                  <li>الاعتراض على معالجة معلوماتك</li>
                  <li>طلب نقل معلوماتك</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">8. التحديثات على سياسة الخصوصية</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار بارز على المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">9. تواصل معنا</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك التواصل معنا عبر:
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

export default Privacy;
