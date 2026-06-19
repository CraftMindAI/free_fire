const LINKS = ["Privacy Policy", "Terms of Service", "Support", "Discord"];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 mt-12 bg-[#0e0e0e]">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

        <span className="font-orbitron text-crimson text-2xl font-black uppercase tracking-tighter">
          Free Fire
        </span>

        <nav className="flex flex-wrap justify-center gap-8">
          {LINKS.map((link) => (
            <a key={link} href="#"
              className="text-on-surface-variant text-xs font-bold tracking-widest uppercase
                          hover:text-crimson transition-colors duration-200">
              {link}
            </a>
          ))}
        </nav>

        <p className="text-on-surface-variant/50 text-[10px] font-bold tracking-widest uppercase">
          © 2024 Free Fire Esports. All Rights Reserved.
        </p>

      </div>
    </footer>
  );
}
