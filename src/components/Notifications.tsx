import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Bell, Check, Briefcase, Star, Calendar, Info } from "lucide-react";

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "application" | "job_alert" | "interview" | "system";
  read: boolean;
  created_at: string;
};

const typeConfig = {
  application: { icon: <Briefcase className="w-5 h-5" />, bg: "bg-emerald-100 text-emerald-600" },
  job_alert: { icon: <Star className="w-5 h-5" />, bg: "bg-yellow-100 text-yellow-600" },
  interview: { icon: <Calendar className="w-5 h-5" />, bg: "bg-blue-100 text-blue-600" },
  system: { icon: <Info className="w-5 h-5" />, bg: "bg-gray-100 text-gray-600" },
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setNotifications((data ?? []) as Notification[]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
      if (error) throw error;
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };


  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm shadow-sm"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Sleeping bell illustration */}
          <div className="relative w-52 h-52 mb-3">
            {/* Soft glow that matches the bell's teal color */}
            <div className="absolute inset-0 bg-teal-100 rounded-full blur-2xl opacity-70 scale-90" />
            <img
              src="/notifications-empty.jpg"
              alt="No notifications"
              className="relative w-full h-full object-contain drop-shadow-lg animate-bounce-slow"
            />
          </div>

          <h3 className="text-xl font-bold text-gray-700 mb-2">All quiet here!</h3>
          <p className="text-gray-400 text-sm max-w-xs text-center leading-relaxed mb-6">
            You have no notifications yet. We'll wake you up when something important happens! 🔔
          </p>

          {/* Activity hints — what triggers notifications */}
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {[
              { emoji: "📋", text: "Application updates" },
              { emoji: "💼", text: "New job matches" },
              { emoji: "📩", text: "Employer messages" },
            ].map((hint) => (
              <div
                key={hint.text}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-500"
              >
                <span>{hint.emoji}</span>
                <span>{hint.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.system;
            return (
              <div
                key={notification.id}
                className={`rounded-2xl shadow-sm border transition-all overflow-hidden ${
                  notification.read ? "bg-white border-gray-100" : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-800 text-base">{notification.title}</h3>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Read
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
