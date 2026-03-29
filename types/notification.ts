export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
export type NotifType =
  | 'transfer'
  | 'deposit'
  | 'p2p'
  | 'contribution'
  | 'interest'
  | 'break'
  | 'system';
