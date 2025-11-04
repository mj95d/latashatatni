import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Store as StoreIcon,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  MoreVertical,
  Star,
  CheckCircle,
  XCircle,
  Building2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  logo_url: string;
  cover_url: string;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  created_at: string;
  city_id: string;
  category_id: string;
  owner_id: string;
  cities?: {
    name: string;
  };
  categories?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
}

const Stores = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    fetchStores();
    fetchCities();

    // Realtime: update list immediately when stores are added/updated/deleted
    const channel = supabase
      .channel('admin-stores-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stores' },
        (payload) => {
          console.log('Realtime stores change (admin):', payload);
          fetchStores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          cities (name),
          categories (name),
          profiles (full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Generate signed URLs for private bucket objects
      const withSigned = await Promise.all(
        (data || []).map(async (s: any) => {
          if (s.logo_url && !s.logo_url.startsWith('http')) {
            const { data: signed } = await supabase.storage
              .from('store-documents')
              .createSignedUrl(s.logo_url, 60 * 60); // 1 hour
            return { ...s, logo_url: signed?.signedUrl || s.logo_url };
          }
          // handle legacy publicUrl saved from private bucket
          if (s.logo_url && s.logo_url.includes('/object/public/store-documents/')) {
            const path = s.logo_url.split('/object/public/store-documents/')[1];
            const { data: signed } = await supabase.storage
              .from('store-documents')
              .createSignedUrl(path, 60 * 60);
            return { ...s, logo_url: signed?.signedUrl || s.logo_url };
          }
          return s;
        })
      );

      setStores(withSigned as any);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المتاجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await supabase
        .from("cities")
        .select("id, name")
        .order("name");
      
      setCities(data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleToggleActive = async (storeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("stores")
        .update({ is_active: !currentStatus })
        .eq("id", storeId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: !currentStatus ? "تم تفعيل المتجر بنجاح" : "تم إخفاء المتجر",
      });

      fetchStores();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المتجر؟ سيتم حذف جميع بياناته نهائياً.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("stores")
        .delete()
        .eq("id", storeId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المتجر بنجاح",
      });

      fetchStores();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (store: Store) => {
    setSelectedStore(store);
    setShowDetailsDialog(true);
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && store.is_active) ||
      (filterStatus === "inactive" && !store.is_active);

    const matchesCity =
      filterCity === "all" || store.city_id === filterCity;

    return matchesSearch && matchesStatus && matchesCity;
  });

  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.is_active).length,
    inactive: stores.filter((s) => !s.is_active).length,
    highRated: stores.filter((s) => s.rating >= 4).length,
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
            <StoreIcon className="w-8 h-8 text-primary" />
            إدارة المتاجر
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض وإدارة جميع المتاجر المسجلة على المنصة
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي المتاجر</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
            <StoreIcon className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-green-50/50 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المتاجر النشطة</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.active}</h3>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-red-50/50 border-red-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المتاجر المخفية</p>
              <h3 className="text-3xl font-bold text-red-600">{stats.inactive}</h3>
            </div>
            <XCircle className="h-10 w-10 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-amber-50/50 border-amber-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">تقييم عالي (4+)</p>
              <h3 className="text-3xl font-bold text-amber-600">{stats.highRated}</h3>
            </div>
            <Star className="h-10 w-10 text-amber-500 opacity-50" />
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
              placeholder="ابحث عن متجر بالاسم أو الوصف..."
              className="pr-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المتاجر</SelectItem>
              <SelectItem value="active">نشطة فقط</SelectItem>
              <SelectItem value="inactive">مخفية فقط</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-full md:w-[200px]">
              <MapPin className="w-4 h-4 ml-2" />
              <SelectValue placeholder="المدينة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stores Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المتجر</TableHead>
              <TableHead>المالك</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>التقييم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            ) : (
              filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={store.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {store.phone || "لا يوجد رقم"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{store.profiles?.full_name || "غير محدد"}</TableCell>
                  <TableCell>{store.cities?.name || "-"}</TableCell>
                  <TableCell>{store.categories?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{store.rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-xs text-muted-foreground">
                        ({store.reviews_count || 0})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {store.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        نشط
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">
                        مخفي
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(store.created_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(store)}>
                          <Eye className="w-4 h-4 ml-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(store.id, store.is_active)}
                        >
                          {store.is_active ? (
                            <>
                              <EyeOff className="w-4 h-4 ml-2" />
                              إخفاء المتجر
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 ml-2" />
                              تفعيل المتجر
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteStore(store.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف المتجر
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

      {/* Store Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المتجر</DialogTitle>
            <DialogDescription>معلومات كاملة عن المتجر</DialogDescription>
          </DialogHeader>

          {selectedStore && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {selectedStore.logo_url && (
                  <img
                    src={selectedStore.logo_url}
                    alt={selectedStore.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold">{selectedStore.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedStore.description || "لا يوجد وصف"}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedStore.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span dir="ltr">{selectedStore.phone}</span>
                  </div>
                )}
                {selectedStore.whatsapp && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span dir="ltr">{selectedStore.whatsapp}</span>
                  </div>
                )}
                {selectedStore.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStore.email}</span>
                  </div>
                )}
                {selectedStore.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={selectedStore.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedStore.website}
                    </a>
                  </div>
                )}
                {selectedStore.address && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStore.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stores;
