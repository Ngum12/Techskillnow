/** Referral reward rules, kept pure so they can be tested. */

const digits = (phone: string) => phone.replace(/\D/g, "").replace(/^(00)?237/, "");

/**
 * Friends who count: paid orders made with the referrer's link, excluding the referrer
 * buying for themselves (same phone number).
 */
export function countFriends(orders: { buyer_phone: string }[], referrerPhone: string): number {
  const own = digits(referrerPhone);
  return orders.filter((o) => !own || digits(o.buyer_phone) !== own).length;
}

/** Free courses earned so far, still available to claim, and friends needed for the next one. */
export function rewardStatus(friends: number, claimed: number, perCourse: number) {
  const earned = Math.floor(friends / perCourse);
  return {
    earned,
    available: Math.max(0, earned - claimed),
    /** Progress towards the next free course, e.g. 2 of 3. */
    towardsNext: friends % perCourse,
    perCourse,
  };
}
