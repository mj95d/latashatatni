import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Trash2, Edit, Search, Image as ImageIcon, Copy, Check, Eye, Download, X } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import LoadingSpinner from "@/components/LoadingSpinner";

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  category: string | null;
  alt_text: string | null;
  description: string | null;
  tags: any;
  created_at: string;
  uploaded_by: string | null;
}

const categories = [
  { value: "all", label: "جميع الفئات" },
  { value: "hero", label: "صور البانر الرئيسي" },
  { value: "city", label: "صور المدن" },
  { value: "store", label: "صور المتاجر" },
  { value: "product", label: "صور المنتجات" },
  { value: "offer", label: "صور العروض" },
  { value: "tourism", label: "صور الأماكن السياحية" },
  { value: "general", label: "صور عامة" },
];

export const MediaManager = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [media, selectedCategory, searchQuery]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("فشل في تحميل الصور");
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = media;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMedia(filtered);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Compress image
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to storage
        const { error: uploadError, data } = await supabase.storage
          .from("site-media")
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("site-media")
          .getPublicUrl(filePath);

        // Save to media_library
        const { error: dbError } = await supabase.from("media_library").insert({
          file_name: file.name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: compressedFile.size,
          category: "general",
          alt_text: file.name.split(".")[0],
        });

        if (dbError) throw dbError;
      }

      toast.success("تم رفع الصور بنجاح");
      fetchMedia();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("فشل في رفع الصور");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (mediaItem: MediaFile) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("site-media")
        .remove([mediaItem.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("media_library")
        .delete()
        .eq("id", mediaItem.id);

      if (dbError) throw dbError;

      toast.success("تم حذف الصورة بنجاح");
      fetchMedia();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("فشل في حذف الصورة");
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) return;

    try {
      const { error } = await supabase
        .from("media_library")
        .update({
          category: selectedFile.category,
          alt_text: selectedFile.alt_text,
          description: selectedFile.description,
        })
        .eq("id", selectedFile.id);

      if (error) throw error;

      toast.success("تم تحديث الصورة بنجاح");
      setEditDialogOpen(false);
      fetchMedia();
    } catch (error) {
      console.error("Error updating media:", error);
      toast.error("فشل في تحديث الصورة");
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error("فشل في نسخ الرابط");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const event = { target: { files: e.dataTransfer.files, value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  const downloadImage = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('تم تحميل الصورة');
    } catch (error) {
      toast.error('فشل تحميل الصورة');
    }
  };

  const viewImage = (url: string) => {
    setPreviewImage(url);
    setShowPreviewDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            مكتبة الصور
          </h2>
          <p className="text-muted-foreground mt-1">إدارة جميع صور الموقع بشكل احترافي</p>
        </div>
        <div className="relative">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            size="lg"
          >
            <Upload className="w-5 h-5 ml-2" />
            {uploading ? "جاري الرفع..." : "رفع صور جديدة"}
          </Button>
        </div>
      </div>

      {/* Drag and Drop Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-12 text-center">
          <Upload className={`h-16 w-16 mx-auto mb-4 transition-colors ${
            dragActive ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <p className="text-lg font-medium mb-2">
            اسحب وأفلت الصور هنا
          </p>
          <p className="text-sm text-muted-foreground">
            أو انقر على زر "رفع صور جديدة" أعلاه • يدعم رفع صور متعددة
          </p>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">فلترة حسب الفئة</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base font-medium">بحث</Label>
            <div className="relative mt-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في الصور..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">إجمالي الصور:</span>
            <Badge variant="secondary" className="font-semibold">{media.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">الصور المعروضة:</span>
            <Badge variant="secondary" className="font-semibold">{filteredMedia.length}</Badge>
          </div>
        </div>
      </Card>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <ImageIcon className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold mb-2">لا توجد صور</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'لم يتم العثور على صور تطابق البحث' 
                : 'ابدأ برفع الصور لإدارتها في مكتبة الصور'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                <X className="w-4 h-4 ml-2" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="aspect-square relative bg-muted overflow-hidden">
                <img
                  src={item.file_url}
                  alt={item.alt_text || item.file_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => viewImage(item.file_url)}
                      title="معاينة"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(item.file_url, item.file_name)}
                      title="تحميل"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setSelectedFile(item);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(item.file_url)}
                      title="نسخ الرابط"
                    >
                      {copiedUrl === item.file_url ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item)}
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="font-semibold text-sm truncate" title={item.file_name}>
                  {item.file_name}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.value === item.category)?.label || "عام"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : ''}
                  </span>
                </div>
                {item.alt_text && (
                  <p className="text-xs text-muted-foreground line-clamp-2" title={item.alt_text}>
                    {item.alt_text}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">تعديل معلومات الصورة</DialogTitle>
            <DialogDescription>قم بتحديث الفئة والأوصاف والبيانات الوصفية للصورة</DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-1">
                {/* Image Preview */}
                <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-border bg-muted">
                  <img
                    src={selectedFile.file_url}
                    alt={selectedFile.alt_text || selectedFile.file_name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="grid gap-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base">اسم الملف</Label>
                      <Input value={selectedFile.file_name} disabled className="mt-2" />
                    </div>
                    <div>
                      <Label className="text-base">الفئة *</Label>
                      <Select
                        value={selectedFile.category || 'general'}
                        onValueChange={(value) =>
                          setSelectedFile({ ...selectedFile, category: value })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">النص البديل (Alt Text)</Label>
                    <Input
                      value={selectedFile.alt_text || ""}
                      onChange={(e) =>
                        setSelectedFile({ ...selectedFile, alt_text: e.target.value })
                      }
                      placeholder="وصف مختصر للصورة - مهم لمحركات البحث وإمكانية الوصول"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      يُستخدم لتحسين SEO ومساعدة القارئات الصوتية
                    </p>
                  </div>

                  <div>
                    <Label className="text-base">الوصف التفصيلي</Label>
                    <Textarea
                      value={selectedFile.description || ""}
                      onChange={(e) =>
                        setSelectedFile({ ...selectedFile, description: e.target.value })
                      }
                      rows={4}
                      placeholder="وصف تفصيلي لمحتوى الصورة واستخدامها..."
                      className="mt-2"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label className="text-sm text-muted-foreground">حجم الملف</Label>
                      <p className="font-semibold mt-1">
                        {selectedFile.file_size 
                          ? `${(selectedFile.file_size / 1024).toFixed(2)} KB`
                          : 'غير معروف'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">نوع الملف</Label>
                      <p className="font-semibold mt-1">{selectedFile.file_type}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">تاريخ الرفع</Label>
                      <p className="font-semibold mt-1 text-sm">
                        {new Date(selectedFile.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">رابط الصورة المباشر</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        value={selectedFile.file_url} 
                        readOnly 
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedFile.file_url)}
                      >
                        {copiedUrl === selectedFile.file_url ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleUpdate} size="lg">
                    حفظ التغييرات
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setShowPreviewDialog(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            {previewImage && (
              <div className="flex items-center justify-center p-8 bg-black/95 rounded-lg min-h-[80vh]">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
