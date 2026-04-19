import Link from "next/link";
import { AuthStatus } from "../auth/auth-status";
import { getCurrentUser } from "@/app/lib/auth";
import { navLinks } from "./data";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <section className="sticky top-0 z-40 border-b-4 border-surface-strong bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          className="font-display text-lg font-bold italic uppercase text-accent-pink sm:text-xl"
          href="/"
        >
          QTime
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className={link.active ? "text-accent-pink" : undefined}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <AuthStatus user={user} />
      </div>
    </section>
  );
}
