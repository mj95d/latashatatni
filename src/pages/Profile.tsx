import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, LogOut, Store } from "lucide-react";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          city: city,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "تم التحديث بنجاح!",
        description: "تم حفظ معلوماتك الشخصية",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center">جاري التحميل...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                الملف الشخصي
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              إدارة معلوماتك الشخصية
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Info Card */}
            <Card className="border-2 animate-fade-in">
              <CardHeader>
                <CardTitle>معلوماتك الشخصية</CardTitle>
                <CardDescription>قم بتحديث بياناتك الشخصية</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="أدخل اسمك الكامل"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="pr-10 bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        type="text"
                        placeholder="اختر مدينتك"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={updating}>
                    {updating ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>هل أنت تاجر؟</CardTitle>
                  <CardDescription>
                    انضم إلى منصة لا تشتتني وابدأ بعرض متجرك ومنتجاتك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="hero" className="w-full" onClick={() => navigate("/merchant/dashboard")}>
                    <Store className="ml-2 h-4 w-4" />
                    لوحة تحكم التاجر
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/50">
                <CardHeader>
                  <CardTitle>تسجيل الخروج</CardTitle>
                  <CardDescription>
                    سيتم تسجيل خروجك من حسابك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;