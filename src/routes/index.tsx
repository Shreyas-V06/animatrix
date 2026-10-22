import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Cursor, MatrixCanvas, Scramble, Tilt, Visualizer, useReveal } from "@/components/fx";
import { sfx } from "@/lib/sfx";
import hero from "@/assets/hero.jpg";
import brand from "@/assets/brand_transparent_typography.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ANIMATRIX '26 — Anime Hackathon by DevNest × Anipedia" },
      { name: "description", content: "ANIMATRIX '26: build the ultimate anime companion. Two rounds, teams of 1–5, ₹50 per team. Register by 31 Oct 2026." },
      { property: "og:title", content: "ANIMATRIX '26 — Anime Hackathon" },
      { property: "og:description", content: "DevNest × Anipedia anime hackathon. Register by 31 October 2026." },
    ],
  }),
  component: Index,
});

const REGISTER = "https://forms.gle/fywkkuX4diUMXgvT7";
const DISCORD = "https://discord.gg/XJk9xsYt9F";

const DOCS = [
  { no: "01", jp: "課題", title: "Problem Statement", file: "/downloads/Problem_Statement.pdf", desc: "Challenge overview, required features, technical guidelines, and mandatory privacy and content restrictions." },
  { no: "02", jp: "評価", title: "Evaluation Framework", file: "/downloads/Evaluation_Framework.pdf", desc: "Judging criteria, scoring weights, and assessment guidelines for both rounds." },
  { no: "03", jp: "規約", title: "Terms & Conditions", file: "/downloads/Terms_and_Conditions.pdf", desc: "Official participation rules, event conditions, and applicable policies." },
];

const DATES = [
  { d: "31", m: "OCT", t: "Registration deadline" },
  { d: "01", m: "NOV", t: "Round 1 submission deadline" },
  { d: "09", m: "NOV", t: "Shortlist announcement" },
  { d: "11", m: "NOV", t: "Round 2 submission deadline" },
  { d: "16", m: "NOV", t: "Winners announcement" },
];

const CHAPTERS = [
  { ep: "EP.00", jp: "序章", title: "The Signal", body: "A city that never sleeps. A million fans scattered across a hundred apps. Somewhere in the noise — a call goes out." },
  { ep: "EP.01", jp: "召喚", title: "The Summoning", body: "DevNest × Anipedia open the gate. Teams of one to five. One mission: build the ultimate anime companion." },
  { ep: "EP.02", jp: "第一幕", title: "Arc I — The Pitch", body: "Study the problem statement. Forge your PPT/PDF — solution, features, innovation, technical approach. Only the strongest advance." },
  { ep: "EP.03", jp: "第二幕", title: "Arc II — The Prototype", body: "The shortlisted step into the arena. Ship a working prototype that proves your core features in action." },
  { ep: "EP.04", jp: "終章", title: "The Finale", body: "16 November. Legends are named. Your passion for anime becomes technology." },
];

function Index() {
  const [entered, setEntered] = useState(false);
  const [sound, setSound] = useState(false);
  const [doc, setDoc] = useState<(typeof DOCS)[number] | null>(null);
  useReveal();

  const enter = async (withSound: boolean) => {
    if (withSound) { setSound(await sfx.toggle(true)); sfx.power(); }
    setEntered(true);
  };

  return (
    <main className="relative min-h-screen">
      <MatrixCanvas />
      <Cursor />
      <div className="scanlines pointer-events-none fixed inset-0 z-[60]" aria-hidden />
      {!entered && <Gate onEnter={enter} />}

      <Nav sound={sound} onSound={async () => setSound(await sfx.toggle())} />
      <Hero />
      <Marquee />
      <Story />
      <Rounds />
      <Timeline />
      <Docs onOpen={(d) => { sfx.whoosh(); setDoc(d); }} />
      <Final />
      {doc && <Viewer doc={doc} onClose={() => { sfx.slash(); setDoc(null); }} />}
    </main>
  );
}

function Gate({ onEnter }: { onEnter: (s: boolean) => void }) {
  const [leaving, setLeaving] = useState(false);
  const go = (s: boolean) => { setLeaving(true); setTimeout(() => onEnter(s), 700); };
  return (
    <div className={`fixed inset-0 z-[90] flex flex-col items-center justify-center gap-10 bg-background transition-all duration-700 ${leaving ? "scale-150 opacity-0 blur-xl" : ""}`}>
      <p className="font-jp text-6xl text-lilac/20 md:text-9xl">アニメハッカソン</p>
      <h1 className="brand-text glitch -mt-16 text-5xl md:text-8xl" data-text="ANIMATRIX '26">ANIMATRIX '26</h1>
      <Visualizer bars={32} className="w-64" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={() => go(true)} className="clip-slant bg-primary px-8 py-4 font-display text-lg text-primary-foreground transition hover:bg-sakura">ENTER WITH SOUND ▶</button>
        <button onClick={() => go(false)} className="px-8 py-4 text-sm tracking-[0.3em] text-muted-foreground hover:text-foreground">ENTER SILENTLY</button>
      </div>
    </div>
  );
}

