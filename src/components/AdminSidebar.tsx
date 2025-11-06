import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Store,
  Package,
  Tag,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  ScrollText,
  Shield,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  UserPlus,
  MessageCircle,
  Image
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminMenuItems = [
  { title: "لوحة التحكم", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "إدارة المستخدمين", url: "/admin/users", icon: Users },
  { title: "طلبات التجار", url: "/admin/merchant-requests", icon: UserCheck },
  { title: "الطلبات", url: "/admin/orders", icon: ShoppingCart },
  { title: "طلبات الواتساب", url: "/admin/whatsapp-orders", icon: MessageCircle },
  { title: "إدارة المتاجر", url: "/admin/stores", icon: Store },
  { title: "إدارة المنتجات", url: "/admin/products", icon: Package },
  { title: "إدارة العروض", url: "/admin/offers", icon: Tag },
  { title: "طلبات الاشتراكات", url: "/admin/subscriptions", icon: CreditCard },
  { title: "المدن والمواقع", url: "/admin/cities", icon: MapPin },
  { title: "مكتبة الصور", url: "/admin/media", icon: Image },
  { title: "التقارير", url: "/admin/reports", icon: FileText },
  { title: "السجلات", url: "/admin/logs", icon: ScrollText },
  { title: "صلاحيات الأدمن", url: "/admin/roles", icon: Shield },
  { title: "إنشاء حسابات أدمن", url: "/admin/create-admins", icon: UserPlus },
  { title: "الإعدادات", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" 
      : "hover:bg-muted/50 text-foreground";

  return (
    <Sidebar side="right" className={isCollapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-card border-r">
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-bold bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              لوحة التحكم
            </h2>
          )}
        </div>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">القائمة الرئيسية</SidebarGroupLabel>}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"} />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
