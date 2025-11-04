import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from "lucide-react";
import { PasswordStrengthIndicator, validatePassword } from "@/components/PasswordStrengthIndicator";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // التحقق من وجود جلسة صالحة
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        toast({
          title: "خطأ",
          description: "الرابط غير صالح أو منتهي الصلاحية. الرجاء طلب رابط جديد.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/reset-password"), 3000);
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال كلمة المرور وتأكيدها",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.valid) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، رقم واحد، ورمز خاص واحد",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // Log the password reset for security audit
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.from('user_activity').insert({
            user_id: user.id,
            activity_type: 'password_reset',
            activity_description: 'تم إعادة تعيين كلمة المرور بنجاح',
          });
        } catch {
          // Silent fail for logging
        }
      }

      toast({
        title: "✅ تم تحديث كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح. سيتم تسجيل خروجك من جميع الأجهزة.",
      });

      // Sign out from all sessions for security
      await supabase.auth.signOut({ scope: 'global' });

      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("Update password error:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث كلمة المرور. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">جاري التحقق من الجلسة...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">تعيين كلمة مرور جديدة</CardTitle>
          <CardDescription className="text-center">
            أدخل كلمة المرور الجديدة الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {password && confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">كلمات المرور متطابقة</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">كلمات المرور غير متطابقة</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">⚠️ إجراءات أمنية:</p>
              <ul className="space-y-1 text-muted-foreground mr-4">
                <li>• سيتم تسجيل خروجك من جميع الأجهزة</li>
                <li>• سيتم تسجيل هذه العملية في سجل الأمان</li>
                <li>• الرابط صالح لاستخدام واحد فقط</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading || password !== confirmPassword}>
              {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePassword;
