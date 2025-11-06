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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, MapPin, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

interface TourismPlace {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  city_id: string | null;
  images: any;
  created_at: string;
  city?: {
    name: string;
  };
}

interface City {
  id: string;
  name: string;
}

interface MediaFile {
  id: string;
  file_url: string;
  file_name: string;
  category: string | null;
}

const categories = [
  { value: "historical", label: "معالم تاريخية" },
  { value: "natural", label: "معالم طبيعية" },
  { value: "park", label: "حدائق ومتنزهات" },
  { value: "museum", label: "متاحف" },
  { value: "entertainment", label: "ترفيه" },
  { value: "religious", label: "معالم دينية" },
  { value: "cultural", label: "معالم ثقافية" },
  { value: "other", label: "أخرى" },
];

const TourismPlaces = () => {
  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<TourismPlace | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    latitude: "",
    longitude: "",
    city_id: "",
  });

  useEffect(() => {
    fetchPlaces();
    fetchCities();
    fetchMediaLibrary();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tourism_places")
        .select("*, city:cities(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaces(data || []);
    } catch (error) {
      console.error("Error fetching places:", error);
      toast.error("فشل في تحميل الأماكن السياحية");
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchMediaLibrary = async () => {
    try {
      const { data, error } = await supabase
        .from("media_library")
        .select("id, file_url, file_name, category")
        .or("category.eq.tourism,category.eq.صور الأماكن السياحية,category.is.null")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMediaLibrary(data || []);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const handleOpenDialog = (place?: TourismPlace) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name: place.name,
        description: place.description || "",
        category: place.category || "",
        latitude: place.latitude?.toString() || "",
        longitude: place.longitude?.toString() || "",
        city_id: place.city_id || "",
      });
      setSelectedImages(
        Array.isArray(place.images) ? place.images : []
      );
    } else {
      setEditingPlace(null);
      setFormData({
        name: "",
        description: "",
        category: "",
        latitude: "",
        longitude: "",
        city_id: "",
      });
      setSelectedImages([]);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.city_id) {
      toast.error("الرجاء إدخال الاسم والمدينة");
      return;
    }

    try {
      const placeData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        city_id: formData.city_id,
        images: selectedImages,
      };

      if (editingPlace) {
        const { error } = await supabase
          .from("tourism_places")
          .update(placeData)
          .eq("id", editingPlace.id);

        if (error) throw error;
        toast.success("تم تحديث المكان بنجاح");
      } else {
        const { error } = await supabase
          .from("tourism_places")
          .insert(placeData);

        if (error) throw error;
        toast.success("تم إضافة المكان بنجاح");
      }

      setDialogOpen(false);
      fetchPlaces();
    } catch (error) {
      console.error("Error saving place:", error);
      toast.error("فشل في حفظ المكان");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المكان؟")) return;

    try {
      const { error } = await supabase
        .from("tourism_places")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("تم حذف المكان بنجاح");
      fetchPlaces();
    } catch (error) {
      console.error("Error deleting place:", error);
      toast.error("فشل في حذف المكان");
    }
  };

  const toggleImageSelection = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url)
        ? prev.filter((img) => img !== url)
        : [...prev, url]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأماكن السياحية</h1>
          <p className="text-muted-foreground">إضافة وتعديل الأماكن السياحية في المدن</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مكان سياحي
        </Button>
      </div>

      {/* Places Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>عدد الصور</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="font-medium">{place.name}</TableCell>
                  <TableCell>{place.city?.name || "-"}</TableCell>
                  <TableCell>
                    {categories.find((c) => c.value === place.category)?.label || "-"}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(place.images) ? place.images.length : 0} صورة
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(place)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(place.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {places.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد أماكن سياحية
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlace ? "تعديل مكان سياحي" : "إضافة مكان سياحي جديد"}
            </DialogTitle>
            <DialogDescription>
              أدخل معلومات المكان السياحي
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>اسم المكان</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="مثال: حديقة الملك عبدالله"
              />
            </div>

            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="وصف المكان السياحي..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>المدينة</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, city_id: value })
                  }
                >
                  <SelectTrigger>
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

              <div>
                <Label>الفئة</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>خط الطول (Longitude)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="46.6753"
                />
              </div>
              <div>
                <Label>خط العرض (Latitude)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="24.7136"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>الصور ({selectedImages.length})</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setMediaDialogOpen(true)}
                >
                  <ImageIcon className="w-4 h-4 ml-2" />
                  اختر من المكتبة
                </Button>
              </div>
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedImages.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 left-1"
                        onClick={() => toggleImageSelection(url)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSave}>
                {editingPlace ? "حفظ التغييرات" : "إضافة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Library Dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>اختر الصور من المكتبة</DialogTitle>
            <DialogDescription>
              انقر على الصور لإضافتها أو إزالتها
            </DialogDescription>
          </DialogHeader>

          {mediaLibrary.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">لا توجد صور متاحة</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  قم برفع صور من صفحة مكتبة الصور أولاً
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMediaDialogOpen(false);
                    window.location.href = "/admin/media";
                  }}
                >
                  <ImageIcon className="w-4 h-4 ml-2" />
                  فتح مكتبة الصور
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>تم العثور على {mediaLibrary.length} صورة</strong> - انقر على الصور لتحديدها ({selectedImages.length} محددة)
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {mediaLibrary.map((media) => (
                  <div
                    key={media.id}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                      selectedImages.includes(media.file_url)
                        ? "border-primary ring-4 ring-primary/30 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleImageSelection(media.file_url)}
                  >
                    <img
                      src={media.file_url}
                      alt={media.file_name}
                      className="w-full h-full object-cover"
                    />
                    {selectedImages.includes(media.file_url) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white truncate">{media.file_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-between items-center gap-2 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedImages.length > 0 && `${selectedImages.length} صورة محددة`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMediaDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setMediaDialogOpen(false)}>
                تم ({selectedImages.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourismPlaces;
