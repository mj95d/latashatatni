import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, Lock, Mail, User, Phone } from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const SetupAdmin = () => {
  const [step, setStep] = useState<'verify' | 'create'>('verify');
  const [loading, setLoading] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });
  const navigate = useNavigate();

  // كلمة السر السرية لحماية الصفحة
  const SETUP_SECRET = "LATASHTATNI2025"; // يمكن تغييرها

  const handleVerifySecret = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (secretKey === SETUP_SECRET) {
      setStep('create');
      toast.success("تم التحقق بنجاح! يمكنك الآن إنشاء حساب الأدمن");
    } else {
      toast.error("كلمة السر غير صحيحة");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminData.email || !adminData.password || !adminData.fullName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (adminData.password.length < 6) {
      toast.error("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    
    try {
      // استدعاء edge function لإنشاء الأدمن
      const { data, error } = await supabase.functions.invoke('create-admin-users', {
        body: {
          email: adminData.email,
          password: adminData.password,
          fullName: adminData.fullName,
          phone: adminData.phone
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'فشل في استدعاء الخدمة');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(data?.message || "تم إنشاء حساب الأدمن بنجاح!");
      
      // تسجيل الدخول تلقائياً
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminData.email,
        password: adminData.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        toast.error("تم إنشاء الحساب لكن فشل تسجيل الدخول التلقائي. يرجى تسجيل الدخول يدوياً");
        navigate("/auth");
      } else {
        toast.success("تم تسجيل الدخول كأدمن!");
        navigate("/admin");
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <img src={logo} alt="لا تشتتني" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            إعداد حساب الأدمن الأول
          </h1>
          <p className="text-muted-foreground mt-2">صفحة محمية لإنشاء أول مدير للنظام</p>
        </div>

        <Card className="border-2 shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {step === 'verify' ? 'التحقق من الصلاحية' : 'إنشاء حساب الأدمن'}
            </CardTitle>
            <CardDescription>
              {step === 'verify' 
                ? 'أدخل كلمة السر السرية للمتابعة' 
                : 'املأ بيانات حساب الأدمن الأول'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'verify' ? (
              <form onSubmit={handleVerifySecret} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secretKey">كلمة السر السرية</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="أدخل كلمة السر السرية"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      required
                      className="pr-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    الكلمة السرية الافتراضية: <span className="font-mono bg-muted px-2 py-1 rounded">LATASHTATNI2025</span>
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  التحقق والمتابعة
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      disabled={loading}
                      required
                      className="pr-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور *</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="6 أحرف على الأقل"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      disabled={loading}
                      required
                      className="pr-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="الاسم الكامل"
                      value={adminData.fullName}
                      onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
                      disabled={loading}
                      required
                      className="pr-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+966xxxxxxxxx"
                      value={adminData.phone}
                      onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                      disabled={loading}
                      className="pr-10"
                    />
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-semibold text-primary">⚠️ تنبيه أمني:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>احفظ بيانات تسجيل الدخول في مكان آمن</li>
                    <li>ستحصل على صلاحيات كاملة لإدارة النظام</li>
                    <li>يمكنك حذف هذه الصفحة بعد إنشاء الحساب</li>
                  </ul>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Shield className="ml-2 h-4 w-4" />
                      إنشاء حساب الأدمن
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-muted-foreground"
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupAdmin;
