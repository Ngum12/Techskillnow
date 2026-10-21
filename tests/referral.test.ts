import { test } from "node:test";
import assert from "node:assert/strict";
import { countFriends, rewardStatus } from "@/lib/referral-math";

test("referral: buying with your own link does not count", () => {
  const orders = [{ buyer_phone: "677 11 22 33" }, { buyer_phone: "+237 677112233" }, { buyer_phone: "699 00 00 01" }, { buyer_phone: "650000002" }];
  assert.equal(countFriends(orders, "677112233"), 2);
  assert.equal(countFriends(orders, "00237 677 11 22 33"), 2);
  assert.equal(countFriends(orders, ""), 4);
});

test("referral: one free course for every 3 friends", () => {
  assert.deepEqual(rewardStatus(0, 0, 3), { earned: 0, available: 0, towardsNext: 0, perCourse: 3 });
  assert.deepEqual(rewardStatus(2, 0, 3), { earned: 0, available: 0, towardsNext: 2, perCourse: 3 });
  assert.deepEqual(rewardStatus(3, 0, 3), { earned: 1, available: 1, towardsNext: 0, perCourse: 3 });
  assert.deepEqual(rewardStatus(7, 1, 3), { earned: 2, available: 1, towardsNext: 1, perCourse: 3 });
  assert.equal(rewardStatus(7, 5, 3).available, 0, "never negative");
});
