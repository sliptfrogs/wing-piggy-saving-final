'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LogOut,
  User,
  Shield,
  Edit2,
  Save,
  X,
  Wallet,
  PiggyBank,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
} from 'lucide-react'; // adjust path if needed
import { LogoutConfirmDialog } from '@/components/ui/logout-confirm-dialog';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// ── Static mock ───────────────────────────────────────────────────────────────

const mockProfile = {
  full_name: 'Alex Johnson',
  phone: '+855 12 345 678',
  email: 'alex@example.com',
  joined: 'January 2024',
};
const mockStats = [
  {
    label: 'Main Balance',
    value: formatCurrency(1250.5),
    icon: Wallet,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Total Saved',
    value: formatCurrency(4240.25),
    icon: TrendingUp,
    color: 'bg-accent/10 text-accent',
  },
  {
    label: 'Active Goals',
    value: '3',
    icon: PiggyBank,
    color: 'bg-info/10 text-info',
  },
  {
    label: 'Goals Completed',
    value: '1',
    icon: CheckCircle2,
    color: 'bg-success/10 text-success',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(mockProfile.full_name);
  const [phone, setPhone] = useState(mockProfile.phone);
  const [saving, setSaving] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleEdit = () => {
    setFullName(mockProfile.full_name);
    setPhone(mockProfile.phone);
    setEditing(true);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
    }, 700);
  };

  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* ── LEFT: identity card ── */}
        <div className="xl:col-span-1 space-y-4">
          {/* Avatar card */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-display font-bold text-foreground">
              {fullName}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mockProfile.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{phone}</p>

            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" /> Joined {mockProfile.joined}
            </div>

            {!editing && (
              <Button
                variant="glass"
                size="sm"
                className="mt-4 w-full"
                onClick={handleEdit}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
            )}
          </div>

          {/* Quick actions */}
          <div className="glass rounded-2xl p-4 space-y-2">
            <Button
              variant="glass"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/admin')}
            >
              <Shield className="w-4 h-4" /> Admin Panel
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setLogoutDialogOpen(true)} // open dialog instead of direct navigation
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* ── RIGHT: stats + edit form ── */}
        <div className="xl:col-span-2 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mockStats.map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                className="glass rounded-2xl p-4"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-display font-bold text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Edit form / info display */}
          <div className="glass rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">
                Account Info
              </h3>
              {editing ? (
                <button
                  onClick={() => setEditing(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="hero"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-1.5" />{' '}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { icon: User, label: 'Full Name', value: fullName },
                  { icon: Mail, label: 'Email', value: mockProfile.email },
                  { icon: Phone, label: 'Phone', value: phone },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-background border border-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Logout confirmation dialog */}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </div>
  );
}
