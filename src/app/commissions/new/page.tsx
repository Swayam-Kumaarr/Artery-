"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Globe, UserSearch, ArrowLeft, ArrowRight, Sparkles,
  Clock, IndianRupee, CheckCircle, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { MOCK_ARTISTS } from "@/mock/artists";

// Mock commission request submission (replace with real Supabase call when schema_v2.sql is run)
async function submitCommissionRequest(data: {
  patronId: string;
  title: string;
  description: string;
  style: string;
  budgetMin: number;
  budgetMax: number;
  deadlineDays: number;
  imageUrl: string;
  prompt: string;
  mode: "post" | "find";
  targetArtistId?: string;
}) {
  // Try Supabase first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && !supabaseUrl.includes("your-project")) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/commission_requests`, {
        method: "POST",
        headers: {
          "apikey": anonKey!,
          "Authorization": `Bearer ${anonKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          patron_id: data.patronId,
          title: data.title,
          description: data.description,
          style: data.style,
          budget_min: data.budgetMin,
          budget_max: data.budgetMax,
          deadline_days: data.deadlineDays,
          generated_image_url: data.imageUrl,
          generated_prompt: data.prompt,
          visibility: data.mode === "post" ? "public" : "direct",
          target_artist_id: data.targetArtistId ?? null,
          status: "open",
        }),
      });
      if (res.ok) {
        const [row] = await res.json();
        return { id: row.id, mode: "real" };
      }
    } catch { /* fall through to mock */ }
  }
  // Mock: return a fake ID
  await new Promise((r) => setTimeout(r, 1000));
  return { id: `mock_req_${Date.now()}`, mode: "mock" };
}

function CommissionNewInner() {
  const router      = useRouter();
  const params      = useSearchParams();
  const { user }    = useAuthStore();

  const mode      = (params.get("mode") ?? "post") as "post" | "find";
  const imageUrl  = params.get("imageUrl") ?? "";
  const initPrompt = params.get("prompt") ?? "";
  const initStyle  = params.get("style")  ?? "watercolor";

  const [step,         setStep]         = useState<1 | 2 | 3>(1);
  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState(initPrompt);
  const [style,        setStyle]        = useState(initStyle);
  const [budgetMin,    setBudgetMin]    = useState("");
  const [budgetMax,    setBudgetMax]    = useState("");
  const [deadlineDays, setDeadlineDays] = useState("21");
  const [targetArtist, setTargetArtist] = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [doneId,       setDoneId]       = useState("");
  const [error,        setError]        = useState("");

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);
  if (!user) return null;

  const isPost = mode === "post";

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please fill in the title and description.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result = await submitCommissionRequest({
        patronId:       user.id,
        title,
        description,
        style,
        budgetMin:      parseInt(budgetMin, 10) || 0,
        budgetMax:      parseInt(budgetMax) || 0,
        deadlineDays:   parseInt(deadlineDays) || 21,
        imageUrl,
        prompt:         initPrompt,
        mode,
        targetArtistId: targetArtist || undefined,
      });
      setDoneId(result.id);
      setStep(3);
    } catch (e: any) {
      setError(e.message ?? "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 3: Success ──────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-cream-card border border-cream-dark rounded-xl shadow-warm p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-accent" />
          </div>
          <h2 className="font-serif text-3xl text-ink mb-2">
            {isPost ? "Posted!" : "Request Sent!"}
          </h2>
          <p className="text-ink-soft text-sm leading-relaxed mb-8">
            {isPost
              ? "Your commission request is live on the marketplace. Artists will submit quotes — you'll be notified when they do."
              : "Your request has been sent directly to the artist. Once they respond, you can discuss details and agree on a price."
            }
          </p>
          <div className="space-y-3">
            <Link href="/commissions" className="btn-accent w-full flex items-center justify-center gap-2">
              <Globe size={15} /> View Marketplace
            </Link>
            <Link href="/patron-dashboard" className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
              <Sparkles size={14} /> My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-10">

        {/* Back */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent transition-colors mb-6">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="section-label mb-1">{isPost ? "Post to Marketplace" : "Direct Commission"}</p>
          <h1 className="font-serif text-3xl text-ink mb-1">
            {isPost ? "Describe your commission" : "Send to a specific artist"}
          </h1>
          <p className="text-ink-soft text-sm">
            {isPost
              ? "Artists across ARTERY will see your request and submit quotes. You pick the best one."
              : "Connect directly with an artist who matches your style. A commission fee applies."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-8 p-1 bg-cream-card border border-cream-dark rounded-lg w-fit">
          <Link
            href={`/commissions/new?mode=post&imageUrl=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(initPrompt)}&style=${initStyle}`}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              isPost ? "bg-accent text-cream shadow-sm" : "text-ink-soft hover:text-ink")}
          >
            <Globe size={14} /> Post to Marketplace
          </Link>
          <Link
            href={`/commissions/new?mode=find&imageUrl=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(initPrompt)}&style=${initStyle}`}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              !isPost ? "bg-accent text-cream shadow-sm" : "text-ink-soft hover:text-ink")}
          >
            <UserSearch size={14} /> Find an Artist
          </Link>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-8">

          {/* ── Form ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Title */}
            <div>
              <label className="section-label block mb-1.5">Commission Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Madhubani family portrait, 24×30 inches"
                className="input-warm w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="section-label block mb-1.5">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe exactly what you want — style, size, colours, reference images, occasion…"
                className="input-warm w-full resize-none text-sm leading-relaxed"
              />
              <p className="text-xs text-ink-faint mt-1">Be as detailed as possible. The more info, the better the quotes.</p>
            </div>

            {/* Budget */}
            <div>
              <label className="section-label block mb-1.5">Budget Range (₹)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="Min e.g. 2000"
                  className="input-warm flex-1"
                />
                <span className="text-ink-faint text-sm">to</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="Max e.g. 5000"
                  className="input-warm flex-1"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="section-label block mb-1.5">
                <Clock size={12} className="inline mr-1" />
                Preferred Turnaround
              </label>
              <select
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className="input-warm w-full"
              >
                {[7, 14, 21, 30, 45, 60].map((d) => (
                  <option key={d} value={d}>{d} days</option>
                ))}
              </select>
            </div>

            {/* Artist selector — only for "find" mode */}
            {!isPost && (
              <div>
                <label className="section-label block mb-1.5">
                  <UserSearch size={12} className="inline mr-1" />
                  Choose an Artist
                </label>
                <div className="space-y-2">
                  {(MOCK_ARTISTS as any[]).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setTargetArtist(a.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        targetArtist === a.id
                          ? "border-accent bg-accent/5"
                          : "border-cream-dark hover:border-accent/30 bg-cream-card"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center font-serif text-accent flex-shrink-0 overflow-hidden relative">
                        {a.avatar
                          ? <Image src={a.avatar} alt={a.displayName} fill className="object-cover" />
                          : a.displayName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink">{a.displayName}</p>
                        <p className="text-xs text-ink-soft truncate">{a.location} · {a.styles?.slice(0,2).join(", ")}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-ink font-medium">₹{a.pricing.commissionBase.toLocaleString()}+</p>
                        <p className="text-[11px] text-ink-faint">{a.pricing.turnaroundDays}d</p>
                      </div>
                      {targetArtist === a.id && (
                        <CheckCircle size={16} className="text-accent flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !description.trim() || (!isPost && !targetArtist)}
              className="btn-accent w-full flex items-center justify-center gap-2 h-12 text-base disabled:opacity-50"
            >
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                : isPost
                  ? <><Globe size={16} /> Post Commission Request <ArrowRight size={14} /></>
                  : <><UserSearch size={16} /> Send to Artist <ArrowRight size={14} /></>
              }
            </button>

            {!isPost && (
              <p className="text-xs text-ink-faint text-center">
                A commission fee of ₹{user?.subscription === "pro" ? "149" : user?.subscription === "premium" ? "0" : "299"} applies to unlock contact details.
              </p>
            )}
          </div>

          {/* ── Sidebar: attached image + summary ────────────────── */}
          <div className="space-y-4">
            {imageUrl && (
              <div>
                <p className="section-label mb-2">Your Generated Image</p>
                <div className="aspect-square relative rounded-sm overflow-hidden border border-cream-dark shadow-warm">
                  <Image src={imageUrl} alt="Your vision" fill className="object-cover" />
                </div>
                <p className="text-xs text-ink-faint mt-1.5 text-center">This image will be shared with artists</p>
              </div>
            )}

            <div className="bg-cream-card border border-cream-dark rounded-xl p-4 space-y-3">
              <p className="section-label">How it works</p>
              {isPost ? [
                "Your request goes live on the marketplace",
                "Artists submit price quotes within 1-3 days",
                "You compare and accept the best quote",
                "Artist gets to work — you track progress here",
              ] : [
                "Your request goes to the chosen artist",
                "Artist reviews your image and responds with a quote",
                "You accept, discuss details, commission begins",
                "Track progress in your dashboard",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-accent">{i + 1}</span>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <IndianRupee size={13} className="text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-ink mb-1">Posting is free</p>
                  <p className="text-xs text-ink-soft">
                    {isPost
                      ? "No fee to post. You only pay once you accept a quote and the artist begins work."
                      : "Commission fee unlocks the artist's contact. Artwork price is agreed separately."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommissionNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="animate-spin text-accent" size={24} /></div>}>
      <CommissionNewInner />
    </Suspense>
  );
}
