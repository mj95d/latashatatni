import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, Phone, MapPin, Store, Tag, Calendar, Clock, 
  MessageSquare, CheckCircle, XCircle, AlertCircle, Truck, ShoppingBag
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppOrderDetailsDialogProps {
  order: {
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
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const WhatsAppOrderDetailsDialog = ({ 
  order, 
  open, 
  onOpenChange,
  onUpdate 
}: WhatsAppOrderDetailsDialogProps) => {
  const [status, setStatus] = useState<"NEW" | "IN_PROGRESS" | "DONE" | "CANCELED">(
    (order?.status as "NEW" | "IN_PROGRESS" | "DONE" | "CANCELED") || "NEW"
  );
  const [adminNotes, setAdminNotes] = useState(order?.admin_notes || "");
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handleUpdateStatus = async (newStatus: "NEW" | "IN_PROGRESS" | "DONE" | "CANCELED") => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("whatsapp_orders")
        .update({ 
          status: newStatus,
          admin_notes: adminNotes
        })
        .eq("id", order.id);

      if (error) throw error;

      setStatus(newStatus);
      toast.success("تم تحديث حالة الطلب بنجاح");
      onUpdate();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("حدث خطأ في تحديث الطلب");
    } finally {
      setLoading(false);
    }
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

  const handleContactCustomer = () => {
    if (order.customer_phone) {
      window.open(`tel:${order.customer_phone}`, '_self');
    } else {
      toast.error("لا يوجد رقم هاتف للعميل");
    }
  };

  const handleContactMerchant = () => {
    const phone = order.stores?.whatsapp || order.stores?.phone;
    if (phone) {
      const message = `مرحباً، بخصوص طلب واتساب رقم ${order.id.slice(0, 8)}...\nالعميل: ${order.customer_name || 'غير محدد'}\nالعرض: ${order.offers?.title || 'غير محدد'}`;
      window.open(buildWhatsAppLink(phone, message), '_blank');
    } else {
      toast.error("لا يوجد رقم تواصل للتاجر");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">تفاصيل الطلب</DialogTitle>
            {getStatusBadge(status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات العميل */}
          <div className="p-6 bg-card/50 rounded-xl border-2 border-border/50">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              معلومات العميل
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">الاسم:</span>
                <span className="font-semibold">{order.customer_name || "غير محدد"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">الهاتف:</span>
                <span className="font-semibold">{order.customer_phone || "غير محدد"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">الحي:</span>
                <span className="font-semibold">{order.neighborhood || "غير محدد"}</span>
              </div>
              <div className="flex items-center gap-2">
                {order.delivery_method === "delivery" ? (
                  <Truck className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">الاستلام:</span>
                <span className="font-semibold">
                  {order.delivery_method === "delivery" ? "توصيل" : 
                   order.delivery_method === "pickup" ? "استلام من المحل" : 
                   "غير محدد"}
                </span>
              </div>
            </div>
          </div>

          {/* معلومات المتجر والعرض/المنتج */}
          <div className="p-6 bg-card/50 rounded-xl border-2 border-border/50">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              معلومات المتجر والطلب
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">المتجر:</span>
                <span className="font-semibold">{order.stores?.name || "-"}</span>
                {order.stores?.cities?.name && (
                  <Badge variant="outline">{order.stores.cities.name}</Badge>
                )}
              </div>

              {/* عرض صور وتفاصيل المنتج */}
              {order.products && (
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex gap-4">
                    {order.products.images && Array.isArray(order.products.images) && order.products.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <img
                          src={typeof order.products.images[0] === 'string' ? order.products.images[0] : order.products.images[0]?.url}
                          alt={order.products.name}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">المنتج:</span>
                        <span className="font-semibold">{order.products.name}</span>
                      </div>
                      {order.products.price && (
                        <p className="text-lg font-bold text-primary">
                          {order.products.price} ريال
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* عرض صور وتفاصيل العرض */}
              {order.offers && (
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex gap-4">
                    {order.offers.images && Array.isArray(order.offers.images) && order.offers.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <img
                          src={order.offers.images.find((img: any) => img.is_primary)?.url || order.offers.images[0]?.url || order.offers.images[0]}
                          alt={order.offers.title}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">العرض:</span>
                        <span className="font-semibold">{order.offers.title}</span>
                      </div>
                      {order.offers.discount_text && (
                        <Badge className="bg-secondary">{order.offers.discount_text}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {order.stores?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-muted-foreground">العنوان:</span>
                  <span className="font-semibold">{order.stores.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* الرسالة الأصلية */}
          <div className="p-6 bg-card/50 rounded-xl border-2 border-border/50">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              الرسالة الأصلية
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm">
              {order.customer_message}
            </div>
          </div>

          {/* معلومات الطلب */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Calendar className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
              <p className="font-semibold">
                {format(new Date(order.created_at), "dd MMM yyyy - HH:mm", { locale: ar })}
              </p>
            </div>
            {order.completed_at && (
              <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-xs text-muted-foreground">تاريخ الإكمال</p>
                <p className="font-semibold">
                  {format(new Date(order.completed_at), "dd MMM yyyy - HH:mm", { locale: ar })}
                </p>
              </div>
            )}
            {order.response_time_minutes && (
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                <Clock className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-xs text-muted-foreground">وقت الاستجابة</p>
                <p className="font-semibold">
                  {Math.round(order.response_time_minutes)} دقيقة
                </p>
              </div>
            )}
          </div>

          {/* تغيير الحالة */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">إدارة الطلب</h3>
            <div className="grid md:grid-cols-4 gap-2">
              <Button
                variant={status === "NEW" ? "default" : "outline"}
                onClick={() => handleUpdateStatus("NEW")}
                disabled={loading}
                className="w-full"
              >
                <AlertCircle className="w-4 h-4 ml-1" />
                جديد
              </Button>
              <Button
                variant={status === "IN_PROGRESS" ? "default" : "outline"}
                onClick={() => handleUpdateStatus("IN_PROGRESS")}
                disabled={loading}
                className="w-full"
              >
                <Clock className="w-4 h-4 ml-1" />
                جارٍ التواصل
              </Button>
              <Button
                variant={status === "DONE" ? "default" : "outline"}
                onClick={() => handleUpdateStatus("DONE")}
                disabled={loading}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 ml-1" />
                مكتمل
              </Button>
              <Button
                variant={status === "CANCELED" ? "destructive" : "outline"}
                onClick={() => handleUpdateStatus("CANCELED")}
                disabled={loading}
                className="w-full"
              >
                <XCircle className="w-4 h-4 ml-1" />
                ملغي
              </Button>
            </div>
          </div>

          {/* ملاحظات الأدمن */}
          <div className="space-y-2">
            <label className="font-semibold text-sm">ملاحظات الأدمن</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="أضف ملاحظات حول الطلب..."
              rows={3}
            />
            <Button 
              onClick={() => handleUpdateStatus(status)}
              disabled={loading}
              className="w-full"
            >
              حفظ الملاحظات
            </Button>
          </div>

          {/* أزرار سريعة */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <Button
              onClick={handleContactCustomer}
              variant="outline"
              className="w-full"
              disabled={!order.customer_phone}
            >
              <Phone className="w-4 h-4 ml-1" />
              اتصل بالعميل
            </Button>
            <Button
              onClick={handleContactMerchant}
              variant="outline"
              className="w-full"
              disabled={!order.stores?.whatsapp && !order.stores?.phone}
            >
              <MessageSquare className="w-4 h-4 ml-1" />
              تواصل مع التاجر
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
