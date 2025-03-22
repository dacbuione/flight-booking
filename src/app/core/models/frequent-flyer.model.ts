export enum TierLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum ActivityType {
  FLIGHT = 'FLIGHT',
  PROMOTION = 'PROMOTION',
  REDEMPTION = 'REDEMPTION',
  TIER_UPGRADE = 'TIER_UPGRADE',
  PARTNER_ACTIVITY = 'PARTNER_ACTIVITY'
}

export interface Benefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  availableTiers: TierLevel[];
}

export interface ActivityRecord {
  id: string;
  date: Date;
  activityType: ActivityType;
  description: string;
  pointsEarned: number;
  flightId?: string; // Optional, only for flight-related activities
}

export interface FrequentFlyer {
  id: string;
  userId: string;
  membershipNumber: string;
  tierLevel: TierLevel;
  points: number;
  tierExpiryDate: Date;
  enrollmentDate: Date;
  benefits: Benefit[];
  activityHistory: ActivityRecord[];
}

// Interface cho redemption rewards
export interface RedemptionReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: RewardCategory;
  imageUrl?: string;
  expiryDate?: Date;
}

export enum RewardCategory {
  FLIGHT = 'FLIGHT',
  UPGRADE = 'UPGRADE',
  LOUNGE_ACCESS = 'LOUNGE_ACCESS',
  PARTNER_REWARD = 'PARTNER_REWARD',
  MERCHANDISE = 'MERCHANDISE'
} 