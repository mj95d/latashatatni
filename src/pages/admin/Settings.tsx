import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Shield,
  Globe,
  Database,
  Bell,
  Lock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string;
  is_public: boolean;
}

interface AdminPermission {
  id: string;
  admin_id: string;
  permission_key: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const Settings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchPermissions();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الإعدادات: " + error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data separately
      const permissionsWithProfiles = await Promise.all(
        (data || []).map(async (perm) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", perm.admin_id)
            .single();

          return {
            ...perm,
            profiles: profile,
          };
        })
      );

      setPermissions(permissionsWithProfiles as any);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الصلاحيات: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("app_settings")
        .update({ 
          setting_value: JSON.stringify(value),
          updated_by: currentUser.user?.id 
        })
        .eq("setting_key", key);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث الإعداد بنجاح",
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الإعداد: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePermission = async (
    id: string,
    field: "can_read" | "can_write" | "can_delete",
    value: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("admin_permissions")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث الصلاحية بنجاح",
      });

      fetchPermissions();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الصلاحية: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find((s) => s.setting_key === key);
    if (!setting) return "";
    
    try {
      return JSON.parse(setting.setting_value);
    } catch {
      return setting.setting_value;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">إعدادات النظام</h2>
        <p className="text-muted-foreground mt-1">
          إدارة شاملة لجميع إعدادات التطبيق والصلاحيات
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" />
            الصلاحيات
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-2">
            <Database className="h-4 w-4" />
            الحدود
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            الأمان
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                إعدادات أساسية للموقع والتطبيق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">اسم الموقع</Label>
                  <div className="flex gap-2">
                    <Input
                      id="site_name"
                      defaultValue={getSettingValue("site_name")}
                      onBlur={(e) => updateSetting("site_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description">وصف الموقع</Label>
                  <Input
                    id="site_description"
                    defaultValue={getSettingValue("site_description")}
                    onBlur={(e) => updateSetting("site_description", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">البريد الإلكتروني للتواصل</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    defaultValue={getSettingValue("contact_email")}
                    onBlur={(e) => updateSetting("contact_email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">رقم الهاتف للتواصل</Label>
                  <Input
                    id="contact_phone"
                    defaultValue={getSettingValue("contact_phone")}
                    onBlur={(e) => updateSetting("contact_phone", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                صلاحيات المشرفين
              </CardTitle>
              <CardDescription>
                إدارة صلاحيات الوصول للمشرفين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المشرف</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead className="text-center">قراءة</TableHead>
                    <TableHead className="text-center">كتابة</TableHead>
                    <TableHead className="text-center">حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        لا توجد صلاحيات محددة حالياً
                      </TableCell>
                    </TableRow>
                  ) : (
                    permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div className="font-medium">
                            {permission.profiles?.full_name || "غير محدد"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.permission_key}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.can_read}
                            onCheckedChange={(checked) =>
                              updatePermission(permission.id, "can_read", checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.can_write}
                            onCheckedChange={(checked) =>
                              updatePermission(permission.id, "can_write", checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.can_delete}
                            onCheckedChange={(checked) =>
                              updatePermission(permission.id, "can_delete", checked)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                حدود النظام
              </CardTitle>
              <CardDescription>
                تحديد الحدود القصوى للمستخدمين والتجار
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max_stores">الحد الأقصى للمتاجر لكل تاجر</Label>
                <Input
                  id="max_stores"
                  type="number"
                  min="1"
                  defaultValue={getSettingValue("max_stores_per_merchant")}
                  onBlur={(e) =>
                    updateSetting("max_stores_per_merchant", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_offers">الحد الأقصى للعروض لكل متجر</Label>
                <Input
                  id="max_offers"
                  type="number"
                  min="1"
                  defaultValue={getSettingValue("max_offers_per_store")}
                  onBlur={(e) =>
                    updateSetting("max_offers_per_store", parseInt(e.target.value))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                إعدادات الأمان
              </CardTitle>
              <CardDescription>
                التحكم في الأمان والصلاحيات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">وضع الصيانة</Label>
                  <p className="text-sm text-muted-foreground">
                    إيقاف الموقع مؤقتاً للصيانة
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={getSettingValue("maintenance_mode") === true}
                  onCheckedChange={(checked) =>
                    updateSetting("maintenance_mode", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration">السماح بالتسجيل</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للمستخدمين الجدد بالتسجيل
                  </p>
                </div>
                <Switch
                  id="registration"
                  checked={getSettingValue("allow_registration") === true}
                  onCheckedChange={(checked) =>
                    updateSetting("allow_registration", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
