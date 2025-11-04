import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Calendar } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

interface EditOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerId: string;
  onSuccess: () => void;
}

export const EditOfferDialog = ({ open, onOpenChange, offerId, onSuccess }: EditOfferDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_percentage: "",
    discount_text: "",
    start_date: "",
    end_date: "",
    is_active: true
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  useEffect(() => {
    if (open && offerId) {
      fetchOfferData();
    }
  }, [open, offerId]);

  const fetchOfferData = async () => {
    try {
      setLoadingOffer(true);
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("id", offerId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          discount_percentage: data.discount_percentage?.toString() || "",
          discount_text: data.discount_text || "",
          start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : "",
          end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : "",
          is_active: data.is_active ?? true
        });
        
        // Handle images - ensure it's an array
        const images = Array.isArray(data.images) ? data.images : [];
        setExistingImages(images);
      }
    } catch (error: any) {
      console.error("Error fetching offer:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل بيانات العرض",
        variant: "destructive"
      });
    } finally {
      setLoadingOffer(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length - deletedImages.length + selectedFiles.length + files.length;
    
    if (totalImages > 5) {
      toast({
        title: "تنبيه",
        description: "الحد الأقصى هو 5 صور",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setDeletedImages(prev => [...prev, imageUrl]);
  };

  const restoreExistingImage = (imageUrl: string) => {
    setDeletedImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "خطأ",
        description: "عنوان العرض مطلوب",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Upload new images
      let uploadedImages: any[] = [];
      
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const compressedFile = await compressImage(file);
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${i}.${fileExt}`;
          const filePath = `offers/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, compressedFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          uploadedImages.push({
            url: publicUrl,
            is_primary: (existingImages.length - deletedImages.length + i) === 0
          });
        }
      }

      // Filter out deleted images and merge with new ones
      const finalImages = [
        ...existingImages.filter(img => !deletedImages.includes(img.url)),
        ...uploadedImages
      ];

      // Ensure at least one image is primary
      if (finalImages.length > 0 && !finalImages.some(img => img.is_primary)) {
        finalImages[0].is_primary = true;
      }

      // Update offer
      const { error: updateError } = await supabase
        .from("offers")
        .update({
          title: formData.title,
          description: formData.description || null,
          discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
          discount_text: formData.discount_text || null,
          start_date: formData.start_date || new Date().toISOString(),
          end_date: formData.end_date || null,
          is_active: formData.is_active,
          images: finalImages,
          image_url: finalImages[0]?.url || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", offerId);

      if (updateError) throw updateError;

      toast({
        title: "✅ تم التحديث بنجاح",
        description: "تم تحديث العرض بنجاح"
      });

      onSuccess();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating offer:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث العرض",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_percentage: "",
      discount_text: "",
      start_date: "",
      end_date: "",
      is_active: true
    });
    setSelectedFiles([]);
    setExistingImages([]);
    setDeletedImages([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">تعديل العرض</DialogTitle>
        </DialogHeader>

        {loadingOffer ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">عنوان العرض *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: خصم 50% على جميع المنتجات"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">وصف العرض</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للعرض..."
                rows={3}
              />
            </div>

            {/* Discount Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">نسبة الخصم (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_text">نص الخصم</Label>
                <Input
                  id="discount_text"
                  value={formData.discount_text}
                  onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                  placeholder="خصم خاص"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ البداية
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ الانتهاء
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg border-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                عرض نشط ومرئي للعملاء
              </Label>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <Label>صور العرض (حد أقصى 5 صور)</Label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">الصور الحالية:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((img, index) => (
                      <div
                        key={index}
                        className={`relative group ${deletedImages.includes(img.url) ? 'opacity-40' : ''}`}
                      >
                        <img
                          src={img.url}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2"
                        />
                        {deletedImages.includes(img.url) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => restoreExistingImage(img.url)}
                            className="absolute top-2 left-2"
                          >
                            استعادة
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeExistingImage(img.url)}
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        {img.is_primary && (
                          <span className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            رئيسية
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">صور جديدة:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`صورة جديدة ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-primary"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {(existingImages.length - deletedImages.length + selectedFiles.length) < 5 && (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">اضغط لإضافة صور</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  "حفظ التعديلات"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
