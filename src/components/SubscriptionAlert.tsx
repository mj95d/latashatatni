import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Store {
  id: string;
  plan: string;
  plan_expires_at: string | null;
}

export function SubscriptionAlert() {
  const [store, setStore] = useState<Store | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: stores, error } = await supabase
        .from('stores')
        .select('id, plan, plan_expires_at')
        .eq('owner_id', user.id)
        .limit(1);

      if (error) throw error;
      
      if (stores && stores.length > 0) {
        const merchantStore = stores[0];
        setStore(merchantStore);

        if (merchantStore.plan_expires_at && merchantStore.plan !== 'free') {
          const expiryDate = new Date(merchantStore.plan_expires_at);
          const today = new Date();
          const diffTime = expiryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setDaysLeft(diffDays);
          
          // Show alert if less than 7 days or expired
          if (diffDays <= 7) {
            setShowAlert(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  if (!showAlert || !store) return null;

  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  return (
    <div className="mb-6" dir="rtl">
      {isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>انتهى اشتراكك</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>انتهت صلاحية اشتراكك. تم تحويلك للباقة المجانية. جدد اشتراكك للاستمرار في الاستفادة من المميزات.</p>
            <Button asChild size="sm" className="w-fit">
              <Link to="/plans">جدد الاشتراك</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {isExpiringSoon && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>اشتراكك على وشك الانتهاء</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>
              اشتراكك سينتهي خلال {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"}. 
              جدد الآن للاستمرار في الاستفادة من جميع المميزات.
            </p>
            <Button asChild size="sm" className="w-fit">
              <Link to="/plans">جدد الآن</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}