import { navLinks } from "./data";

export function SiteHeader() {
  return (
    <section className="sticky top-0 z-40 border-b-4 border-surface-strong bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="font-display text-lg font-bold italic uppercase text-accent-pink sm:text-xl">
          QTime
        </div>
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
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <span className="text-accent-pink">ON</span>
          <span className="text-accent-teal">AIR</span>
        </div>
      </div>
    </section>
  );
}
