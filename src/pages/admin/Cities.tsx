import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface City {
  id: string;
  name: string;
  name_en: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

const Cities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    description: "",
    image_url: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCities(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المدن",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const cityData = {
        name: formData.name,
        name_en: formData.name_en,
        description: formData.description,
        image_url: formData.image_url,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (editingCity) {
        const { error } = await supabase
          .from("cities")
          .update(cityData)
          .eq("id", editingCity.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث المدينة بنجاح",
        });
      } else {
        const { error } = await supabase.from("cities").insert([cityData]);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة المدينة بنجاح",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchCities();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل حفظ المدينة",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      name_en: city.name_en || "",
      description: city.description || "",
      image_url: city.image_url || "",
      latitude: city.latitude?.toString() || "",
      longitude: city.longitude?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المدينة؟")) return;

    try {
      const { error } = await supabase.from("cities").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف المدينة بنجاح",
      });

      fetchCities();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل حذف المدينة",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      name_en: "",
      description: "",
      image_url: "",
      latitude: "",
      longitude: "",
    });
    setEditingCity(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">المدن والمواقع</h2>
          <p className="text-muted-foreground mt-1">إدارة المدن والمواقع الجغرافية</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة مدينة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCity ? "تعديل المدينة" : "إضافة مدينة جديدة"}
              </DialogTitle>
              <DialogDescription>
                أدخل معلومات المدينة بالتفصيل
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المدينة (عربي) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_en">اسم المدينة (English)</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) =>
                      setFormData({ ...formData, name_en: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">رابط الصورة</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">خط العرض</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    placeholder="24.7136"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">خط الطول</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    placeholder="46.6753"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            قائمة المدن ({cities.length})
          </CardTitle>
          <CardDescription>جميع المدن المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم العربي</TableHead>
                <TableHead>الاسم الإنجليزي</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الإحداثيات</TableHead>
                <TableHead>تاريخ الإضافة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    لا توجد مدن مسجلة
                  </TableCell>
                </TableRow>
              ) : (
                cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>{city.name_en || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {city.description || "-"}
                    </TableCell>
                    <TableCell>
                      {city.latitude && city.longitude ? (
                        <span className="text-xs">
                          {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(city.created_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(city)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(city.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cities;
