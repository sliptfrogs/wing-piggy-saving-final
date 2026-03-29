export interface OwnPiggyTransferRequest {
  recipient_account_number: string; // or piggy_account_id – check your backend
  amount: number;
  notes?: string;
}
export interface OwnPiggyTransferResponse {
  amount: number;
  completed_at: string | null;
  description: string;
  from_account_id: string;
  from_account_number: string;
  goal_completed: boolean;
  new_main_balance: number;
  new_piggy_balance: number;
  to_account_id: string;
  to_account_number: string;
  transaction_id: string;
  type: string;
}
