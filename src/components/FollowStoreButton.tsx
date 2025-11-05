import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FollowStoreButtonProps {
  storeId: string;
  storeName: string;
}

const FollowStoreButton = ({ storeId, storeName }: FollowStoreButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [storeId]);

  const checkFollowStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from('store_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('store_id', storeId)
        .maybeSingle();

      if (error) throw error;

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً', {
        description: 'سجل الدخول لمتابعة المتاجر والحصول على إشعارات بالعروض الجديدة'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('store_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('store_id', storeId);

        if (error) throw error;

        setIsFollowing(false);
        toast.success('تم إلغاء المتابعة', {
          description: `لن تصلك إشعارات من ${storeName} بعد الآن`
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('store_follows')
          .insert({
            user_id: user.id,
            store_id: storeId
          });

        if (error) throw error;

        setIsFollowing(true);
        toast.success('تمت المتابعة بنجاح! 🎉', {
          description: `سنرسل لك إشعارات بالعروض والمنتجات الجديدة من ${storeName}`
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error('حدث خطأ', {
        description: 'حاول مرة أخرى'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size="lg"
      onClick={handleFollowToggle}
      disabled={loading}
      className={`gap-2 border-2 transition-smooth ${
        isFollowing 
          ? 'bg-primary hover:bg-primary/90' 
          : 'hover:bg-primary/10 hover:border-primary/50'
      }`}
    >
      <Heart 
        className={`w-5 h-5 transition-smooth ${
          isFollowing ? 'fill-current' : ''
        }`} 
      />
      {isFollowing ? 'يتم المتابعة' : 'متابعة المتجر'}
    </Button>
  );
};

export default FollowStoreButton;
