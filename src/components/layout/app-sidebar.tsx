import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';
import { Logo } from '@/components/icons';
import { LogOut } from 'lucide-react';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4 md:p-2 items-center md:bg-transparent">
        {/* Logo for mobile view or when sidebar is icon-only */}
        <Link href="/dashboard" className="block md:hidden group-data-[collapsible=icon]:block">
          <Logo className="h-8 w-auto fill-primary" />
          <span className="sr-only">Day Weaver Home</span>
        </Link>
         {/* Full logo for expanded sidebar on md+ screens when not icon-only */}
        <Link href="/dashboard" className="hidden md:block group-data-[collapsible=icon]:hidden">
          <Logo className="h-8 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-0">
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
          <LogOut className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
