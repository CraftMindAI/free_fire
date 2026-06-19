import features from "../data/features";
import type { ReactElement } from "react";

const icons: Record<string, ReactElement> = {
  trophy: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  ),
  payments: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
    </svg>
  ),
  gamepad: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z" />
    </svg>
  ),
};

export default function FeaturesSection() {
  return (
    <section className="py-12 px-6 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 [perspective:1200px]">
        {features.map((f) => (
          <div
            key={f.id}
            className={`glass p-10 rounded-2xl border-t-4 ${f.borderTop} group cursor-default
                         [transform-style:preserve-3d] transition-transform duration-150
                         hover:[transform:perspective(700px)_rotateY(3deg)_rotateX(-3deg)_translateZ(8px)]`}
          >
            {/* Icon */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6
                              transition-transform duration-300 group-hover:scale-110
                              ${f.iconBg} ${f.iconColor}`}>
              {icons[f.icon]}
            </div>

            <h3 className="font-sora text-2xl text-on-surface font-bold mb-4">{f.title}</h3>

            <p className="text-on-surface-variant leading-relaxed text-base">{f.description}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {f.tags.map((tag) => (
                <span key={tag}
                  className="px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase
                              text-on-surface-variant bg-white/5 border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
