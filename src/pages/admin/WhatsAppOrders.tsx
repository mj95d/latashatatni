import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Store, Tag, Calendar, User, Phone, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface WhatsAppOrder {
  id: string;
  store_id: string;
  offer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_message: string;
  source_page: string;
  status: string;
  created_at: string;
  stores: {
    name: string;
  } | null;
  offers: {
    title: string;
  } | null;
}

const WhatsAppOrders = () => {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("whatsapp_orders")
        .select(`
          *,
          stores (name),
          offers (title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      
      // حساب الإحصائيات
      const total = data?.length || 0;
      const pending = data?.filter(o => o.status === "pending").length || 0;
      const completed = data?.filter(o => o.status === "completed").length || 0;
      const cancelled = data?.filter(o => o.status === "cancelled").length || 0;
      
      setStats({ total, pending, completed, cancelled });
    } catch (error) {
      console.error("Error fetching whatsapp orders:", error);
      toast.error("حدث خطأ في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("تم تحديث حالة الطلب بنجاح");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("حدث خطأ في تحديث حالة الطلب");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 ml-1" />قيد الانتظار</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300"><CheckCircle className="w-3 h-3 ml-1" />مكتمل</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-300"><XCircle className="w-3 h-3 ml-1" />ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourcePageBadge = (source: string) => {
    const sourceMap: Record<string, string> = {
      "offer_page": "صفحة العرض",
      "store_page": "صفحة المتجر",
      "product_page": "صفحة المنتج",
      "offers_list": "قائمة العروض",
      "stores_list": "قائمة المتاجر",
    };
    return <Badge variant="secondary">{sourceMap[source] || source}</Badge>;
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
          إدارة ومتابعة جميع الطلبات الواردة عبر واتساب
        </p>
      </div>

      {/* إحصائيات */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملغي</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* جدول الطلبات */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المتجر</TableHead>
                    <TableHead>العرض</TableHead>
                    <TableHead>المصدر</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
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
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <span>{order.stores?.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <span>{order.offers?.title || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSourcePageBadge(order.source_page)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, "completed")}
                              >
                                إكمال
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                              >
                                إلغاء
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppOrders;
