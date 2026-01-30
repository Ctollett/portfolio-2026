'use client';

import Link from 'next/link';
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {

  const navItems =
  [
    { id: 1, label: 'Home', link: '/'},
    { id: 2, label: 'Lab', link: '/lab'},
    { id: 3, label: 'Writing', link: '/writing'},
    { id: 4, label: 'About', link: '/about'},
   ]

  return (
    <nav className="flex flex-row justify-between items-center w-[100%]">
      <ul className="flex flex-row gap-3 text-base font-sans">
        {navItems.map((item) => (
        <li key={item.id}>
            <Link href={item.link}>{item.label}</Link>
          </li>

        ))}
      </ul>
          <div>
        <div className="flex"><ThemeToggle/></div>
      </div>
    </nav>
  );
}
