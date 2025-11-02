import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Store as StoreIcon,
  Package, Tag, Clock, Activity, CheckCircle, XCircle, Ban
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsModal = ({ userId, open, onOpenChange }: UserDetailsModalProps) => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    stores: 0,
    offers: 0,
    orders: 0,
    products: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && open) {
      fetchUserDetails();
    }
  }, [userId, open]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);

      // جلب معلومات المستخدم
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // جلب الدور
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      // جلب إحصائيات المتاجر
      const { count: storesCount } = await supabase
        .from("stores")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", userId);

      // جلب إحصائيات العروض
      const { count: offersCount } = await supabase
        .from("offers")
        .select("id", { count: "exact", head: true })
        .eq("store_id", userId);

      // جلب إحصائيات المنتجات
      const { count: productsCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true });

      // جلب إحصائيات الطلبات
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true });

      // جلب آخر النشاطات
      const { data: activitiesData } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      setUser({
        ...profileData,
        user_roles: rolesData || []
      });

      setStats({
        stores: storesCount || 0,
        offers: offersCount || 0,
        orders: ordersCount || 0,
        products: productsCount || 0
      });

      setActivities(activitiesData || []);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const userRole = user.user_roles?.[0]?.role || "user";
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "فعّال", className: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
      suspended: { label: "موقوف", className: "bg-red-100 text-red-700 border-red-300", icon: Ban },
      disabled: { label: "مُعطّل", className: "bg-gray-100 text-gray-700 border-gray-300", icon: XCircle },
      locked: { label: "مقفل", className: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Ban },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "أدمن", className: "bg-red-100 text-red-700 border-red-300" },
      merchant: { label: "تاجر", className: "bg-blue-100 text-blue-700 border-blue-300" },
      user: { label: "مستخدم", className: "bg-gray-100 text-gray-700 border-gray-300" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            بروفايل المستخدم
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : (
          <div className="space-y-6">
            {/* معلومات أساسية */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{user.full_name || "غير محدد"}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getRoleBadge(userRole)}
                    {getStatusBadge(user.account_status || "active")}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium text-sm">{user.id || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">رقم الجوال</p>
                    <p className="font-medium text-sm" dir="ltr">{user.phone || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">المدينة</p>
                    <p className="font-medium text-sm">{user.city || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">تاريخ التسجيل</p>
                    <p className="font-medium text-sm">
                      {new Date(user.created_at).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>

                {user.last_login_at && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">آخر دخول</p>
                      <p className="font-medium text-sm">
                        {new Date(user.last_login_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                )}

                {user.last_login_device && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">الجهاز</p>
                      <p className="font-medium text-sm">{user.last_login_device}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* الإحصائيات */}
            <div>
              <h4 className="font-bold text-lg mb-3">الإحصائيات</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <StoreIcon className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{stats.stores}</p>
                    <p className="text-xs text-muted-foreground">المتاجر</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Tag className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-2xl font-bold">{stats.offers}</p>
                    <p className="text-xs text-muted-foreground">العروض</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Package className="w-8 h-8 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold">{stats.products}</p>
                    <p className="text-xs text-muted-foreground">المنتجات</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Shield className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{stats.orders}</p>
                    <p className="text-xs text-muted-foreground">الطلبات</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* آخر النشاطات */}
            {activities.length > 0 && (
              <div>
                <h4 className="font-bold text-lg mb-3">آخر النشاطات</h4>
                <Card className="p-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Activity className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.activity_type}</p>
                          {activity.activity_description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {activity.activity_description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.created_at).toLocaleString("ar-SA")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            <Separator />

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};