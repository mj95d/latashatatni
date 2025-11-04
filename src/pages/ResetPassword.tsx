import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال بريد إلكتروني صحيح",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/update-password`;
      
      // Always return success message for security (don't reveal if email exists)
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      // Show success regardless of whether email exists
      setEmailSent(true);
      toast({
        title: "تم الإرسال",
        description: "إذا كان هناك حساب مرتبط بهذا البريد، سيتم إرسال رابط إعادة التعيين خلال دقائق.",
      });
    } catch (error: any) {
      // Generic error message for security
      setEmailSent(true);
      toast({
        title: "تم الإرسال",
        description: "إذا كان هناك حساب مرتبط بهذا البريد، سيتم إرسال رابط إعادة التعيين خلال دقائق.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Button>
          </div>
          <CardTitle className="text-2xl text-center">استرجاع كلمة المرور</CardTitle>
          <CardDescription className="text-center">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  تم إرسال رابط إعادة تعيين كلمة المرور (إن وُجد حساب) إلى:
                </p>
                <p className="font-medium">{email}</p>
                <p className="text-sm text-muted-foreground">
                  الرجاء التحقق من صندوق الوارد وصندوق الرسائل غير المرغوبة.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ⏱️ الرابط صالح لمدة 60 دقيقة فقط
                </p>
                <p className="text-xs text-muted-foreground">
                  🔒 لأسباب أمنية، لا نؤكد ما إذا كان البريد مسجلاً أم لا
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="w-full"
              >
                إرسال رابط جديد
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  dir="ltr"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
