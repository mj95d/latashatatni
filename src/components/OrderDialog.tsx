import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingCart } from "lucide-react";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId?: string;
  storeName?: string;
  offerId?: string;
  offerTitle?: string;
}

export const OrderDialog = ({ 
  open, 
  onOpenChange, 
  storeId, 
  storeName,
  offerId,
  offerTitle 
}: OrderDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    notes: "",
    quantity: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = offerId ? [{ offerId, qty: formData.quantity }] : [];
      
      const { error } = await supabase
        .from("orders")
        .insert({
          store_id: storeId,
          items: items,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          notes: formData.notes,
          channel: "web-form",
          status: "NEW",
          is_demo: false
        });

      if (error) throw error;

      toast({
        title: "تم إرسال الطلب بنجاح! ✅",
        description: `تم إرسال طلبك إلى ${storeName || "المتجر"}. سيتم التواصل معك قريباً.`,
      });

      // Reset form
      setFormData({
        customer_name: "",
        customer_phone: "",
        notes: "",
        quantity: 1
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال الطلب",
        description: error.message || "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `مرحباً، أرغب بطلب ${offerTitle || "منتج"} من متجر ${storeName || ""}`;
    const phone = "966532402020"; // رقم واتساب المنصة الموحد
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-5 h-5 text-primary" />
            اطلب الآن
          </DialogTitle>
          <DialogDescription>
            {offerTitle && <span className="font-semibold text-foreground">{offerTitle}</span>}
            {storeName && <span className="block text-sm mt-1">من {storeName}</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">الاسم *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="أدخل اسمك"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">رقم الجوال *</Label>
            <Input
              id="customer_phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              placeholder="05XXXXXXXX"
              required
              className="h-11"
              dir="ltr"
            />
          </div>

          {offerId && (
            <div className="space-y-2">
              <Label htmlFor="quantity">الكمية</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات خاصة بالطلب..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 shadow-glow"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  إرسال الطلب
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleWhatsApp}
            >
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              طلب عبر واتساب
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};