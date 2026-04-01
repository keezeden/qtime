export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 md:px-20">
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
      <div className="relative z-10 max-w-5xl space-y-12 text-center">
        <div className="inline-block -rotate-1 transform">
          <h1 className="bg-gradient-to-br from-[#ff89ab] via-[#ff2b88] to-[#26fedc] bg-clip-text font-display text-7xl font-black leading-none tracking-tighter text-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] italic md:text-9xl">
            QTIME
          </h1>
        </div>
        <p className="-rotate-1 font-display text-2xl font-extrabold leading-tight text-[#f3deff] md:text-4xl">
          Real-time 1v1 word battles where every turn is on the clock and{" "}
          <span className="text-[#ffe96c] italic underline decoration-[#26fedc]">
            pressure
          </span>{" "}
          decides the winner.
        </p>
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
          <button className="group relative rotate-2 bg-[#ff89ab] px-12 py-6 font-display text-3xl font-black uppercase text-[#0b0e14] shadow-[8px_8px_0px_0px_#1c2028] transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none active:scale-95">
            Play Now
          </button>
          <button className="border-4 border-[#1c2028] bg-[#1c2028] px-10 py-5 font-display text-xl font-bold uppercase tracking-widest transition-transform hover:-rotate-2">
            Watch Trailer
          </button>
        </div>
      </div>
    </section>
  );
}