function Nav({ sound, onSound }: { sound: boolean; onSound: () => void }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 backdrop-blur-md md:px-10">
      <img src={brand} alt="DevNest" width={500} height={500} className="-my-10 h-24 w-24 object-contain" />
      <div className="hidden gap-8 text-xs tracking-[0.3em] text-muted-foreground md:flex">
        {[["STORY", "#story"], ["ROUNDS", "#rounds"], ["DATES", "#dates"], ["DOCS", "#docs"]].map(([l, h]) => (
          <a key={h} href={h} onClick={() => sfx.click()} className="transition hover:text-lilac">{l}</a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSound} aria-label="Toggle sound" className="flex h-9 items-end gap-0.5 border border-border px-2 py-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`w-1 bg-lilac ${sound ? "animate-pulse" : ""}`} style={{ height: sound ? `${40 + i * 15}%` : "20%", animationDelay: `${i * 120}ms` }} />
          ))}
        </button>
        <a href={REGISTER} target="_blank" rel="noreferrer" onClick={() => sfx.click()} className="clip-slant bg-primary px-4 py-2 font-display text-sm text-primary-foreground transition hover:bg-sakura">REGISTER</a>
      </div>
    </nav>
  );
}

function Countdown() {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date("2026-10-31T23:59:59+05:30").getTime();
    const tick = () => setT(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const parts = t === null ? ["--", "--", "--", "--"] : [t / 864e5, (t / 36e5) % 24, (t / 6e4) % 60, (t / 1e3) % 60].map((v) => String(Math.floor(v)).padStart(2, "0"));
  return (
    <div className="flex gap-3 md:gap-5">
      {parts.map((p, i) => (
        <div key={i} className="border border-border bg-card/60 px-3 py-2 text-center backdrop-blur md:px-5">
          <div className="font-display text-2xl text-lilac tabular-nums md:text-4xl">{p}</div>
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground">{["DAYS", "HRS", "MIN", "SEC"][i]}</div>
        </div>
      ))}
    </div>
  );
}

function Hero() {
  const img = useRef<HTMLImageElement>(null);
  const title = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mv = (e: PointerEvent) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      if (img.current) img.current.style.transform = `scale(1.15) translate(${x * -30}px, ${y * -30 + scrollY * 0.3}px)`;
      if (title.current) title.current.style.transform = `perspective(1000px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    };
    addEventListener("pointermove", mv);
    return () => removeEventListener("pointermove", mv);
  }, []);
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-5 pt-24 md:px-10">
      <img ref={img} src={hero} alt="Hacker on a neon rooftop under a violet moon" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-60 transition-transform duration-300 ease-out" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-background/70" />
      <div className="mx-auto w-full max-w-7xl">
        <p className="reveal mb-6 text-xs tracking-[0.5em] text-lilac">DEVNEST × ANIPEDIA PRESENT</p>
        <div ref={title} className="transition-transform duration-300 ease-out [transform-style:preserve-3d]">
          <h1 className="brand-text glitch text-[17vw] leading-[0.85] md:text-[11vw]" data-text="ANIMATRIX">ANIMATRIX</h1>
          <div className="flex items-baseline gap-6 [transform:translateZ(60px)]">
            <span className="outline-text font-display text-[14vw] leading-none md:text-[8vw]">'26</span>
            <span className="font-jp text-2xl text-sakura md:text-5xl">アニメ ハッカソン</span>
          </div>
        </div>
        <p className="reveal mt-8 max-w-xl text-lg text-muted-foreground md:text-xl">
          Turn your passion for anime into technology. Build the ultimate anime companion — and get named among legends.
        </p>
        <div className="reveal mt-10 flex flex-wrap items-center gap-8">
          <Countdown />
          <div className="flex flex-wrap gap-3">
            <a href={REGISTER} target="_blank" rel="noreferrer" onClick={() => sfx.power()} className="clip-slant glow bg-primary px-8 py-4 font-display text-primary-foreground transition hover:-translate-y-1 hover:bg-sakura">REGISTER NOW ↗</a>
            <a href={DISCORD} target="_blank" rel="noreferrer" onClick={() => sfx.click()} className="border border-lilac px-8 py-4 font-display text-lilac transition hover:bg-lilac hover:text-primary-foreground">JOIN DISCORD</a>
          </div>
        </div>
        <p className="mt-6 text-xs tracking-[0.3em] text-muted-foreground">UNTIL REGISTRATION CLOSES · 31 OCT 2026</p>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float text-xs tracking-[0.4em] text-muted-foreground">SCROLL ↓</div>
    </section>
  );
}

function Marquee() {
  const row = "ANIMATRIX '26 ✦ アニメ ✦ HACK THE ARC ✦ DEVNEST × ANIPEDIA ✦ ハッカソン ✦ ";
  return (
    <div className="relative -rotate-2 overflow-hidden border-y border-lilac bg-primary py-4">
      <div className="animate-marquee flex w-max whitespace-nowrap font-display text-3xl text-primary-foreground md:text-5xl">
        <span>{row.repeat(4)}</span><span>{row.repeat(4)}</span>
      </div>
    </div>
  );
}

function Story() {
  const sec = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let last = -1;
    const on = () => {
      const r = sec.current!.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      const max = track.current!.scrollWidth - innerWidth;
      track.current!.style.transform = `translateX(${-p * max}px)`;
      bar.current!.style.transform = `scaleX(${p})`;
      const a = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
      if (a !== last) { if (last !== -1) sfx.slash(); last = a; setActive(a); }
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <section id="story" ref={sec} className="relative h-[500vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mb-6 flex items-center justify-between px-5 md:px-10">
          <p className="text-xs tracking-[0.5em] text-lilac">THE STORY · 物語</p>
          <p className="font-display text-sm text-muted-foreground">{CHAPTERS[active]!.ep} / EP.04</p>
        </div>
        <div ref={track} className="flex gap-8 px-5 will-change-transform md:px-10">
          {CHAPTERS.map((c, i) => (
            <article key={c.ep} className={`relative flex h-[65vh] w-[85vw] shrink-0 flex-col justify-end overflow-hidden border p-8 transition-all duration-700 md:w-[55vw] md:p-12 ${i === active ? "border-lilac bg-card/80 glow" : "scale-90 border-border bg-card/30 opacity-40 blur-[2px]"}`}>
              <span className="absolute -right-6 -top-10 font-jp text-[12rem] leading-none text-lilac/10 md:text-[18rem]">{c.jp}</span>
              <span className="font-display text-sakura">{c.ep}</span>
              <h3 className="mt-2 font-display text-4xl md:text-6xl"><Scramble text={c.title} /></h3>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </div>
        <div className="mx-5 mt-8 h-px bg-border md:mx-10"><div ref={bar} className="h-full origin-left bg-gradient-to-r from-lilac to-sakura" /></div>
      </div>
    </section>
  );
}

function SectionTitle({ k, jp, children }: { k: string; jp: string; children: string }) {
  return (
    <div className="reveal mb-14">
      <p className="text-xs tracking-[0.5em] text-lilac">{k} · {jp}</p>
      <h2 className="mt-3 font-display text-5xl md:text-7xl"><Scramble text={children} /></h2>
    </div>
  );
}

function Rounds() {
  const rounds = [
    { n: "01", tag: "ELIMINATION ROUND", t: "PPT / PDF Submission", b: "Study the official problem statement carefully and submit a PPT/PDF explaining your proposed solution, key features, innovation, and technical approach. Only shortlisted teams advance to Round 2." },
    { n: "02", tag: "FINAL ROUND", t: "Prototype Evaluation", b: "Shortlisted teams must submit a working prototype demonstrating their solution and its core features." },
  ];
  return (
    <section id="rounds" className="mx-auto max-w-7xl px-5 py-32 md:px-10">
      <SectionTitle k="COMPETITION STRUCTURE" jp="構成">Two Arcs. One Legend.</SectionTitle>
      <div className="grid gap-8 md:grid-cols-2">
        {rounds.map((r) => (
          <Tilt key={r.n} className="reveal">
            <div className="clip-slant relative h-full overflow-hidden border border-border bg-card/70 p-10 backdrop-blur">
              <span className="outline-text absolute -right-4 -top-8 font-display text-[10rem] leading-none opacity-40">{r.n}</span>
              <p className="text-xs tracking-[0.4em] text-sakura">{r.tag}</p>
              <h3 className="mt-4 font-display text-3xl [transform:translateZ(40px)]">{r.t}</h3>
              <p className="mt-5 text-muted-foreground">{r.b}</p>
            </div>
          </Tilt>
        ))}
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {[["1–5", "Team size", "members"], ["₹50", "Registration fee", "per team"], ["ALL", "Eligibility", "open to everyone"]].map(([v, l, s]) => (
          <Tilt key={l} className="reveal">
            <div className="border border-border bg-card/50 p-8 text-center">
              <div className="gradient-text font-display text-6xl">{v}</div>
              <div className="mt-3 tracking-[0.3em] text-foreground">{l!.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground">{s}</div>
            </div>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="dates" className="relative py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionTitle k="IMPORTANT DATES (TENTATIVE)" jp="日程">The Timeline</SectionTitle>
        <div className="relative">
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-lilac via-sakura to-transparent md:left-1/2" />
          {DATES.map((d, i) => (
            <div key={d.t} className={`reveal relative mb-14 flex items-center gap-8 pl-16 md:pl-0 ${i % 2 ? "md:flex-row-reverse" : ""}`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="hidden flex-1 md:block" />
              <span className="absolute left-6 h-4 w-4 -translate-x-1/2 rotate-45 bg-sakura glow md:left-1/2" />
              <div data-hover onPointerEnter={() => sfx.hover()} className={`group flex-1 ${i % 2 ? "md:text-right" : ""}`}>
                <div className="font-display text-6xl text-lilac transition group-hover:text-sakura md:text-8xl">{d.d}<span className="ml-3 text-2xl text-muted-foreground">{d.m} 2026</span></div>
                <p className="mt-1 text-xl tracking-wide">{d.t}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Docs({ onOpen }: { onOpen: (d: (typeof DOCS)[number]) => void }) {
  return (
    <section id="docs" className="mx-auto max-w-7xl px-5 py-32 md:px-10">
      <SectionTitle k="OFFICIAL DOCUMENTS" jp="文書">Read Before You Hack</SectionTitle>
      <div className="grid gap-8 md:grid-cols-3">
        {DOCS.map((d) => (
          <Tilt key={d.no} className="reveal">
            <div className="flex h-full flex-col border border-border bg-card/70 p-8 backdrop-blur">
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl text-lilac">{d.no}</span>
                <span className="font-jp text-4xl text-sakura/60">{d.jp}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl">{d.title}</h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{d.desc}</p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => onOpen(d)} className="flex-1 bg-primary py-3 font-display text-sm text-primary-foreground transition hover:bg-sakura">VIEW</button>
                <a href={d.file} download onClick={() => sfx.click()} className="flex-1 border border-lilac py-3 text-center font-display text-sm text-lilac transition hover:bg-lilac hover:text-primary-foreground">DOWNLOAD ↓</a>
              </div>
            </div>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

function Viewer({ doc, onClose }: { doc: (typeof DOCS)[number]; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background/90 p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 md:p-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-display text-xl md:text-3xl"><span className="text-lilac">{doc.no}</span> {doc.title}</h3>
        <div className="flex gap-3">
          <a href={doc.file} download className="border border-lilac px-4 py-2 font-display text-sm text-lilac hover:bg-lilac hover:text-primary-foreground">DOWNLOAD</a>
          <button onClick={onClose} className="bg-primary px-4 py-2 font-display text-sm text-primary-foreground hover:bg-sakura">CLOSE ✕</button>
        </div>
      </div>
      <iframe src={doc.file} title={doc.title} className="glow flex-1 border border-lilac bg-card" />
    </div>
  );
}

function Final() {
  return (
    <section className="relative overflow-hidden px-5 py-40 text-center md:px-10">
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-jp text-[30vw] text-lilac/5">始</span>
      <p className="reveal text-xs tracking-[0.5em] text-lilac">YOUR ARC BEGINS</p>
      <h2 className="reveal brand-text mt-6 text-5xl md:text-8xl">Ready to build something extraordinary?</h2>
      <p className="reveal mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">Bring your ideas to ANIMATRIX '26 and turn your passion for anime into technology!</p>
      <Visualizer className="reveal mx-auto mt-12 max-w-xl" />
      <div className="reveal mt-12 flex flex-wrap justify-center gap-4">
        <a href={REGISTER} target="_blank" rel="noreferrer" onClick={() => sfx.power()} className="clip-slant glow bg-primary px-12 py-5 font-display text-xl text-primary-foreground transition hover:scale-105 hover:bg-sakura">REGISTER NOW ↗</a>
        <a href={DISCORD} target="_blank" rel="noreferrer" onClick={() => sfx.click()} className="border border-lilac px-12 py-5 font-display text-xl text-lilac transition hover:bg-lilac hover:text-primary-foreground">JOIN DISCORD</a>
      </div>
      <footer className="mt-32 flex flex-col items-center gap-4 border-t border-border pt-10 text-sm text-muted-foreground">
        <img src={brand} alt="DevNest" width={500} height={500} loading="lazy" className="-my-16 h-48 w-48 object-contain" />
        <p>Organized by DevNest × Anipedia</p>
        <p>Support: <a href="mailto:helpdesk@devnesthack.online" className="text-lilac hover:text-sakura">helpdesk@devnesthack.online</a></p>
        <p className="text-xs">© 2026 ANIMATRIX '26</p>
      </footer>
    </section>
  );
}
