import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX, Clock, Phone, MapPin, Building, Loader2 } from "lucide-react";

const MerchantRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("merchant_requests")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, userId: string, action: "approve" | "reject") => {
    try {
      setSubmitting(true);

      const { error: updateError } = await supabase
        .from("merchant_requests")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      if (action === "approve") {
        // Add merchant role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "merchant"
          });

        if (roleError && roleError.code !== '23505') throw roleError; // Ignore duplicate

        // Get the merchant request details to create the store
        const { data: requestData } = await supabase
          .from("merchant_requests")
          .select("*")
          .eq("id", requestId)
          .single();

        if (requestData) {
          // Create store with approved status
          const { error: storeError } = await supabase
            .from("stores")
            .insert({
              owner_id: userId,
              name: requestData.business_name,
              description: requestData.business_description,
              phone: requestData.phone,
              whatsapp: requestData.whatsapp,
              address: requestData.address,
              city: requestData.city,
              latitude: requestData.latitude,
              longitude: requestData.longitude,
              logo_url: requestData.logo_url,
              commercial_document: requestData.commercial_document,
              website: requestData.website,
              approved: true,  // Store is pre-approved
              is_active: true
            });

          if (storeError) throw storeError;
        }
      }

      toast({
        title: action === "approve" ? "تمت الموافقة" : "تم الرفض",
        description: action === "approve" 
          ? "تمت الموافقة على الطلب وإنشاء المتجر. يمكن للتاجر الآن إضافة المنتجات مباشرة." 
          : "تم رفض الطلب"
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "secondary", label: "قيد المراجعة", icon: Clock },
      approved: { variant: "default", label: "موافق عليه", icon: UserCheck },
      rejected: { variant: "destructive", label: "مرفوض", icon: UserX }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">طلبات التجار</h1>
        <p className="text-muted-foreground mt-1">مراجعة والموافقة على طلبات التجار الجدد</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center">
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">لا توجد طلبات</h3>
          <p className="text-muted-foreground">
            لا توجد طلبات تجار جديدة في الوقت الحالي
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{request.business_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      بواسطة: {request.profiles?.full_name || "غير محدد"}
                    </p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{request.phone}</span>
                </div>
                {request.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{request.city}</span>
                  </div>
                )}
              </div>

              {request.business_description && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{request.business_description}</p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRequest(request.id, request.user_id, "approve")}
                    disabled={submitting}
                    className="gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    موافقة
                  </Button>
                  <Button
                    onClick={() => handleRequest(request.id, request.user_id, "reject")}
                    disabled={submitting}
                    variant="destructive"
                    className="gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    رفض
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantRequests;
