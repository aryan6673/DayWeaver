
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarPlus,
  ListChecks,
  CalendarDays, // Added for Calendar
  Settings,
  LifeBuoy,
  BarChart3, // Added BarChart3 import
  // Removed Shuffle, GitFork, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule/create', label: 'Create Schedule', icon: CalendarPlus },
  { href: '/tasks', label: 'My Tasks', icon: ListChecks },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays }, // Added Calendar
  // Removed Reallocate Tasks, Breakdown Task, Meeting Prep
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const secondaryNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: LifeBuoy },
];

export function SidebarNav() {
  const pathname = usePathname();

  const renderNavItems = (items: typeof mainNavItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} legacyBehavior passHref>
          <SidebarMenuButton
            isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            tooltip={item.label}
            className="w-full justify-start"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ));

  return (
    <nav className="flex flex-col h-full">
      <SidebarGroup className="p-2">
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu>
      </SidebarGroup>
      <div className="mt-auto">
        <SidebarGroup className="p-2">
           <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarMenu>{renderNavItems(secondaryNavItems)}</SidebarMenu>
        </SidebarGroup>
      </div>
    </nav>
  );
}
