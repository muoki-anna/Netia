import pb from '@/lib/pocketbaseClient';

/**
 * Ensures the current user has a loyalty_accounts record, creating one with
 * 0 points if it doesn't exist yet, then returns it.
 */
export async function getOrCreateLoyaltyAccount() {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('Not authenticated');

  try {
    const record = await pb
      .collection('loyalty_accounts')
      .getFirstListItem(`user = "${userId}"`);
    return record;
  } catch (err) {
    if (err?.status === 404) {
      return pb.collection('loyalty_accounts').create({ user: userId, points: 0 });
    }
    throw err;
  }
}

export async function getLoyaltyTransactions() {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('Not authenticated');

  return pb.collection('loyalty_transactions').getFullList({
    filter: `user = "${userId}"`,
    sort: '-created',
  });
}

/**
 * Logs a seedling/product purchase and awards loyalty points (1 point per
 * 100 KES spent, rounded down), then updates the account balance.
 */
export async function logPurchaseAndEarnPoints({ amountKes, note }) {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('Not authenticated');

  const pointsEarned = Math.max(1, Math.floor(Number(amountKes) / 100));
  const account = await getOrCreateLoyaltyAccount();

  await pb.collection('loyalty_transactions').create({
    user: userId,
    points: pointsEarned,
    type: 'earn',
    note: note || `Purchase of KES ${amountKes}`,
  });

  return pb.collection('loyalty_accounts').update(account.id, {
    points: account.points + pointsEarned,
  });
}

/**
 * Redeems points from the account balance, recording a redeem transaction.
 */
export async function redeemPoints({ points, note }) {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('Not authenticated');

  const account = await getOrCreateLoyaltyAccount();
  const redeemAmount = Number(points);

  if (!redeemAmount || redeemAmount <= 0) {
    throw new Error('Enter a valid number of points to redeem');
  }
  if (redeemAmount > account.points) {
    throw new Error('Not enough points to redeem');
  }

  await pb.collection('loyalty_transactions').create({
    user: userId,
    points: -redeemAmount,
    type: 'redeem',
    note: note || 'Points redeemed for future purchase',
  });

  return pb.collection('loyalty_accounts').update(account.id, {
    points: account.points - redeemAmount,
  });
}
