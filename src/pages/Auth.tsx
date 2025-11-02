import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, Phone, Shield, Store, Fingerprint } from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import { useUserRole } from "@/hooks/useUserRole";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordStrengthIndicator, validatePassword } from "@/components/PasswordStrengthIndicator";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isMerchant, setIsMerchant] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const { isAvailable, isEnrolled, enrollBiometric, authenticateWithBiometric } = useBiometricAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      } else {
        // Load saved email if remember me was enabled
        const savedEmail = localStorage.getItem("saved_email");
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast({
        variant: "destructive",
        title: "كلمة المرور ضعيفة",
        description: "يرجى التأكد من استيفاء جميع شروط كلمة المرور الآمنة",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            is_merchant: isMerchant,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      const successMessage = isMerchant 
        ? "تم إنشاء حسابك كتاجر بنجاح! يمكنك الآن إضافة متجرك وعروضك"
        : "تم إنشاء حسابك بنجاح! مرحباً بك في لا تشتتني";

      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: successMessage,
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("saved_email", email);
      } else {
        localStorage.removeItem("saved_email");
      }

      toast({
        title: "تم تسجيل الدخول بنجاح!",
        description: "مرحباً بعودتك",
      });

      // Save password for biometric login if enrolled
      if (isEnrolled) {
        localStorage.setItem(`biometric_pwd_${btoa(email)}`, btoa(password));
      }

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: error.message || "تحقق من البريد الإلكتروني وكلمة المرور",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSignIn = async () => {
    setLoading(true);
    
    try {
      const email = await authenticateWithBiometric();
      
      if (!email) {
        toast({
          variant: "destructive",
          title: "فشلت المصادقة",
          description: "لم نتمكن من التحقق من هويتك",
        });
        setLoading(false);
        return;
      }

      // Get saved password (in production, use a more secure method)
      const savedPassword = localStorage.getItem(`biometric_pwd_${btoa(email)}`);
      
      if (!savedPassword) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يرجى تسجيل الدخول بكلمة المرور أولاً",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: atob(savedPassword),
      });

      if (error) throw error;

      toast({
        title: "تم تسجيل الدخول بنجاح!",
        description: "مرحباً بعودتك",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "تم إرسال رابط إعادة التعيين!",
        description: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور",
      });

      setShowResetPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين",
      });
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
            لا تشتتني
          </h1>
          <p className="text-muted-foreground mt-2">اكتشف أفضل المتاجر والعروض</p>
        </div>

        <Card className="border-2 shadow-glow animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-2xl text-center">مرحباً بك</CardTitle>
            <CardDescription className="text-center">
              سجل دخولك أو أنشئ حساب جديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      تذكرني
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>

                  {/* Biometric Login Button */}
                  {isAvailable && isEnrolled && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleBiometricSignIn}
                      disabled={loading}
                    >
                      <Fingerprint className="h-4 w-4" />
                      تسجيل الدخول بالبصمة/الوجه
                    </Button>
                  )}

                  <div className="text-center mt-3">
                    <Link to="/reset-password">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-primary"
                      >
                        نسيت كلمة المرور؟
                      </Button>
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="أدخل اسمك الكامل"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">رقم الجوال (اختياري)</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                    </div>
                    
                    {/* Password Strength Indicator */}
                    <PasswordStrengthIndicator password={password} />
                  </div>

                  {/* Merchant Checkbox */}
                  <div className="flex items-start space-x-2 space-x-reverse border-2 border-primary/20 rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <Checkbox
                      id="is-merchant"
                      checked={isMerchant}
                      onCheckedChange={(checked) => setIsMerchant(checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="is-merchant"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        <Store className="w-4 h-4 text-primary" />
                        التسجيل كتاجر
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        احصل على لوحة تحكم لإدارة متجرك وعروضك (حد أقصى 10 إعلانات مجانية)
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Reset Password Dialog */}
        {showResetPassword && (
          <Card className="border-2 shadow-glow mt-4 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl text-center">إعادة تعيين كلمة المرور</CardTitle>
              <CardDescription className="text-center">
                أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="example@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="pr-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetPassword(false)}
                    disabled={loading}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Admin Access - Hidden Link */}
        {isAdmin && (
          <div className="text-center mt-4">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                لوحة التحكم
              </Button>
            </Link>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          بإنشاء حساب، أنت توافق على{" "}
          <a href="/terms" className="text-primary hover:underline">
            شروط الاستخدام
          </a>{" "}
          و
          <a href="/privacy" className="text-primary hover:underline">
            سياسة الخصوصية
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;