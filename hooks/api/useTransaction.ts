import { transactionService } from '@/lib/api/services/transaction.service';
import { PageResponse, TransactionResponseDto } from '@/lib/zod/transaction-response';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';


export const useTransactions = (page: number = 0, size: number = 10) => {
    const { data: session } = useSession();
    const token = session?.accessToken;

    return useQuery<PageResponse<TransactionResponseDto>>({
        queryKey: ['transactions', 'all', page, size, token],
        queryFn: () => transactionService.getAll(token!, page, size),
        enabled: !!token,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useTransactionsByType = (type: string, page: number = 0, size: number = 10) => {
    const { data: session } = useSession();
    const token = session?.accessToken;

    return useQuery<PageResponse<TransactionResponseDto>>({
        queryKey: ['transactions', 'type', type, page, size, token],
        queryFn: () => transactionService.getByType(token!, type, page, size),
        enabled: !!token && !!type,
        staleTime: 5 * 60 * 1000,
    });
};

export const useTransactionsByDateRange = (
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 10
) => {
    const { data: session } = useSession();
    const token = session?.accessToken;

    return useQuery<PageResponse<TransactionResponseDto>>({
        queryKey: ['transactions', 'date-range', startDate, endDate, page, size, token],
        queryFn: () => transactionService.getByDateRange(token!, startDate, endDate, page, size),
        enabled: !!token && !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000,
    });
};

export const useRecentTransactions = (limit: number = 5) => {
    const { data: session } = useSession();
    const token = session?.accessToken;

    return useQuery<TransactionResponseDto[]>({
        queryKey: ['transactions', 'recent', limit, token],
        queryFn: () => transactionService.getRecent(token!, limit),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });
};
