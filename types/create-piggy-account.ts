// Add these types
export interface CreatePiggyGoalRequest {
  name: string;
  target_amount: number;
  hide_balance: boolean;
  lock_period_days?: number; // optional
}

export interface CreatePiggyGoalResponse {
  account: unknown; // or specific type if needed
  piggyGoal: unknown;
}
