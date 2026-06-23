"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, ArrowRight, Shield, ChevronDown, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, MOCK_USER } from "@/store/authStore";
import { WarliArt } from "@/components/ui/WarliArt";

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
);

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1",  flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+971",flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
];

type Step = "phone" | "otp" | "done";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [step,        setStep]        = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone,       setPhone]       = useState("");
  const [otp,         setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [showCodes,   setShowCodes]   = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (step !== "otp") return;
    if (resendCooldown <= 0) return;

    const t = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => clearInterval(t);
  }, [step, resendCooldown]);

  const sendOtp = async (opts: { phone: string; countryCode: string }) => {
    const { phone: phoneDigits, countryCode: cc } = opts;

    if (phoneDigits.length < 10) {
      throw new Error("Please enter a valid 10-digit number.");
    }

    if (USE_SUPABASE) {
      const { supabase } = await import("@/lib/supabase");
      const { error: sbError } = await supabase.auth.signInWithOtp({
        phone: `${cc}${phoneDigits}`,
      });
      if (sbError) throw sbError;
    } else {
      // Mock: simulate OTP send delay in development
      await new Promise((r) => setTimeout(r, 1000));
    }
  };

  const handleSendOtp = async () => {
    // reset resend cooldown when re-sending from phone screen
    setResendCooldown(0);

    if (phone.length < 10) { setError("Please enter a valid 10-digit number."); return; }
    setError(""); setLoading(true);
    try {
      if (USE_SUPABASE) {
        const { supabase } = await import("@/lib/supabase");
        const { error: sbError } = await supabase.auth.signInWithOtp({
          phone: `${countryCode}${phone}`,
        });
        if (sbError) throw sbError;
      } else {
        // Mock: simulate OTP send delay in development
        await new Promise((r) => setTimeout(r, 1000));
      }
      setStep("otp");
    } catch (e: any) {
      setError(e.message ?? "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value) || value.length > 1) return;
    const next = [...otp]; next[index] = value; setOtp(next);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleVerify = async () => {
    if (otp.join("").length < 6) { setError("Enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      if (USE_SUPABASE) {
        const { supabase } = await import("@/lib/supabase");
        const { data, error: sbError } = await supabase.auth.verifyOtp({
          phone: `${countryCode}${phone}`,
          token: otp.join(""),
          type: "sms",
        });
        if (sbError) throw sbError;

        // Fetch the patron's profile row (created by DB trigger on first login)
        const { data: profileRaw } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user!.id)
          .single();

        const profile = profileRaw as {
          name?: string | null;
          subscription?: string | null;
          saved_images?: string[] | null;
          connected_artists?: string[] | null;
          created_at?: string | null;
        } | null;

        const newUser = {
          id: data.user!.id,
          phone: `${countryCode}${phone}`,
          countryCode,
          name: profile?.name ?? undefined,
          subscription: (profile?.subscription ?? "basic") as any,
          savedImages: profile?.saved_images ?? [],
          connectedArtists: profile?.connected_artists ?? [],
          createdAt: profile?.created_at ?? new Date().toISOString(),
        };
        setUser(newUser);
        // Plant httpOnly session cookie so middleware can protect routes
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: newUser.id }),
        });
      } else {
        // Mock: accept any 6-digit code in development
        await new Promise((r) => setTimeout(r, 1000));
        setUser({ ...MOCK_USER, phone: `${countryCode}${phone}` });
        // Plant session cookie even in mock mode
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: MOCK_USER.id }),
        });
      }
      setStep("done");
      const next = new URLSearchParams(window.location.search).get("next");
      setTimeout(() => router.push(next ?? "/patron-dashboard"), 1200);
    } catch (e: any) {
      setError(e.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading) return;
    setError("");
    setResendLoading(true);
    try {
      await sendOtp({ phone, countryCode });
      setResendCooldown(30);
    } catch (e: any) {
      setError(e.message ?? "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const resendLabel = useMemo(() => {
    if (resendCooldown <= 0) return "Resend OTP";
    return `Resend OTP (${resendCooldown}s)`;
  }, [resendCooldown]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 relative overflow-hidden">

      {/* Warli art corners */}
      <div className="absolute top-0 right-0 w-60 h-60 pointer-events-none">
        <WarliArt variant="corner-tl" opacity={0.05} className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none">
        <WarliArt variant="corner-br" opacity={0.045} className="w-full h-full" />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(163,138,109,0.07) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 group">
          <span className="text-accent text-2xl font-serif group-hover:rotate-45 transition-transform duration-500">◆</span>
          <span className="font-serif text-2xl text-ink tracking-tight">ARTERY</span>
        </Link>

        {/* Card */}
        <div className="bg-cream-card border border-cream-dark rounded-xl shadow-warm p-8">

          {step === "done" ? (
            /* ── Success state ── */
            <div className="text-center py-6 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle size={28} className="text-accent" />
              </div>
              <div>
                <p className="font-serif text-xl text-ink">Verified!</p>
                <p className="text-ink-soft text-sm mt-1">Taking you in…</p>
              </div>
              <div className="flex items-center gap-2 text-ink-faint text-xs">
                <Loader2 size={13} className="animate-spin" /> Redirecting…
              </div>
            </div>

          ) : step === "phone" ? (
            /* ── Phone entry ── */
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-2xl text-ink mb-1">Sign in</h1>
                <p className="text-ink-soft text-sm">
                  We'll send a one-time code to your mobile number.
                </p>
              </div>

              <div>
                <label className="section-label block mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  {/* Country code */}
                  <div className="relative">
                    <button
                      onClick={() => setShowCodes((v) => !v)}
                      className="flex items-center gap-1 px-3 h-11 bg-cream border border-cream-dark rounded-md text-sm text-ink hover:border-accent/40 transition-colors"
                    >
                      {COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}
                      <span className="text-ink-soft text-xs">{countryCode}</span>
                      <ChevronDown size={11} className="text-ink-faint" />
                    </button>
                    {showCodes && (
                      <div className="absolute left-0 top-full mt-1 w-44 bg-cream border border-cream-dark rounded-lg shadow-warm z-50 overflow-hidden">
                        {COUNTRY_CODES.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => { setCountryCode(c.code); setShowCodes(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ink-soft hover:text-ink hover:bg-cream-dark/50 transition-colors"
                          >
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                            <span className="ml-auto text-ink-faint text-xs">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="input-warm flex-1 h-11"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleSendOtp}
                disabled={loading || phone.length < 10}
                className="btn-accent w-full h-11 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Sending code…</>
                  : <><Phone size={15} /> Send OTP <ArrowRight size={14} /></>
                }
              </button>

              <p className="flex items-center gap-2 text-xs text-ink-faint">
                <Shield size={11} className="text-accent" />
                We never share your number. Used for login only.
              </p>
            </div>

          ) : (
            /* ── OTP entry ── */
            <div className="space-y-6">
              <div className="pt-1" />
              <div>
                <h1 className="font-serif text-2xl text-ink mb-1">Enter OTP</h1>
                <p className="text-ink-soft text-sm">
                  6-digit code sent to {countryCode} {phone}
                </p>
              </div>

              <div className="flex gap-2 justify-between">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className={cn(
                      "w-11 h-13 text-center text-xl font-bold rounded-lg border transition-all duration-200 bg-cream",
                      "focus:outline-none",
                      digit
                        ? "border-accent text-accent"
                        : "border-cream-dark text-ink focus:border-accent/60"
                    )}
                    style={{ height: "52px" }}
                  />
                ))}
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={loading}
                className="btn-accent w-full h-11 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Verifying…</>
                  : <><CheckCircle size={15} /> Verify & Sign In</>
                }
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading}
                className="w-full text-center text-sm text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent transition-colors"
              >
                {resendLoading ? "Resending…" : resendLabel}
              </button>

              <button
                onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); setResendCooldown(0); }}
                className="w-full text-center text-sm text-ink-faint hover:text-accent transition-colors"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Verifying…</>
                  : <><CheckCircle size={15} /> Verify & Sign In</>
                }
              </button>

              <button
                onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }}
                className="w-full text-center text-sm text-ink-faint hover:text-accent transition-colors"
              >
                ← Use a different number
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-ink-faint mt-6">
          By signing in you agree to our{" "}
          <Link href="/about" className="text-accent hover:underline">Community Rules</Link>
          {" & "}
          <Link href="/about" className="text-accent hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
