import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, MapPin, Image as ImageIcon, FileText } from "lucide-react";
import MapPicker from "./MapPicker";

interface AddStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddStoreDialog = ({ open, onOpenChange, onSuccess }: AddStoreDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    city_id: "",
    address: "",
    phone: "",
    whatsapp: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Load categories and cities when dialog opens
  useEffect(() => {
    const loadData = async () => {
      const [categoriesRes, citiesRes] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("cities").select("*")
      ]);
      
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
    };
    
    if (open) loadData();
  }, [open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const validateFile = (file: File, type: 'image' | 'document'): boolean => {
    // Check file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يجب أن لا يتجاوز حجم الملف 5 ميجابايت",
        variant: "destructive"
      });
      return false;
    }

    // Dangerous extensions to block
    const dangerousExtensions = /\.(php|phtml|php3|php4|php5|phps|cgi|pl|py|rb|sh|exe|bat|cmd|com|jar|jsp|asp|aspx)$/i;
    if (dangerousExtensions.test(file.name)) {
      toast({
        title: "نوع الملف غير مسموح",
        description: "هذا النوع من الملفات غير مسموح به لأسباب أمنية",
        variant: "destructive"
      });
      return false;
    }

    // Check MIME type
    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "نوع الملف غير صحيح",
        description: type === 'image' 
          ? "يجب أن يكون الملف صورة (JPG, PNG, WEBP)"
          : "يجب أن يكون الملف صورة أو PDF",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, 'image')) {
        setLogoFile(file);
      } else {
        e.target.value = ''; // Reset input
      }
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, 'document')) {
        setDocumentFile(file);
      } else {
        e.target.value = ''; // Reset input
      }
    }
  };

  const safeObjectPath = (userId: string, file: File) => {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const random = Math.random().toString(36).slice(2, 10);
    const ts = Date.now().toString(36);
    return `${userId}/${ts}_${random}.${ext}`;
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) throw error;
    // Return the object path (safer for private buckets)
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // Check store limit before uploading files
      const { count, error: countError } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      if (countError) throw countError;

      if (count !== null && count >= 10) {
        throw new Error("لقد وصلت للحد الأقصى من المتاجر (10 متاجر)");
      }

      let logoUrl = null;
      let documentUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const logoPath = safeObjectPath(user.id, logoFile);
        logoUrl = await uploadFile(logoFile, 'store-documents', logoPath);
      }

      // Upload document if provided
      if (documentFile) {
        const docPath = safeObjectPath(user.id, documentFile);
        documentUrl = await uploadFile(documentFile, 'store-documents', docPath);
      }

      // Insert store
      const { error } = await supabase
        .from("stores")
        .insert([{
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id || null,
          city_id: formData.city_id || null,
          address: formData.address,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          latitude: formData.latitude,
          longitude: formData.longitude,
          logo_url: logoUrl,
          commercial_document: documentUrl,
          is_active: true,
          approved: false
        }]);

      if (error) throw error;

      toast({
        title: "تم إضافة المتجر بنجاح!",
        description: "سيتم مراجعة متجرك من قبل الإدارة وتفعيله قريباً",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        category_id: "",
        city_id: "",
        address: "",
        phone: "",
        whatsapp: "",
        latitude: null,
        longitude: null,
      });
      setLogoFile(null);
      setDocumentFile(null);
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة المتجر",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ✨ إضافة متجر جديد
          </DialogTitle>
          <DialogDescription className="text-base">
            املأ المعلومات التالية لإضافة متجرك. جميع الحقول المطلوبة مميزة بـ *
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-muted/30 to-background rounded-xl border-2">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              المعلومات الأساسية
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">اسم المتجر *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="مثال: محل الأزياء العصرية"
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">التصنيف *</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon && <span className="ml-2">{cat.icon}</span>}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">وصف المتجر</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="اكتب وصفاً مختصراً عن متجرك ونشاطه التجاري..."
                rows={3}
                className="resize-none text-base"
              />
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-background rounded-xl border-2">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              معلومات التواصل
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">رقم الجوال *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+966 50 000 0000"
                  required
                  className="h-12 text-base"
                  dir="ltr"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-base font-semibold">رقم الواتساب</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  placeholder="+966 50 000 0000"
                  className="h-12 text-base"
                  dir="ltr"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-semibold">المدينة *</Label>
                <Select value={formData.city_id} onValueChange={(value) => handleInputChange("city_id", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="حي، شارع، رقم المبنى"
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Files */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-muted/30 to-background rounded-xl border-2">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              الملفات والمستندات
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-base font-semibold">شعار المتجر</Label>
                <div className="relative">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="h-12"
                  />
                  {logoFile && (
                    <p className="text-xs text-green-600 mt-1">✓ {logoFile.name}</p>
                  )}
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label htmlFor="document" className="text-base font-semibold">السجل التجاري</Label>
                <div className="relative">
                  <Input
                    id="document"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDocumentChange}
                    className="h-12"
                  />
                  {documentFile && (
                    <p className="text-xs text-green-600 mt-1">✓ {documentFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Location */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-background rounded-xl border-2">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              الموقع على الخريطة
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              اضغط على الخريطة لتحديد موقع متجرك بدقة
            </p>
            <MapPicker
              onLocationChange={handleLocationChange}
              latitude={formData.latitude || 24.7136}
              longitude={formData.longitude || 46.6753}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 h-14 text-base"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 text-base gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  إضافة المتجر
                </>
              )}
            </Button>
          </div>

          {/* Info Note */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
            <ImageIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-primary mb-1">
                ملاحظة مهمة
              </p>
              <p className="text-muted-foreground">
                سيتم مراجعة متجرك من قبل الإدارة خلال 24-48 ساعة. بعد الموافقة يمكنك إضافة منتجاتك مباشرة!
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};