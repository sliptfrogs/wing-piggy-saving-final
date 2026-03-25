"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, ArrowDownLeft, Users, Heart, RotateCcw,
    Percent, Hammer, Filter, ArrowUpDown,
    TrendingUp, TrendingDown, Search, X, Calendar, Loader2,
    RefreshCw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/api/useTransaction';
import { TransactionResponseDto } from '@/lib/zod/transaction-response';


function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type FilterType = 'all' | 'interest' | 'p2p' | 'contribution' | 'deposit' | 'transfer';

interface UITransaction {
    id: string;
    type: FilterType;
    description: string;
    amount: number;
    status: string;
    created_at: string;
    isCredit: boolean;
    fromMask?: string;
    toMask?: string;
    counterpartyName?: string;
    goalName?: string;
}

const typeMap: Record<string, FilterType> = {
    'P2P_TRANSFER': 'p2p',
    'GOAL_CONTRIBUTION': 'contribution',
    'INTEREST': 'interest',
};

const typeConfig: Record<FilterType, { icon: typeof ArrowUpRight; color: string; label: string }> = {
    p2p: { icon: Users, color: 'bg-info/10 text-info', label: 'P2P' },
    contribution: { icon: Heart, color: 'bg-accent/10 text-accent', label: 'Contribution' },
    deposit: { icon: ArrowDownLeft, color: 'bg-success/10 text-success', label: 'Deposit' },
    transfer: { icon: ArrowUpRight, color: 'bg-primary/10 text-primary', label: 'Transfer' },
    interest: { icon: Percent, color: 'bg-warning/10 text-warning', label: 'Interest' },
    all: { icon: Filter, color: 'bg-secondary text-muted-foreground', label: 'All' },
};

function mapTransactionToUI(tx: TransactionResponseDto): UITransaction {
    const uiType = typeMap[tx.transaction_type] || 'transfer';
    const isCredit = tx.entry_type === 'CREDIT';
    const description = tx.description ||
        (uiType === 'contribution' ? 'Contribution to Goal' :
            uiType === 'p2p' ? 'P2P Transfer' : 'Transaction');

    return {
        id: tx.transaction_id,
        type: uiType,
        description,
        amount: tx.amount,
        status: tx.status?.toLowerCase() || 'completed',
        created_at: tx.created_at,
        isCredit,
        fromMask: tx.from_account_mask,
        toMask: tx.to_account_mask,
        counterpartyName: tx.counterparty_name || '',
        goalName: tx.goal_name || '',
    };
}

