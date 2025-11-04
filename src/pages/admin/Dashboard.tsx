import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Store, Tag, TrendingUp, AlertCircle, MapPin, Package, MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalOffers: 0,
    totalProducts: 0,
    pendingRequests: 0,
    totalCities: 0,
    totalCategories: 0,
    whatsappOrders: 0,
    newWhatsappOrders: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, stores, offers, products, cities, categories, requests, whatsappOrders] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("cities").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("merchant_requests").select("*", { count: "exact" }),
        supabase.from("whatsapp_orders").select("*")
      ]);

      const pendingCount = requests.data?.filter(r => r.status === "pending").length || 0;
      const newWhatsappCount = whatsappOrders.data?.filter(o => o.status === "NEW").length || 0;
      
      const completedOrders = whatsappOrders.data?.filter(o => o.response_time_minutes !== null) || [];
      const avgTime = completedOrders.length > 0
        ? completedOrders.reduce((sum, o) => sum + (o.response_time_minutes || 0), 0) / completedOrders.length
        : 0;

      setStats({
        totalUsers: users.count || 0,
        totalStores: stores.count || 0,
        totalOffers: offers.count || 0,
        totalProducts: products.count || 0,
        pendingRequests: pendingCount,
        totalCities: cities.count || 0,
        totalCategories: categories.count || 0,
        whatsappOrders: whatsappOrders.data?.length || 0,
        newWhatsappOrders: newWhatsappCount,
        avgResponseTime: Math.round(avgTime)
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    { title: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "إجمالي المتاجر", value: stats.totalStores, icon: Store, color: "text-green-500" },
    { title: "إجمالي العروض", value: stats.totalOffers, icon: Tag, color: "text-orange-500" },
    { title: "إجمالي المنتجات", value: stats.totalProducts, icon: Package, color: "text-purple-500" },
    { title: "طلبات الواتساب", value: stats.whatsappOrders, icon: MessageCircle, color: "text-cyan-500" },
    { title: "طلبات واتساب جديدة", value: stats.newWhatsappOrders, icon: AlertCircle, color: "text-yellow-500" },
    { title: "متوسط وقت الاستجابة", value: `${stats.avgResponseTime} د`, icon: Clock, color: "text-indigo-500" },
    { title: "طلبات التجار المعلقة", value: stats.pendingRequests, icon: AlertCircle, color: "text-red-500" },
    { title: "عدد المدن", value: stats.totalCities, icon: MapPin, color: "text-teal-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على المنصة</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-4 w-4" />
          نشط
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color} opacity-50`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">النشاط الأخير</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">مستخدم جديد</p>
                <p className="text-sm text-muted-foreground">منذ 5 دقائق</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">متجر جديد تم إضافته</p>
                <p className="text-sm text-muted-foreground">منذ 15 دقيقة</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">طلب تاجر جديد في الانتظار</p>
                <p className="text-sm text-muted-foreground">منذ ساعة</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
