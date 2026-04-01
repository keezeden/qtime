import { SymbolIcon } from "./icon";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t-8 border-[#1c2028] bg-black">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-10 px-5 py-14 md:flex-row md:px-8 md:py-16">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="font-display text-3xl font-black italic tracking-tighter text-[#ffe96c]">
            QTIME
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#45484f]">
            © 2024 QTIME KINETIC GAMING
          </div>
        </div>
        <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
          <a
            className="text-[#26fedc] underline decoration-4 underline-offset-4 transition-colors hover:text-[#ffe96c]"
            href="#"
          >
            How to Play
          </a>
          <a className="text-[#45484f] transition-colors hover:text-[#ffe96c]" href="#">
            Support
          </a>
          <a className="text-[#45484f] transition-colors hover:text-[#ffe96c]" href="#">
            Privacy
          </a>
        </div>
        <div className="flex items-center gap-6">
          <a className="text-[#ff89ab] transition-transform hover:scale-125" href="#">
            <SymbolIcon label="G" className="text-3xl" />
          </a>
          <a className="text-[#ff89ab] transition-transform hover:scale-125" href="#">
            <SymbolIcon label="S" className="text-3xl" />
          </a>
        </div>
      </div>
    </footer>
  );
}
