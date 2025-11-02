import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  DollarSign,
  Store,
  MoreVertical,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number;
  is_active: boolean;
  images: any;
  created_at: string;
  store_id: string;
  stores?: {
    name: string;
  };
}

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStore, setFilterStore] = useState<string>("all");
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stores (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المنتجات",
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

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: !currentStatus ? "تم تفعيل المنتج بنجاح" : "تم إخفاء المنتج",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && product.is_active) ||
      (filterStatus === "inactive" && !product.is_active);

    const matchesStore =
      filterStore === "all" || product.store_id === filterStore;

    return matchesSearch && matchesStatus && matchesStore;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    inactive: products.filter((p) => !p.is_active).length,
    onSale: products.filter((p) => p.old_price && p.old_price > p.price).length,
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
            <Package className="w-8 h-8 text-primary" />
            إدارة المنتجات
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض وإدارة جميع المنتجات على المنصة
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي المنتجات</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
            <Package className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-green-50/50 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">منتجات نشطة</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.active}</h3>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-red-50/50 border-red-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">منتجات مخفية</p>
              <h3 className="text-3xl font-bold text-red-600">{stats.inactive}</h3>
            </div>
            <XCircle className="h-10 w-10 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-orange-50/50 border-orange-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">عروض خاصة</p>
              <h3 className="text-3xl font-bold text-orange-600">{stats.onSale}</h3>
            </div>
            <DollarSign className="h-10 w-10 text-orange-500 opacity-50" />
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
              placeholder="ابحث عن منتج بالاسم أو الوصف..."
              className="pr-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المنتجات</SelectItem>
              <SelectItem value="active">نشطة فقط</SelectItem>
              <SelectItem value="inactive">مخفية فقط</SelectItem>
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

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنتج</TableHead>
              <TableHead>المتجر</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>السعر القديم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.stores?.name || "غير محدد"}</TableCell>
                  <TableCell className="font-bold" dir="ltr">
                    {product.price?.toFixed(2)} ر.س
                  </TableCell>
                  <TableCell dir="ltr">
                    {product.old_price ? (
                      <span className="line-through text-muted-foreground">
                        {product.old_price.toFixed(2)} ر.س
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {product.is_active ? (
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
                    {new Date(product.created_at).toLocaleDateString("ar-SA", {
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
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                        >
                          {product.is_active ? (
                            <>
                              <EyeOff className="w-4 h-4 ml-2" />
                              إخفاء المنتج
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 ml-2" />
                              تفعيل المنتج
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف المنتج
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

export default Products;
