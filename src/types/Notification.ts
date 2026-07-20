export type NotificationKind = 'info' | 'warning' | 'success' | 'alert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  read: boolean;
  createdAt: string;
  link?: string;
}
