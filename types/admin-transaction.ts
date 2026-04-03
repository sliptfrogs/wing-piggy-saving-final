export interface AdminTransaction {
  amount: number;
  balance_after: number | null;
  counterparty_email: string;
  counterparty_name: string;
  created_at: string;
  description: string | null;
  entry_type: string | null;
  from_account_mask: string;
  goal_name: string | null;
  metadata: Record<string, unknown>;
  status: string;
  to_account_mask: string;
  transaction_id: string;
  transaction_type: string;
}
