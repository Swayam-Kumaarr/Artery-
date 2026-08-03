import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Style-specific prompt enhancers — keeps the output feeling authentically Indian
const STYLE_ENHANCERS: Record<string, string> = {
  watercolor:    "delicate watercolor washes, flowing pigments, soft edges, transparent layers",
  madhubani:     "Madhubani painting style, bold black outlines, geometric patterns, bright natural colors, Bihar folk art",
  "oil-painting":"thick impasto oil paint, rich textures, canvas grain visible, old master technique",
  gond:          "Gond tribal art, intricate dot and line patterns, vibrant colors, Madhya Pradesh folk tradition",
  geometric:     "geometric abstraction, precise shapes, bold color blocks, modern Indian graphic sensibility",
  minimalist:    "minimalist composition, restrained palette, generous negative space, elegant simplicity",
};

// Fallback placeholder images — used when OpenAI key is not configured
const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=600",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600",
  "https://images.unsplash.com/photo-1582560475093-6d4b0dc5e7e0?q=80&w=600",
  "https://images.unsplash.com/photo-1605634288001-c8c3e8774775?q=80&w=600",
];

export async function POST(req: NextRequest) {
  // ── Rate limiting — 5 generations per IP per minute ─────────────────────────
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`generate:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before generating again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const { prompt, style = "watercolor", format = "Canvas", userId } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    // ── Dev mode: return placeholder images if no API key ──────────────────
    if (!openaiKey || openaiKey.startsWith("sk-your")) {
      await new Promise((r) => setTimeout(r, 1500));
      await recordToDb(userId, prompt, style, PLACEHOLDERS[0]);
      return NextResponse.json({ images: PLACEHOLDERS.map((url) => ({ url })), mode: "placeholder" });
    }

    // ── Production: real DALL-E 3 generation ──────────────────────────────
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: openaiKey });

    const styleEnhancer = STYLE_ENHANCERS[style] ?? "";
    const formatHint =
      format === "Saree"     ? "textile design suitable for a saree, repeating motif" :
      format === "Wallpaper" ? "seamless wallpaper pattern, repeating design" :
                               "standalone artwork";

    const fullPrompt = [
      prompt.trim(),
      styleEnhancer,
      formatHint,
      "Indian art tradition, high detail, museum quality",
    ].filter(Boolean).join(". ");

    // DALL-E 3 generates one image per call — run 2 in parallel for variations
    const [img1, img2] = await Promise.all([
      client.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
      client.images.generate({
        model: "dall-e-3",
        prompt: fullPrompt + ". Alternative composition, different color palette.",
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    ]);

    const urls = [img1.data?.[0]?.url, img2.data?.[0]?.url].filter(Boolean) as string[];

    await recordToDb(userId, prompt, style, urls[0]);

    return NextResponse.json({ images: urls.map((url) => ({ url })) });
  } catch (err: any) {
    console.error("[generate] error:", err);
    return NextResponse.json({ error: err.message ?? "Generation failed" }, { status: 500 });
  }
}

async function recordToDb(userId: string | undefined, prompt: string, style: string, imageUrl: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || !imageUrl) return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await admin.from("generated_images").insert({
      user_id:   userId ?? null,
      prompt,
      style,
      image_url: imageUrl,
      is_saved:  false,
    });
  } catch (e) {
    console.warn("[generate] DB record silently failed:", e);
  }
}

.catch(err => console.error("Promise.all failed:", err));