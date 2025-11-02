import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";

const CreateAdmins = () => {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<string[]>([]);
  const { toast } = useToast();

  const adminAccounts = [
    {
      email: "admin1@latashtatni.com",
      password: "Admin@123456",
      fullName: "مدير النظام الأول",
      phone: "0500000001",
    },
    {
      email: "admin2@latashtatni.com",
      password: "Admin@789012",
      fullName: "مدير النظام الثاني",
      phone: "0500000002",
    },
  ];

  const createAdminUser = async (admin: typeof adminAccounts[0]) => {
    const { data, error } = await supabase.functions.invoke("create-admin-users", {
      body: {
        email: admin.email,
        password: admin.password,
        fullName: admin.fullName,
        phone: admin.phone,
      },
    });

    if (error) throw error;
    return data;
  };

  const handleCreateAdmins = async () => {
    setLoading(true);
    setCreated([]);
    
    try {
      for (const admin of adminAccounts) {
        await createAdminUser(admin);
        setCreated(prev => [...prev, admin.email]);
        
        toast({
          title: "تم إنشاء الحساب",
          description: `تم إنشاء حساب ${admin.fullName} بنجاح`,
        });
      }

      toast({
        title: "اكتمل الإنشاء",
        description: "تم إنشاء جميع حسابات الأدمن بنجاح",
      });
    } catch (error: any) {
      console.error("Error creating admin users:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء حسابات الأدمن",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">إنشاء حسابات أدمن</CardTitle>
          <CardDescription>
            سيتم إنشاء حسابين أدمن بالمعلومات التالية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {adminAccounts.map((admin, index) => (
              <Card key={index} className={created.includes(admin.email) ? "border-green-500" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {created.includes(admin.email) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <UserPlus className="h-5 w-5" />
                    )}
                    الحساب {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">البريد الإلكتروني:</span>
                      <p className="text-muted-foreground">{admin.email}</p>
                    </div>
                    <div>
                      <span className="font-semibold">كلمة المرور:</span>
                      <p className="text-muted-foreground font-mono">{admin.password}</p>
                    </div>
                    <div>
                      <span className="font-semibold">الاسم:</span>
                      <p className="text-muted-foreground">{admin.fullName}</p>
                    </div>
                    <div>
                      <span className="font-semibold">الجوال:</span>
                      <p className="text-muted-foreground">{admin.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleCreateAdmins}
            disabled={loading || created.length === adminAccounts.length}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : created.length === adminAccounts.length ? (
              <>
                <CheckCircle2 className="ml-2 h-4 w-4" />
                تم إنشاء جميع الحسابات
              </>
            ) : (
              <>
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء حسابات الأدمن
              </>
            )}
          </Button>

          {created.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ملاحظة مهمة:
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                احفظ كلمات المرور في مكان آمن. يمكنك الآن تسجيل الدخول باستخدام أي من الحسابين أعلاه.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmins;
