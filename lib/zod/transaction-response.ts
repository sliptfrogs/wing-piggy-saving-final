// lib/api/services/transaction.service.ts

// A single transaction
export interface TransactionResponseDto {
  transaction_id: string;
  transaction_type: string; // e.g., "P2P_TRANSFER", "GOAL_CONTRIBUTION"
  amount: number;
  entry_type: string; // "CREDIT" or "DEBIT"
  status: string;
  created_at: string; // ISO datetime
  from_account_mask?: string;
  to_account_mask?: string;
  counterparty_email?: string;
  counterparty_name?: string;
  goal_name?: string;
  metadata?: { description?: string };
  // optional fields not present in all transactions
  balance_after?: number;
  description?: string | null;
}

// Paginated response
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; unsorted: boolean; empty: boolean };
  };
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number (0‑based)
  sort: { sorted: boolean; unsorted: boolean; empty: boolean };
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
