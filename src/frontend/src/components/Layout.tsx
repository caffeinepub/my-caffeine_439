import { Link, useLocation } from "@tanstack/react-router";
import { Facebook, Mail, Menu, Phone, X, Youtube } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "হোম" },
    { to: "/complaint/submit", label: "অভিযোগ করুন" },
    { to: "/complaint/track", label: "অবস্থা দেখুন" },
    { to: "/notices", label: "নোটিশ বোর্ড" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "যোগাযোগ" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      {/* Top utility bar */}
      <div className="bg-navy text-white py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <span className="hidden sm:block text-white/70">
            বাংলাদেশ গার্মেন্ট শ্রমিক সংহতি — শ্রমিকের পাশে সদা
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <a
              href="tel:01403163378"
              className="flex items-center gap-1 text-white/80 hover:text-white"
            >
              <Phone size={11} />
              <span>০১৪০৩-১৬৩৩৭৮</span>
            </a>
            <a
              href="mailto:garment.samhati@gmail.com"
              className="flex items-center gap-1 text-white/80 hover:text-white hidden sm:flex"
            >
              <Mail size={11} />
              <span>garment.samhati@gmail.com</span>
            </a>
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white/70 hover:text-white"
              >
                <Facebook size={13} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white/70 hover:text-white"
              >
                <Youtube size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + org name */}
          <Link
            to="/"
            className="flex items-center gap-3"
            data-ocid="header.link"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-navy/20 flex-shrink-0">
              <img
                src="/assets/images_2-019d5d07-e28f-741c-be98-1afe1ef35fd2.jpeg"
                alt="বাংলাদেশ গার্মেন্ট শ্রমিক সংহতি লোগো"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-navy leading-tight text-base sm:text-lg">
                বাংলাদেশ গার্মেন্ট শ্রমিক সংহতি
              </div>
              <div className="text-xs text-muted-foreground">
                Bangladesh Garment Workers Solidarity (BGWS)
              </div>
            </div>
          </Link>

          {/* Right side: hotline only (admin link removed) */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
              <Phone size={18} className="text-red-primary" />
              <div>
                <div className="text-xs text-muted-foreground">হটলাইন</div>
                <div className="font-bold text-navy text-sm">০১৪০৩-১৬৩৩৭৮</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Green nav bar */}
      <nav className="bg-green-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive(link.to)
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
                data-ocid={`nav.${link.label.toLowerCase()}.link`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center justify-between py-2">
            <span className="text-white font-semibold text-sm">মেনু</span>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white p-1"
              aria-label="মেনু খুলুন"
              data-ocid="nav.menu.toggle"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 text-sm font-semibold rounded transition-colors ${
                    isActive(link.to)
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                  onClick={() => setMenuOpen(false)}
                  data-ocid={`nav.mobile.${link.label}.link`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-navy text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Col 1: Org info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                  <img
                    src="/assets/images_2-019d5d07-e28f-741c-be98-1afe1ef35fd2.jpeg"
                    alt="লোগো"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-sm">
                  বাংলাদেশ গার্মেন্ট শ্রমিক সংহতি
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                গার্মেন্ট শ্রমিকদের অধিকার রক্ষায় এবং ন্যায্য মজুরি নিশ্চিত করতে আমরা সর্বদা
                প্রতিশ্রুতিবদ্ধ।
              </p>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Facebook size={14} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Youtube size={14} />
                </a>
              </div>
            </div>

            {/* Col 2: Quick links */}
            <div>
              <h3 className="font-bold text-sm mb-4 text-white/90">দ্রুত লিঙ্ক</h3>
              <ul className="space-y-2 text-sm text-white/60">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    প্রাইভেসি পলিসি
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    ব্যবহারের শর্তাবলী
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div>
              <h3 className="font-bold text-sm mb-4 text-white/90">যোগাযোগ</h3>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-start gap-2">
                  <Phone size={14} className="mt-0.5 flex-shrink-0" />
                  <span>হটলাইন: ০১৪০৩-১৬৩৩৭৮</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">💬</span>
                  <a
                    href="https://wa.me/8801403163378"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    হোয়াটসঅ্যাপ: +৮৮০১৪০৩-১৬৩৩৭৮
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Mail size={14} className="mt-0.5 flex-shrink-0" />
                  <a
                    href="mailto:garment.samhati@gmail.com"
                    className="hover:text-white"
                  >
                    garment.samhati@gmail.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">📍</span>
                  <span>
                    ১১০৪ রোজভিউ প্লাজা, ১৮৫ বীর উত্তম সি আর দত্ত রোড, হাতিরপুল, ঢাকা-১২০৫
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">🕒</span>
                  <span>রবি-বৃহঃ, সকাল ৯টা – বিকাল ৫টা</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
            <span>
              © {new Date().getFullYear()} বাংলাদেশ গার্মেন্ট শ্রমিক সংহতি। সর্বস্বত্ব
              সংরক্ষিত।
            </span>
            <span>
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 underline"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
