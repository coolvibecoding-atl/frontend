'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { User, CreditCard, Settings, Bell, Shield, LogOut, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PLANS, PlanType } from '@/lib/stripe';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    currentPeriodEnd: Date | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user?.id) return;
      
      try {
        const res = await fetch('/api/subscription');
        const data = await res.json();
        if (data.subscription) {
          setSubscription(data.subscription);
        } else {
          setSubscription({
            plan: 'FREE',
            status: 'active',
            currentPeriodEnd: null,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user?.id]);

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlan = subscription?.plan?.toUpperCase() as PlanType || 'FREE';
  const planDetails = PLANS[currentPlan] || PLANS.FREE;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="panel p-6">
              <div className="flex items-center gap-4 mb-4">
                {user?.imageUrl ? (
                  <Image 
                    src={user.imageUrl} 
                    alt={user.fullName || 'Profile'}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-[var(--accent-primary)]" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{user?.fullName || 'User'}</h2>
                  <p className="text-[var(--text-secondary)]">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="panel p-4">
              <ul className="space-y-2">
                <li>
                  <a href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                    <User className="w-5 h-5" />
                    Profile
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <CreditCard className="w-5 h-5" />
                    Tracks
                  </a>
                </li>
                <li>
                  <a href="/dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <Settings className="w-5 h-5" />
                    History
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Card */}
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[var(--accent-primary)]" />
                  Subscription
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription?.status === 'active' 
                    ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                    : 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]'
                }`}>
                  {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold">{planDetails.name} Plan</h4>
                    <p className="text-[var(--text-secondary)]">
                      {planDetails.price === 0 ? 'Free forever' : `$${planDetails.price}/month`}
                    </p>
                  </div>
                  {currentPlan !== 'FREE' && (
                    <button
                      type="button"
                      onClick={handleManageBilling}
                      className="btn-secondary"
                    >
                      Manage Billing
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Plan Features</h4>
                {planDetails.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                    {feature}
                  </div>
                ))}
              </div>

              {currentPlan === 'FREE' && (
                <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
                  <Link href="/#pricing" className="btn-primary w-full text-center block">
                    Upgrade to Pro
                  </Link>
                </div>
              )}
            </div>

            {/* Account Settings */}
            <div className="panel p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
                Account Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-tertiary)]">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-[var(--text-secondary)]">Get updates about your tracks</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[var(--border-default)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-tertiary)]">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[var(--text-secondary)]" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-[var(--text-secondary)]">Add extra security to your account</p>
                    </div>
                  </div>
                  <button type="button" className="btn-secondary text-sm">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--accent-secondary)]/10">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-[var(--accent-secondary)]" />
                    <div>
                      <p className="font-medium text-[var(--accent-secondary)]">Sign Out</p>
                      <p className="text-sm text-[var(--text-secondary)]">Sign out of your account</p>
                    </div>
                  </div>
                  <button type="button" className="btn-danger text-sm">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
