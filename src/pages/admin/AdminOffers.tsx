import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Tag,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Store,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  discount_text: string;
  image_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  store_id: string;
  stores?: {
    name: string;
  };
}

const AdminOffers = () => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStore, setFilterStore] = useState<string>("all");
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetchOffers();
    fetchStores();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          stores (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل العروض",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const { data } = await supabase
        .from("stores")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      
      setStores(data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleToggleActive = async (offerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("offers")
        .update({ is_active: !currentStatus })
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: !currentStatus ? "تم تفعيل العرض بنجاح" : "تم إيقاف العرض",
      });

      fetchOffers();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف العرض بنجاح",
      });

      fetchOffers();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    }
  };

  const isOfferExpired = (endDate: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && offer.is_active && !isOfferExpired(offer.end_date)) ||
      (filterStatus === "inactive" && !offer.is_active) ||
      (filterStatus === "expired" && isOfferExpired(offer.end_date));

    const matchesStore =
      filterStore === "all" || offer.store_id === filterStore;

    return matchesSearch && matchesStatus && matchesStore;
  });

  const stats = {
    total: offers.length,
    active: offers.filter((o) => o.is_active && !isOfferExpired(o.end_date)).length,
    inactive: offers.filter((o) => !o.is_active).length,
    expired: offers.filter((o) => isOfferExpired(o.end_date)).length,
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Tag className="w-8 h-8 text-primary" />
            إدارة العروض
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض وإدارة جميع العروض والخصومات على المنصة
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي العروض</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
            <Tag className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-green-50/50 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">عروض نشطة</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.active}</h3>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-red-50/50 border-red-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">عروض موقوفة</p>
              <h3 className="text-3xl font-bold text-red-600">{stats.inactive}</h3>
            </div>
            <XCircle className="h-10 w-10 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-amber-50/50 border-amber-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">عروض منتهية</p>
              <h3 className="text-3xl font-bold text-amber-600">{stats.expired}</h3>
            </div>
            <Clock className="h-10 w-10 text-amber-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عرض..."
              className="pr-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع العروض</SelectItem>
              <SelectItem value="active">نشطة فقط</SelectItem>
              <SelectItem value="inactive">موقوفة</SelectItem>
              <SelectItem value="expired">منتهية</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Store className="w-4 h-4 ml-2" />
              <SelectValue placeholder="المتجر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المتاجر</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Offers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العرض</TableHead>
              <TableHead>المتجر</TableHead>
              <TableHead>الخصم</TableHead>
              <TableHead>تاريخ البداية</TableHead>
              <TableHead>تاريخ الانتهاء</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {offer.image_url && (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{offer.title}</div>
                        {offer.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {offer.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{offer.stores?.name || "غير محدد"}</TableCell>
                  <TableCell>
                    {offer.discount_percentage ? (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-300 gap-1">
                        <Percent className="w-3 h-3" />
                        {offer.discount_percentage}%
                      </Badge>
                    ) : (
                      <span className="text-sm">{offer.discount_text || "-"}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {offer.start_date
                      ? new Date(offer.start_date).toLocaleDateString("ar-SA")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {offer.end_date
                      ? new Date(offer.end_date).toLocaleDateString("ar-SA")
                      : "مفتوح"}
                  </TableCell>
                  <TableCell>
                    {isOfferExpired(offer.end_date) ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
                        منتهي
                      </Badge>
                    ) : offer.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        نشط
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">
                        موقوف
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!isOfferExpired(offer.end_date) && (
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(offer.id, offer.is_active)}
                          >
                            {offer.is_active ? (
                              <>
                                <EyeOff className="w-4 h-4 ml-2" />
                                إيقاف العرض
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 ml-2" />
                                تفعيل العرض
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف العرض
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default AdminOffers;
