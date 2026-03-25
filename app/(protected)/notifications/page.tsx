"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Check, ArrowUpRight, ArrowDownLeft, Users, Heart,
    PiggyBank, Percent, Hammer, Info, CheckCheck, Filter, X, Loader2,
    Dot,
    Disc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/api/useNotification';
import { toast } from '@/hooks/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifType = 'transfer' | 'deposit' | 'p2p' | 'contribution' | 'interest' | 'break' | 'system';

interface Notification {
    id: string;
    type: NotifType;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

const typeConfig: Record<NotifType, { icon: typeof Bell; color: string; label: string }> = {
    transfer: { icon: ArrowUpRight, color: 'bg-primary/10 text-primary', label: 'Transfer' },
    deposit: { icon: ArrowDownLeft, color: 'bg-success/10 text-success', label: 'Deposit' },
    p2p: { icon: Users, color: 'bg-info/10 text-info', label: 'P2P' },
    contribution: { icon: Heart, color: 'bg-accent/10 text-accent', label: 'Contribution' },
    interest: { icon: Percent, color: 'bg-warning/10 text-warning', label: 'Interest' },
    break: { icon: Hammer, color: 'bg-destructive/10 text-destructive', label: 'Break' },
    system: { icon: Info, color: 'bg-secondary text-muted-foreground', label: 'System' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Notifications() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [page, setPage] = useState(0);
    const pageSize = 20;

    // Current time for date grouping – updated every minute
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    // TanStack Query hooks
    const { data: notificationsPage, isLoading, error, refetch } = useNotifications(page, pageSize);
    const { data: unreadCount, refetch: refetchUnread } = useUnreadCount();
    const { mutate: markAsRead, isPending: isMarking } = useMarkAsRead();
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

    // Transform API data to UI format
    const notifications = notificationsPage?.content || [];

    const markRead = (id: string) => {
        markAsRead(id, {
            onSuccess: () => {
                refetch();
                refetchUnread();
            },
            onError: (err) => {
                toast({
                    title: 'Error',
                    description: err.message,
                    variant: 'destructive',
                });
            },
        });
    };

    const markAllRead = () => {
        markAllAsRead(undefined, {
            onSuccess: () => {
                refetch();
                refetchUnread();
                toast({
                    title: 'All marked read',
                    description: 'All notifications have been marked as read.',
                });
            },
            onError: (err) => {
                toast({
                    title: 'Error',
                    description: err.message,
                    variant: 'destructive',
                });
            },
        });
    };

    const filtered = useMemo(() => {
        let list = notifications;
        if (filter === 'unread') {
            list = list.filter(n => !n.read);
        }
        return list;
    }, [notifications, filter]);

    // Group by relative date label using stable currentTime
    const grouped = useMemo(() => {
        const map = new Map<string, Notification[]>();
        const label = (iso: string) => {
            const diff = currentTime - new Date(iso).getTime();
            if (diff < 3600000) return 'Just Now';
            if (diff < 86400000) return 'Today';
            if (diff < 172800000) return 'Yesterday';
            return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        };
        filtered.forEach(n => {
            const key = label(n.created_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(n);
        });
        return map;
    }, [filtered, currentTime]);

    // Pagination controls
    const totalPages = notificationsPage?.totalPages || 0;
    const hasPrev = page > 0;
    const hasNext = page < totalPages - 1;

    const handlePrevPage = () => setPage(p => p - 1);
    const handleNextPage = () => setPage(p => p + 1);

    if (isLoading && !notificationsPage) {
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
                    <p>Failed to load notifications: {error.message}</p>
                    <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {unreadCount !== undefined && unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                </div>

                {unreadCount !== undefined && unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllRead}
                        disabled={isMarkingAll}
                        className="gap-2 border border-y-0 border-l-0 rounded-none border-green-500  relative overflow-hidden group transition-all duration-300 ease-out"
                    >
                        {/* Animated background effect */}
                        <span className="absolute inset-0 w-0 bg-green-500/10 transition-all duration-300 ease-out group-hover:w-full" />
                        <CheckCheck className="w-4 h-4" />
                        {isMarkingAll ? 'Marking...' : 'Mark all read'}
                    </Button>
                )}
            </div>

            {/* Read/Unread Toggle */}
            <div className="flex bg-secondary/50 rounded-xl p-1 w-full sm:w-auto">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    All
                    <span className="ml-1.5 text-xs text-muted-foreground">({notifications.length})</span>
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Unread
                    {unreadCount !== undefined && unreadCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Notification list */}
            <div className="space-y-6">
                {filtered.length === 0 ? (
                    <div className="glass rounded-2xl p-12 sm:p-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                            <Bell className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-semibold text-foreground">No notifications</p>
                        <p className="text-sm text-muted-foreground">
                            {filter === 'unread' ? 'You have no unread notifications' : 'You\'re all caught up!'}
                        </p>
                    </div>
                ) : (
                    <>
                        {Array.from(grouped.entries()).map(([dateLabel, items]) => (
                            <div key={dateLabel}>
                                <div className="flex items-center gap-3 mb-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">{dateLabel}</p>
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground shrink-0">{items.length}</span>
                                </div>

                                <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
                                    <AnimatePresence>
                                        {items.map((n, i) => {
                                            const { icon: Icon, color } = typeConfig[n.type] || typeConfig.system;
                                            return (
                                                <motion.div
                                                    key={n.id}
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.03 * i }}
                                                    onClick={() => !n.read && markRead(n.id)}
                                                    className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2 transition-colors cursor-pointer group ${!n.read ? 'hover:bg-primary/5' : 'hover:bg-secondary/40'
                                                        }`}
                                                >

                                                    <div className={`w-8  h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className={`text-sm font-semibold leading-tight ${!n.read ? 'text-foreground' : 'text-muted-foreground'
                                                                }`}>
                                                                {n.title}
                                                            </p>
                                                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                                                {typeConfig[n.type]?.label || 'System'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                                                            {new Date(n.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>

                                                    {!n.read && (
                                                        <button
                                                            onClick={e => { e.stopPropagation(); markRead(n.id); }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevPage}
                                    disabled={!hasPrev}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={handleNextPage}
                                    disabled={!hasNext}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
