import React from 'react';
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Heart,
  Gamepad2,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Banknote,
  Laptop,
  TrendingUp,
  PlusCircle,
  Coffee,
  Plane,
  Home,
  Shield,
  Smartphone,
  Gift,
  HelpCircle,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Heart,
  Gamepad2,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Banknote,
  Laptop,
  TrendingUp,
  PlusCircle,
  Coffee,
  Plane,
  Home,
  Shield,
  Smartphone,
  Gift,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
};

export const AVAILABLE_ICONS = [
  'UtensilsCrossed',
  'Car',
  'ShoppingBag',
  'Heart',
  'Gamepad2',
  'FileText',
  'GraduationCap',
  'MoreHorizontal',
  'Banknote',
  'Laptop',
  'TrendingUp',
  'PlusCircle',
  'Coffee',
  'Plane',
  'Home',
  'Shield',
  'Smartphone',
  'Gift',
];
