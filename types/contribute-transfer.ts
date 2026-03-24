export interface ContributeTransferRequest {
    recipient_account_number: string;
    amount: number;
    notes?: string;
}

export interface ContributeTransferResponse {
    transaction_id: string;
    sender_account_id: string;
    sender_account_number: string;
    recipient_account_id: string;
    recipient_account_number: string;
    amount: number;
    transaction_type: string;
    goal_name: string;
    goal_owner: string;
    description: string;
    current_main_balance: number;
    status: string;
    completedAt: string;
}
