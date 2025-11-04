import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, Clock, CheckCircle, XCircle, Loader2, Upload, FileText, Globe, Phone, MapPin, Package, Tag, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { AddStoreDialog } from "@/components/AddStoreDialog";
import { SubscriptionAlert } from "@/components/SubscriptionAlert";
import { AddOfferDialog } from "@/components/AddOfferDialog";
import { ProductsManager } from "@/components/merchant/ProductsManager";
import { StoresGrid } from "@/components/merchant/StoresGrid";
import { MerchantStats } from "@/components/merchant/MerchantStats";
import MapPicker from "@/components/MapPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Merchant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role: userRole, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  const [showAddOfferDialog, setShowAddOfferDialog] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    phone: "",
    city: "",
    website: "",
    whatsapp: "",
    address: "",
    latitude: 24.7136 as number | "",
    longitude: 46.6753 as number | ""
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
    checkMerchantRequest();
    if (userRole === 'merchant') {
      fetchStores();
      fetchOffers();
    }
  }, [userRole]);

  const fetchStores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("No authenticated user found");
        return;
      }

      console.log("Fetching stores for user:", user.id);

      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          categories (
            name,
            icon
          ),
          cities (
            name
          )
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching stores:", error);
        toast({
          title: "خطأ في تحميل المتاجر",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched stores:", data);
      setStores(data || []);
      if (data && data.length > 0 && !selectedStoreId) {
        setSelectedStoreId(data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching stores:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في تحميل المتاجر",
        variant: "destructive",
      });
    }
  };

  const fetchOffers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("No authenticated user found");
        return;
      }

      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          stores!inner(
            id,
            name,
            owner_id,
            cities (name),
            categories (name)
          )
        `)
        .eq("stores.owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        toast({
          title: "خطأ في تحميل العروض",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setOffers(data || []);
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في تحميل العروض",
        variant: "destructive",
      });
    }
  };

  const checkMerchantRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("merchant_requests")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking request:", error);
        return;
      }

      if (data) {
        setRequestStatus(data.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "خطأ",
        description: "يرجى رفع صورة بصيغة JPG, PNG أو WEBP فقط",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "خطأ",
        description: "يرجى رفع ملف PDF أو صورة فقط",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setDocumentFile(file);
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data.path;
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let logoUrl = "";
      let documentUrl = "";

      // Upload logo if provided
      if (logoFile) {
        const timestamp = Date.now();
        const safeFileName = logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const logoPath = `merchant-requests/${user.id}/logo_${timestamp}_${safeFileName}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('store-documents')
          .upload(logoPath, logoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          throw new Error("فشل رفع الشعار: " + uploadError.message);
        }
        
        logoUrl = logoPath;
      }

      // Upload document if provided
      if (documentFile) {
        const timestamp = Date.now();
        const safeFileName = documentFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const docPath = `merchant-requests/${user.id}/document_${timestamp}_${safeFileName}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('store-documents')
          .upload(docPath, documentFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Document upload error:", uploadError);
          throw new Error("فشل رفع الوثيقة: " + uploadError.message);
        }
        
        documentUrl = docPath;
      }

      const insertData = {
        user_id: user.id,
        business_name: formData.business_name,
        business_description: formData.business_description,
        phone: formData.phone,
        city: formData.city,
        website: formData.website || null,
        whatsapp: formData.whatsapp || null,
        address: formData.address || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        logo_url: logoUrl || null,
        commercial_document: documentUrl || null
      };

      console.log("Inserting merchant request:", insertData);

      const { error } = await supabase
        .from("merchant_requests")
        .insert([insertData]);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم مراجعة طلبك والرد عليك قريباً",
      });

      setRequestStatus("pending");
      setFormData({
        business_name: "",
        business_description: "",
        phone: "",
        city: "",
        website: "",
        whatsapp: "",
        address: "",
        latitude: 24.7136,
        longitude: 46.6753
      });
      setLogoFile(null);
      setLogoPreview("");
      setDocumentFile(null);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // إذا كان تاجر بالفعل، يتم توجيهه للوحة التحكم الخاصة به
  if (userRole === "merchant" || userRole === "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
          {/* Subscription Alert */}
          <SubscriptionAlert />
          
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4 shadow-xl">
              <Store className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
              لوحة تحكم التاجر
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              إدارة متاجرك ومنتجاتك وعروضك بكل سهولة واحترافية
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-12">
            {currentUserId && <MerchantStats userId={currentUserId} />}
          </div>

          <Tabs defaultValue="stores" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-4 h-auto mb-8 bg-card/80 backdrop-blur-sm p-2 rounded-2xl border-2 shadow-lg">
              <TabsTrigger 
                value="stores" 
                className="flex flex-col gap-2 h-auto py-4 text-base font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105"
              >
                <Store className="w-6 h-6" />
                <div className="flex flex-col items-center">
                  <span>متاجري</span>
                  <span className="text-xs opacity-80">({stores.length})</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex flex-col gap-2 h-auto py-4 text-base font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105"
              >
                <Package className="w-6 h-6" />
                <span>منتجاتي</span>
              </TabsTrigger>
              <TabsTrigger 
                value="offers" 
                className="flex flex-col gap-2 h-auto py-4 text-base font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105"
              >
                <Tag className="w-6 h-6" />
                <div className="flex flex-col items-center">
                  <span>عروضي</span>
                  <span className="text-xs opacity-80">({offers.length})</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex flex-col gap-2 h-auto py-4 text-base font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105"
              >
                <TrendingUp className="w-6 h-6" />
                <span>الإحصائيات</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stores" className="mt-8">
              <Card className="p-8 border-2">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">متاجرك</h3>
                    <p className="text-muted-foreground">
                      {stores.length} {stores.length === 1 ? 'متجر' : 'متاجر'}
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="shadow-lg hover:shadow-xl transition-all gap-2"
                    onClick={() => setShowAddStoreDialog(true)}
                  >
                    <Store className="w-4 h-4" />
                    إضافة متجر جديد
                  </Button>
                </div>
                
                <StoresGrid 
                  stores={stores} 
                  onStoreSelect={(storeId) => {
                    setSelectedStoreId(storeId);
                    // Switch to products tab
                    const productsTab = document.querySelector('[value="products"]') as HTMLElement;
                    productsTab?.click();
                  }}
                />
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-8">
              <Card className="p-8 border-2">
                {stores.length === 0 ? (
                  <div className="text-center py-16">
                    <Store className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                    <h4 className="text-xl font-semibold mb-3">أضف متجراً أولاً</h4>
                    <p className="text-muted-foreground mb-6">
                      يجب إضافة متجر قبل إضافة المنتجات
                    </p>
                    <Button onClick={() => setShowAddStoreDialog(true)} size="lg">
                      <Store className="w-4 h-4 ml-2" />
                      إضافة متجر
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Store Selector */}
                    <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-primary" />
                        <span className="font-semibold">اختر المتجر:</span>
                      </div>
                      <Select
                        value={selectedStoreId || stores[0]?.id}
                        onValueChange={(value) => setSelectedStoreId(value)}
                      >
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="اختر متجر" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4" />
                                {store.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Products Manager */}
                    <ProductsManager storeId={selectedStoreId || stores[0]?.id} />
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="mt-8">
              <Card className="p-8 border-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">عروضك</h3>
                  <Button 
                    size="lg" 
                    className="shadow-glow"
                    onClick={() => {
                      if (stores.length === 0) {
                        toast({
                          title: "تنبيه",
                          description: "يجب إضافة متجر أولاً قبل إضافة عروض",
                          variant: "destructive",
                        });
                        return;
                      }
                      setShowAddOfferDialog(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    إضافة عرض جديد
                  </Button>
                </div>
                
                {offers.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                    <h4 className="text-xl font-semibold mb-3">لا توجد عروض حالياً</h4>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      أضف عروضك الحصرية واجذب المزيد من العملاء
                    </p>
                    <Button onClick={() => navigate("/offers")} variant="outline" size="lg">
                      تصفح العروض
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                      <Card key={offer.id} className="overflow-hidden">
                        <div className="relative h-48">
                          <img
                            src={
                              (offer.images && offer.images.length > 0 
                                ? offer.images.find((img: any) => img.is_primary)?.url || offer.images[0].url
                                : offer.image_url) || 
                              'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop'
                            }
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-lg mb-2 line-clamp-1">{offer.title}</h4>
                          {offer.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {offer.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className={offer.is_active ? "text-green-600" : "text-red-600"}>
                              {offer.is_active ? "نشط" : "غير نشط"}
                            </span>
                            {offer.end_date && (
                              <span>ينتهي: {new Date(offer.end_date).toLocaleDateString('ar-SA')}</span>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8">
              <Card className="p-8 border-2">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-l from-primary to-primary-glow bg-clip-text text-transparent">
                    الإحصائيات والتحليلات
                  </h3>
                  <p className="text-muted-foreground text-lg">تتبع أداء متاجرك ومنتجاتك وعروضك</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* إجمالي المتاجر */}
                  <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {stores.length}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-foreground">متاجرك النشطة</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stores.filter(s => s.is_active).length} متجر نشط
                    </p>
                  </Card>

                  {/* إجمالي العروض */}
                  <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {offers.length}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-foreground">عروضك الحالية</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {offers.filter(o => o.is_active).length} عرض نشط
                    </p>
                  </Card>

                  {/* معدل التقييمات */}
                  <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {stores.length > 0 
                          ? (stores.reduce((acc, s) => acc + (s.rating || 0), 0) / stores.length).toFixed(1)
                          : '0.0'
                        }
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-foreground">متوسط التقييم</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      من {stores.reduce((acc, s) => acc + (s.reviews_count || 0), 0)} تقييم
                    </p>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* حالة المتاجر */}
                  <Card className="p-6 bg-muted/30 border-2">
                    <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
                      <Store className="w-5 h-5 text-primary" />
                      حالة المتاجر
                    </h4>
                    <div className="space-y-4">
                      {stores.length > 0 ? (
                        stores.map((store) => (
                          <div key={store.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${store.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="font-semibold">{store.name}</span>
                            </div>
                            <span className={`text-sm px-3 py-1 rounded-full ${
                              store.approved 
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            }`}>
                              {store.approved ? 'معتمد ✓' : 'قيد المراجعة'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          لا توجد متاجر بعد
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* نصائح وتوصيات */}
                  <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      نصائح لزيادة المبيعات
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>أضف صوراً احترافية وواضحة لمنتجاتك</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>حدّث عروضك بشكل منتظم لجذب العملاء</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>استخدم وصف تفصيلي يوضح مميزات المنتج</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>رد على استفسارات العملاء بسرعة واحترافية</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>استفد من ميزة المنتجات المميزة لزيادة الظهور</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">نصائح للتجار</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• أضف صوراً واضحة وجذابة لمنتجاتك</li>
                  <li>• حدث عروضك بانتظام لجذب المزيد من العملاء</li>
                  <li>• تفاعل مع تقييمات العملاء بشكل احترافي</li>
                  <li>• استخدم الوصف التفصيلي لمنتجاتك وخدماتك</li>
                </ul>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
        
        {/* Add Store Dialog */}
        <AddStoreDialog 
          open={showAddStoreDialog}
          onOpenChange={setShowAddStoreDialog}
          onSuccess={() => {
            fetchStores(); // Reload stores
            setShowAddStoreDialog(false);
            toast({
              title: "✅ تم بنجاح",
              description: "تم إضافة المتجر بنجاح"
            });
          }}
        />

        {/* Add Offer Dialog */}
        {selectedStoreId && (
          <AddOfferDialog
            open={showAddOfferDialog}
            onOpenChange={setShowAddOfferDialog}
            storeId={selectedStoreId || stores[0]?.id}
            onSuccess={() => {
              fetchOffers(); // Reload offers
              setShowAddOfferDialog(false);
              toast({
                title: "✅ تم بنجاح",
                description: "تم إضافة العرض بنجاح"
              });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-16 md:py-24">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4 shadow-glow">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
            انضم كتاجر
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            افتح متجرك في أقل من دقيقتين. أضف عروضك اليوم وابدأ استقبال الطلبات فورًا.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-full px-5 py-2.5 text-sm">
              <span className="font-bold text-primary">✨ التسجيل مجاني</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 border-2 border-secondary/30 rounded-full px-5 py-2.5 text-sm">
              <span className="font-bold text-secondary">💰 العمولة 1% فقط</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {requestStatus === "pending" && (
            <Card className="p-8 mb-8 border-2 border-amber-500/50 bg-amber-50/10">
              <div className="flex items-start gap-4">
                <Clock className="w-12 h-12 text-amber-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">طلبك قيد المراجعة</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    تم إرسال طلبك بنجاح وهو الآن قيد المراجعة من قبل فريقنا. سيتم إشعارك بمجرد الموافقة على طلبك.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {requestStatus === "approved" && (
            <Card className="p-8 mb-8 border-2 border-green-500/50 bg-green-50/10">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">تمت الموافقة على طلبك</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    تهانينا! تمت الموافقة على طلبك. يمكنك الآن البدء في إدارة متجرك وعروضك.
                  </p>
                  <Button onClick={() => window.location.reload()} className="mt-4">
                    الذهاب للوحة التحكم
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {requestStatus === "rejected" && (
            <Card className="p-8 mb-8 border-2 border-red-500/50 bg-red-50/10">
              <div className="flex items-start gap-4">
                <XCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">تم رفض طلبك</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    للأسف، لم تتم الموافقة على طلبك. للمزيد من المعلومات، يرجى التواصل معنا.
                  </p>
                  <Button onClick={() => navigate("/contact")} className="mt-4" variant="outline">
                    تواصل معنا
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!requestStatus && (
            <Card className="p-8 md:p-12 shadow-elegant border-2">
              <h2 className="text-2xl font-bold mb-6 gradient-text">طلب التسجيل كتاجر</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-base">اسم المتجر *</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اسم متجرك"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description" className="text-base">وصف المتجر</Label>
                  <Textarea
                    id="business_description"
                    name="business_description"
                    value={formData.business_description}
                    onChange={handleChange}
                    placeholder="وصف مختصر عن متجرك ونشاطه التجاري"
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base">
                      <Phone className="w-4 h-4 inline-block ml-1" />
                      رقم الهاتف *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+966 50 000 0000"
                      className="h-12"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-base">
                      <Phone className="w-4 h-4 inline-block ml-1" />
                      واتساب
                    </Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+966 50 000 0000"
                      className="h-12"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base">المدينة</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="مدينة المتجر"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-base">
                      <Globe className="w-4 h-4 inline-block ml-1" />
                      الموقع الإلكتروني
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="h-12"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base">
                    <MapPin className="w-4 h-4 inline-block ml-1" />
                    عنوان المتجر
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="أدخل عنوان المتجر التفصيلي"
                    className="h-12"
                  />
                </div>

                {/* Map Picker */}
                <div className="space-y-3">
                  <Label className="text-base">
                    <MapPin className="w-4 h-4 inline-block ml-1" />
                    موقع المتجر على الخريطة *
                  </Label>
                  <div className="border-2 border-border rounded-lg overflow-hidden h-[400px]">
                    <MapPicker
                      latitude={typeof formData.latitude === 'number' ? formData.latitude : null}
                      longitude={typeof formData.longitude === 'number' ? formData.longitude : null}
                      onLocationChange={handleLocationChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    اضغط على الخريطة لتحديد موقع متجرك بدقة
                    {formData.latitude && formData.longitude && (
                      <span className="mr-2 font-medium text-primary">
                        (تم التحديد ✓)
                      </span>
                    )}
                  </p>
                </div>

                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label htmlFor="logo" className="text-base">
                    <Upload className="w-4 h-4 inline-block ml-1" />
                    صورة شعار المتجر
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="logo" 
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      {logoPreview ? (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="h-32 w-32 object-cover rounded-lg border-2 border-primary/30"
                          />
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            انقر لتغيير الصورة
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                          <p className="text-sm font-medium text-center mb-1">
                            انقر لرفع شعار المتجر
                          </p>
                          <p className="text-xs text-muted-foreground text-center">
                            JPG, PNG, WEBP (حد أقصى 5 ميجابايت)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Commercial Document Upload */}
                <div className="space-y-3">
                  <Label htmlFor="document" className="text-base">
                    <FileText className="w-4 h-4 inline-block ml-1" />
                    شهادة / سجل تجاري
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <Input
                      id="document"
                      type="file"
                      accept="application/pdf,image/jpeg,image/jpg,image/png"
                      onChange={handleDocumentChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="document" 
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      {documentFile ? (
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
                          <p className="text-sm font-medium mb-1">
                            {documentFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            انقر لتغيير الملف
                          </p>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                          <p className="text-sm font-medium text-center mb-1">
                            انقر لرفع السجل التجاري أو الشهادة
                          </p>
                          <p className="text-xs text-muted-foreground text-center">
                            PDF أو صورة (حد أقصى 10 ميجابايت)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border-2 border-border/50">
                  <h3 className="font-semibold text-lg mb-3">ملاحظة مهمة:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• سيتم مراجعة طلبك من قبل فريقنا</li>
                    <li>• ستتلقى إشعاراً عند الموافقة على طلبك</li>
                    <li>• يجب أن تكون المعلومات المقدمة صحيحة ودقيقة</li>
                    <li>• يُنصح بإرفاق شعار المتجر والسجل التجاري لتسريع المراجعة</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  disabled={loading}
                  className="w-full text-lg shadow-glow hover:shadow-xl hover:scale-105 transition-smooth"
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال الطلب"
                  )}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      
      <AddOfferDialog
        open={showAddOfferDialog}
        onOpenChange={setShowAddOfferDialog}
        storeId={selectedStoreId}
        onSuccess={() => {
          fetchOffers();
          toast({
            title: "تم بنجاح",
            description: "تم إضافة العرض بنجاح",
          });
        }}
      />
    </div>
  );
};

export default Merchant;
