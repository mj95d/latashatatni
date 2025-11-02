import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, LogIn, UserCheck, Edit, Trash2, Plus } from "lucide-react";

interface UserActivityTimelineProps {
  userId: string;
}

export const UserActivityTimeline = ({ userId }: UserActivityTimelineProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      login: LogIn,
      signup: UserCheck,
      update: Edit,
      delete: Trash2,
      create: Plus,
    };
    
    const Icon = icons[type] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      login: "bg-blue-100 text-blue-700 border-blue-300",
      signup: "bg-green-100 text-green-700 border-green-300",
      update: "bg-yellow-100 text-yellow-700 border-yellow-300",
      delete: "bg-red-100 text-red-700 border-red-300",
      create: "bg-purple-100 text-purple-700 border-purple-300",
    };
    
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">لا توجد نشاطات مسجلة</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4">سجل النشاط</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4 items-start">
            <div className="relative">
              <Badge variant="outline" className={`${getActivityColor(activity.activity_type)} p-2`}>
                {getActivityIcon(activity.activity_type)}
              </Badge>
              {index !== activities.length - 1 && (
                <div className="absolute top-10 right-1/2 transform translate-x-1/2 w-0.5 h-8 bg-border" />
              )}
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium">{activity.activity_description || activity.activity_type}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
                  {new Date(activity.created_at).toLocaleString("ar-SA", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              
              {activity.ip_address && (
                <p className="text-xs text-muted-foreground" dir="ltr">
                  IP: {activity.ip_address}
                </p>
              )}
              
              {activity.user_agent && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {activity.user_agent}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};