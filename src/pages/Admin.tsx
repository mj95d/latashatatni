import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, MapPin, Tag, Building, Loader2, UserCheck, UserX, Clock, 
  Users, ShoppingBag, TrendingUp, AlertCircle, BarChart3, Settings 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [merchantRequests, setMerchantRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalOffers: 0,
    pendingRequests: 0,
    totalCities: 0,
    totalCategories: 0
  });

  // Cities form state
  const [cityForm, setCityForm] = useState({
    name: "",
    name_en: "",
    description: "",
    image_url: "",
    latitude: "",
    longitude: ""
  });

  // Categories form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    name_en: "",
    icon: ""
  });

  // Stores form state
  const [storeForm, setStoreForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    whatsapp: "",
    logo_url: "",
    cover_url: "",
    latitude: "",
    longitude: ""
  });

  // Offers form state
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    discount_text: "",
    discount_percentage: "",
    image_url: "",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    } else if (isAdmin) {
      fetchMerchantRequests();
      fetchStats();
    }
  }, [isAdmin, loading, navigate]);

  const fetchStats = async () => {
    try {
      const [users, stores, offers, cities, categories] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id", { count: "exact", head: true }),
        supabase.from("cities").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true })
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalStores: stores.count || 0,
        totalOffers: offers.count || 0,
        pendingRequests: merchantRequests.filter(r => r.status === "pending").length,
        totalCities: cities.count || 0,
        totalCategories: categories.count || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchMerchantRequests = async () => {
    try {
      setLoadingRequests(true);
      const { data, error } = await supabase
        .from("merchant_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMerchantRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب طلبات التجار",
        variant: "destructive"
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleMerchantRequest = async (requestId: string, userId: string, action: "approve" | "reject") => {
    try {
      setSubmitting(true);

      // تحديث حالة الطلب
      const { error: updateError } = await supabase
        .from("merchant_requests")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // إذا تمت الموافقة، إضافة دور التاجر
      if (action === "approve") {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "merchant"
          });

        if (roleError) throw roleError;
      }

      toast({
        title: action === "approve" ? "تمت الموافقة" : "تم الرفض",
        description: action === "approve" 
          ? "تمت الموافقة على الطلب بنجاح" 
          : "تم رفض الطلب"
      });

      fetchMerchantRequests();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء معالجة الطلب",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("cities").insert([{
        name: cityForm.name,
        name_en: cityForm.name_en,
        description: cityForm.description,
        image_url: cityForm.image_url,
        latitude: cityForm.latitude ? parseFloat(cityForm.latitude) : null,
        longitude: cityForm.longitude ? parseFloat(cityForm.longitude) : null
      }]);

      if (error) throw error;

      toast({
        title: "تم إضافة المدينة بنجاح",
        description: "تمت إضافة المدينة إلى قاعدة البيانات"
      });

      setCityForm({ name: "", name_en: "", description: "", image_url: "", latitude: "", longitude: "" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المدينة",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("categories").insert([{
        name: categoryForm.name,
        name_en: categoryForm.name_en,
        icon: categoryForm.icon
      }]);

      if (error) throw error;

      toast({
        title: "تم إضافة التصنيف بنجاح",
        description: "تمت إضافة التصنيف إلى قاعدة البيانات"
      });

      setCategoryForm({ name: "", name_en: "", icon: "" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التصنيف",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
              <Settings className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
              لوحة تحكم الأدمن
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              إدارة شاملة للمنصة
            </p>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">المستخدمين</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Store className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStores}</p>
                  <p className="text-sm text-muted-foreground">المتاجر</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalOffers}</p>
                  <p className="text-sm text-muted-foreground">العروض</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                  <p className="text-sm text-muted-foreground">طلبات معلقة</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCities}</p>
                  <p className="text-sm text-muted-foreground">المدن</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Tag className="w-7 h-7 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCategories}</p>
                  <p className="text-sm text-muted-foreground">التصنيفات</p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8 h-auto flex-wrap">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="merchants" className="gap-2">
                <Store className="w-4 h-4" />
                طلبات التجار
                {stats.pendingRequests > 0 && (
                  <Badge variant="destructive" className="mr-1">{stats.pendingRequests}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="cities" className="gap-2">
                <MapPin className="w-4 h-4" />
                المدن
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Tag className="w-4 h-4" />
                التصنيفات
              </TabsTrigger>
              <TabsTrigger value="stores" className="gap-2">
                <Store className="w-4 h-4" />
                المتاجر
              </TabsTrigger>
              <TabsTrigger value="offers" className="gap-2">
                <Building className="w-4 h-4" />
                العروض
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-2">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    النشاط الأخير
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">طلبات تجار جديدة</span>
                      <Badge>{merchantRequests.filter(r => r.status === "pending").length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">إجمالي التجار النشطين</span>
                      <Badge variant="secondary">{merchantRequests.filter(r => r.status === "approved").length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">المتاجر المفعلة</span>
                      <Badge variant="outline">{stats.totalStores}</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-2">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    إجراءات مطلوبة
                  </h3>
                  <div className="space-y-3">
                    {stats.pendingRequests > 0 ? (
                      <div className="p-4 bg-amber-50/50 border-2 border-amber-200 rounded-lg">
                        <p className="font-semibold text-amber-900 mb-2">
                          {stats.pendingRequests} طلب تاجر بانتظار المراجعة
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            const merchantsTab = document.querySelector('[value="merchants"]') as HTMLElement;
                            merchantsTab?.click();
                          }}
                        >
                          مراجعة الطلبات
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>لا توجد إجراءات مطلوبة حالياً</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="merchants">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">طلبات التجار</h2>
                
                {loadingRequests ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : merchantRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Store className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>لا توجد طلبات جديدة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {merchantRequests.map((request) => (
                      <Card key={request.id} className="p-6 border-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold">{request.business_name}</h3>
                              {request.status === "pending" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                                  <Clock className="w-4 h-4" />
                                  قيد المراجعة
                                </span>
                              )}
                              {request.status === "approved" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                  <UserCheck className="w-4 h-4" />
                                  تمت الموافقة
                                </span>
                              )}
                              {request.status === "rejected" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                  <UserX className="w-4 h-4" />
                                  مرفوض
                                </span>
                              )}
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                              <div>
                                <span className="font-semibold">الهاتف:</span> {request.phone}
                              </div>
                              {request.city && (
                                <div>
                                  <span className="font-semibold">المدينة:</span> {request.city}
                                </div>
                              )}
                            </div>
                            
                            {request.business_description && (
                              <p className="text-muted-foreground">{request.business_description}</p>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              تاريخ التقديم: {new Date(request.created_at).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                          
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleMerchantRequest(request.id, request.user_id, "approve")}
                                disabled={submitting}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <UserCheck className="w-4 h-4 ml-1" />
                                موافقة
                              </Button>
                              <Button
                                onClick={() => handleMerchantRequest(request.id, request.user_id, "reject")}
                                disabled={submitting}
                                size="sm"
                                variant="destructive"
                              >
                                <UserX className="w-4 h-4 ml-1" />
                                رفض
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="cities">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">إضافة مدينة جديدة</h2>
                <form onSubmit={handleAddCity} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city-name">اسم المدينة (بالعربية)</Label>
                      <Input
                        id="city-name"
                        value={cityForm.name}
                        onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city-name-en">اسم المدينة (بالإنجليزية)</Label>
                      <Input
                        id="city-name-en"
                        value={cityForm.name_en}
                        onChange={(e) => setCityForm({ ...cityForm, name_en: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city-description">الوصف</Label>
                    <Textarea
                      id="city-description"
                      value={cityForm.description}
                      onChange={(e) => setCityForm({ ...cityForm, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city-image">رابط الصورة</Label>
                    <Input
                      id="city-image"
                      type="url"
                      value={cityForm.image_url}
                      onChange={(e) => setCityForm({ ...cityForm, image_url: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city-lat">خط العرض</Label>
                      <Input
                        id="city-lat"
                        type="number"
                        step="any"
                        value={cityForm.latitude}
                        onChange={(e) => setCityForm({ ...cityForm, latitude: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city-lng">خط الطول</Label>
                      <Input
                        id="city-lng"
                        type="number"
                        step="any"
                        value={cityForm.longitude}
                        onChange={(e) => setCityForm({ ...cityForm, longitude: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    إضافة المدينة
                  </Button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">إضافة تصنيف جديد</h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cat-name">اسم التصنيف (بالعربية)</Label>
                      <Input
                        id="cat-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cat-name-en">اسم التصنيف (بالإنجليزية)</Label>
                      <Input
                        id="cat-name-en"
                        value={categoryForm.name_en}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cat-icon">الأيقونة (اسم من Lucide Icons)</Label>
                    <Input
                      id="cat-icon"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      placeholder="مثال: Store, ShoppingBag, Coffee"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    إضافة التصنيف
                  </Button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="stores">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">قريباً: إدارة المتاجر</h2>
                <p className="text-muted-foreground">
                  ستتمكن قريباً من إضافة وتعديل المتاجر من هنا
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="offers">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">قريباً: إدارة العروض</h2>
                <p className="text-muted-foreground">
                  ستتمكن قريباً من إضافة وتعديل العروض من هنا
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
