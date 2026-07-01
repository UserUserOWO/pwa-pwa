import { supabase } from "@/lib/supabase";
import { Notification } from "@/types";

/**
 * Centralized notification service.
 * Currently stores in database. Future: add Push, Email, SMS.
 */
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      data: params.data ?? {},
      read: false,
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as unknown as Notification[]) || [];
}

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}