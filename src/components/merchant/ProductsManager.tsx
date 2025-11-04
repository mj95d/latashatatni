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
  Shield,
  Clock,
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
  category: string | null;
  stock_quantity: number;
  is_featured: boolean;
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
  const [storeApproved, setStoreApproved] = useState(true);
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
    category: "",
    stock_quantity: "0",
    is_featured: false,
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
        .select("name, approved")
        .eq("id", storeId)
        .single();

      if (error) throw error;
      setStoreName(data?.name || "متجرك");
      setStoreApproved(data?.approved || false);
    } catch (error) {
      console.error("Error fetching store name:", error);
      setStoreName("متجرك");
      setStoreApproved(false);
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
    addFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addFiles = (files: File[]) => {
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

    // Check total limit (max 10 images)
    const currentCount = selectedFiles.length;
    const newCount = currentCount + files.length;

    if (newCount > 10) {
      toast({
        title: "تحذير",
        description: `يمكنك رفع حتى 10 صور فقط. لديك ${currentCount} صورة وحاولت إضافة ${files.length} صورة.`,
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
          is_active: true,
          category: formData.category || null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          is_featured: formData.is_featured,
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
        category: "",
        stock_quantity: "0",
        is_featured: false,
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
      {/* Store Not Approved Warning */}
      {!storeApproved && (
        <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-2">
                متجرك قيد المراجعة
              </h3>
              <p className="text-amber-800 dark:text-amber-200 text-sm mb-4">
                متجرك حالياً قيد المراجعة من قبل فريقنا. بعد الموافقة، يمكنك إضافة المنتجات مباشرة وستظهر للعملاء فوراً بدون الحاجة لمراجعة إضافية.
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4" />
                <span>عادة ما تستغرق المراجعة من 24-48 ساعة</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            منتجاتي
          </h2>
          <p className="text-muted-foreground mt-1">
            {storeApproved 
              ? "أضف منتجاتك وستظهر مباشرة للعملاء بدون مراجعة"
              : "سيتم تفعيل إضافة المنتجات بعد اعتماد متجرك"
            }
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="gap-2"
          disabled={!storeApproved}
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              إضافة منتج جديد
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              أضف منتجك وسيظهر مباشرة للعملاء بدون مراجعة
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Information */}
            <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                المعلومات الأساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold">
                    اسم المنتج *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: هاتف آيفون 15 برو"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold">
                    فئة المنتج
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="مثال: إلكترونيات، ملابس، أثاث"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sku" className="text-sm font-semibold">
                    كود المنتج (SKU)
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="مثال: IPH-15P-256"
                    className="mt-1.5 font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    كود فريد للمنتج (سيُنشأ تلقائياً إن ترك فارغاً)
                  </p>
                </div>
                <div>
                  <Label htmlFor="stock_quantity" className="text-sm font-semibold">
                    الكمية المتوفرة
                  </Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_quantity: e.target.value })
                    }
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-sm font-semibold">
                    السعر (ر.س) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="old_price" className="text-sm font-semibold">
                    السعر قبل الخصم (اختياري)
                  </Label>
                  <Input
                    id="old_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.old_price}
                    onChange={(e) =>
                      setFormData({ ...formData, old_price: e.target.value })
                    }
                    placeholder="0.00"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    سيظهر كخصم في بطاقة المنتج
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_featured: checked })
                      }
                    />
                    <div>
                      <Label htmlFor="is_featured" className="text-sm font-semibold cursor-pointer">
                        منتج مميز ⭐
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        المنتجات المميزة تظهر في أعلى نتائج البحث
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Product Images */}
            <Card className="p-6 bg-gradient-to-br from-background to-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  صور المنتج *
                </h3>
                <Badge variant="outline" className="text-sm">
                  {selectedFiles.length}/10 صور
                </Badge>
              </div>

              {/* Drag & Drop Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={selectedFiles.length >= 10}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-bold mb-2">
                    اسحب الصور هنا أو اضغط للرفع
                  </p>
                  <p className="text-sm text-muted-foreground">
                    حتى 10 صور • JPG, PNG, WEBP • الحد الأقصى 5 ميجا لكل صورة
                  </p>
                </label>
              </div>

              {/* Image Previews Grid */}
              {previewUrls.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden border-2 border-muted hover:border-primary transition-colors"
                    >
                      <div className="aspect-square">
                        <img
                          src={url}
                          alt={`معاينة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Main Image Badge */}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-semibold shadow-lg">
                          الرئيسية
                        </div>
                      )}

                      {/* Image Number */}
                      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Processing Options */}
              <Card className="p-4 bg-background/50 backdrop-blur-sm mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  إعدادات معالجة الصور
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compression" className="text-sm font-medium">
                        ضغط تلقائي للصور
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        تقليل حجم الملف وتسريع التحميل
                      </p>
                    </div>
                    <Switch
                      id="compression"
                      checked={imageOptions.enableCompression}
                      onCheckedChange={(checked) =>
                        setImageOptions({
                          ...imageOptions,
                          enableCompression: checked,
                        })
                      }
                    />
                  </div>
                  
                  {imageOptions.enableCompression && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                      <Label htmlFor="quality" className="text-xs font-medium">
                        جودة الصورة: {Math.round(imageOptions.compressionQuality * 100)}%
                      </Label>
                      <Slider
                        id="quality"
                        min={0.5}
                        max={1}
                        step={0.1}
                        value={[imageOptions.compressionQuality]}
                        onValueChange={(value) =>
                          setImageOptions({
                            ...imageOptions,
                            compressionQuality: value[0],
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <Label htmlFor="watermark" className="text-sm font-medium">
                        علامة مائية باسم المتجر
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        حماية صورك من النسخ
                      </p>
                    </div>
                    <Switch
                      id="watermark"
                      checked={imageOptions.enableWatermark}
                      onCheckedChange={(checked) =>
                        setImageOptions({
                          ...imageOptions,
                          enableWatermark: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </Card>
            </Card>

            {/* Section 3: Description */}
            <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                وصف المنتج
              </h3>
              <div>
                <Label htmlFor="description" className="text-sm font-semibold">
                  الوصف التفصيلي
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="اكتب وصفاً تفصيلياً للمنتج... المواصفات، الحالة، المميزات، وأي تفاصيل مهمة للمشتري"
                  rows={5}
                  className="mt-1.5 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  الوصف الواضح والتفصيلي يزيد من فرص البيع
                </p>
              </div>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
                disabled={uploading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    نشر المنتج فوراً ✨
                  </>
                )}
              </Button>
            </div>

            {/* Info Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-primary mb-1">
                  نشر فوري بدون مراجعة
                </p>
                <p className="text-muted-foreground">
                  منتجك سيظهر مباشرة للعملاء فور الضغط على "نشر" لأن متجرك معتمد ✅
                </p>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
