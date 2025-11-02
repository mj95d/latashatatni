import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Upload, Building2 } from "lucide-react";

const PLANS = {
  free: {
    name: "الأساسي",
    price: 0,
    features: [
      "عرض واحد شهريًا",
      "حد 10 منتجات",
      "عروض واحد شهريًا",
      "دعم غير أساسي",
      "إحصائيات بسيطة"
    ]
  },
  premium: {
    name: "المميز",
    price: 199,
    features: [
      "جميع مميزات الأساسي",
      "منتجات غير محدودة",
      "عروض غير محدودة",
      "الظهور في نتائج البحث",
      "أولوية في نتائج البحث",
      "صفحة متجر محسنة",
      "إحصائيات متقدمة",
      "دعم فني مميز"
    ]
  },
  business: {
    name: "الأعمال",
    price: 499,
    features: [
      "جميع مميزات المميز",
      "عروض غير محدودة",
      "ظهور في الصفحة الرئيسية",
      "تقارير تفصيلية",
      "لمارات تحليلية متقدمة",
      "فريق دعم خاص مخصص",
      "دعم فني على مدار الساعة",
      "إعلانات مجانية مخصصة"
    ]
  }
};

const DURATIONS = [
  { value: "1-month", label: "شهر واحد", discount: 0 },
  { value: "3-months", label: "3 أشهر", discount: 10 },
  { value: "1-year", label: "سنة كاملة", discount: 20 }
];

export default function Subscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("1-month");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  
  const planType = searchParams.get("plan") || "premium";
  const plan = PLANS[planType as keyof typeof PLANS] || PLANS.premium;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    const duration = DURATIONS.find(d => d.value === selectedDuration);
    const discount = duration?.discount || 0;
    const months = selectedDuration === "1-month" ? 1 : selectedDuration === "3-months" ? 3 : 12;
    const totalPrice = plan.price * months;
    const discountedPrice = totalPrice - (totalPrice * discount / 100);
    return Math.round(discountedPrice);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setPaymentProof(file);
  };

  const uploadPaymentProof = async (requestId: string) => {
    if (!paymentProof) return null;

    setUploadingProof(true);
    try {
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `${requestId}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-documents')
        .upload(filePath, paymentProof);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      throw error;
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async () => {
    if (planType === "free") {
      toast({
        title: "خطأ",
        description: "الباقة المجانية لا تحتاج إلى اشتراك",
        variant: "destructive"
      });
      return;
    }

    if (!paymentProof) {
      toast({
        title: "خطأ",
        description: "يرجى رفع إثبات الدفع",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create subscription request
      const { data: request, error: requestError } = await supabase
        .from('subscription_requests')
        .insert({
          merchant_id: user.id,
          plan: planType,
          duration: selectedDuration,
          price: calculatePrice(),
          status: 'pending_review'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload payment proof
      const proofUrl = await uploadPaymentProof(request.id);

      // Update request with payment proof URL
      const { error: updateError } = await supabase
        .from('subscription_requests')
        .update({ payment_proof_url: proofUrl })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم مراجعة طلبك وتفعيل الاشتراك خلال 24 ساعة"
      });

      navigate("/merchant");
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">إكمال عملية الاشتراك</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            شكرًا لاختيارك باقة {plan.name}. لإكمال الاشتراك يرجى سداد رسوم الاشتراك ثم رفع إيصال الدفع
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Plan Summary */}
          <Card className="p-4 md:p-6 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <h2 className="text-lg md:text-xl font-bold">{plan.name}</h2>
                <p className="text-xs md:text-sm text-muted-foreground">ملخص الباقة</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="mb-4">
                <Label className="mb-3 block text-sm md:text-base">اختر مدة الاشتراك</Label>
                <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration} className="space-y-2">
                  {DURATIONS.map((duration) => (
                    <div key={duration.value} className="flex items-center justify-between p-2 md:p-3 border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={duration.value} id={duration.value} />
                        <Label htmlFor={duration.value} className="cursor-pointer text-sm md:text-base">
                          {duration.label}
                        </Label>
                      </div>
                      {duration.discount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                          خصم {duration.discount}%
                        </span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="bg-primary/5 p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs md:text-sm text-muted-foreground">المبلغ الإجمالي</span>
                  <span className="text-xl md:text-2xl font-bold">{calculatePrice()} ريال</span>
                </div>
                {DURATIONS.find(d => d.value === selectedDuration)?.discount! > 0 && (
                  <p className="text-xs text-muted-foreground">
                    تم تطبيق خصم {DURATIONS.find(d => d.value === selectedDuration)?.discount}%
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-4 md:p-6 h-fit">
            <h2 className="text-lg md:text-xl font-bold mb-4">معلومات التحويل البنكي</h2>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 md:p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-2 md:gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">اسم الحساب</p>
                    <p className="font-semibold text-xs md:text-sm">شركة لا تشتتني</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">البنك</p>
                    <p className="font-semibold text-xs md:text-sm">الراجحي</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">رقم الحساب</p>
                    <p className="font-semibold text-xs md:text-sm">123456789</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">الآيبان</p>
                    <p className="font-semibold text-xs md:text-sm break-all">SA00000000000000</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="payment-proof" className="mb-3 block text-sm md:text-base">
                  رفع إيصال الدفع <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed rounded-lg p-4 md:p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    id="payment-proof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="payment-proof"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm md:text-base">
                        {paymentProof ? paymentProof.name : "اضغط لرفع الملف"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        الصور أو PDF (حد أقصى 5 ميجابايت)
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !paymentProof || uploadingProof}
              className="w-full"
              size="lg"
            >
              {submitting || uploadingProof ? "جاري الإرسال..." : "إرسال الطلب"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              سيتم مراجعة طلبك خلال 24 ساعة وتفعيل الاشتراك فورًا بعد التأكد من الدفع
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}