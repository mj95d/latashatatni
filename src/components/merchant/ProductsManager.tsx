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
  Star,
  GripVertical,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  images: any;
  is_active: boolean;
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
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [storeName, setStoreName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    old_price: "",
    quantity: "1",
    category: "",
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
      if (!storeId) {
        console.warn("No store ID provided");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "خطأ في تحميل المنتجات",
          description: error.message,
          variant: "destructive",
        });
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في تحميل المنتجات",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > 10) {
      toast({
        title: "تحذير",
        description: "الحد الأقصى 10 صور لكل منتج",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (selectedFiles.length + files.length > 10) {
      toast({
        title: "تحذير",
        description: "الحد الأقصى 10 صور لكل منتج",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...selectedFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    // Update primary image index if needed
    if (primaryImageIndex === draggedIndex) {
      setPrimaryImageIndex(index);
    } else if (primaryImageIndex === index) {
      setPrimaryImageIndex(draggedIndex);
    }

    setSelectedFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];

    if (!storeId) {
      throw new Error("معرّف المتجر غير موجود");
    }

    // Upload images in order, with primary image first
    const orderedFiles = [...selectedFiles];
    const primaryFile = orderedFiles.splice(primaryImageIndex, 1)[0];
    orderedFiles.unshift(primaryFile);

    toast({
      title: "جاري معالجة الصور...",
      description: "ضغط الصور وإضافة العلامة المائية",
    });

    for (let i = 0; i < orderedFiles.length; i++) {
      const file = orderedFiles[i];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!validTypes.includes(file.type)) {
        throw new Error(`نوع الملف ${file.name} غير مدعوم. استخدم JPG, PNG أو WEBP`);
      }

      // Process image: compress + watermark
      const processedFile = await processImage(file, storeName);

      const fileExt = 'jpg'; // Always save as JPG after processing
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${storeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`فشل رفع ${file.name}: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المنتج",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سعر صحيح",
        variant: "destructive",
      });
      return;
    }

    if (formData.old_price && parseFloat(formData.old_price) <= parseFloat(formData.price)) {
      toast({
        title: "خطأ",
        description: "السعر قبل الخصم يجب أن يكون أكبر من السعر الحالي",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة صورة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (!storeId) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد المتجر",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload images
      const imageUrls = await uploadImages();

      if (!imageUrls || imageUrls.length === 0) {
        throw new Error("فشل رفع الصور");
      }

      // Insert product
      const { data: insertedProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          store_id: storeId,
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          price: parseFloat(formData.price),
          old_price: formData.old_price ? parseFloat(formData.old_price) : null,
          images: imageUrls,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(insertError.message || "فشل إضافة المنتج");
      }

      toast({
        title: "تم بنجاح ✓",
        description: `تم إضافة ${formData.name} بنجاح`,
      });

      // Reset form
      setFormData({ 
        name: "", 
        description: "", 
        price: "", 
        old_price: "", 
        quantity: "1", 
        category: "" 
      });
      setSelectedFiles([]);
      setPrimaryImageIndex(0);
      setIsDialogOpen(false);
      
      // Refresh products
      await fetchProducts();
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "خطأ في الإضافة",
        description: error.message || "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
        description: !currentStatus ? "تم تفعيل المنتج" : "تم إخفاء المنتج",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string) => {
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
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (product: Product) => {
    if (products.length >= 10) {
      toast({
        title: "تحذير",
        description: "لقد وصلت للحد الأقصى من المنتجات (10 منتجات)",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: duplicatedProduct, error } = await supabase
        .from("products")
        .insert({
          store_id: storeId,
          name: `${product.name} (نسخة)`,
          description: product.description,
          price: product.price,
          old_price: product.old_price,
          images: product.images,
          is_active: false, // Start as inactive
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم النسخ ✓",
        description: `تم نسخ ${product.name} بنجاح`,
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "خطأ في النسخ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">منتجاتك</h3>
          <p className="text-muted-foreground mt-1">
            {products.length} / 10 منتجات
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" disabled={products.length >= 10}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">إضافة منتج جديد</DialogTitle>
              <p className="text-sm text-muted-foreground">
                املأ المعلومات التالية. جميع الحقول المطلوبة مشار إليها بـ *
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* القسم 1: المعلومات الأساسية */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  المعلومات الأساسية
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="product-name">اسم المنتج *</Label>
                  <Input
                    id="product-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: كرسي جلد فاخر"
                    required
                    className="text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">السعر الحالي (ريال) *</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="350.00"
                      required
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-old-price">السعر قبل الخصم (اختياري)</Label>
                    <Input
                      id="product-old-price"
                      type="number"
                      step="0.01"
                      value={formData.old_price}
                      onChange={(e) =>
                        setFormData({ ...formData, old_price: e.target.value })
                      }
                      placeholder="450.00"
                      className="text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-category">التصنيف (اختياري)</Label>
                    <Input
                      id="product-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="مثال: أثاث، إلكترونيات"
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-quantity">الكمية المتوفرة</Label>
                    <Input
                      id="product-quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="1"
                      className="text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">وصف مختصر</Label>
                  <Textarea
                    id="product-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="وصف قصير عن المنتج وأهم مميزاته..."
                    rows={3}
                    className="text-base resize-none"
                  />
                </div>
              </div>

              {/* القسم 2: رفع الصور */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    صور المنتج
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {selectedFiles.length} / 10 صور
                  </span>
                </div>

                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging 
                      ? 'border-primary bg-primary/5 scale-[1.02]' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-medium mb-1">
                        اسحب الصور هنا أو اضغط للرفع
                      </p>
                      <p className="text-sm text-muted-foreground">
                        يمكنك رفع حتى 10 صور (JPG, PNG, WEBP)
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <GripVertical className="w-4 h-4" />
                      اسحب الصور لإعادة الترتيب • اضغط على النجمة لتعيين الصورة الرئيسية
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {selectedFiles.map((file, index) => (
                        <div 
                          key={index} 
                          className={`relative group cursor-move transition-all ${
                            draggedIndex === index ? 'opacity-50 scale-95' : ''
                          }`}
                          draggable
                          onDragStart={() => handleImageDragStart(index)}
                          onDragOver={(e) => handleImageDragOver(e, index)}
                          onDragEnd={handleImageDragEnd}
                        >
                          <div className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                            primaryImageIndex === index 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-transparent'
                          }`}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`معاينة ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            
                            {/* Primary Image Star */}
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className={`absolute top-1 left-1 p-1.5 rounded-full transition-all ${
                                primaryImageIndex === index
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-black/50 text-white hover:bg-primary hover:scale-110'
                              }`}
                              title={primaryImageIndex === index ? 'الصورة الرئيسية' : 'تعيين كصورة رئيسية'}
                            >
                              <Star className={`w-3 h-3 ${primaryImageIndex === index ? 'fill-current' : ''}`} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              title="حذف الصورة"
                            >
                              <X className="w-3 h-3" />
                            </button>

                            {/* Drag Handle */}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          
                          {primaryImageIndex === index && (
                            <p className="text-xs text-center text-primary font-medium mt-1">
                              رئيسية
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-base" 
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5 ml-2" />
                      حفظ المنتج
                    </>
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({ name: "", description: "", price: "", old_price: "", quantity: "1", category: "" });
                    setSelectedFiles([]);
                    setPrimaryImageIndex(0);
                    setIsDialogOpen(false);
                  }}
                  disabled={uploading}
                  className="h-12 px-6"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h4 className="text-xl font-semibold mb-2">لا توجد منتجات</h4>
          <p className="text-muted-foreground mb-4">
            ابدأ بإضافة منتجاتك الآن
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <div className="relative h-48 bg-muted">
                {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                  <img
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={product.is_active ? "default" : "secondary"}
                  >
                    {product.is_active ? "نشط" : "مخفي"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h4 className="font-bold text-lg line-clamp-1">{product.name}</h4>
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" dir="ltr">
                    {product.price.toFixed(2)} ر.س
                  </span>
                  {product.old_price && (
                    <span className="text-sm line-through text-muted-foreground" dir="ltr">
                      {product.old_price.toFixed(2)} ر.س
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(product.id, product.is_active)}
                    className="flex-1"
                  >
                    {product.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 ml-2" />
                        إخفاء
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 ml-2" />
                        تفعيل
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(product)}
                    title="نسخ المنتج"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
