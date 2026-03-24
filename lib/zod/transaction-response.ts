// lib/api/services/transaction.service.ts

// A single transaction
export interface TransactionResponseDto {
  id: string;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  type: string;                 // "P2P", "CONTRIBUTE", "OWN"
  description: string;
  completedAt: string;          // ISO date-time string
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
  number: number;               // current page number (0‑based)
  sort: { sorted: boolean; unsorted: boolean; empty: boolean };
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
