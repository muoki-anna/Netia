import React, { useEffect, useState } from 'react';
import { Sprout, Gift, History } from 'lucide-react';
import {
  getOrCreateLoyaltyAccount,
  getLoyaltyTransactions,
  logPurchaseAndEarnPoints,
  redeemPoints,
} from '@/api/LoyaltyApi';

const RewardsPage = () => {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [acc, tx] = await Promise.all([
        getOrCreateLoyaltyAccount(),
        getLoyaltyTransactions(),
      ]);
      setAccount(acc);
      setTransactions(tx);
    } catch (err) {
      setError('Could not load your rewards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogPurchase = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await logPurchaseAndEarnPoints({ amountKes: purchaseAmount, note: 'Seedling purchase' });
      setPurchaseAmount('');
      setMessage('Points added for your purchase.');
      await load();
    } catch (err) {
      setMessage(err.message || 'Could not log this purchase.');
    } finally {
      setBusy(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await redeemPoints({ points: redeemAmount, note: 'Redeemed for future purchase' });
      setRedeemAmount('');
      setMessage('Points redeemed successfully.');
      await load();
    } catch (err) {
      setMessage(err.message || 'Could not redeem points.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10">
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">Loyalty rewards</h1>
        <p className="mt-3 text-muted-foreground">
          Every seedling and growing-media purchase earns you redeemable points — 1 point for
          every KES 100 spent. Redeem points toward future orders anytime.
        </p>
      </header>

      {loading ? (
        <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <>
          <div className="mb-10 flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-secondary/60 p-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sprout className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your points balance</p>
                <p className="font-display text-4xl text-foreground">{account?.points ?? 0}</p>
              </div>
            </div>
          </div>

          {message && (
            <p className="mb-6 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground">
              {message}
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <form
              onSubmit={handleLogPurchase}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 text-foreground">
                <Sprout className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Log a purchase</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Bought seedlings or growing media? Log the amount to earn points.
              </p>
              <input
                type="number"
                min="1"
                required
                placeholder="Amount spent (KES)"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                Earn points
              </button>
            </form>

            <form
              onSubmit={handleRedeem}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 text-foreground">
                <Gift className="h-5 w-5 text-accent" />
                <h2 className="font-semibold">Redeem points</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Use your points toward your next order at checkout.
              </p>
              <input
                type="number"
                min="1"
                required
                placeholder="Points to redeem"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-md border border-accent px-4 py-2 font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                Redeem
              </button>
            </form>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2 text-foreground">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Points history</h2>
            </div>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {transactions.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="text-foreground">{tx.note || (tx.type === 'earn' ? 'Points earned' : 'Points redeemed')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${tx.points > 0 ? 'text-primary' : 'text-destructive'}`}
                    >
                      {tx.points > 0 ? '+' : ''}
                      {tx.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RewardsPage;
