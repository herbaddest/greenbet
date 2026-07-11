import type { AppNotification } from "@/types"
import { supabase } from "@/lib/supabase"

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase.from("sportsbook_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20)
  if (error || !data) return []
  return data.map((item) => ({ id: item.id, type: item.type, title: item.title, message: item.message, isRead: item.is_read, createdAt: item.created_at, actionUrl: item.action_url }))
}
