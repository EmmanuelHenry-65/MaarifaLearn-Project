import { supabase } from '../lib/supabase';

export type NotificationType = 'system' | 'exam' | 'planner' | 'achievement' | 'ai';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

interface RawNotificationRow {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(userId: string, limit = 10): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, notification_type, is_read, created_at')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<RawNotificationRow[]>();

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.notification_type,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function markAllRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

export async function createNotification(userId: string, title: string, message: string, type: NotificationType): Promise<void> {
  const { error } = await supabase.from('notifications').insert({ profile_id: userId, title, message, notification_type: type });
  if (error) throw error;
}
