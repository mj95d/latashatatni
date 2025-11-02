import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { AddStoreDialog } from "@/components/AddStoreDialog";

const Merchant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role: userRole, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    phone: "",
    city: ""
  });

  useEffect(() => {
    checkMerchantRequest();
  }, []);

  const checkMerchantRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("merchant_requests")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking request:", error);
        return;
      }

      if (data) {
        setRequestStatus(data.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("merchant_requests")
        .insert([
          {
            user_id: user.id,
            ...formData
          }
        ]);

      if (error) throw error;

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم مراجعة طلبك والرد عليك قريباً",
      });

      setRequestStatus("pending");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // إذا كان تاجر بالفعل، يتم توجيهه للوحة التحكم الخاصة به
  if (userRole === "merchant" || userRole === "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
              <Store className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
              لوحة تحكم التاجر
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              إدارة متاجرك وعروضك بكل سهولة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المتاجر</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العروض النشطة</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="stores" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 h-14 mb-8">
              <TabsTrigger value="stores" className="text-base">
                <Store className="w-4 h-4 ml-2" />
                متاجري
              </TabsTrigger>
              <TabsTrigger value="offers" className="text-base">
                <CheckCircle className="w-4 h-4 ml-2" />
                عروضي
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-base">
                <Clock className="w-4 h-4 ml-2" />
                الإحصائيات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stores" className="mt-8">
              <Card className="p-8 border-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">متاجرك</h3>
                  <Button 
                    size="lg" 
                    className="shadow-glow"
                    onClick={() => setShowAddStoreDialog(true)}
                  >
                    <Store className="w-4 h-4 ml-2" />
                    إضافة متجر جديد
                  </Button>
                </div>
                <div className="text-center py-16">
                  <Store className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                  <h4 className="text-xl font-semibold mb-3">لا توجد متاجر حالياً</h4>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    ابدأ بإضافة متجرك الأول وعرض منتجاتك للعملاء
                  </p>
                  <Button onClick={() => navigate("/stores")} variant="outline" size="lg">
                    تصفح المتاجر
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="mt-8">
              <Card className="p-8 border-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">عروضك</h3>
                  <Button size="lg" className="shadow-glow">
                    <CheckCircle className="w-4 h-4 ml-2" />
                    إضافة عرض جديد
                  </Button>
                </div>
                <div className="text-center py-16">
                  <CheckCircle className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                  <h4 className="text-xl font-semibold mb-3">لا توجد عروض حالياً</h4>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    أضف عروضك الحصرية واجذب المزيد من العملاء
                  </p>
                  <Button onClick={() => navigate("/offers")} variant="outline" size="lg">
                    تصفح العروض
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8">
              <Card className="p-8 border-2">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">الإحصائيات</h3>
                  <p className="text-muted-foreground">تتبع أداء متاجرك وعروضك</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-4">المشاهدات الأسبوعية</h4>
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                      لا توجد بيانات كافية
                    </div>
                  </div>
                  <div className="p-6 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-4">العروض الأكثر شعبية</h4>
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                      لا توجد بيانات كافية
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">نصائح للتجار</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• أضف صوراً واضحة وجذابة لمنتجاتك</li>
                  <li>• حدث عروضك بانتظام لجذب المزيد من العملاء</li>
                  <li>• تفاعل مع تقييمات العملاء بشكل احترافي</li>
                  <li>• استخدم الوصف التفصيلي لمنتجاتك وخدماتك</li>
                </ul>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
        
        {/* Add Store Dialog */}
        <AddStoreDialog 
          open={showAddStoreDialog}
          onOpenChange={setShowAddStoreDialog}
          onSuccess={() => {
            // Reload stores or update state
            toast({
              title: "تم بنجاح",
              description: "تم إضافة المتجر بنجاح"
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
            انضم كتاجر
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            افتح متجرك في أقل من دقيقتين. أضف عروضك اليوم وابدأ استقبال الطلبات فورًا.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-full px-5 py-2.5 text-sm">
              <span className="font-bold text-primary">✨ التسجيل مجاني</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 border-2 border-secondary/30 rounded-full px-5 py-2.5 text-sm">
              <span className="font-bold text-secondary">💰 العمولة 1% فقط</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {requestStatus === "pending" && (
            <Card className="p-8 mb-8 border-2 border-amber-500/50 bg-amber-50/10">
              <div className="flex items-start gap-4">
                <Clock className="w-12 h-12 text-amber-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">طلبك قيد المراجعة</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    تم إرسال طلبك بنجاح وهو الآن قيد المراجعة من قبل فريقنا. سيتم إشعارك بمجرد الموافقة على طلبك.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {requestStatus === "approved" && (
            <Card className="p-8 mb-8 border-2 border-green-500/50 bg-green-50/10">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">تمت الموافقة على طلبك</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    تهانينا! تمت الموافقة على طلبك. يمكنك الآن البدء في إدارة متجرك وعروضك.
                  </p>
                  <Button onClick={() => window.location.reload()} className="mt-4">
                    الذهاب للوحة التحكم
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {requestStatus === "rejected" && (
            <Card className="p-8 mb-8 border-2 border-red-500/50 bg-red-50/10">
              <div className="flex items-start gap-4">
                <XCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">تم رفض طلبك</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    للأسف، لم تتم الموافقة على طلبك. للمزيد من المعلومات، يرجى التواصل معنا.
                  </p>
                  <Button onClick={() => navigate("/contact")} className="mt-4" variant="outline">
                    تواصل معنا
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!requestStatus && (
            <Card className="p-8 md:p-12 shadow-elegant border-2">
              <h2 className="text-2xl font-bold mb-6 gradient-text">طلب التسجيل كتاجر</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-base">اسم المتجر *</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اسم متجرك"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description" className="text-base">وصف المتجر</Label>
                  <Textarea
                    id="business_description"
                    name="business_description"
                    value={formData.business_description}
                    onChange={handleChange}
                    placeholder="وصف مختصر عن متجرك ونشاطه التجاري"
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+966 50 000 0000"
                      className="h-12"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base">المدينة</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="مدينة المتجر"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border-2 border-border/50">
                  <h3 className="font-semibold text-lg mb-3">ملاحظة مهمة:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• سيتم مراجعة طلبك من قبل فريقنا</li>
                    <li>• ستتلقى إشعاراً عند الموافقة على طلبك</li>
                    <li>• يجب أن تكون المعلومات المقدمة صحيحة ودقيقة</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  disabled={loading}
                  className="w-full text-lg shadow-glow hover:shadow-xl hover:scale-105 transition-smooth"
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال الطلب"
                  )}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Merchant;
