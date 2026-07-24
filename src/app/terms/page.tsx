import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ARTERY",
  description: "Read the Terms of Service for ARTERY — the platform connecting patrons with India's finest artists.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using ARTERY, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any part of these terms, you may not use the platform.",
  },
  {
    title: "2. Platform Usage",
    content:
      "ARTERY is a platform that connects patrons with verified Indian artisans through AI-assisted art generation. You may not misuse the platform, attempt to reverse-engineer it, scrape data, or use it for any unlawful or unauthorised purpose.",
  },
  {
    title: "3. User Responsibilities",
    content:
      "You are responsible for maintaining the confidentiality of your account. You agree not to share false information, impersonate others, or engage in any conduct that disrupts or harms other users, artists, or the platform.",
  },
  {
    title: "4. Commissions & Payments",
    content:
      "All payments are processed securely via Razorpay. A platform commission fee applies to each transaction. ARTERY is not liable for disputes between patrons and artists, but will make reasonable efforts to facilitate resolution in good faith.",
  },
  {
    title: "5. Intellectual Property",
    content:
      "Artwork commissioned through ARTERY remains the intellectual property of the creating artist unless explicitly transferred in a written agreement. AI-generated previews are for reference only and do not constitute final artwork.",
  },
  {
    title: "6. Artist Verification",
    content:
      "ARTERY makes reasonable efforts to verify all listed artists. However, we do not guarantee the quality, delivery time, or outcome of any commission. Users engage with artists at their own discretion.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      "ARTERY is provided on an 'as is' basis. We are not liable for any indirect, incidental, or consequential damages arising from your use of — or inability to use — the platform.",
  },
  {
    title: "8. Termination",
    content:
      "We reserve the right to suspend or terminate your access to ARTERY at any time if you violate these terms, engage in fraudulent activity, or harm the community.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We may update these Terms of Service at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We recommend reviewing this page periodically.",
  },
  {
    title: "10. Contact",
    content:
      "For questions about these terms, please reach out to us at support@artery.art. We aim to respond within 2 business days.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-cream-dark bg-cream-card">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-14">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/"
              className="text-ink-soft hover:text-accent text-sm transition-colors"
            >
              Home
            </Link>
            <span className="text-ink-faint text-sm">/</span>
            <span className="text-ink text-sm">Terms of Service</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-ink mb-3 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-ink-soft text-sm">
            Last updated: June 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-14">
        <p className="text-ink-soft leading-relaxed mb-12 text-sm">
          Welcome to ARTERY. These Terms of Service govern your use of our platform,
          which bridges AI imagination with the hands of India&apos;s finest artists.
          Please read them carefully before proceeding.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div
              key={section.title}
              className="border-l-2 border-accent/30 pl-6"
            >
              <h2 className="font-serif text-xl text-ink mb-3">
                {section.title}
              </h2>
              <p className="text-ink-soft leading-relaxed text-sm">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-10 border-t border-cream-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-ink-faint text-xs">
            © {new Date().getFullYear()} ARTERY. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/support"
              className="text-ink-faint hover:text-accent text-xs transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/"
              className="text-ink-faint hover:text-accent text-xs transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}