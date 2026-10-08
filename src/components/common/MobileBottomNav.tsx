'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, AlertCircle, Building2, FileText } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  // Hide on print or full-screen print views if needed
  if (pathname.includes('/ptm')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Daily Grid',
      href: '/classes/class-4a-math/daily',
      icon: Zap,
      isActive: pathname.includes('/daily'),
    },
    {
      label: 'Attention',
      href: '/attention-queue',
      icon: AlertCircle,
      isActive: pathname === '/attention-queue',
    },
    {
      label: 'Coord Desk',
      href: '/coordinator/review',
      icon: Building2,
      isActive: pathname === '/coordinator/review',
    },
    {
      label: 'Reports',
      href: '/classes/class-4a-math/reports',
      icon: FileText,
      isActive: pathname.includes('/reports'),
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 safe-bottom print:hidden shadow-lg shadow-slate-900/5">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] touch-target-48 cursor-pointer ${
                item.isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  item.isActive ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
