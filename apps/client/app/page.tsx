export default function Home() {
  return (
    <main className="flex flex-col">
      <section className="sticky top-0 z-40 border-b-4 border-surface-strong bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="font-display text-lg font-bold italic uppercase text-accent-pink sm:text-xl">
            QTime
          </div>
          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted md:flex">
            <a className="text-accent-pink" href="#home">
              Home
            </a>
            <a href="#features">Arena</a>
            <a href="#snapshot">Climb</a>
            <a href="#cta">Queue</a>
          </nav>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <span className="text-accent-pink">◎</span>
            <span className="text-accent-pink">◔</span>
          </div>
        </div>
      </section>

      <section id="home" className="relative overflow-hidden px-5 py-18 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="tile-shadow-pink absolute top-12 left-[5%] flex h-20 w-20 rotate-12 items-center justify-center border-2 border-accent-pink bg-accent-pink/10 font-display text-3xl font-bold text-accent-pink">
            Q
          </div>
          <div className="absolute top-28 right-[9%] flex h-12 w-12 -rotate-12 items-center justify-center rounded-full border-2 border-accent-yellow/50 bg-accent-yellow/10 font-display text-xl font-bold text-accent-yellow">
            2x
          </div>
          <div className="tile-shadow-teal absolute right-[6%] bottom-24 flex h-18 w-18 -rotate-6 items-center justify-center border-2 border-accent-teal bg-accent-teal/10 font-display text-3xl font-bold text-accent-teal">
            T
          </div>
          <div className="absolute top-[64%] left-[16%] h-1 w-18 -rotate-45 bg-accent-teal" />
          <div className="absolute top-[37%] right-[18%] h-1 w-12 rotate-45 bg-accent-yellow" />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="neon-frost border border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            Live Matchmaking Word Duels
          </div>
          <h1 className="font-display mt-10 bg-linear-[135deg,var(--accent-pink),#e30071_58%,var(--accent-teal)] bg-clip-text text-6xl leading-none font-bold uppercase italic text-transparent sm:text-8xl lg:text-[7.25rem]">
            QTIME
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold text-foreground sm:text-2xl">
            The whacky TV title battle where{" "}
            <span className="text-accent-yellow">chaos</span> is the key.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
            Turn your rack into the highest scoring word you can find, crack the score
            race wide open, and reach 500 before your rival flips the duel.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              className="pressable-pink font-display inline-flex min-h-13 items-center justify-center border-2 border-black bg-accent-pink px-8 py-4 text-base font-bold uppercase text-[#0b0e14]"
              href="#cta"
            >
              Play Now
            </a>
            <a
              className="font-display inline-flex min-h-13 items-center justify-center border-2 border-border bg-surface-strong px-8 py-4 text-base font-bold uppercase text-foreground"
              href="#flow"
            >
              Watch Match Flow
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="border-t-4 border-surface-strong px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10">
            <p className="font-display text-3xl font-bold uppercase italic text-accent-teal sm:text-4xl">
              Game Features
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="panel-shadow border-2 border-border bg-surface-strong px-6 py-7">
              <div className="mb-8 flex h-28 items-center justify-center bg-background">
                <div className="h-4 w-18 -translate-x-6 bg-accent-teal" />
                <div className="ml-5 flex h-18 w-18 items-center justify-center bg-surface text-6xl text-accent-teal">
                  ⚡
                </div>
              </div>
              <div className="font-display text-2xl font-bold uppercase italic text-foreground">
                Real-Time Duels
              </div>
              <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
                No waiting days for a turn. Fast score-pressure word battles with tight
                matchmaking and explosive comeback windows.
              </p>
            </article>

            <article className="panel-shadow rotate-1 border-2 border-accent-pink bg-accent-pink px-6 py-7 text-[#481227]">
              <div className="mb-8 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center border border-[#481227] bg-[#f9bbd0] font-display font-bold">
                  A
                </div>
                <div className="flex h-10 w-10 items-center justify-center border border-[#481227] bg-[#ffe77d] font-display font-bold">
                  B
                </div>
                <div className="flex h-10 w-10 items-center justify-center border border-[#481227] bg-[#7df9df] font-display font-bold">
                  C
                </div>
              </div>
              <div className="font-display text-2xl font-bold uppercase italic">
                Draw Your Tiles
              </div>
              <p className="mt-4 max-w-sm text-sm leading-7">
                Collect wild turns from the chaos color set so every score spike feels
                sudden, dangerous, and very silly.
              </p>
            </article>

            <article
              id="flow"
              className="panel-shadow border-2 border-border bg-surface px-6 py-7 lg:col-span-2"
            >
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="font-display text-3xl font-bold uppercase italic text-accent-yellow">
                    Global Climb
                  </p>
                  <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                    Think you can win the loudest room in the queue? Climb the weekly
                    ladder, chase score spikes, and fight for the top line.
                  </p>
                  <a
                    className="pressable-teal font-display mt-6 inline-flex min-h-12 items-center justify-center border-2 border-black bg-accent-teal px-5 py-3 text-sm font-bold uppercase text-[#071110]"
                    href="#matchmaking"
                  >
                    View Match Flow
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="border border-border bg-background px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-bold uppercase text-foreground">
                          01
                        </span>
                        <span className="font-display text-sm font-bold uppercase text-foreground">
                          Lexi Loop
                        </span>
                      </div>
                      <span className="font-display text-sm font-bold uppercase text-accent-teal">
                        23,840 PTS
                      </span>
                    </div>
                  </div>
                  <div className="border border-border bg-background px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-bold uppercase text-foreground">
                          02
                        </span>
                        <span className="font-display text-sm font-bold uppercase text-foreground">
                          Wordwisp
                        </span>
                      </div>
                      <span className="font-display text-sm font-bold uppercase text-accent-pink">
                        21,970 PTS
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="border border-border bg-surface-strong px-4 py-4 text-center">
                      <div className="font-display text-4xl font-bold text-accent-pink">1</div>
                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        Rack
                      </div>
                    </div>
                    <div className="border border-border bg-surface-strong px-4 py-4 text-center">
                      <div className="font-display text-4xl font-bold text-accent-teal">2</div>
                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        Build
                      </div>
                    </div>
                    <div className="border border-border bg-surface-strong px-4 py-4 text-center">
                      <div className="font-display text-4xl font-bold text-accent-yellow">3</div>
                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        Score
                      </div>
                    </div>
                    <div className="border border-border bg-surface-strong px-4 py-4 text-center">
                      <div className="font-display text-4xl font-bold text-accent-green">4</div>
                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        500
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="matchmaking" className="border-t-4 border-surface-strong px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-display text-3xl font-bold uppercase italic text-accent-yellow sm:text-4xl">
                Matchmaking Pressure
              </p>
              <h2 className="font-display mt-4 text-4xl font-bold uppercase italic text-foreground sm:text-5xl">
                Better pairings keep the score race nasty.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                The systems side stays mostly invisible. What you feel is quick pairing,
                tighter skill bands, and rematches that keep your palms hot instead of
                wasting time in weak queues.
              </p>
            </div>

            <div className="grid gap-4">
              <article className="panel-shadow -rotate-2 border-2 border-accent-pink bg-surface px-5 py-6">
                <div className="font-display text-2xl font-bold uppercase text-accent-pink">
                  Quick Pairing
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Spend less time in menus and more time hunting the next high-value word.
                </p>
              </article>
              <article className="panel-shadow rotate-2 border-2 border-accent-teal bg-surface px-5 py-6">
                <div className="font-display text-2xl font-bold uppercase text-accent-teal">
                  Fairer Duels
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Close score lines make every rack matter and every comeback believable.
                </p>
              </article>
              <article className="panel-shadow -rotate-1 border-2 border-accent-yellow bg-surface px-5 py-6">
                <div className="font-display text-2xl font-bold uppercase text-accent-yellow">
                  Replay Loop
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Better opponents make the climb worth chasing after each weekly reset.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="snapshot" className="border-t-4 border-surface-strong px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="text-center">
            <p className="font-display text-3xl font-bold uppercase italic text-foreground sm:text-4xl">
              The Pros Agree...
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <article className="panel-shadow max-w-xs rotate-[-4deg] border-2 border-accent-pink bg-surface px-6 py-6">
              <p className="text-sm leading-7 text-foreground">
                "I played a 72-point word and my rival somehow hit me with the comeback
                rack. Pure cinema."
              </p>
              <p className="font-display mt-5 text-xs font-bold uppercase tracking-[0.18em] text-accent-pink">
                @rackreaper
              </p>
            </article>
            <article className="panel-shadow max-w-xs rotate-[3deg] border-2 border-accent-teal bg-surface px-6 py-6">
              <p className="text-sm leading-7 text-foreground">
                "Finally, a word game that feels like a fight instead of homework."
              </p>
              <p className="font-display mt-5 text-xs font-bold uppercase tracking-[0.18em] text-accent-teal">
                @vowelvandal
              </p>
            </article>
            <article className="panel-shadow max-w-xs rotate-[-2deg] border-2 border-accent-yellow bg-surface px-6 py-6">
              <p className="text-sm leading-7 text-foreground">
                "The leaderboard drama is real. I lost one duel and immediately queued
                three more."
              </p>
              <p className="font-display mt-5 text-xs font-bold uppercase tracking-[0.18em] text-accent-yellow">
                @chaoslex
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="cta" className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="panel-shadow mx-auto w-full max-w-5xl border-2 border-black bg-linear-[135deg,#1b1f2b,#2a2230] px-6 py-10 text-center sm:px-10 sm:py-16">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent-yellow">
            Ready To Rumble?
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold uppercase italic text-foreground sm:text-7xl">
            READY TO RUMBLE?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Join 50,000+ players in the most intense word game ever made.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              className="pressable-pink font-display inline-flex min-h-13 items-center justify-center border-2 border-black bg-accent-pink px-8 py-4 text-base font-bold uppercase text-[#140812]"
              href="#home"
            >
              App Store
            </a>
            <a
              className="pressable-teal font-display inline-flex min-h-13 items-center justify-center border-2 border-black bg-accent-teal px-8 py-4 text-base font-bold uppercase text-[#081312]"
              href="#cta"
            >
              Google Play
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
