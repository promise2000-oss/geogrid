import {
  Bell,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Gauge,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const APP_NAV: NavItem[] = [
  { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard, end: true },
  { label: "Assignments", to: "/app/assignments", icon: FileText },
  { label: "Grades", to: "/app/grades", icon: Gauge },
  { label: "Payments", to: "/app/payments", icon: CircleDollarSign },
  { label: "Notifications", to: "/app/notifications", icon: Bell },
  { label: "Calendar", to: "/app/calendar", icon: CalendarDays },
  { label: "Settings", to: "/app/settings/profile", icon: Settings },
];

export const MOBILE_TABS: NavItem[] = [
  APP_NAV[0]!,
  APP_NAV[1]!,
  APP_NAV[2]!,
  APP_NAV[3]!,
  { label: "More", to: "/app/notifications", icon: Bell },
];