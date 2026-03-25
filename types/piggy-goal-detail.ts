export interface PiggyGoalDetail {
  id: string;
  name: string;
  target_amount: number;
  status: string;          // e.g., "ACTIVE", "BROKEN", "COMPLETED"
  lock_expires_at: string | null;
  created_at: string;
  account_number: string;
  current_balance: number;
  is_public: boolean;
  hide_balance: boolean;
  currency: string;
}
