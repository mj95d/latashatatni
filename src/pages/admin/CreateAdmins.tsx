import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const CreateAdmins = () => {
  const [loading, setLoading] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState<string[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

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
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-users', {
        body: {
          email: admin.email,
          password: admin.password,
          fullName: admin.fullName,
          phone: admin.phone
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating admin:', error);
      return { success: false, error: error.message };
    }
  };

  const handleCreateNewAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.fullName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (newAdmin.password.length < 6) {
      toast.error("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    
    try {
      const result = await createAdminUser(newAdmin);
      
      if (result.success) {
        toast.success(`تم إنشاء حساب ${newAdmin.fullName} بنجاح`);
        setNewAdmin({ email: "", password: "", fullName: "", phone: "" });
      } else {
        toast.error(`فشل إنشاء الحساب: ${result.error}`);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmins = async () => {
    setLoading(true);
    
    for (const admin of adminAccounts) {
      if (createdAccounts.includes(admin.email)) {
        continue;
      }

      try {
        const result = await createAdminUser(admin);
        
        if (result.success) {
          toast.success(`تم إنشاء حساب ${admin.fullName} بنجاح`);
          setCreatedAccounts(prev => [...prev, admin.email]);
        } else {
          toast.error(`فشل إنشاء حساب ${admin.fullName}: ${result.error}`);
        }
      } catch (error) {
        toast.error(`حدث خطأ أثناء إنشاء حساب ${admin.fullName}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة حسابات الأدمن</h1>
        <p className="text-muted-foreground mt-2">
          إضافة مديري نظام جدد بصلاحيات كاملة
        </p>
      </div>

      {/* نموذج إضافة أدمن جديد */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            إضافة مدير نظام جديد
          </CardTitle>
          <CardDescription>
            أدخل بيانات مدير النظام الجديد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                placeholder="6 أحرف على الأقل"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="الاسم الكامل"
                value={newAdmin.fullName}
                onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+966xxxxxxxxx"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            onClick={handleCreateNewAdmin}
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
                <UserPlus className="ml-2 h-4 w-4" />
                إضافة مدير النظام
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* الحسابات المحددة مسبقاً */}
      <Card>
        <CardHeader>
          <CardTitle>الحسابات الافتراضية (اختياري)</CardTitle>
          <CardDescription>
            إنشاء حسابات الأدمن المحددة مسبقاً بضغطة واحدة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {adminAccounts.map((admin, index) => (
              <Card key={index} className={createdAccounts.includes(admin.email) ? "border-green-500" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {createdAccounts.includes(admin.email) ? (
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
            disabled={loading || createdAccounts.length === adminAccounts.length}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : createdAccounts.length === adminAccounts.length ? (
              <>
                <CheckCircle2 className="ml-2 h-4 w-4" />
                تم إنشاء جميع الحسابات
              </>
            ) : (
              <>
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء الحسابات الافتراضية
              </>
            )}
          </Button>

          {createdAccounts.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ملاحظة مهمة:
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                احفظ كلمات المرور في مكان آمن. يمكنك الآن تسجيل الدخول باستخدام أي من الحسابات أعلاه.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmins;
