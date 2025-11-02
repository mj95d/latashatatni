import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  Package,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  channel: string;
  status: string;
  is_demo: boolean;
  items: any;
  notes: string;
  created_at: string;
  stores?: {
    name: string;
  };
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDemo, setFilterDemo] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from("orders")
        .select(`
          *,
          stores (
            name
          )
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: { label: "جديد", variant: "default" as const, icon: Clock },
      CONFIRMED: { label: "مؤكد", variant: "secondary" as const, icon: CheckCircle },
      COMPLETED: { label: "مكتمل", variant: "default" as const, icon: Package },
      CANCELLED: { label: "ملغي", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NEW;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    if (filterDemo === "demo" && !order.is_demo) return false;
    if (filterDemo === "real" && order.is_demo) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    demo: orders.filter((o) => o.is_demo).length,
    real: orders.filter((o) => !o.is_demo).length,
    new: orders.filter((o) => o.status === "NEW").length,
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-1">
            عرض وإدارة جميع الطلبات على المنصة
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الطلبات</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
            <ShoppingCart className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">طلبات فعلية</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.real}</h3>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-amber-50/50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">طلبات تجريبية</p>
              <h3 className="text-3xl font-bold text-amber-600">{stats.demo}</h3>
            </div>
            <Package className="h-10 w-10 text-amber-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">قيد الانتظار</p>
              <h3 className="text-3xl font-bold">{stats.new}</h3>
            </div>
            <Clock className="h-10 w-10 text-orange-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">تصفية:</span>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="حالة الطلب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="NEW">جديد</SelectItem>
              <SelectItem value="CONFIRMED">مؤكد</SelectItem>
              <SelectItem value="COMPLETED">مكتمل</SelectItem>
              <SelectItem value="CANCELLED">ملغي</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDemo} onValueChange={setFilterDemo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="نوع الطلب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الطلبات</SelectItem>
              <SelectItem value="real">طلبات فعلية فقط</SelectItem>
              <SelectItem value="demo">طلبات تجريبية فقط</SelectItem>
            </SelectContent>
          </Select>

          {(filterStatus !== "all" || filterDemo !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus("all");
                setFilterDemo("all");
              }}
            >
              إعادة تعيين
            </Button>
          )}
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>اسم العميل</TableHead>
              <TableHead>المتجر</TableHead>
              <TableHead>القناة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div>{order.customer_name}</div>
                      <div className="text-sm text-muted-foreground" dir="ltr">
                        {order.customer_phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.stores?.name || "غير محدد"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.channel === "web-form" ? "نموذج" : "واتساب"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {order.is_demo ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
                        Demo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                        فعلي
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      عرض التفاصيل
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;