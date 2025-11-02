import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, Search, Filter, Download, Loader2, Calendar } from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  user_email: string;
  user_name: string;
  table_name: string;
  record_id: string;
  changes: any;
  timestamp: string;
  ip_address?: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, actionFilter, dateFilter, logs]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // في الوقت الحالي، سنعرض سجلات وهمية
      // يمكن لاحقاً إضافة جدول audit_logs في قاعدة البيانات
      const mockLogs: LogEntry[] = [
        {
          id: "1",
          action: "CREATE",
          user_email: "admin@example.com",
          user_name: "المشرف الرئيسي",
          table_name: "stores",
          record_id: "store-123",
          changes: { name: "متجر جديد", city: "الرياض" },
          timestamp: new Date().toISOString(),
          ip_address: "192.168.1.1",
        },
        {
          id: "2",
          action: "UPDATE",
          user_email: "merchant@example.com",
          user_name: "تاجر النجاح",
          table_name: "offers",
          record_id: "offer-456",
          changes: { discount_percentage: 20 },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip_address: "192.168.1.2",
        },
        {
          id: "3",
          action: "DELETE",
          user_email: "admin@example.com",
          user_name: "المشرف الرئيسي",
          table_name: "users",
          record_id: "user-789",
          changes: null,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ip_address: "192.168.1.1",
        },
        {
          id: "4",
          action: "CREATE",
          user_email: "user@example.com",
          user_name: "مستخدم عادي",
          table_name: "orders",
          record_id: "order-321",
          changes: { total_amount: 500, status: "NEW" },
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          ip_address: "192.168.1.3",
        },
      ];

      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل السجلات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // فلترة بالبحث
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.table_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة بنوع العملية
    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // فلترة بالتاريخ
    if (dateFilter !== "all") {
      const now = Date.now();
      const filterTime = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      }[dateFilter as keyof typeof filterTime];

      if (filterTime) {
        filtered = filtered.filter(
          (log) => now - new Date(log.timestamp).getTime() < filterTime
        );
      }
    }

    setFilteredLogs(filtered);
  };

  const getActionBadge = (action: string) => {
    const variants = {
      CREATE: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
    } as const;

    const labels = {
      CREATE: "إنشاء",
      UPDATE: "تحديث",
      DELETE: "حذف",
    } as const;

    return (
      <Badge variant={variants[action as keyof typeof variants] || "outline"}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const exportLogs = () => {
    toast({
      title: "قريباً",
      description: "ميزة تصدير السجلات ستكون متاحة قريباً",
    });
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
          <h2 className="text-3xl font-bold">سجلات النظام</h2>
          <p className="text-muted-foreground mt-1">
            سجل شامل لجميع العمليات والأنشطة في النظام
          </p>
        </div>

        <Button onClick={exportLogs} className="gap-2">
          <Download className="h-4 w-4" />
          تصدير السجلات
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                سجل الأنشطة ({filteredLogs.length})
              </CardTitle>
              <CardDescription>
                جميع العمليات المسجلة في النظام
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في السجلات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل العمليات</SelectItem>
                  <SelectItem value="CREATE">إنشاء</SelectItem>
                  <SelectItem value="UPDATE">تحديث</SelectItem>
                  <SelectItem value="DELETE">حذف</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Calendar className="h-4 w-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ والوقت</TableHead>
                <TableHead>العملية</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>الجدول</TableHead>
                <TableHead>معرف السجل</TableHead>
                <TableHead>عنوان IP</TableHead>
                <TableHead>التغييرات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    لا توجد سجلات مطابقة للفلاتر المحددة
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.user_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {log.user_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {log.table_name}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{log.record_id}</code>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.ip_address || "-"}
                    </TableCell>
                    <TableCell>
                      {log.changes ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded block max-w-xs truncate">
                          {JSON.stringify(log.changes)}
                        </code>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">ملاحظة:</p>
            <p>
              هذه النسخة التجريبية من السجلات. لتفعيل التسجيل الكامل، يجب إضافة
              جدول audit_logs في قاعدة البيانات مع triggers لتسجيل جميع العمليات
              تلقائياً.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
