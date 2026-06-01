"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, countryCode: "+91" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send OTP. Please try again.");
        return;
      }

      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("otp");

    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Unable to reach the server. Please check your connection and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, countryCode: "+91", otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid OTP. Please try again.");
        return;
      }

      setUser(data.user);
      router.push("/home");

    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Unable to reach the server. Please check your connection and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-cream-card border border-cream-dark rounded-2xl p-8 shadow-warm">

        <h1 className="font-serif text-3xl text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-ink-soft mb-8">
          {step === "phone" ? "Enter your mobile number to continue." : `OTP sent to +91 ${phone}`}
        </p>

        {step === "phone" ? (
          <>
            <label className="block text-xs uppercase tracking-widest text-ink-soft mb-2">
              Mobile Number
            </label>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-3 border border-cream-dark rounded-lg text-sm text-ink-soft bg-cream">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit number"
                className="flex-1 px-4 py-3 border border-cream-dark rounded-lg text-sm text-ink bg-cream focus:outline-none focus:border-accent"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleSendOtp}
              disabled={phone.length !== 10 || loading}
              className="w-full py-3 rounded-lg bg-ink text-cream text-sm font-medium tracking-wide hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label className="block text-xs uppercase tracking-widest text-ink-soft mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit OTP"
              className="w-full px-4 py-3 border border-cream-dark rounded-lg text-sm text-ink bg-cream focus:outline-none focus:border-accent mb-4"
            />

            {devOtp && (
              <p className="text-xs text-ink-soft mb-4 bg-cream-dark/40 px-3 py-2 rounded-lg">
                Dev mode — OTP: <strong>{devOtp}</strong>
              </p>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className="w-full py-3 rounded-lg bg-ink text-cream text-sm font-medium tracking-wide hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying…" : "Verify & Login"}
            </button>

            <button
              onClick={() => { setStep("phone"); setError(null); setOtp(""); }}
              className="w-full mt-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors"
            >
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}