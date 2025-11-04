import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { processImage } from "@/lib/imageUtils";
import {
  Package,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Camera,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  images: any;
  is_active: boolean;
  sku: string | null;
  created_at: string;
}

interface ProductsManagerProps {
  storeId: string;
}

export const ProductsManager = ({ storeId }: ProductsManagerProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [storeName, setStoreName] = useState("");
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [imageOptions, setImageOptions] = useState({
    enableCompression: true,
    enableWatermark: true,
    compressionQuality: 0.8,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    old_price: "",
    sku: "",
  });

  useEffect(() => {
    if (storeId) {
      fetchProducts();
      fetchStoreName();
    }
  }, [storeId]);

  const fetchStoreName = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("name")
        .eq("id", storeId)
        .single();

      if (error) throw error;
      setStoreName(data?.name || "متجرك");
    } catch (error) {
      console.error("Error fetching store name:", error);
      setStoreName("متجرك");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate unique SKU
  const generateSKU = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `PRD-${timestamp}-${random}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter((f) => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      toast({
        title: "خطأ",
        description: "يُسمح فقط بملفات الصور (JPG, PNG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Add new files to existing ones
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      try {
        const processedFile = await processImage(file, storeName, {
          enableCompression: imageOptions.enableCompression,
          enableWatermark: imageOptions.enableWatermark,
          compressionQuality: imageOptions.compressionQuality,
        });

        const fileExt = file.name.split(".").pop();
        const fileName = `${storeId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, processedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (error: any) {
        console.error("Error uploading image:", error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المنتج والسعر على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة صورة واحدة على الأقل للمنتج",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload images
      const imageUrls = await uploadImages();

      // Generate SKU if not provided
      const productSku = formData.sku.trim() || generateSKU();

      // Insert product - is_active is true by default in database
      const { data, error } = await supabase
        .from("products")
        .insert({
          store_id: storeId,
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          old_price: formData.old_price ? parseFloat(formData.old_price) : null,
          sku: productSku,
          images: imageUrls,
          is_active: true, // Product goes live immediately
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ تم نشر المنتج",
        description: `تم إضافة "${formData.name}" وهو الآن متاح للعملاء مباشرة!`,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        old_price: "",
        sku: "",
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setIsDialogOpen(false);

      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة المنتج",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: currentStatus ? "تم إخفاء المنتج" : "تم إظهار المنتج",
        description: currentStatus
          ? "المنتج غير مرئي للعملاء الآن"
          : "المنتج مرئي للعملاء الآن",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المنتج",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

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
        description: "فشل في حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const copySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
    toast({
      title: "تم النسخ",
      description: "تم نسخ رقم المنتج",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            منتجاتي
          </h2>
          <p className="text-muted-foreground mt-1">
            أضف منتجاتك وستظهر مباشرة للعملاء بدون مراجعة
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
          <p className="text-muted-foreground mb-6">
            ابدأ بإضافة منتجك الأول الآن
          </p>
          <Button onClick={() => setIsDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 ml-2" />
            إضافة منتج
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square bg-muted">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={product.is_active ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {product.is_active ? (
                      <>
                        <Eye className="h-3 w-3" />
                        نشط
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        مخفي
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* SKU */}
                {product.sku && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">رقم المنتج:</span>
                    <code className="bg-muted px-2 py-1 rounded font-mono">
                      {product.sku}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copySku(product.sku!)}
                    >
                      {copiedSku === product.sku ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {product.price} ر.س
                  </span>
                  {product.old_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.old_price} ر.س
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                  >
                    {product.is_active ? (
                      <>
                        <EyeOff className="h-4 w-4 ml-2" />
                        إخفاء
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 ml-2" />
                        إظهار
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              إضافة منتج جديد
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              سيظهر منتجك مباشرة للعملاء بعد الإضافة
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Images */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5" />
                صور المنتج *
              </Label>
              
              {/* Image Options */}
              <Card className="p-4 space-y-3 bg-muted/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compression" className="text-sm">
                    ضغط الصور تلقائياً
                  </Label>
                  <Switch
                    id="compression"
                    checked={imageOptions.enableCompression}
                    onCheckedChange={(checked) =>
                      setImageOptions({ ...imageOptions, enableCompression: checked })
                    }
                  />
                </div>
                
                {imageOptions.enableCompression && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      جودة الضغط: {Math.round(imageOptions.compressionQuality * 100)}%
                    </Label>
                    <Slider
                      value={[imageOptions.compressionQuality]}
                      onValueChange={([value]) =>
                        setImageOptions({ ...imageOptions, compressionQuality: value })
                      }
                      min={0.5}
                      max={1}
                      step={0.1}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="watermark" className="text-sm">
                    إضافة علامة مائية
                  </Label>
                  <Switch
                    id="watermark"
                    checked={imageOptions.enableWatermark}
                    onCheckedChange={(checked) =>
                      setImageOptions({ ...imageOptions, enableWatermark: checked })
                    }
                  />
                </div>
              </Card>

              {/* Image Upload Area */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">اضغط لاختيار الصور</p>
                    <p className="text-sm text-muted-foreground">
                      أو اسحب الصور هنا (JPG, PNG, WEBP)
                    </p>
                  </div>
                </label>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">
                          الصورة الرئيسية
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                اسم المنتج *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="مثال: كرسي جلد فاخر"
                required
                className="text-base"
              />
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                وصف المنتج
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="اكتب وصفاً مختصراً للمنتج..."
                rows={3}
                className="text-base resize-none"
              />
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-semibold">
                  السعر *
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    required
                    className="text-base pr-12"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ر.س
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="old_price" className="text-base font-semibold">
                  السعر القديم
                </Label>
                <div className="relative">
                  <Input
                    id="old_price"
                    type="number"
                    step="0.01"
                    value={formData.old_price}
                    onChange={(e) =>
                      setFormData({ ...formData, old_price: e.target.value })
                    }
                    placeholder="0.00"
                    className="text-base pr-12"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ر.س
                  </span>
                </div>
              </div>
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-base font-semibold">
                رقم المنتج (SKU)
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="سيتم توليده تلقائياً إذا تركته فارغاً"
                className="text-base font-mono"
              />
              <p className="text-xs text-muted-foreground">
                رقم فريد للمنتج يساعدك في تتبع المبيعات والمخزون
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={uploading}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="flex-1 gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    نشر المنتج الآن
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
