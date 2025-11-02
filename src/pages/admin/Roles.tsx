import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  Store,
  Package,
  Tag,
  ShoppingCart,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit,
  UserCheck
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  user_name?: string;
  user_phone?: string;
}

const adminPermissions = [
  { id: "users", name: "إدارة المستخدمين", icon: Users, description: "عرض وتعديل وحذف المستخدمين" },
  { id: "merchant_requests", name: "طلبات التجار", icon: UserCheck, description: "قبول أو رفض طلبات الانضمام" },
  { id: "stores", name: "إدارة المتاجر", icon: Store, description: "تعديل وإخفاء المتاجر" },
  { id: "products", name: "إدارة المنتجات", icon: Package, description: "إضافة وتعديل المنتجات" },
  { id: "offers", name: "إدارة العروض", icon: Tag, description: "إدارة العروض والخصومات" },
  { id: "orders", name: "إدارة الطلبات", icon: ShoppingCart, description: "متابعة وإدارة الطلبات" },
  { id: "cities", name: "إدارة المدن", icon: MapPin, description: "إضافة وتعديل المدن" },
  { id: "payments", name: "الاشتراكات والمدفوعات", icon: CreditCard, description: "إدارة الاشتراكات" },
  { id: "reports", name: "التقارير", icon: FileText, description: "عرض التقارير والإحصائيات" },
  { id: "settings", name: "الإعدادات", icon: Settings, description: "إعدادات المنصة العامة" },
];

const Roles = () => {
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data: rolesData, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = rolesData?.map(r => r.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      // Merge data
      const mergedData = rolesData?.map(role => {
        const profile = profilesData?.find(p => p.id === role.user_id);
        return {
          ...role,
          user_name: profile?.full_name,
          user_phone: profile?.phone,
        };
      }) || [];

      setUserRoles(mergedData);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    try {
      // البحث عن المستخدم بالبريد الإلكتروني
      const { data: profiles, error: searchError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("full_name", `%${searchEmail}%`)
        .limit(1);

      if (searchError || !profiles || profiles.length === 0) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على المستخدم",
          variant: "destructive",
        });
        return;
      }

      const userId = profiles[0].id;

      // التحقق من عدم وجود دور مسبق
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", selectedRole as any)
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "تنبيه",
          description: "هذا الدور موجود مسبقاً للمستخدم",
          variant: "destructive",
        });
        return;
      }

      // إضافة الدور
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: selectedRole as any,
        });

      if (insertError) throw insertError;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الدور للمستخدم",
      });

      setShowAddDialog(false);
      setSearchEmail("");
      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة الدور",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدور؟")) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الدور بنجاح",
      });

      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "أدمن", variant: "default" as const, className: "bg-red-100 text-red-700 border-red-300" },
      merchant: { label: "تاجر", variant: "secondary" as const, className: "bg-blue-100 text-blue-700 border-blue-300" },
      user: { label: "مستخدم", variant: "outline" as const, className: "bg-gray-100 text-gray-700 border-gray-300" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const stats = {
    totalRoles: userRoles.length,
    admins: userRoles.filter((r) => r.role === "admin").length,
    merchants: userRoles.filter((r) => r.role === "merchant").length,
    users: userRoles.filter((r) => r.role === "user").length,
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            صلاحيات الأدمن
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة الأدوار والصلاحيات لجميع المستخدمين على المنصة
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="shadow-glow">
              <Plus className="w-4 h-4 ml-2" />
              إضافة دور جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة دور لمستخدم</DialogTitle>
              <DialogDescription>
                ابحث عن المستخدم واختر الدور المناسب له
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="search">اسم المستخدم أو البريد</Label>
                <Input
                  id="search"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="ابحث عن المستخدم..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">الدور</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="merchant">تاجر</SelectItem>
                    <SelectItem value="admin">أدمن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddRole}>
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الأدوار</p>
              <h3 className="text-3xl font-bold">{stats.totalRoles}</h3>
            </div>
            <Shield className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-red-50/50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المسؤولين</p>
              <h3 className="text-3xl font-bold text-red-600">{stats.admins}</h3>
            </div>
            <Shield className="h-10 w-10 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-blue-50/50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">التجار</p>
              <h3 className="text-3xl font-bold text-blue-600">{stats.merchants}</h3>
            </div>
            <Store className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المستخدمين</p>
              <h3 className="text-3xl font-bold">{stats.users}</h3>
            </div>
            <Users className="h-10 w-10 text-gray-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Permissions Overview */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          الصلاحيات المتاحة للأدمن
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminPermissions.map((permission) => {
            const Icon = permission.icon;
            return (
              <Card key={permission.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{permission.name}</h3>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Users with Roles Table */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            المستخدمون والأدوار المعينة
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الجوال</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  لا توجد أدوار معينة
                </TableCell>
              </TableRow>
            ) : (
              userRoles.map((userRole) => (
                <TableRow key={userRole.id}>
                <TableCell className="font-medium">
                    {userRole.user_name || "غير محدد"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-muted-foreground">
                    {userRole.user_phone || "-"}
                  </TableCell>
                  <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(userRole.created_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(userRole.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Security Note */}
      <Card className="p-6 border-2 border-amber-200 bg-amber-50/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-amber-900">ملاحظات أمنية هامة</h3>
            <ul className="space-y-2 text-amber-800 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>صلاحيات الأدمن تمنح الوصول الكامل لجميع بيانات المنصة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>تأكد من منح الصلاحيات فقط للأشخاص الموثوقين</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>مراجعة الأدوار بشكل دوري للتأكد من عدم وجود صلاحيات غير ضرورية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>جميع العمليات يتم تسجيلها في سجل النظام (Logs)</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Roles;