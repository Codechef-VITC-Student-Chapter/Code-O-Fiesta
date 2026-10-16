import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Live Operations', href: '/admin' },
    { name: 'Registration', href: '/admin/registration' },
    { name: 'Question Manager', href: '/admin/questions' },
    { name: 'Integrity Monitoring', href: '/admin/integrity' },
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto -mx-1 px-1 pb-0.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`relative shrink-0 whitespace-nowrap inline-flex items-center min-h-[2.5rem] px-3 rounded-lg font-mono text-[0.6875rem] font-bold uppercase tracking-[0.12em] border-2 transition-colors ${
              isActive ? 'bg-ink text-cream border-ink' : 'border-transparent text-charcoal hover:bg-sand hover:border-ink'
            }`}
          >
            {item.name}
            {isActive && (
              <span aria-hidden="true" className="absolute -bottom-[2px] left-3 right-3 h-[3px] bg-brand rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
