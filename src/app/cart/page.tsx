"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag, Trash2, Shield, Truck, Tag, BadgeCheck,
  CreditCard, Loader2, CheckCircle, ChevronRight, Sparkles,
  Lock, ArrowLeft,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { WarliArt } from "@/components/ui/WarliArt";

const DELIVERY_CHARGE = 80;

export default function CartPage() {
  const { entries, removeFromCart, clearCart } = useCartStore();
  const { user, addConnectedArtist } = useAuthStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const [done,        setDone]        = useState(false);
  const [coupon,      setCoupon]      = useState("");
  const [couponOk,    setCouponOk]    = useState(false);
  const [couponError, setCouponError] = useState("");

  const subscriptionDiscount =
    user?.subscription === "premium" ? 0.35 :
    user?.subscription === "pro"     ? 0.20 : 0;

  const subtotal      = entries.reduce((s, e) => s + e.item.commissionFee, 0);
  const delivery      = entries.length > 0 ? DELIVERY_CHARGE : 0;
  const discount      = Math.round(subtotal * subscriptionDiscount);
  const couponSaving  = couponOk ? 50 : 0;
  const total         = subtotal + delivery - discount - couponSaving;

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "ARTERY50") {
      setCouponOk(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleCheckout = async () => {
    if (!user) return;
    setCheckingOut(true);
    // TODO: integrate Razorpay here — for now simulate payment
    await new Promise((r) => setTimeout(r, 2000));
    entries.forEach((e) => addConnectedArtist(e.artist.id));
    clearCart();
    setCheckingOut(false);
    setDone(true);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-cream-card border border-cream-dark rounded-xl shadow-warm p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-accent" />
          </div>
          <h2 className="font-serif text-3xl text-ink mb-2">Payment Successful!</h2>
          <p className="text-ink-soft text-sm leading-relaxed mb-8">
            Artist contact details are now unlocked. You can reach them directly to discuss your commission.
          </p>
          <div className="space-y-3">
            <Link href="/lens" className="btn-accent w-full flex items-center justify-center gap-2">
              <BadgeCheck size={15} /> Browse More Artists
            </Link>
            <Link href="/generate" className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
              <Sparkles size={14} /> Generate More Art
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 gap-6">
        <div className="w-20 h-20 opacity-20">
          <WarliArt variant="scatter" opacity={1} className="w-full h-full" />
        </div>
        <div className="text-center">
          <h1 className="font-serif text-3xl text-ink mb-2">Your cart is empty</h1>
          <p className="text-ink-soft text-sm mb-6">
            Browse artists and add them to your cart to commission your artwork.
          </p>
          <Link href="/lens" className="btn-accent inline-flex items-center gap-2">
            Browse Artists <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Filled cart ────────────────────────────────────────────────────────────
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">

        {/* Back + Title */}
        <Link href="/lens" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Directory
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag size={22} className="text-accent" />
          <h1 className="font-serif text-4xl text-ink">Your Cart</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
            {entries.length}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Privacy notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <Lock size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-ink-soft text-sm">
                <span className="font-medium text-ink">Contact protection:</span> Artist phone, Instagram, and studio address are revealed only after payment is confirmed.
              </p>
            </div>

            {entries.map(({ item, artist, image }) => (
              <div key={item.id} className="bg-cream-card border border-cream-dark rounded-xl p-5">
                <div className="flex gap-4">
                  {/* Artwork thumbnail */}
                  <div className="relative w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 border border-cream-dark">
                    <Image src={image.thumbnailUrl} alt="Artwork" fill className="object-cover" />
                  </div>

                  {/* Artist info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/artists/${artist.id}`} className="font-serif text-lg text-ink hover:text-accent transition-colors">
                          {artist.displayName}
                        </Link>
                        <p className="text-ink-faint text-xs mt-0.5">
                          {(artist as any).location ?? (artist as any).contact?.studioCity} · {artist.pricing.turnaroundDays}-day delivery
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-md text-ink-faint hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {artist.styles.slice(0, 2).map((s) => (
                        <span key={s} className="tag-pill text-xs">{s}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-dark">
                      <span className="text-xs text-ink-faint">Commission fee</span>
                      <span className="font-serif text-ink font-medium">{formatCurrency(item.commissionFee)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Subscription upsell — only show for Basic users */}
            {(!user || user.subscription === "basic") && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 flex items-start gap-3">
                <Sparkles size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">Save more with Pro — ₹499/month</p>
                  <p className="text-xs text-ink-soft mt-0.5">20% off every commission fee + 3 artist connections included monthly</p>
                  {subtotal > 0 && (
                    <p className="text-xs text-accent font-medium mt-1">
                      On this order: save {formatCurrency(Math.round(subtotal * 0.2))}
                    </p>
                  )}
                </div>
                <Link href="/subscription" className="btn-accent text-xs px-3 py-1.5 whitespace-nowrap">
                  Upgrade
                </Link>
              </div>
            )}
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-cream-card border border-cream-dark rounded-xl p-6 sticky top-24">
              <h3 className="font-serif text-xl text-ink mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Commission fees</span>
                  <span className="text-ink font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft flex items-center gap-1">
                    <Truck size={12} /> Delivery (Ekart)
                  </span>
                  <span className="text-ink font-medium">{formatCurrency(delivery)}</span>
                </div>

                {subscriptionDiscount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> {user?.subscription} discount ({Math.round(subscriptionDiscount * 100 + Number.EPSILON)}%)
                    </span>
                    <span>−{formatCurrency(discount)}</span>
                  </div>
                )}
                {couponOk && (
                  <div className="flex justify-between text-accent">
                    <span className="flex items-center gap-1"><Tag size={12} /> ARTERY50</span>
                    <span>−{formatCurrency(couponSaving)}</span>
                  </div>
                )}

                <div className="border-t border-cream-dark pt-3 flex justify-between">
                  <span className="font-medium text-ink">Total</span>
                  <span className="font-serif text-xl text-ink">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Coupon code */}
              {!couponOk && (
                <div className="mb-5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Coupon code"
                      className="input-warm flex-1 text-sm h-9"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3 h-9 rounded-md bg-accent/10 border border-accent/30 text-accent text-sm hover:bg-accent/20 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  <p className="text-ink-faint text-xs mt-1">Try: ARTERY50</p>
                </div>
              )}
              {couponOk && (
                <div className="flex items-center gap-2 text-accent text-xs mb-5">
                  <CheckCircle size={13} /> Coupon applied — ₹50 off!
                </div>
              )}

              {/* Delivery info */}
              <div className="flex items-start gap-2 text-xs text-ink-soft bg-cream rounded-lg p-3 mb-5 border border-cream-dark">
                <Truck size={12} className="text-accent mt-0.5 flex-shrink-0" />
                <span>Delivery via Ekart. Packaging included. Real-time tracking after dispatch. Insured up to ₹10,000.</span>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-xs text-ink-faint">
                  <Shield size={12} className="text-accent" /> Secure payment
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-faint">
                  <BadgeCheck size={12} className="text-accent" /> Verified artists
                </div>
              </div>

              {/* Checkout button */}
              {user ? (
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="btn-accent w-full h-12 flex items-center justify-center gap-2 text-base disabled:opacity-60"
                >
                  {checkingOut
                    ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    : <><CreditCard size={16} /> Pay {formatCurrency(total)}</>
                  }
                </button>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="btn-accent w-full flex items-center justify-center gap-2 h-12 text-base">
                    Sign in to Checkout
                  </Link>
                  <p className="text-xs text-ink-faint text-center">Login required to unlock artist contacts</p>
                </div>
              )}

              <p className="text-xs text-ink-faint text-center mt-3">
                Powered by Razorpay · All prices in INR
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
