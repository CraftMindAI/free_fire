import stats from "../data/stats";

const HUD_ITEMS = [
  { label: "Kill/Death", value: "2.4" },
  { label: "Win Rate", value: "38%" },
  { label: "Matches", value: "1,204" },
];

export default function DashboardSection() {
  return (
    <section className="py-12 px-6 max-w-[1440px] mx-auto">
      {/* Heading */}
      <div className="mb-12">
        <h2 className="font-orbitron text-3xl md:text-4xl text-on-surface font-bold tracking-tight mb-2">
          Control Your Destiny
        </h2>
        <p className="font-sora text-on-surface-variant">
          The most advanced pro-gaming dashboard ever built.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 [perspective:1200px] min-h-[500px]">
        {/* Large dashboard panel */}
        <div
          className="md:col-span-8 glass rounded-2xl overflow-hidden relative group min-h-[400px]
                         transition-all duration-300
                         hover:[transform:perspective(1000px)_rotateX(2deg)_translateZ(4px)]
                         hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/card1.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-50
                       group-hover:scale-105 transition-transform duration-700"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-20
                          [background-image:linear-gradient(rgba(0,255,200,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,200,0.1)_1px,transparent_1px)]
                          [background-size:60px_60px]"
          />

          {/* Radar rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {[80, 120, 160].map((s) => (
              <div
                key={s}
                className="absolute rounded-full border border-[rgba(0,255,200,0.1)]"
                style={{ width: s, height: s, top: -s / 2, left: -s / 2 }}
              />
            ))}
            <div className="w-3 h-3 rounded-full bg-crimson shadow-[0_0_12px_#FF2E2E]" />
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent">
            <h4 className="font-sora text-2xl md:text-3xl text-on-surface font-bold">
              Live Operations Hub
            </h4>
            <p className="text-on-surface-variant mt-3 max-w-md text-sm md:text-base">
              Manage your squad, track live matches, and analyze enemy
              strategies in real-time.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="md:col-span-4 flex flex-col gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className={`glass rounded-2xl p-10 flex flex-col justify-center flex-1
                           border-l-4 transition-all duration-300
                           hover:[transform:perspective(600px)_rotateY(-3deg)_translateZ(6px)]
                           ${stat.id === 1 ? "border-l-secondary" : "border-l-crimson"}`}
            >
              <p
                className={`font-orbitron text-5xl md:text-6xl font-black mb-3
                              ${stat.id === 1 ? "text-secondary" : "text-crimson"}`}
              >
                {stat.value}
              </p>
              <p className="text-on-surface text-xs font-bold tracking-widest uppercase mb-3">
                {stat.label}
              </p>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
