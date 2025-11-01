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
import { Store, MapPin, Tag, Building, Loader2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

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
    }
  }, [isAdmin, loading, navigate]);

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                لوحة تحكم الأدمن
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              إدارة المحتوى والإعلانات
            </p>
          </div>

          <Tabs defaultValue="cities" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="cities">
                <MapPin className="w-4 h-4 ml-2" />
                المدن
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Tag className="w-4 h-4 ml-2" />
                التصنيفات
              </TabsTrigger>
              <TabsTrigger value="stores">
                <Store className="w-4 h-4 ml-2" />
                المتاجر
              </TabsTrigger>
              <TabsTrigger value="offers">
                <Building className="w-4 h-4 ml-2" />
                العروض
              </TabsTrigger>
            </TabsList>

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
