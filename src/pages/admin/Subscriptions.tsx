import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Eye, Clock, Building2 } from "lucide-react";

interface SubscriptionRequest {
  id: string;
  plan: string;
  duration: string;
  price: number;
  status: string;
  payment_proof_url: string | null;
  notes: string | null;
  created_at: string;
  merchant_id: string;
  store_id: string | null;
}

export default function Subscriptions() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_requests')
        .select(`
          *,
          profiles:merchant_id (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل طلبات الاشتراك",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, approved: boolean) => {
    setReviewing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error("Request not found");

      // Update subscription request
      const { error: updateError } = await supabase
        .from('subscription_requests')
        .update({
          status: approved ? 'approved' : 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (approved) {
        // Calculate expiry date
        const months = request.duration === '1-month' ? 1 
                     : request.duration === '3-months' ? 3 
                     : 12;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + months);

        // Find merchant's store
        const { data: stores, error: storesError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', request.merchant_id)
          .limit(1);

        if (storesError) throw storesError;

        if (stores && stores.length > 0) {
          // Update store plan
          const { error: storeError } = await supabase
            .from('stores')
            .update({
              plan: request.plan,
              plan_expires_at: expiryDate.toISOString(),
              product_limit: request.plan === 'free' ? 10 : 999999
            })
            .eq('id', stores[0].id);

          if (storeError) throw storeError;

          // Create active subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              store_id: stores[0].id,
              plan_type: request.plan,
              start_date: new Date().toISOString(),
              end_date: expiryDate.toISOString(),
              is_active: true,
              subscription_request_id: requestId
            });

          if (subError) throw subError;
        }
      }

      toast({
        title: approved ? "تم قبول الاشتراك" : "تم رفض الاشتراك",
        description: approved 
          ? "تم تفعيل الباقة للتاجر بنجاح" 
          : "تم رفض طلب الاشتراك"
      });

      setSelectedRequest(null);
      setNotes("");
      fetchRequests();
    } catch (error: any) {
      console.error("Error reviewing request:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في معالجة الطلب",
        variant: "destructive"
      });
    } finally {
      setReviewing(false);
    }
  };

  const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
      free: "الأساسي",
      premium: "المميز",
      business: "الأعمال"
    };
    return plans[plan] || plan;
  };

  const getDurationName = (duration: string) => {
    const durations: Record<string, string> = {
      "1-month": "شهر واحد",
      "3-months": "3 أشهر",
      "1-year": "سنة"
    };
    return durations[duration] || duration;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; variant: any }> = {
      pending_payment: { label: "بانتظار الدفع", variant: "secondary" },
      pending_review: { label: "بانتظار المراجعة", variant: "default" },
      approved: { label: "مقبول", variant: "default" },
      rejected: { label: "مرفوض", variant: "destructive" }
    };
    const statusInfo = statuses[status] || { label: status, variant: "secondary" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          طلبات الاشتراكات
        </h1>
        <p className="text-muted-foreground mt-1">
          إدارة ومراجعة طلبات اشتراكات التجار
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">الإجمالي</div>
          <div className="text-2xl font-bold">{requests.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">بانتظار المراجعة</div>
          <div className="text-2xl font-bold text-primary">
            {requests.filter(r => r.status === 'pending_review').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">مقبول</div>
          <div className="text-2xl font-bold text-green-600">
            {requests.filter(r => r.status === 'approved').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">مرفوض</div>
          <div className="text-2xl font-bold text-destructive">
            {requests.filter(r => r.status === 'rejected').length}
          </div>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الباقة</TableHead>
              <TableHead>المدة</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات اشتراك
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{getPlanName(request.plan)}</TableCell>
                  <TableCell>{getDurationName(request.duration)}</TableCell>
                  <TableCell>{request.price} ريال</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell className="text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>مراجعة طلب الاشتراك</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الباقة</Label>
                  <p className="font-semibold">{getPlanName(selectedRequest.plan)}</p>
                </div>
                <div>
                  <Label>المدة</Label>
                  <p className="font-semibold">{getDurationName(selectedRequest.duration)}</p>
                </div>
                <div>
                  <Label>المبلغ</Label>
                  <p className="font-semibold">{selectedRequest.price} ريال</p>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              {selectedRequest.payment_proof_url && (
                <div>
                  <Label>إثبات الدفع</Label>
                  <div className="mt-2 border rounded-lg p-2">
                    <img
                      src={selectedRequest.payment_proof_url}
                      alt="Payment Proof"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              {selectedRequest.status === 'pending_review' && (
                <>
                  <div>
                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أضف ملاحظات للتاجر..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReview(selectedRequest.id, true)}
                      disabled={reviewing}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 ml-2" />
                      قبول الاشتراك
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReview(selectedRequest.id, false)}
                      disabled={reviewing}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 ml-2" />
                      رفض الاشتراك
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.notes && (
                <div>
                  <Label>ملاحظات المراجعة</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}