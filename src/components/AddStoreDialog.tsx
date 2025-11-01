import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, MapPin, Image as ImageIcon, FileText } from "lucide-react";

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
    latitude: "",
    longitude: "",
  });

  // Load categories and cities when dialog opens
  useState(() => {
    const loadData = async () => {
      const [categoriesRes, citiesRes] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("cities").select("*")
      ]);
      
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
    };
    
    if (open) loadData();
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
      
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      let logoUrl = null;
      let documentUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const logoPath = `${user.id}/${Date.now()}_${logoFile.name}`;
        logoUrl = await uploadFile(logoFile, 'store-documents', logoPath);
      }

      // Upload document if provided
      if (documentFile) {
        const docPath = `${user.id}/${Date.now()}_${documentFile.name}`;
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
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          logo_url: logoUrl,
          commercial_document: documentUrl,
          is_active: false // سيتم تفعيله بعد مراجعة الأدمن
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
        latitude: "",
        longitude: "",
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">إضافة متجر جديد</DialogTitle>
          <DialogDescription>
            املأ المعلومات التالية لإضافة متجرك. جميع الحقول المطلوبة مميزة بـ *
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">اسم المتجر *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              placeholder="أدخل اسم المتجر"
              className="h-12"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">وصف المتجر</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="وصف تفصيلي عن المتجر ونشاطه"
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Category and City */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base">النشاط التجاري *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleInputChange("category_id", value)}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-base">المدينة *</Label>
              <Select 
                value={formData.city_id} 
                onValueChange={(value) => handleInputChange("city_id", value)}
                required
              >
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
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base">العنوان *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              required
              placeholder="عنوان المتجر بالتفصيل"
              className="h-12"
            />
          </div>

          {/* Location Coordinates */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              الموقع على خرائط جوجل (اختياري)
            </Label>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="خط الطول (Longitude)"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
                className="h-12"
                dir="ltr"
              />
              <Input
                placeholder="خط العرض (Latitude)"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
                className="h-12"
                dir="ltr"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              يمكنك الحصول على الإحداثيات من خرائط جوجل بالنقر على الموقع واختيار "ما الموجود هنا؟"
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">رقم الهاتف *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                placeholder="+966 50 000 0000"
                className="h-12"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-base">واتساب (اختياري)</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                placeholder="+966 50 000 0000"
                className="h-12"
                dir="ltr"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <Label htmlFor="logo" className="text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              صورة/شعار المتجر (اختياري)
            </Label>
            <div className="relative">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="h-12"
              />
              {logoFile && (
                <p className="text-sm text-primary mt-2">تم اختيار: {logoFile.name}</p>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-3">
            <Label htmlFor="document" className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              السجل التجاري أو وثيقة العمل الحر *
            </Label>
            <div className="relative">
              <Input
                id="document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleDocumentChange}
                required
                className="h-12"
              />
              {documentFile && (
                <p className="text-sm text-primary mt-2">تم اختيار: {documentFile.name}</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              الصيغ المدعومة: PDF, JPG, PNG (حجم أقصى: 5 ميجابايت)
            </p>
          </div>

          {/* Note */}
          <div className="bg-muted/50 p-4 rounded-lg border-2 border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong>ملاحظة:</strong> سيتم مراجعة المتجر من قبل الإدارة قبل تفعيله وإظهاره للمستخدمين
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 h-12 shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  إضافة المتجر
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-12"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};