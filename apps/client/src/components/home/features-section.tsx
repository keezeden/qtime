import { leaderboardEntries } from "./data";
import { SymbolIcon } from "./icon";

export function FeaturesSection() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl space-y-10">
        <h2 className="rotate-1 font-display text-4xl font-black uppercase italic text-[#26fedc] md:text-5xl">
          Game Features
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          <div className="relative flex min-h-[400px] flex-col justify-end overflow-hidden border-b-8 border-black bg-[#1c2028] p-10 shadow-[8px_8px_0px_0px_#1c2028] md:col-span-7">
            <div className="absolute right-0 top-0 rotate-12 p-8 opacity-20">
              <SymbolIcon label="!" className="text-[12rem] text-[#26fedc]" />
            </div>
            <div className="relative z-10 space-y-4">
              <span className="bg-[#26fedc] px-4 py-1 font-display text-sm font-bold uppercase tracking-tighter text-[#0b0e14]">
                Live Action
              </span>
              <h3 className="font-display text-4xl font-black uppercase italic text-[#f3deff]">
                Real-Time Duels
              </h3>
              <p className="max-w-md text-lg text-[#c599ea]">
                No waiting days for a turn. Fast-paced, synchronous 1v1 matches where smart words
                and faster reads decide the board.
              </p>
            </div>
          </div>

          <div className="group flex rotate-1 flex-col justify-between border-b-8 border-[#ff2bef] bg-[#ff89ab] p-10 shadow-[8px_8px_0px_0px_#1c2028] transition-transform hover:-rotate-1 md:col-span-5">
            <div className="flex flex-wrap gap-4">
              <div className="flex h-16 w-16 items-center justify-center border-b-4 border-black bg-[#22262f] font-display text-3xl font-black text-[#ff89ab]">
                A
              </div>
              <div className="flex h-16 w-16 items-center justify-center border-b-4 border-[#e5cd27] bg-[#ffe96c] font-display text-3xl font-black text-[#615500]">
                B
              </div>
              <div className="flex h-16 w-16 items-center justify-center border-b-4 border-[#00efce] bg-[#26fedc] font-display text-3xl font-black text-[#005d4f]">
                C
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-display text-3xl font-black uppercase italic text-[#590053]">
                Tune Your Tiles
              </h3>
              <p className="text-lg font-semibold text-[rgb(89,0,83,0.8)]">
                Personalize your board, flex rare tile skins, and make every duel look like your
                own loud little arena.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-12 border-b-8 border-black bg-[#11141b] p-8 shadow-[8px_8px_0px_0px_#1c2028] md:col-span-12 md:flex-row">
            <div className="flex-1 space-y-4">
              <h3 className="font-display text-5xl font-black uppercase italic tracking-tighter text-[#ffe96c]">
                Global Climb
              </h3>
              <p className="text-xl text-[#c599ea]">
                Climb the live ladder, defend your streak, and prove you can think faster than the
                other word nerd in the room.
              </p>
              <div className="pt-4">
                <button className="bg-[#26fedc] px-8 py-3 font-display font-black uppercase text-[#0b0e14] shadow-[4px_4px_0px_0px_#000] transition-transform hover:scale-105">
                  View Rankings
                </button>
              </div>
            </div>
            <div className="w-full space-y-4 border-4 border-[#1c2028] bg-[#0b0e14] p-6 md:w-1/2">
              {leaderboardEntries.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between border-b-4 border-black p-4 ${entry.backgroundClassName} ${entry.rotateClassName}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-display font-black ${entry.accentClassName}`}>
                      {entry.rank}
                    </span>
                    <span className="font-display font-bold uppercase text-[#f3deff]">
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-display font-bold text-[#26fedc]">{entry.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
