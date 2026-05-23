import Link from "next/link";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#security", label: "Security" },
  { href: "/login", label: "Login" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-400 text-sm font-black text-slate-950">
            N
          </span>
          Nexora AI
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm font-medium text-slate-300 hover:text-white sm:block">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
