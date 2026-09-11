
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardCheck,
  Compass,
  Goal,
  Bot,
  FileText,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/assessment', icon: ClipboardCheck, label: 'InsightX Assessment' },
  { href: '/reports', icon: FileText, label: 'InsightX Report' },
  { href: '/pathxplore', icon: Compass, label: 'PathXplore Career' },
  { href: '/goals', icon: Goal, label: 'GoalMint Planner' },
  { href: '/mentors', icon: Bot, label: 'MentorSuite AI' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#E9C46A' }}>
            <GraduationCap className="h-5 w-5 text-[#241A3D]" />
          </div>
          <div>
            <span className="font-headline text-lg font-bold text-sidebar-foreground tracking-tight">Path-GeniX™</span>
            <p className="text-[11px] font-semibold text-[#E9C46A] tracking-wide">Genius Path Matrix</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

    