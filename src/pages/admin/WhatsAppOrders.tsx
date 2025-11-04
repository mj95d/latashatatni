import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Store, Tag, Calendar, CheckCircle, Clock, XCircle, AlertCircle, Filter, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { WhatsAppOrderDetailsDialog } from "@/components/admin/WhatsAppOrderDetailsDialog";

interface WhatsAppOrder {
  id: string;
  store_id: string;
  offer_id: string | null;
  product_id?: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_message: string;
  neighborhood: string | null;
  delivery_method: string | null;
  source_page: string;
  status: string;
  admin_notes: string | null;
  response_time_minutes: number | null;
  created_at: string;
  completed_at: string | null;
  stores: {
    name: string;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    cities: {
      name: string;
    } | null;
  } | null;
  offers: {
    title: string;
    discount_text: string | null;
    images?: any;
  } | null;
  products?: {
    name: string;
    price: number | null;
    images?: any;
  } | null;
}

const WhatsAppOrders = () => {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WhatsAppOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WhatsAppOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
  
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    done: 0,
    canceled: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchCities();
    
    // Realtime subscription
    const channel = supabase
      .channel('whatsapp_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_orders'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchOrders(); // تحديث البيانات عند أي تغيير
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, cityFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("whatsapp_orders")
        .select(`
          *,
          stores (
            name,
            phone,
            whatsapp,
            address,
            cities (name)
          ),
          offers (title, discount_text, images),
          products (name, price, images)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching whatsapp orders:", error);
      toast.error("حدث خطأ في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("name")
        .order("name");

      if (error) throw error;

      setCities(data?.map(c => c.name) || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const calculateStats = (data: WhatsAppOrder[]) => {
    const total = data.length;
    const newOrders = data.filter(o => o.status === "NEW").length;
    const inProgress = data.filter(o => o.status === "IN_PROGRESS").length;
    const done = data.filter(o => o.status === "DONE").length;
    const canceled = data.filter(o => o.status === "CANCELED").length;
    
    const completedOrders = data.filter(o => o.response_time_minutes !== null);
    const avgResponseTime = completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + (o.response_time_minutes || 0), 0) / completedOrders.length
      : 0;

    setStats({
      total,
      new: newOrders,
      inProgress,
      done,
      canceled,
      avgResponseTime: Math.round(avgResponseTime),
    });
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter(o => o.stores?.cities?.name === cityFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-300"><AlertCircle className="w-3 h-3 ml-1" />جديد</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 ml-1" />جارٍ التواصل</Badge>;
      case "DONE":
        return <Badge className="bg-green-500/10 text-green-600 border-green-300"><CheckCircle className="w-3 h-3 ml-1" />مكتمل</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-300"><XCircle className="w-3 h-3 ml-1" />ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (order: WhatsAppOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">طلبات الواتساب</h1>
        <p className="text-muted-foreground mt-2">
          إدارة ومتابعة جميع الطلبات الواردة عبر واتساب مع تحديثات فورية
        </p>
      </div>

      {/* إحصائيات */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جديد</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جارٍ التواصل</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملغي</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الاستجابة</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">دقيقة</p>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            تصفية الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">حالة الطلب</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="NEW">جديد</SelectItem>
                  <SelectItem value="IN_PROGRESS">جارٍ التواصل</SelectItem>
                  <SelectItem value="DONE">مكتمل</SelectItem>
                  <SelectItem value="CANCELED">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">المدينة</label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setStatusFilter("all");
                  setCityFilter("all");
                }}
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول الطلبات */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات تطابق الفلاتر المحددة</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>المتجر</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>العرض</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(order.created_at), "dd MMM yyyy", { locale: ar })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name || "غير محدد"}</p>
                          {order.customer_phone && (
                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <span>{order.stores?.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.stores?.cities?.name && (
                          <Badge variant="outline">{order.stores.cities.name}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{order.offers?.title || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                        >
                          عرض التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <WhatsAppOrderDetailsDialog
        order={selectedOrder}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdate={fetchOrders}
      />
    </div>
  );
};

export default WhatsAppOrders;
