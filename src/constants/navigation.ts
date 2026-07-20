import {
  LayoutDashboard,
  Building2,
  UploadCloud,
  Boxes,
  BarChart3,
  Sparkles,
  Calculator,
  FileBarChart,
  Bell,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Company Profile', url: '/company', icon: Building2 },
  { title: 'Upload Center', url: '/uploads', icon: UploadCloud },
  { title: 'Digital Twin', url: '/digital-twin', icon: Boxes },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'AI Insights', url: '/ai-insights', icon: Sparkles },
  { title: 'Carbon Calculator', url: '/carbon-calculator', icon: Calculator },
  { title: 'Reports', url: '/reports', icon: FileBarChart },
  { title: 'Notifications', url: '/notifications', icon: Bell },
  { title: 'Settings', url: '/settings', icon: Settings },
];
