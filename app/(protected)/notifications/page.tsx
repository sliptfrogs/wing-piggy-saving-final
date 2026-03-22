"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Check, ArrowUpRight, ArrowDownLeft, Users, Heart,
    PiggyBank, Percent, Hammer, Info, CheckCheck, Filter, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// ── Mock data ─────────────────────────────────────────────────────────────────

const initialNotifications: Notification[] = [
    { id: 'n1', type: 'deposit', title: 'Salary Received', message: '$2,500.00 deposited to your main account.', read: false, created_at: new Date().toISOString() },
    { id: 'n2', type: 'p2p', title: 'P2P Transfer Sent', message: 'You sent $45.50 to Jane Smith.', read: false, created_at: new Date(Date.now() - 1 * 3600000).toISOString() },
    { id: 'n3', type: 'contribution', title: 'Contribution Received', message: 'David Lee contributed $100.00 to your Vacation Fund.', read: false, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'n4', type: 'interest', title: 'Interest Credited', message: '$2.50 interest added to your Vacation Fund.', read: true, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'n5', type: 'transfer', title: 'Piggy Transfer Complete', message: '$200.00 moved to New Laptop goal.', read: true, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'n6', type: 'break', title: 'Piggy Goal Broken', message: 'Emergency Fund broken. $487.50 returned after penalty.', read: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'n7', type: 'system', title: 'Welcome to Piggywise', message: 'Your account is ready. Start saving today!', read: true, created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 'n8', type: 'deposit', title: 'Freelance Payment', message: '$850.00 deposited to your main account.', read: true, created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Notifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));

    const unreadCount = notifications.filter(n => !n.read).length;

    const filtered = useMemo(() => {
        let list = notifications;

        // Apply read/unread filter
        if (filter === 'unread') {
            list = list.filter(n => !n.read);
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            list = list.filter(n => n.type === typeFilter);
        }

        return list;
    }, [notifications, filter, typeFilter]);

    // Group by relative date label
    const grouped = useMemo(() => {
        const now = Date.now();
        const map = new Map<string, Notification[]>();
        const label = (iso: string) => {
            const diff = now - new Date(iso).getTime();
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
    }, [filtered]);

    const clearFilters = () => {
        setFilter('all');
        setTypeFilter('all');
    };

    const hasActiveFilters = filter !== 'all' || typeFilter !== 'all';

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                </div>

            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Status Toggle - Segmented Control */}
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
                        {unreadCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Type Filter - Compact Dropdown */}
                <div className="relative flex items-center gap-2 w-full sm:w-auto">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-secondary/50 border-0 hover:bg-secondary transition-all">
                            <div className="flex items-center gap-2">
                                {typeFilter !== 'all' && typeConfig[typeFilter as NotifType] ? (
                                    <>
                                        {(() => {
                                            const Icon = typeConfig[typeFilter as NotifType].icon;
                                            return <Icon className="w-4 h-4 text-primary" />;
                                        })()}
                                        <span className="text-sm">{typeConfig[typeFilter as NotifType].label}</span>
                                    </>
                                ) : (
                                    <>
                                        <Filter className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">All types</span>
                                    </>
                                )}
                            </div>
                        </SelectTrigger>
                        <SelectContent align="end" className="min-w-[180px]">
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-muted-foreground" />
                                    <span>All types</span>
                                </div>
                            </SelectItem>
                            {Object.entries(typeConfig).map(([type, cfg]) => (
                                <SelectItem key={type} value={type}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cfg.color}`}>
                                            <cfg.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{cfg.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Clear button - only when filters active */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Clear filters"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filters Display - Subtle chips */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    {filter === 'unread' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/5 text-primary border border-primary/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Unread only
                        </span>
                    )}
                    {typeFilter !== 'all' && typeConfig[typeFilter as NotifType] && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-primary/5 text-primary border border-primary/20">
                            {(() => {
                                const Icon = typeConfig[typeFilter as NotifType].icon;
                                return <Icon className="w-3 h-3" />;
                            })()}
                            {typeConfig[typeFilter as NotifType].label}
                        </span>
                    )}
                </div>
            )}

            {/* Notification list */}
            <div className="space-y-6">
                {filtered.length === 0 ? (
                    <div className="glass rounded-2xl p-12 sm:p-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                            <Bell className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-semibold text-foreground">No notifications</p>
                        <p className="text-sm text-muted-foreground">
                            {hasActiveFilters ? 'Try changing your filters' : 'You\'re all caught up!'}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="hero" size="sm" onClick={clearFilters} className="mt-2">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    Array.from(grouped.entries()).map(([dateLabel, items]) => (
                        <div key={dateLabel}>
                            {/* Date group header */}
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
                                                className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors cursor-pointer group ${!n.read ? 'hover:bg-primary/5' : 'hover:bg-secondary/40'
                                                    }`}
                                            >
                                                {/* Icon */}
                                                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className={`text-sm font-semibold leading-tight ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                                            {typeConfig[n.type]?.label || 'System'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                                                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                                                        {new Date(n.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>

                                                {/* Mark read action */}
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
                    ))
                )}
            </div>
        </div>
    );
}
