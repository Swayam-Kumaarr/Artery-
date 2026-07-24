import Link from "next/link";
import { Shield, Truck, BadgeCheck, Instagram, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cream-dark bg-cream-card mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-accent text-lg font-serif leading-none">◆</span>
              <span className="font-serif text-xl text-ink tracking-tight font-medium">ARTERY</span>
            </Link>
            <p className="text-ink-soft text-sm leading-relaxed">
              Bridging AI imagination with the hands of India&apos;s finest artists.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-cream border border-cream-dark flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent/40 transition-all">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-cream border border-cream-dark flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent/40 transition-all">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:support@artery.art"
                className="w-8 h-8 rounded-full bg-cream border border-cream-dark flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent/40 transition-all">
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-ink font-semibold text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/generate",    label: "Generate Art" },
                { href: "/explore",     label: "Explore" },
                { href: "/styles",      label: "Art Style Guide" },
                { href: "/lens",        label: "Artist Directory" },
                { href: "/commissions", label: "Open Marketplace" },
                { href: "/subscription", label: "Pricing & Plans" },
                { href: "/corporate",   label: "Corporate Orders" },
                { href: "/about",       label: "About Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-ink-soft hover:text-accent transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-ink font-semibold text-xs uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/faq",             label: "FAQ" },
                { href: "/support",         label: "Contact Support" },
                { href: "/orders",          label: "Track Your Order" },
                { href: "/patron-dashboard", label: "My Dashboard" },
                { href: "/artist-dashboard", label: "Artist Dashboard" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-ink-soft hover:text-accent transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust signals */}
          <div>
            <h4 className="text-ink font-semibold text-xs uppercase tracking-wider mb-4">Why ARTERY</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-ink-soft text-sm">Artist contact protected until payment</span>
              </li>
              <li className="flex items-start gap-2.5">
                <BadgeCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-ink-soft text-sm">All artists verified by our team</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-ink-soft text-sm">Ekart delivery integration</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ink-faint text-xs">
            © {new Date().getFullYear()} ARTERY. All rights reserved. Part of the AI4BHARAT initiative.
          </p>
          <div className="flex items-center gap-6">
  <Link href="/terms" className="text-ink-faint hover:text-accent text-xs transition-colors">Terms</Link>
  <Link href="/faq" className="text-ink-faint hover:text-accent text-xs transition-colors">FAQ</Link>
  <Link href="/support" className="text-ink-faint hover:text-accent text-xs transition-colors">Support</Link>
  <Link href="/about#rules" className="text-ink-faint hover:text-accent text-xs transition-colors">Community Rules</Link>
</div>
        </div>
      </div>
    </footer>
  );
}
