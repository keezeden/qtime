export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 md:px-8">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute left-10 top-10 flex h-32 w-32 rotate-12 items-center justify-center rounded-lg border-b-8 border-[#ff2bef] bg-[rgb(255,137,171,0.2)] font-display text-5xl font-black text-[#ff89ab]">
          Q
        </div>
        <div className="absolute bottom-20 right-10 flex h-24 w-24 -rotate-6 items-center justify-center rounded-lg border-b-8 border-[#00efce] bg-[rgb(38,254,220,0.2)] font-display text-4xl font-black text-[#26fedc]">
          T
        </div>
        <div className="absolute right-1/4 top-1/4 flex h-16 w-16 rotate-[25deg] items-center justify-center rounded-lg border-b-8 border-[#e5cd27] bg-[rgb(255,233,108,0.2)] font-display text-2xl font-black text-[#ffe96c]">
          Z
        </div>
        <div className="absolute bottom-1/4 left-1/4 h-2 w-40 -rotate-45 rounded-full bg-[#26fedc]" />
        <div className="absolute left-1/3 top-1/3 h-20 w-20 rounded-full border-4 border-dashed border-[rgb(255,137,171,0.3)]" />
      </div>
      <div className="mx-auto flex min-h-[82vh] w-full max-w-5xl items-center justify-center py-12 md:min-h-[86vh]">
        <div className="relative z-10 max-w-4xl space-y-10 text-center">
          <div className="inline-block -rotate-1 transform">
            <h1 className="bg-gradient-to-br from-[#ff89ab] via-[#ff2b88] to-[#26fedc] bg-clip-text font-display text-6xl font-black leading-none tracking-tighter text-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] italic sm:text-7xl md:text-[7.5rem]">
              QTIME
            </h1>
          </div>
          <p className="-rotate-1 font-display text-xl font-extrabold leading-tight text-[#f3deff] sm:text-2xl md:text-[2rem]">
            Real-time 1v1 word battles where every turn is on the clock and{" "}
            <span className="text-[#ffe96c] italic underline decoration-[#26fedc]">
              pressure
            </span>{" "}
            decides the winner.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
            <button className="group relative rotate-2 bg-[#ff89ab] px-10 py-5 font-display text-2xl font-black uppercase text-[#0b0e14] shadow-[8px_8px_0px_0px_#1c2028] transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none active:scale-95 md:px-12 md:py-6 md:text-3xl">
              Play Now
            </button>
            <button className="border-4 border-[#1c2028] bg-[#1c2028] px-8 py-4 font-display text-lg font-bold uppercase tracking-widest transition-transform hover:-rotate-2 md:px-10 md:py-5 md:text-xl">
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