export default function TransactionHistory() {
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const { data: pageData, isLoading, error, isFetching } = useTransactions(page, pageSize);

    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const transactions: UITransaction[] = useMemo(() => {
        if (!pageData?.content) return [];
        return pageData.content.map(mapTransactionToUI);
    }, [pageData]);

    const filtered: UITransaction[] = useMemo(() => {
        let list = filterType === 'all'
            ? transactions
            : transactions.filter(tx => tx.type === filterType);

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(tx =>
                tx.description.toLowerCase().includes(q) ||
                tx.type.includes(q)
            );
        }

        return [...list].sort((a, b) => {
            switch (sortKey) {
                case 'date-asc':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
    }, [transactions, sortKey, filterType, searchQuery]);

    const summary = useMemo(() => {
        const totalIn = filtered.filter(tx => tx.isCredit).reduce((s, t) => s + t.amount, 0);
        const totalOut = filtered.filter(tx => !tx.isCredit).reduce((s, t) => s + t.amount, 0);
        return { totalIn, totalOut, net: totalIn - totalOut, count: filtered.length };
    }, [filtered]);

    const grouped = useMemo(() => {
        const map = new Map<string, UITransaction[]>();
        filtered.forEach(tx => {
            const key = new Date(tx.created_at).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
            });
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(tx);
        });
        return map;
    }, [filtered]);

    const activeFiltersCount = (filterType !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);
    const totalPages = pageData?.totalPages ?? 0;
    const hasPrev = page > 0;
    const hasNext = page < totalPages - 1;

    const handlePrevPage = () => setPage(p => p - 1);
    const handleNextPage = () => setPage(p => p + 1);

    if (isLoading && !pageData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-destructive">
                    <p>Failed to load transactions: {error.message}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Transaction History</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {pageData?.totalElements ?? 0} total transactions
                    </p>
                </div>
                <div className="flex gap-2 sm:hidden">
                    <Button variant="outline" size="sm" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total In', value: formatCurrency(summary.totalIn), icon: TrendingUp, color: 'bg-success/10 text-success' },
                    { label: 'Total Out', value: formatCurrency(summary.totalOut), icon: TrendingDown, color: 'bg-destructive/10 text-destructive' },
                    { label: 'Net', value: formatCurrency(summary.net), icon: ArrowUpDown, color: summary.net >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive' },
                    { label: 'Shown', value: `${summary.count} tx`, icon: Filter, color: 'bg-secondary text-muted-foreground' },
                ].map(({ label, value, icon: Icon, color }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4"
                    >
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center mb-1 sm:mb-2 ${color}`}>
                            <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        </div>
                        <p className="text-base sm:text-lg font-display font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6">
                <aside className="hidden lg:block lg:col-span-4 space-y-4">
                    <div className="glass rounded-2xl p-5 sticky top-24 transition-all hover:shadow-md">
                        <div className="flex items-center gap-2 mb-5 pb-2 border-b border-border/50">
                            <Filter className="w-4 h-4 text-primary" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter & Sort</p>
                            {activeFiltersCount > 0 && (
                                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/20 text-primary">
                                    {activeFiltersCount} active
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">Transaction Type</p>
                                {filterType !== 'all' && (
                                    <button onClick={() => setFilterType('all')} className="text-xs text-muted-foreground hover:text-primary">
                                        Clear
                                    </button>
                                )}
                            </div>
                            <Select value={filterType} onValueChange={v => setFilterType(v as FilterType)}>
                                <SelectTrigger className="w-full bg-secondary/70 border-border hover:bg-secondary transition-colors">
                                    <SelectValue placeholder="All transactions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Transactions</SelectItem>
                                    {Object.entries(typeConfig).map(([type, cfg]) => type !== 'all' && (
                                        <SelectItem key={type} value={type}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center ${cfg.color}`}>
                                                    <cfg.icon className="w-3 h-3" />
                                                </div>
                                                {cfg.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-xs font-medium text-muted-foreground">Sort by</p>
                            <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
                                <SelectTrigger className="w-full bg-secondary/70 border-border hover:bg-secondary transition-colors">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date-desc">📅 Newest First</SelectItem>
                                    <SelectItem value="date-asc">📅 Oldest First</SelectItem>
                                    <SelectItem value="amount-desc">💰 Highest Amount</SelectItem>
                                    <SelectItem value="amount-asc">💰 Lowest Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </aside>

                <AnimatePresence>
                    {mobileFiltersOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="lg:hidden fixed inset-x-0 top-0 z-50 p-4 bg-background/95 backdrop-blur-lg border-b border-border"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-foreground">Filters</h3>
                                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <p className="text-xs text-muted-foreground">Transaction Type</p>
                                    <Select value={filterType} onValueChange={v => setFilterType(v as FilterType)}>
                                        <SelectTrigger className="w-full bg-secondary border-border text-foreground">
                                            <SelectValue placeholder="All transactions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Transactions</SelectItem>
                                            {Object.entries(typeConfig).map(([type, cfg]) => type !== 'all' && (
                                                <SelectItem key={type} value={type}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center ${cfg.color}`}>
                                                            <cfg.icon className="w-3 h-3" />
                                                        </div>
                                                        {cfg.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-xs text-muted-foreground">Sort by</p>
                                    <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
                                        <SelectTrigger className="h-9 text-xs bg-secondary border-border text-foreground">
                                            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date-desc">Newest First</SelectItem>
                                            <SelectItem value="date-asc">Oldest First</SelectItem>
                                            <SelectItem value="amount-desc">Highest Amount</SelectItem>
                                            <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="hero" size="sm" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                                    Apply Filters
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="lg:col-span-4">
                    {filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-background to-secondary/5 border border-border/50 shadow-lg"
                        >
                            <div className="absolute inset-0 opacity-30">
                                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>
                            <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
                                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center mb-5 border border-border/50 shadow-inner">
                                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/60" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground mb-2">
                                    {filterType !== 'all' || searchQuery ? 'No results' : 'Your journey starts here'}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
                                    {filterType !== 'all' || searchQuery
                                        ? "We couldn't find any transactions matching your current filters. Try a different combination."
                                        : "When you make a transfer or receive money, transactions will appear here."}
                                </p>
                                {(filterType !== 'all' || searchQuery) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setFilterType('all'); setSearchQuery(''); }}
                                        className="group rounded-full px-6 border-primary/20 hover:border-primary/40 transition-colors duration-200"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <div className="space-y-5 sm:space-y-6">
                                {Array.from(grouped.entries()).map(([date, txs]) => (
                                    <div key={date}>
                                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">{date}</p>
                                            <div className="flex-1 h-px bg-border" />
                                            <span className="text-xs text-muted-foreground shrink-0">{txs.length} tx</span>
                                        </div>
                                        <div className="space-y-2">
                                            {txs.map((tx, i) => {
                                                const cfg = typeConfig[tx.type];
                                                const Icon = cfg.icon;
                                                return (
                                                    <motion.div
                                                        key={tx.id}
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.02 * Math.min(i, 10) }}
                                                        className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-secondary/40 transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                                                                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                                                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                                                                        {new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tx.status === 'completed' ? 'bg-success/10 text-success' :
                                                                        tx.status === 'reversed' ? 'bg-destructive/10 text-destructive' :
                                                                            'bg-secondary text-muted-foreground'
                                                                        }`}>
                                                                        {tx.status}
                                                                    </span>
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-secondary/50 text-muted-foreground">
                                                                        {cfg.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className={`text-sm sm:text-base font-bold tabular-nums ${tx.isCredit ? 'text-success' : 'text-foreground'}`}>
                                                                    {tx.isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                                <Button variant="outline" onClick={handlePrevPage} disabled={!hasPrev || isFetching}>
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button variant="outline" onClick={handleNextPage} disabled={!hasNext || isFetching}>
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
