import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Schema للتحقق من صحة البيانات
const generalSettingsSchema = z.object({
  site_name: z.string().min(2, "اسم الموقع يجب أن يكون حرفين على الأقل").max(100, "اسم الموقع طويل جداً"),
  site_description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل").max(500, "الوصف طويل جداً"),
  contact_email: z.string().email("البريد الإلكتروني غير صحيح"),
  contact_phone: z.string().min(10, "رقم الهاتف غير صحيح").max(20, "رقم الهاتف طويل جداً"),
  support_email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  support_phone: z.string().optional(),
  facebook_url: z.string().url("رابط فيسبوك غير صحيح").optional().or(z.literal("")),
  twitter_url: z.string().url("رابط تويتر غير صحيح").optional().or(z.literal("")),
  instagram_url: z.string().url("رابط انستقرام غير صحيح").optional().or(z.literal("")),
});

const limitsSettingsSchema = z.object({
  max_stores_per_merchant: z.number().min(1).max(100),
  max_offers_per_store: z.number().min(1).max(100),
  max_products_per_store: z.number().min(1).max(1000),
  max_images_per_product: z.number().min(1).max(10),
});

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>;
type LimitsSettingsForm = z.infer<typeof limitsSettingsSchema>;

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string;
  is_public: boolean;
  updated_at: string;
  updated_by: string | null;
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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<{tab: string, data: any} | null>(null);
  const { toast } = useToast();

  // Forms
  const generalForm = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      site_name: "",
      site_description: "",
      contact_email: "",
      contact_phone: "",
      support_email: "",
      support_phone: "",
      facebook_url: "",
      twitter_url: "",
      instagram_url: "",
    },
  });

  const limitsForm = useForm<LimitsSettingsForm>({
    resolver: zodResolver(limitsSettingsSchema),
    defaultValues: {
      max_stores_per_merchant: 10,
      max_offers_per_store: 10,
      max_products_per_store: 100,
      max_images_per_product: 5,
    },
  });

  useEffect(() => {
    fetchSettings();
    fetchPermissions();
  }, []);

  // تحديث النماذج عند تحميل الإعدادات
  useEffect(() => {
    if (settings.length > 0) {
      // General Settings
      generalForm.reset({
        site_name: getSettingValue("site_name") || "",
        site_description: getSettingValue("site_description") || "",
        contact_email: getSettingValue("contact_email") || "",
        contact_phone: getSettingValue("contact_phone") || "",
        support_email: getSettingValue("support_email") || "",
        support_phone: getSettingValue("support_phone") || "",
        facebook_url: getSettingValue("facebook_url") || "",
        twitter_url: getSettingValue("twitter_url") || "",
        instagram_url: getSettingValue("instagram_url") || "",
      });

      // Limits Settings
      limitsForm.reset({
        max_stores_per_merchant: getSettingValue("max_stores_per_merchant") || 10,
        max_offers_per_store: getSettingValue("max_offers_per_store") || 10,
        max_products_per_store: getSettingValue("max_products_per_store") || 100,
        max_images_per_product: getSettingValue("max_images_per_product") || 5,
      });
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  // حفظ الإعدادات العامة
  const onSaveGeneralSettings = async (data: GeneralSettingsForm) => {
    setPendingSave({ tab: "general", data });
    setShowSaveDialog(true);
  };

  // حفظ إعدادات الحدود
  const onSaveLimitsSettings = async (data: LimitsSettingsForm) => {
    setPendingSave({ tab: "limits", data });
    setShowSaveDialog(true);
  };

  // تنفيذ الحفظ بعد التأكيد
  const executeSave = async () => {
    if (!pendingSave) return;

    try {
      setSaving(true);
      const { data: currentUser } = await supabase.auth.getUser();
      
      const updates: Array<{ key: string; value: any }> = [];

      if (pendingSave.tab === "general") {
        Object.entries(pendingSave.data).forEach(([key, value]) => {
          updates.push({ key, value });
        });
      } else if (pendingSave.tab === "limits") {
        Object.entries(pendingSave.data).forEach(([key, value]) => {
          updates.push({ key, value });
        });
      }

      // تحديث جميع الإعدادات
      for (const update of updates) {
        const { error } = await supabase
          .from("app_settings")
          .upsert({
            setting_key: update.key,
            setting_value: JSON.stringify(update.value),
            setting_type: typeof update.value,
            updated_by: currentUser.user?.id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "setting_key"
          });

        if (error) throw error;
      }

      toast({
        title: "✅ تم الحفظ بنجاح",
        description: `تم تحديث ${updates.length} إعداد بنجاح`,
      });

      await fetchSettings();
      setShowSaveDialog(false);
      setPendingSave(null);
    } catch (error: any) {
      toast({
        title: "❌ خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          setting_key: key,
          setting_value: JSON.stringify(value),
          setting_type: typeof value,
          updated_by: currentUser.user?.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "setting_key"
        });

      if (error) throw error;

      toast({
        title: "✅ تم الحفظ",
        description: "تم تحديث الإعداد بنجاح",
      });

      await fetchSettings();
    } catch (error: any) {
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل تحديث الإعداد",
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
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSaveGeneralSettings)} className="space-y-4">
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
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="site_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الموقع *</FormLabel>
                          <FormControl>
                            <Input placeholder="لا تشتتني" {...field} />
                          </FormControl>
                          <FormDescription>
                            الاسم الرسمي للموقع
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني للتواصل *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            البريد الرئيسي للتواصل
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={generalForm.control}
                    name="site_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الموقع *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="منصة تربط التجار بالعملاء" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          وصف مختصر يظهر في نتائج البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف للتواصل *</FormLabel>
                          <FormControl>
                            <Input placeholder="+966XXXXXXXXX" {...field} />
                          </FormControl>
                          <FormDescription>
                            رقم الواتساب/الجوال الرئيسي
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="support_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني للدعم الفني</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="support@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            البريد الخاص بالدعم الفني (اختياري)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={generalForm.control}
                    name="support_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الدعم الفني</FormLabel>
                        <FormControl>
                          <Input placeholder="+966XXXXXXXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          رقم الدعم الفني (اختياري)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">روابط التواصل الاجتماعي</h3>
                    <div className="grid gap-4">
                      <FormField
                        control={generalForm.control}
                        name="facebook_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط فيسبوك</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://facebook.com/yourpage" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="twitter_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط تويتر / X</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://twitter.com/yourhandle" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="instagram_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط انستقرام</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://instagram.com/yourhandle" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generalForm.reset()}
                      disabled={saving}
                    >
                      إلغاء التغييرات
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
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
          <Form {...limitsForm}>
            <form onSubmit={limitsForm.handleSubmit(onSaveLimitsSettings)} className="space-y-4">
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
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={limitsForm.control}
                      name="max_stores_per_merchant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأقصى للمتاجر لكل تاجر</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            عدد المتاجر التي يمكن لكل تاجر إنشاؤها
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={limitsForm.control}
                      name="max_offers_per_store"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأقصى للعروض لكل متجر</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            عدد العروض النشطة لكل متجر
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={limitsForm.control}
                      name="max_products_per_store"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأقصى للمنتجات لكل متجر</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="1000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            عدد المنتجات التي يمكن إضافتها لكل متجر
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={limitsForm.control}
                      name="max_images_per_product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأقصى للصور لكل منتج</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            عدد الصور المسموح بها لكل منتج
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => limitsForm.reset()}
                      disabled={saving}
                    >
                      إلغاء التغييرات
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
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

      {/* Dialog للتأكيد قبل الحفظ */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حفظ التغييرات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حفظ هذه التغييرات؟ سيتم تطبيقها على الموقع مباشرة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={executeSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "تأكيد الحفظ"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
