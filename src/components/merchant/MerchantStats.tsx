import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Store, Package, Tag, TrendingUp, Eye, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MerchantStatsProps {
  userId: string;
}

interface Stats {
  totalStores: number;
  approvedStores: number;
  totalProducts: number;
  activeProducts: number;
  totalOffers: number;
  activeOffers: number;
}

export const MerchantStats = ({ userId }: MerchantStatsProps) => {
  const [stats, setStats] = useState<Stats>({
    totalStores: 0,
    approvedStores: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOffers: 0,
    activeOffers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get stores stats
      const { data: stores } = await supabase
        .from("stores")
        .select("id, approved, is_active")
        .eq("owner_id", userId);

      const totalStores = stores?.length || 0;
      const approvedStores = stores?.filter(s => s.approved).length || 0;

      // Get products stats
      const storeIds = stores?.map(s => s.id) || [];
      let totalProducts = 0;
      let activeProducts = 0;

      if (storeIds.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("id, is_active")
          .in("store_id", storeIds);

        totalProducts = products?.length || 0;
        activeProducts = products?.filter(p => p.is_active).length || 0;
      }

      // Get offers stats
      let totalOffers = 0;
      let activeOffers = 0;

      if (storeIds.length > 0) {
        const { data: offers } = await supabase
          .from("offers")
          .select("id, is_active")
          .in("store_id", storeIds);

        totalOffers = offers?.length || 0;
        activeOffers = offers?.filter(o => o.is_active).length || 0;
      }

      setStats({
        totalStores,
        approvedStores,
        totalProducts,
        activeProducts,
        totalOffers,
        activeOffers,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "إجمالي المتاجر",
      value: stats.totalStores,
      subtitle: `${stats.approvedStores} معتمد`,
      icon: Store,
      colorClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
      borderClass: "hover:border-blue-500/30",
      gradientClass: "from-blue-500/10 to-blue-500/5",
    },
    {
      title: "المنتجات",
      value: stats.totalProducts,
      subtitle: `${stats.activeProducts} نشط`,
      icon: Package,
      colorClass: "text-green-500",
      bgClass: "bg-green-500/10",
      borderClass: "hover:border-green-500/30",
      gradientClass: "from-green-500/10 to-green-500/5",
    },
    {
      title: "العروض",
      value: stats.totalOffers,
      subtitle: `${stats.activeOffers} نشط`,
      icon: Tag,
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
      borderClass: "hover:border-amber-500/30",
      gradientClass: "from-amber-500/10 to-amber-500/5",
    },
    {
      title: "إجمالي المشاهدات",
      value: "قريباً",
      subtitle: "تحليلات متقدمة",
      icon: TrendingUp,
      colorClass: "text-purple-500",
      bgClass: "bg-purple-500/10",
      borderClass: "hover:border-purple-500/30",
      gradientClass: "from-purple-500/10 to-purple-500/5",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`p-6 hover:shadow-xl transition-all duration-300 group border-2 ${stat.borderClass} bg-gradient-to-br ${stat.gradientClass}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`w-6 h-6 ${stat.colorClass}`} />
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.subtitle}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
