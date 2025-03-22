export interface Addon {
  id: string;
  type: AddonType;
  name: string;
  description: string;
  price: number;
  currency: string;
  icon?: string;
  isAvailable: boolean;
  maxQuantity?: number;
  discountPercentage?: number;
  flightRoute?: {
    origin: string;
    destination: string;
  };
}

export enum AddonType {
  BAGGAGE = 'BAGGAGE',
  MEAL = 'MEAL',
  INSURANCE = 'INSURANCE',
  SEAT_SELECTION = 'SEAT_SELECTION',
  AIRPORT_TRANSFER = 'AIRPORT_TRANSFER',
  LOUNGE_ACCESS = 'LOUNGE_ACCESS',
  PRIORITY_BOARDING = 'PRIORITY_BOARDING',
  WIFI = 'WIFI',
  ENTERTAINMENT = 'ENTERTAINMENT'
}

export interface BaggageAddon extends Addon {
  type: AddonType.BAGGAGE;
  weight: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}

export interface MealAddon extends Addon {
  type: AddonType.MEAL;
  mealType: MealType;
  dietaryOptions: DietaryOption[];
  isHotMeal: boolean;
}

export enum MealType {
  STANDARD = 'STANDARD',
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  HALAL = 'HALAL',
  KOSHER = 'KOSHER',
  DIABETIC = 'DIABETIC',
  LOW_SODIUM = 'LOW_SODIUM',
  GLUTEN_FREE = 'GLUTEN_FREE',
  SEAFOOD = 'SEAFOOD',
  CHILD_MEAL = 'CHILD_MEAL'
}

export enum DietaryOption {
  NUT_FREE = 'NUT_FREE',
  DAIRY_FREE = 'DAIRY_FREE',
  GLUTEN_FREE = 'GLUTEN_FREE',
  SEAFOOD_FREE = 'SEAFOOD_FREE',
  EGG_FREE = 'EGG_FREE'
}

export interface InsuranceAddon extends Addon {
  type: AddonType.INSURANCE;
  coverageDetails: {
    medicalCoverage: number;
    cancellationCoverage: number;
    baggageCoverage: number;
    delayCoverage: number;
  };
  provider: string;
  termsUrl: string;
}

export interface PassengerAddonSelection {
  passengerId: string;
  addons: {
    addonId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
}

export interface BookingAddons {
  bookingId: string;
  passengerSelections: PassengerAddonSelection[];
  totalPrice: number;
  currency: string;
} 