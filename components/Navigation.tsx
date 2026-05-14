'use client';
import { m } from 'framer-motion'
import { fadeUpWithDelay } from '@/lib/motion'
import Link from 'next/link';
import ThemeToggle from "./ThemeToggle";
import { usePathname } from 'next/navigation';
import { useLabFocus } from '@/lib/labFocusContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isLabFocused } = useLabFocus();

  const navItems =
  [
    { id: 1, label: 'Home', link: '/'},
    { id: 2, label: 'Lab', link: '/lab'},
    { id: 3, label: 'Writing', link: '/writing'},
    { id: 4, label: 'About', link: '/about'},
   ]

  const isActive = (link: string) => pathname === link;
  const primaryColor = '#000000';
  const mutedColor = '#BABABA';

  return (
    <m.nav
      variants={fadeUpWithDelay(0.3)}
      initial="hidden"
      animate={isLabFocused ? { opacity: 0, y: -20 } : "visible"}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: isLabFocused ? 'none' : 'auto' }}
      className="flex flex-row justify-between items-center w-[100%]"
    >
      <ul className="flex flex-row gap-3 text-base font-sans">
        {navItems.map((item) => (
        <li key={item.id}>
            <Link href={item.link}>
              <m.span
                style={{ color: isActive(item.link) ? primaryColor : mutedColor }}
                whileHover={isActive(item.link) ? {} : { color: primaryColor }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </m.span>
            </Link>
          </li>

        ))}
      </ul>
          <div>
        <div className="flex"><ThemeToggle/></div>
      </div>
    </m.nav>
  );
}
