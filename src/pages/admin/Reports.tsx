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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Store,
  Tag,
  ShoppingCart,
  Calendar,
  Loader2,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalOffers: number;
  totalOrders: number;
  activeSubscriptions: number;
  pendingRequests: number;
  chartData?: any[];
  storesByCity?: any[];
  ordersTimeline?: any[];
}

const Reports = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalStores: 0,
    totalOffers: 0,
    totalOrders: 0,
    activeSubscriptions: 0,
    pendingRequests: 0,
    chartData: [],
    storesByCity: [],
    ordersTimeline: [],
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // جلب إحصائيات المستخدمين
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // جلب إحصائيات المتاجر
      const { count: storesCount } = await supabase
        .from("stores")
        .select("*", { count: "exact", head: true });

      // جلب إحصائيات العروض
      const { count: offersCount } = await supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // جلب إحصائيات الطلبات
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // جلب الاشتراكات النشطة
      const { count: subsCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // جلب طلبات التجار المعلقة
      const { count: requestsCount } = await supabase
        .from("merchant_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // جلب بيانات المتاجر حسب المدن للرسم البياني
      const { data: storesData } = await supabase
        .from("stores")
        .select("city_id, cities(name)")
        .eq("is_active", true);

      const cityStats = storesData?.reduce((acc: any, store: any) => {
        const cityName = store.cities?.name || "غير محدد";
        acc[cityName] = (acc[cityName] || 0) + 1;
        return acc;
      }, {});

      const storesByCity = Object.entries(cityStats || {}).map(([name, value]) => ({
        name,
        value,
      }));

      // بيانات عامة للمخططات
      const chartData = [
        { name: "المستخدمين", value: usersCount || 0 },
        { name: "المتاجر", value: storesCount || 0 },
        { name: "العروض", value: offersCount || 0 },
        { name: "الطلبات", value: ordersCount || 0 },
      ];

      setStats({
        totalUsers: usersCount || 0,
        totalStores: storesCount || 0,
        totalOffers: offersCount || 0,
        totalOrders: ordersCount || 0,
        activeSubscriptions: subsCount || 0,
        pendingRequests: requestsCount || 0,
        chartData,
        storesByCity,
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الإحصائيات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
  }: {
    title: string;
    value: number;
    icon: any;
    description: string;
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString("ar-SA")}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">التقارير والإحصائيات</h2>
          <p className="text-muted-foreground mt-1">
            تقارير شاملة عن أداء المنصة
          </p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفترات</SelectItem>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="year">هذا العام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="stores">المتاجر</TabsTrigger>
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="إجمالي المستخدمين"
              value={stats.totalUsers}
              icon={Users}
              description="عدد المستخدمين المسجلين"
            />
            <StatCard
              title="إجمالي المتاجر"
              value={stats.totalStores}
              icon={Store}
              description="عدد المتاجر النشطة"
            />
            <StatCard
              title="العروض النشطة"
              value={stats.totalOffers}
              icon={Tag}
              description="عدد العروض الحالية"
            />
            <StatCard
              title="إجمالي الطلبات"
              value={stats.totalOrders}
              icon={ShoppingCart}
              description="جميع الطلبات المسجلة"
            />
            <StatCard
              title="الاشتراكات النشطة"
              value={stats.activeSubscriptions}
              icon={Calendar}
              description="اشتراكات مدفوعة فعالة"
            />
            <StatCard
              title="طلبات معلقة"
              value={stats.pendingRequests}
              icon={BarChart3}
              description="طلبات تجار بانتظار المراجعة"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>رسم بياني للأداء العام</CardTitle>
                <CardDescription>
                  مقارنة الإحصائيات الرئيسية للمنصة
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع المتاجر حسب المدن</CardTitle>
                <CardDescription>
                  عدد المتاجر النشطة في كل مدينة
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.storesByCity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {stats.storesByCity?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${(index * 45) % 360}, 70%, 50%)`}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل المستخدمين</CardTitle>
              <CardDescription>
                إحصائيات تفصيلية عن المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="إجمالي المستخدمين"
                  value={stats.totalUsers}
                  icon={Users}
                  description="جميع المستخدمين المسجلين"
                />
                <StatCard
                  title="طلبات التجار"
                  value={stats.pendingRequests}
                  icon={Store}
                  description="طلبات معلقة"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل المتاجر</CardTitle>
              <CardDescription>
                إحصائيات تفصيلية عن المتاجر والعروض
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="المتاجر النشطة"
                  value={stats.totalStores}
                  icon={Store}
                  description="متاجر مفعلة ونشطة"
                />
                <StatCard
                  title="العروض المتاحة"
                  value={stats.totalOffers}
                  icon={Tag}
                  description="عروض نشطة حالياً"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الإيرادات</CardTitle>
              <CardDescription>
                إحصائيات الاشتراكات والإيرادات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="الاشتراكات النشطة"
                  value={stats.activeSubscriptions}
                  icon={Calendar}
                  description="اشتراكات مدفوعة فعالة"
                />
                <StatCard
                  title="إجمالي الطلبات"
                  value={stats.totalOrders}
                  icon={ShoppingCart}
                  description="طلبات عبر المنصة"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-start gap-2" dir="rtl">
        <Button onClick={fetchStats} variant="outline">
          تحديث البيانات
        </Button>
        <Button>
          <FileDown className="ml-2 h-4 w-4" />
          تصدير التقرير (PDF)
        </Button>
      </div>
    </div>
  );
};

export default Reports;
