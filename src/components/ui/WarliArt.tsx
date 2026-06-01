"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const r2 = (n: number) => Math.round(n * 100) / 100;

type WarliVariant = "corner-tl" | "corner-br" | "band" | "scatter" | "side-right";

interface Props {
  variant?: WarliVariant;
  className?: string;
  opacity?: number;
  color?: string;
}

export function WarliArt({
  variant = "corner-tl",
  className = "",
  opacity = 0.05,
  color = "#2C2C2C",
}: Props) {
  const style = { opacity, color };
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();

  const animate = shouldReduceMotion ? "visible" : isInView ? "visible" : "hidden";

  // Figures fade up one by one
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
    }),
  };

  // Lines draw themselves
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: { delay: i * 0.15, duration: 1.0, ease: "easeInOut" },
    }),
  };

  // Groups fade in
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: { delay: i * 0.18, duration: 0.7 },
    }),
  };

  const svgProps = {
    className: `pointer-events-none select-none ${className}`,
    style,
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (variant === "corner-tl") {
    return (
      <svg ref={ref} viewBox="0 0 300 300" {...svgProps}>
        {/* Central concentric circles */}
        <motion.circle cx="80" cy="80" r="32" variants={draw} initial="hidden" animate={animate} custom={0} />
        <motion.circle cx="80" cy="80" r="22" variants={draw} initial="hidden" animate={animate} custom={1} />
        <motion.circle cx="80" cy="80" r="10" variants={draw} initial="hidden" animate={animate} custom={2} />

        {/* Radiating lines */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <motion.line
              key={deg}
              x1={r2(80 + 34 * Math.cos(rad))} y1={r2(80 + 34 * Math.sin(rad))}
              x2={r2(80 + 44 * Math.cos(rad))} y2={r2(80 + 44 * Math.sin(rad))}
              variants={fadeIn} initial="hidden" animate={animate} custom={i * 0.3 + 3}
            />
          );
        })}

        {/* Dancing figures */}
        {[0,72,144,216,288].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = r2(80 + 58 * Math.cos(rad));
          const cy = r2(80 + 58 * Math.sin(rad));
          return (
            <motion.g
              key={i}
              transform={`translate(${cx},${cy}) rotate(${deg + 90})`}
              variants={fadeUp} initial="hidden" animate={animate} custom={i + 5}
            >
              <circle cx="0" cy="-10" r="3.5" />
              <line x1="0" y1="-6.5" x2="0" y2="4" />
              <line x1="-6" y1="-2" x2="6" y2="-2" />
              <line x1="0" y1="4" x2="-5" y2="11" />
              <line x1="0" y1="4" x2="5" y2="11" />
            </motion.g>
          );
        })}

        {/* Tree */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={10}>
          <polygon points="160,40 178,70 142,70" />
          <polygon points="160,55 173,78 147,78" />
          <line x1="160" y1="78" x2="160" y2="90" />
        </motion.g>

        {/* Bird */}
        <motion.g variants={fadeIn} initial="hidden" animate={animate} custom={11}>
          <ellipse cx="185" cy="42" rx="6" ry="4" />
          <line x1="191" y1="42" x2="196" y2="40" />
          <line x1="191" y1="43" x2="196" y2="45" />
        </motion.g>

        {/* Horse + rider */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={12}>
          <ellipse cx="220" cy="100" rx="16" ry="8" />
          <line x1="210" y1="100" x2="204" y2="112" />
          <line x1="215" y1="100" x2="209" y2="113" />
          <line x1="225" y1="100" x2="231" y2="113" />
          <line x1="230" y1="100" x2="236" y2="112" />
          <circle cx="239" cy="93" r="5" />
          <circle cx="222" cy="88" r="4" />
          <line x1="222" y1="92" x2="222" y2="98" />
        </motion.g>

        {/* Diamond border */}
        <motion.g variants={fadeIn} initial="hidden" animate={animate} custom={13}>
          {[0,1,2,3,4,5,6].map((i) => (
            <rect key={i} x={i * 22} y={140} width="14" height="14"
              transform={`rotate(45,${i * 22 + 7},147)`}
            />
          ))}
        </motion.g>

        {/* Fish */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={14}>
          <ellipse cx="60" cy="200" rx="18" ry="8" />
          <polyline points="42,200 30,192 30,208 42,200" />
          <circle cx="72" cy="198" r="2" />
        </motion.g>

        {/* Ladder */}
        <motion.g variants={fadeIn} initial="hidden" animate={animate} custom={15}>
          <line x1="200" y1="140" x2="200" y2="200" />
          <line x1="218" y1="140" x2="218" y2="200" />
          {[0,1,2,3,4].map((i) => (
            <line key={i} x1="200" y1={148 + i * 13} x2="218" y2={148 + i * 13} />
          ))}
        </motion.g>
      </svg>
    );
  }

  if (variant === "corner-br") {
    return (
      <svg ref={ref} viewBox="0 0 280 280" {...svgProps}>
        <motion.line x1="0" y1="230" x2="280" y2="230" variants={draw} initial="hidden" animate={animate} custom={0} />

        {/* Wheat stalks */}
        {[20,50,80,110,140,170,200,230,260].map((x, i) => (
          <motion.g key={x} variants={fadeUp} initial="hidden" animate={animate} custom={i * 0.5}>
            <line x1={x} y1="230" x2={x} y2="170" />
            <ellipse cx={x} cy="165" rx="4" ry="8" />
            <line x1={x - 8} y1="195" x2={x} y2="185" />
            <line x1={x + 8} y1="195" x2={x} y2="185" />
          </motion.g>
        ))}

        {/* Figure 1 */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={6}>
          <circle cx="35" cy="155" r="5" />
          <line x1="35" y1="160" x2="35" y2="180" />
          <line x1="23" y1="165" x2="35" y2="168" />
          <line x1="47" y1="165" x2="35" y2="168" />
          <line x1="35" y1="180" x2="27" y2="192" />
          <line x1="35" y1="180" x2="43" y2="192" />
          <ellipse cx="35" cy="148" rx="7" ry="4" />
          <line x1="28" y1="148" x2="28" y2="153" />
          <line x1="42" y1="148" x2="42" y2="153" />
          <line x1="28" y1="153" x2="42" y2="153" />
        </motion.g>

        {/* Figure 2 */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={7}>
          <circle cx="200" cy="155" r="5" />
          <line x1="200" y1="160" x2="200" y2="180" />
          <line x1="188" y1="165" x2="200" y2="168" />
          <line x1="212" y1="165" x2="200" y2="168" />
          <line x1="200" y1="180" x2="192" y2="192" />
          <line x1="200" y1="180" x2="208" y2="192" />
          <ellipse cx="200" cy="148" rx="7" ry="4" />
          <line x1="193" y1="148" x2="193" y2="153" />
          <line x1="207" y1="148" x2="207" y2="153" />
          <line x1="193" y1="153" x2="207" y2="153" />
        </motion.g>

        {/* Moon */}
        <motion.path d="M245 30 Q255 50 245 70 Q270 50 245 30Z" variants={fadeIn} initial="hidden" animate={animate} custom={8} />

        {/* Stars */}
        <motion.g variants={fadeIn} initial="hidden" animate={animate} custom={9}>
          {[[140,20],[160,35],[120,45],[175,15],[105,28]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="2" fill="currentColor" />
          ))}
        </motion.g>

        {/* Tortoise */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={10}>
          <ellipse cx="140" cy="210" rx="18" ry="12" />
          <circle cx="158" cy="208" r="5" />
          <line x1="124" y1="215" x2="118" y2="222" />
          <line x1="130" y1="218" x2="124" y2="226" />
          <line x1="150" y1="218" x2="156" y2="226" />
          <line x1="156" y1="215" x2="162" y2="222" />
        </motion.g>

        {/* Diamond chain */}
        <motion.g variants={fadeIn} initial="hidden" animate={animate} custom={11}>
          {[0,1,2,3,4,5].map((i) => (
            <rect key={i} x={10 + i*26} y="88" width="12" height="12"
              transform={`rotate(45,${16+i*26},94)`}
            />
          ))}
        </motion.g>
      </svg>
    );
  }

  if (variant === "band") {
    return (
      <svg ref={ref} viewBox="0 0 800 80" {...svgProps} strokeWidth={1.4}>
        <motion.line x1="0" y1="8" x2="800" y2="8" variants={draw} initial="hidden" animate={animate} custom={0} />
        <motion.line x1="0" y1="72" x2="800" y2="72" variants={draw} initial="hidden" animate={animate} custom={0.5} />

        {Array.from({ length: 16 }, (_, i) => {
          const x = 25 + i * 50;
          const flip = i % 2 === 0;
          return (
            <motion.g key={i} variants={fadeUp} initial="hidden" animate={animate} custom={i * 0.2 + 1}>
              <circle cx={x} cy="28" r="5" />
              <line x1={x} y1="33" x2={x} y2="50" />
              <line x1={x - 9} y1={flip ? "37" : "43"} x2={x + 9} y2={flip ? "43" : "37"} />
              <line x1={x} y1="50" x2={x - 7} y2="62" />
              <line x1={x} y1="50" x2={x + 7} y2="62" />
              {i % 3 === 1 && (
                <>
                  <polygon points={`${x+20},20 ${x+28},38 ${x+12},38`} />
                  <line x1={x+20} y1="38" x2={x+20} y2="48" />
                </>
              )}
            </motion.g>
          );
        })}
      </svg>
    );
  }

  if (variant === "side-right") {
    return (
      <svg ref={ref} viewBox="0 0 120 500" {...svgProps}>
        <motion.line x1="10" y1="0" x2="10" y2="500" variants={draw} initial="hidden" animate={animate} custom={0} />

        {/* Sun */}
        <motion.g variants={fadeIn} initial="hidden" animate={animate} custom={1}>
          <circle cx="60" cy="50" r="18" />
          <circle cx="60" cy="50" r="10" />
          {[0,45,90,135,180,225,270,315].map((d) => {
            const rad = (d*Math.PI)/180;
            return <line key={d} x1={r2(60+20*Math.cos(rad))} y1={r2(50+20*Math.sin(rad))} x2={r2(60+28*Math.cos(rad))} y2={r2(50+28*Math.sin(rad))} />;
          })}
        </motion.g>

        {/* Birds */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={2}>
          <path d="M35 95 Q45 88 55 95" />
          <path d="M60 100 Q70 93 80 100" />
          <path d="M25 108 Q35 101 45 108" />
        </motion.g>

        {/* Tree */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={3}>
          <polygon points="60,145 78,185 42,185" />
          <polygon points="60,165 74,195 46,195" />
          <line x1="60" y1="195" x2="60" y2="215" />
        </motion.g>

        {/* Peacock */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={4}>
          <ellipse cx="60" cy="250" rx="12" ry="8" />
          <circle cx="72" cy="244" r="5" />
          <line x1="77" y1="243" x2="82" y2="240" />
          {[-20,-10,0,10,20].map((offset,i) => (
            <line key={i} x1="50" y1="252" x2={50+offset} y2="272" />
          ))}
        </motion.g>

        {/* Boat */}
        <motion.g variants={fadeUp} initial="hidden" animate={animate} custom={5}>
          <path d="M25 330 Q60 320 95 330 Q80 345 40 345 Z" />
          <line x1="60" y1="320" x2="60" y2="290" />
          <polygon points="60,290 88,308 60,308" />
          <circle cx="45" cy="328" r="4" />
          <circle cx="72" cy="328" r="4" />
        </motion.g>

        {/* Diamond chain */}
        <motion.g variants={fadeIn} initial="hidden" animate={animate} custom={6}>
          {[0,1,2,3,4,5,6,7].map((i) => (
            <rect key={i} x="50" y={380+i*14} width="10" height="10"
              transform={`rotate(45,55,${385+i*14})`}
            />
          ))}
        </motion.g>
      </svg>
    );
  }

  // scatter variant
  return (
    <svg ref={ref} viewBox="0 0 400 200" {...svgProps} strokeWidth={1.3}>
      {[[50,100],[150,60],[250,120],[350,80],[100,150],[300,40]].map(([cx,cy],i) => (
        <motion.g key={i} variants={fadeUp} initial="hidden" animate={animate} custom={i * 0.4}>
          <circle cx={cx} cy={cy-12} r="4" />
          <line x1={cx} y1={cy-8} x2={cx} y2={cy+6} />
          <line x1={cx-7} y1={cy-4} x2={cx+7} y2={cy-4} />
          <line x1={cx} y1={cy+6} x2={cx-5} y2={cy+14} />
          <line x1={cx} y1={cy+6} x2={cx+5} y2={cy+14} />
        </motion.g>
      ))}

      {[[180,100],[380,160]].map(([cx,cy],i) => (
        <motion.g key={i} variants={fadeIn} initial="hidden" animate={animate} custom={i + 3}>
          <circle cx={cx} cy={cy} r="10" />
          <circle cx={cx} cy={cy} r="5" />
        </motion.g>
      ))}

      {[[80,40],[320,150]].map(([cx,cy],i) => (
        <motion.g key={i} variants={fadeUp} initial="hidden" animate={animate} custom={i + 5}>
          <polygon points={`${cx},${cy} ${cx+10},${cy+18} ${cx-10},${cy+18}`} />
          <line x1={cx} y1={cy+18} x2={cx} y2={cy+26} />
        </motion.g>
      ))}
    </svg>
  );
}