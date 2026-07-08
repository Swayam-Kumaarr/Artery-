# Artery

> *AI as a communication tool. Human hands as the final word.*

The rise of AI-generated art has created a real problem for artists. It's faster and cheaper than ever to produce visuals — yet human artists are struggling more than ever to find their place and price their work fairly.

Artery bridges this gap instead of widening it.

Rather than replacing artists, Artery uses AI as a communication tool. Customers describe what they want, AI generates a reference visual, and artists use that as a brief to create a real, physical, handcrafted piece. This eliminates the biggest friction in commissioned art — the gap between what a customer imagines and what an artist delivers.

**Artery gives artists a clearer brief, fairer pricing power, and a platform that positions human creativity where it deserves to be.**

---

**Live demo →** [artery on Vercel](https://artery-ppwv8wdt4-mailboxswayam-3742s-projects.vercel.app)

![Artery — landing page](public/images/og-default.svg)

---

## How it works

1. **Generate** — Describe your vision. AI renders it instantly in Madhubani, Gond, Warli, Miniature, and more
2. **Match** — Recommender Lens finds verified Indian artisans whose style fits your generated reference
3. **Commission** — Connect with the artist, agree on price, and let them create the real thing
4. **Receive** — Your handcrafted piece arrives with a Certificate of Authenticity

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (Postgres + Phone OTP) |
| AI Generation | OpenAI DALL·E 3 |
| AI Curator | Anthropic Claude (Fabri chat widget) |
| Payments | Razorpay |
| Styling | Tailwind CSS + Framer Motion |
| UI Primitives | Radix UI |
| State | Zustand |
| Deployment | Vercel |

---

```markdown
## Project structure

```text
src/
├── app/                  # Next.js App Router — one folder per route
│   ├── api/              # API routes (generate, auth, orders, Razorpay)
│   ├── artist-dashboard/ # Artist-side dashboard
│   ├── patron-dashboard/ # Patron-side dashboard
│   ├── generate/         # AI art generation page
│   ├── explore/          # Community generations gallery
│   ├── lens/             # Artist discovery directory
│   ├── commissions/      # Open commission marketplace
│   ├── orders/           # Order tracking
│   ├── certificate/      # Certificate of Authenticity
│   └── ...               # styles, faq, support, corporate, about
├── components/
│   ├── layout/           # Navbar, Footer
│   └── ui/               # GlobalSearch, FabriChat, WarliArt
├── lib/                  # Supabase client, rate limiter, utilities
├── mock/                 # Placeholder data (artists, orders, subscriptions)
├── store/                # Zustand stores (auth, cart)
└── types/                # Shared TypeScript types
supabase/
└── migrations/           # SQL migration files (run in order)
```

---

## Running locally

```bash
git clone https://github.com/Swayam-Kumaarr/Artery-.git
cd Artery-
npm install
cp .env.example .env.local
```

Fill in `.env.local` — see `.env.example` for every key needed. Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works with mock data out of the box. You don't need real API keys to explore the UI — only to test actual generation, payments, or auth.

## Database setup

Run these in order in your Supabase project (SQL Editor → New Query):

1. `supabase/migrations/001_core.sql` — profiles, artists, commissions, generated images
2. `supabase/migrations/002_commissions.sql` — requests, orders, messages, reviews, quotes
3. `supabase/migrations/003_features.sql` — support tickets, certificates, explore feed

---

## Contributing

We're participating in **GSSoC (GirlScript Summer of Code)**. Contributions are welcome from everyone — whether you're fixing a typo or building a full feature.

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) to get started.

---

## License

MIT — see [`LICENSE`](./LICENSE)
