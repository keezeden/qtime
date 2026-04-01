import { SymbolIcon } from "./icon";

export function TopNav() {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b-4 border-[#1c2028] bg-[#0b0e14] px-8 py-6 shadow-[0px_4px_0px_0px_rgba(34,38,47,1)]">
      <div className="font-display text-3xl font-black italic tracking-tighter text-[#ff89ab]">
        QTime
      </div>
      <div className="hidden items-center gap-8 font-display font-bold uppercase tracking-tighter md:flex">
        <a
          className="border-b-4 border-[#ff89ab] pb-1 text-[#ff89ab] transition-all hover:scale-105 hover:skew-x-2"
          href="#"
        >
          Home
        </a>
        <a className="text-[#45484f] transition-all hover:scale-105 hover:skew-x-2" href="#">
          Arena
        </a>
        <a className="text-[#45484f] transition-all hover:scale-105 hover:skew-x-2" href="#">
          Skins
        </a>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[#ff89ab] transition-all hover:scale-105 hover:skew-x-2 active:translate-y-1">
          <SymbolIcon label="$" className="text-3xl" />
        </button>
        <button className="text-[#ff89ab] transition-all hover:scale-105 hover:skew-x-2 active:translate-y-1">
          <SymbolIcon label="@" className="text-3xl" />
        </button>
      </div>
    </nav>
  );
}
