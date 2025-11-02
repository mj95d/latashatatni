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
import { ScrollText, Search, Filter, Download, Loader2, Calendar, RefreshCw } from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  user_email: string | null;
  user_name: string | null;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  timestamp: string;
  ip_address?: string | null;
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

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const formattedLogs: LogEntry[] = (data || []).map((log) => ({
        id: log.id,
        action: log.action,
        user_email: log.user_email,
        user_name: log.user_name,
        table_name: log.table_name,
        record_id: log.record_id,
        old_data: log.old_data,
        new_data: log.new_data,
        timestamp: log.timestamp,
        ip_address: log.ip_address,
      }));

      setLogs(formattedLogs);
      setFilteredLogs(formattedLogs);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل السجلات: " + error.message,
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
    const csvContent = [
      ["التاريخ", "العملية", "المستخدم", "الجدول", "معرف السجل"],
      ...filteredLogs.map((log) => [
        formatTimestamp(log.timestamp),
        log.action,
        `${log.user_name || "-"} (${log.user_email || "-"})`,
        log.table_name,
        log.record_id || "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "تم التصدير",
      description: "تم تصدير السجلات بنجاح",
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
            سجل شامل لجميع العمليات والأنشطة في النظام ({filteredLogs.length} سجل)
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={exportLogs} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>
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
                      {log.new_data ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-primary">عرض التفاصيل</summary>
                          <code className="text-xs bg-muted px-2 py-1 rounded block mt-2 max-w-md overflow-auto">
                            {JSON.stringify(log.new_data, null, 2)}
                          </code>
                        </details>
                      ) : log.old_data ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-destructive">بيانات محذوفة</summary>
                          <code className="text-xs bg-muted px-2 py-1 rounded block mt-2 max-w-md overflow-auto">
                            {JSON.stringify(log.old_data, null, 2)}
                          </code>
                        </details>
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

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-sm">
            <p className="font-medium mb-2 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-primary" />
              معلومات السجلات:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>يتم تسجيل جميع العمليات تلقائياً في قاعدة البيانات</li>
              <li>السجلات مرتبطة بالجداول: المتاجر، العروض، الأدوار، الاشتراكات</li>
              <li>يمكن تصدير السجلات بصيغة CSV للمراجعة والتحليل</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
