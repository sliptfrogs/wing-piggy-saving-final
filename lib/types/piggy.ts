// types/piggy.ts

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface PiggyGoal {
  piggy_goal_id: string;
  goal_name: string;
  target_amount: number;
  balance: number;
  goal_status: GoalStatus;
  account_id: string;
  account_number: string;
  currency: string;
  is_public: boolean;
  hide_balance?: boolean;
  locked_at?: string;
  lock_expires_at?: string;
  created_at: string;
  user_id: string;
}

export interface CreatePiggyRequest {
  name: string; // matches the request field
  targetAmount: number; // camelCase as API expects
  hideBalance: boolean;
  lockPeriodDays: number;
}
