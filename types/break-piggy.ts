export interface BreakPiggyRequest {
  piggy_account_number: string;
}
export interface BreakPiggyResponse {
  completed_at: string | null;
  goal_name: string;
  new_main_balance: number;
  original_balance: number;
  penalty_amount: number;
  penalty_percentage: number;
  piggy_goal_id: string;
  return_amount: number;
  transaction_id: string;
  was_early_break: boolean;
}
