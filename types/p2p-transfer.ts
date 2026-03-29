export interface P2PTransferRequest {
    recipient_account_number: string;
    amount: number;
}
export interface P2PTransferResponse {
    transaction_id: string;
    from_account_id: string;
    from_account_number: string;
    to_account_id: string;
    to_account_number: string;
    amount: number;
    type: string;
    recipient_name: string;
    description: string;
    new_main_balance: number;
    completed_at: string;
}

