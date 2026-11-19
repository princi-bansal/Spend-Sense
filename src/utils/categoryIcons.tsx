import React from 'react';
import {
  Utensils,
  ShoppingBasket,
  Car,
  Home,
  Zap,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  CircleDollarSign,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Rocket,
  Smartphone,
  CreditCard,
  Landmark,
  Banknote,
} from 'lucide-react';

export function getCategoryIcon(category: string, className = 'w-4 h-4'): React.ReactNode {
  switch (category) {
    case 'Food & Dining':
      return <Utensils className={className} />;
    case 'Groceries':
      return <ShoppingBasket className={className} />;
    case 'Transport':
      return <Car className={className} />;
    case 'Housing & Rent':
      return <Home className={className} />;
    case 'Utilities & Bills':
      return <Zap className={className} />;
    case 'Shopping':
      return <ShoppingBag className={className} />;
    case 'Entertainment':
      return <Film className={className} />;
    case 'Health & Fitness':
      return <HeartPulse className={className} />;
    case 'Education':
      return <GraduationCap className={className} />;
    case 'Salary':
      return <Briefcase className={className} />;
    case 'Freelance':
      return <Laptop className={className} />;
    case 'Investments':
      return <TrendingUp className={className} />;
    case 'Gift & Bonus':
      return <Gift className={className} />;
    case 'Side Hustle':
      return <Rocket className={className} />;
    default:
      return <CircleDollarSign className={className} />;
  }
}

export function getPaymentIcon(method: string, className = 'w-3.5 h-3.5'): React.ReactNode {
  switch (method) {
    case 'UPI':
      return <Smartphone className={className} />;
    case 'Credit Card':
    case 'Debit Card':
      return <CreditCard className={className} />;
    case 'Bank Transfer':
      return <Landmark className={className} />;
    case 'Cash':
      return <Banknote className={className} />;
    default:
      return <CircleDollarSign className={className} />;
  }
}
