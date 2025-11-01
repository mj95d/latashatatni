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

const Merchant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role: userRole, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
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
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
              <Store className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
              لوحة تحكم التاجر
            </h1>
          </div>

          <Tabs defaultValue="stores" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stores">متاجري</TabsTrigger>
              <TabsTrigger value="offers">عروضي</TabsTrigger>
            </TabsList>

            <TabsContent value="stores" className="mt-8">
              <Card className="p-8">
                <div className="text-center py-12">
                  <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-4">متاجرك</h3>
                  <p className="text-muted-foreground mb-6">
                    يمكنك إدارة متاجرك وإضافة متاجر جديدة من هنا
                  </p>
                  <Button onClick={() => navigate("/stores")} size="lg">
                    عرض المتاجر
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="mt-8">
              <Card className="p-8">
                <div className="text-center py-12">
                  <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-4">عروضك</h3>
                  <p className="text-muted-foreground mb-6">
                    يمكنك إدارة عروضك وإضافة عروض جديدة من هنا
                  </p>
                  <Button onClick={() => navigate("/offers")} size="lg">
                    عرض العروض
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
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
            سجل متجرك وابدأ في عرض منتجاتك وعروضك للمستخدمين
          </p>
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
