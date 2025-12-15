import Link from "next/link";

export const Footer = () => (
  <footer className="bg-[#4a2424] text-[#dcaaaa] py-12 text-center">
    <p className="font-serif text-2xl mb-4">Gabriel & Raquel</p>
    <p className="text-sm font-light uppercase tracking-widest opacity-70">
      April 18, 2026 • Mölndal
    </p>
    <div className="mt-8">
      <Link href="/admin" className="text-xs text-[#dcaaaa]/30 hover:text-[#dcaaaa]/60 transition-colors">
        Admin
      </Link>
    </div>
  </footer>
);
