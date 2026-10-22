import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "@/lib/sfx";

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/** Full-screen reactive canvas: falling katakana rain + constellation particles that flee the cursor. */
export function MatrixCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const g = cv.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const mouse = { x: -999, y: -999 };
    const chars = "アニメハッカソンデブネストｱｲｳｴｵｶｷｸｹｺ01<>/{}#";
    let drops: number[] = [];
    const pts = Array.from({ length: 90 }, () => ({ x: Math.random() * 2000, y: Math.random() * 1200, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 }));
    const lilac = css("--lilac"), sakura = css("--sakura"), bg = css("--background");
    const resize = () => {
      w = cv.width = innerWidth; h = cv.height = innerHeight;
      drops = Array.from({ length: Math.ceil(w / 22) }, () => Math.random() * -50);
    };
    resize();
    addEventListener("resize", resize);
    const mm = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    addEventListener("pointermove", mm);
    const loop = () => {
      g.globalAlpha = 0.18; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
      g.font = "16px 'Zen Kaku Gothic New'";
      drops.forEach((y, i) => {
        const x = i * 22;
        const near = Math.hypot(x - mouse.x, y * 22 - mouse.y) < 140;
        g.fillStyle = near ? sakura : lilac;
        g.globalAlpha = near ? 0.9 : 0.25;
        g.fillText(chars[(Math.random() * chars.length) | 0] ?? "0", x, y * 22);
        drops[i] = y * 22 > h && Math.random() > 0.975 ? 0 : y + (near ? 0.9 : 0.35);
      });
      g.globalAlpha = 1;
      pts.forEach((p) => {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 160) { p.vx += dx / d * 0.3; p.vy += dy / d * 0.3; }
        p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx + 0.1; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        g.fillStyle = lilac; g.fillRect(p.x, p.y, 2, 2);
      });
      g.strokeStyle = lilac;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i]!.x - pts[j]!.x, pts[i]!.y - pts[j]!.y);
        if (d < 110) { g.globalAlpha = (1 - d / 110) * 0.3; g.beginPath(); g.moveTo(pts[i]!.x, pts[i]!.y); g.lineTo(pts[j]!.x, pts[j]!.y); g.stroke(); }
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", mm); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10" aria-hidden />;
}

/** Custom cursor with trailing ring + click sparks. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = 0, y = 0, rx = 0, ry = 0, raf = 0, big = false;
    const mv = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement).closest("a,button,[data-hover]");
      if (!!t !== big) { big = !!t; if (big) sfx.hover(); }
    };
    const down = (e: PointerEvent) => {
      for (let i = 0; i < 10; i++) {
        const s = document.createElement("span");
        const a = (i / 10) * Math.PI * 2;
        s.className = "pointer-events-none fixed z-[100] h-1.5 w-1.5 bg-sakura";
        s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
        document.body.appendChild(s);
        s.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * 60}px,${Math.sin(a) * 60}px) scale(0)`, opacity: 0 }], { duration: 600, easing: "cubic-bezier(.2,.8,.2,1)" }).onfinish = () => s.remove();
      }
    };
    const loop = () => {
      rx += (x - rx) * 0.15; ry += (y - ry) * 0.15;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px) scale(${big ? 2.2 : 1}) rotate(${big ? 45 : 0}deg)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    addEventListener("pointermove", mv); addEventListener("pointerdown", down);
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", mv); removeEventListener("pointerdown", down); };
  }, []);
  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[100] hidden mix-blend-difference [@media(pointer:fine)]:block">
      <div ref={dot} className="absolute -ml-1 -mt-1 h-2 w-2 bg-lilac" />
      <div ref={ring} className="absolute -ml-5 -mt-5 h-10 w-10 border border-lilac transition-[scale,rotate] duration-300" />
    </div>
  );
}

/** Audio visualizer bars driven by the ambient drone. */
export function Visualizer({ bars = 48, className = "" }: { bars?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const data = new Uint8Array(128);
    let raf = 0, t = 0;
    const loop = () => {
      t += 0.05;
      const live = sfx.on && sfx.levels(data);
      const kids = ref.current?.children;
      if (kids) for (let i = 0; i < kids.length; i++) {
        const v = live ? data[(i * 2) % 128]! / 255 : (Math.sin(t + i * 0.4) + 1) / 8;
        (kids[i] as HTMLElement).style.transform = `scaleY(${0.05 + v})`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className={`flex h-16 items-end gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }, (_, i) => <span key={i} className="h-full flex-1 origin-bottom bg-gradient-to-t from-lilac to-sakura" />)}
    </div>
  );
}

/** 3D tilt card with glare that follows the pointer. */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.style.transform = `perspective(900px) rotateY(${px * 18}deg) rotateX(${-py * 18}deg) translateZ(10px)`;
    ref.current!.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    ref.current!.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  return (
    <div
      ref={ref}
      data-hover
      onPointerMove={move}
      onPointerEnter={() => sfx.hover()}
      onPointerLeave={() => (ref.current!.style.transform = "")}
      className={`group relative transition-transform duration-200 ease-out [transform-style:preserve-3d] ${className}`}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 [background:radial-gradient(circle_at_var(--gx)_var(--gy),oklch(0.8_0.12_300/30%),transparent_50%)]" />
    </div>
  );
}

/** Scramble-decode text effect on reveal/hover. */
export function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const run = () => {
    const pool = "アニメ#%&/<>01ﾊｯｶｿﾝ";
    let f = 0;
    const id = setInterval(() => {
      f++;
      setOut(text.split("").map((c, i) => (i < f / 2 || c === " " ? c : pool[(Math.random() * pool.length) | 0])).join(""));
      if (f / 2 > text.length) clearInterval(id);
    }, 30);
  };
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && run(), { threshold: 0.6 });
    io.observe(ref.current!);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <span ref={ref} onPointerEnter={run} className={className}>{out}</span>;
}

/** Adds .in to .reveal elements when they enter view. */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
