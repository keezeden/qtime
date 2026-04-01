export function CtaSection() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden border-b-[12px] border-black bg-[#11141b] p-10 text-center shadow-[12px_12px_0px_0px_#1c2028] md:p-16">
          <div className="relative z-10 space-y-8">
            <h2 className="font-display text-5xl font-black uppercase tracking-tighter text-white italic drop-shadow-lg md:text-7xl">
              Ready To Rumble?
            </h2>
            <p className="mx-auto max-w-2xl text-2xl font-bold text-[#c599ea]">
              Join the next wave of QTime players and battle live under the clock.
            </p>
            <div className="flex flex-col items-center justify-center gap-6 pt-8 sm:flex-row">
              <button className="w-full rotate-1 bg-[#ff89ab] px-12 py-5 font-display text-2xl font-black uppercase text-[#0b0e14] shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:w-auto">
                App Store
              </button>
              <button className="w-full -rotate-1 bg-[#26fedc] px-12 py-5 font-display text-2xl font-black uppercase text-[#0b0e14] shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:w-auto">
                Google Play
              </button>
            </div>
          </div>
          <div className="absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rounded-full bg-[rgb(255,137,171,0.2)] blur-2xl" />
          <div className="absolute -mb-24 -ml-24 bottom-0 left-0 h-48 w-48 rounded-full bg-[rgb(38,254,220,0.1)] blur-3xl" />
        </div>
      </div>
    </section>
  );
}
