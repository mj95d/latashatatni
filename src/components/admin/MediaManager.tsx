import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
import { Upload, Trash2, Edit, Search, Image as ImageIcon, Copy, Check } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">مكتبة الصور</h2>
          <p className="text-muted-foreground">إدارة جميع صور الموقع</p>
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
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 ml-2" />
              {uploading ? "جاري الرفع..." : "رفع صور جديدة"}
            </label>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>فلترة حسب الفئة</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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
            <Label>بحث</Label>
            <div className="relative">
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
      </Card>

      {/* Media Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredMedia.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد صور</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-square relative">
                <img
                  src={item.file_url}
                  alt={item.alt_text || item.file_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedFile(item);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(item.file_url)}
                  >
                    {copiedUrl === item.file_url ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{item.file_name}</p>
                <p className="text-xs text-muted-foreground">{item.category || "عام"}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الصورة</DialogTitle>
            <DialogDescription>قم بتحديث معلومات الصورة</DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={selectedFile.file_url}
                  alt={selectedFile.alt_text}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Label>الفئة</Label>
                <Select
                  value={selectedFile.category}
                  onValueChange={(value) =>
                    setSelectedFile({ ...selectedFile, category: value })
                  }
                >
                  <SelectTrigger>
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
              <div>
                <Label>النص البديل (Alt Text)</Label>
                <Input
                  value={selectedFile.alt_text || ""}
                  onChange={(e) =>
                    setSelectedFile({ ...selectedFile, alt_text: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={selectedFile.description || ""}
                  onChange={(e) =>
                    setSelectedFile({ ...selectedFile, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label>رابط الصورة</Label>
                <div className="flex gap-2">
                  <Input value={selectedFile.file_url} readOnly />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedFile.file_url)}
                  >
                    {copiedUrl === selectedFile.file_url ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdate}>حفظ التغييرات</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
