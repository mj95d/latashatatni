import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Package, Tag, Sparkles, Store as StoreIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import LoadingSpinner from "./LoadingSpinner";

interface NotificationsPanelProps {
  onClose?: () => void;
}

const NotificationsPanel = ({ onClose }: NotificationsPanelProps) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_offer':
        return <Tag className="w-5 h-5 text-secondary" />;
      case 'new_product':
        return <Package className="w-5 h-5 text-primary" />;
      case 'featured_product':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'store_update':
        return <StoreIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on related type
    if (notification.related_type === 'offer' && notification.related_id) {
      navigate(`/offers`);
    } else if (notification.related_type === 'product' && notification.related_id) {
      navigate(`/product/${notification.related_id}`);
    }

    onClose?.();
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="md" message="جاري تحميل الإشعارات..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">الإشعارات</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
              {unreadCount} جديد
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="gap-2 text-xs"
          >
            <CheckCheck className="w-4 h-4" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-semibold">لا توجد إشعارات</p>
            <p className="text-sm text-muted-foreground mt-1">
              سنعلمك بأحدث العروض والمنتجات
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-accent/50 transition-smooth cursor-pointer relative group ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notification.is_read ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-semibold text-sm ${
                        !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 transition-smooth"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </span>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="w-3 h-3" />
                          تحديد كمقروء
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/profile');
                onClose?.();
              }}
              className="text-primary"
            >
              عرض جميع الإشعارات
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;
