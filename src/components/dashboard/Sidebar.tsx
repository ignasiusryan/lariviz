"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard/heatmap", label: "Heatmap" },
  { href: "/dashboard/routes", label: "Routes" },
  { href: "/dashboard/insights", label: "Insights" },
  { href: "/dashboard/times", label: "Run Times" },
  { href: "/dashboard/records", label: "Records" },
];

const createItems = [
  { href: "/dashboard/stickers", label: "Stickers" },
  { href: "/dashboard/poster", label: "Poster" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">LARIVIZ</div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">Create</div>
        <div className="sidebar-section">
          {createItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
