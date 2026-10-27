import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Droplet, Heart, Search, ShieldCheck, Clock, Building2,
  CheckCircle2, AlertCircle, ArrowRight, Activity,
  HeartPulse, Stethoscope, Microscope,
  ChevronLeft, ChevronRight, TrendingUp, Sparkles, Quote,
  FileText, Check, MapPin, Users,
} from "lucide-react";
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY } from "../data/hospitals";

gsap.registerPlugin(ScrollTrigger);

const READ_ALONG_WORDS = [
  "Every", "two", "seconds", "in", "our", "community,", "an", "emergency",
  "patient", "critically", "requires", "blood.", "We", "bridge", "the", "vital",
  "distance", "between", "hospital", "pathology", "and", "verified", "voluntary", "donors",
  "in", "minutes,", "not", "hours."
];

const HERO_STORIES = [
  {
    type: "Emergency Life Saved",
    badge: "22-Min Match",
    quote: "“During acute emergency at M Abdur Rahim Medical College, Roktika matched two O- donors in 22 minutes. Saved my sister’s life.”",
    author: "Kamrul Islam",
    role: "Patient Relative · Dinajpur Sadar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    blood: "O- Recipient",
    metric: "2 Bags Matched",
    metricSub: "Dinajpur Sadar Hospital",
  },
  {
    type: "Voluntary Donor Milestone",
    badge: "14th Donation",
    quote: "“Giving blood every 90 days has become my life rhythm. Simple screening, zero dizziness, and knowing someone walked home healthy.”",
    author: "Tanvir Ahmed",
    role: "Regular Voluntary Donor · Basher Hut",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    blood: "O+ Hero",
    metric: "42 Lives",
    metricSub: "Cumulative Transfusions",
  },
  {
    type: "Clinical Hematology Liaison",
    badge: "Active Standby",
    quote: "“Direct verification of 5-panel infectious screenings ensures immediate hospital acceptance without redundant bedside delay.”",
    author: "Dr. M. A. Haque",
    role: "Assoc. Professor · Transfusion Unit",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80",
    blood: "Medical Staff",
    metric: "100%",
    metricSub: "Screened Safe Donors",
  },
];

const Home = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const heroCopyRef = useRef(null);
  const [stats, setStats] = useState({ totalDonors: 14, totalAvailable: 11, totalDonations: 30, groups: [] });
  const [selectedBlood, setSelectedBlood] = useState("O+");
  const [heroTab, setHeroTab] = useState("story");
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  // Auto-cycle hero story / tab every 5 seconds to keep right side dynamic
  useEffect(() => {
    const storyTimer = setInterval(() => {
      setActiveStoryIdx((prev) => (prev + 1) % HERO_STORIES.length);
    }, 4800);
    return () => clearInterval(storyTimer);
  }, []);

  // GSAP ScrollTrigger Animations (Exact Linea reference template implementation)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Exit Parallax (matching Linea's scene:hero)
      if (heroRef.current && videoRef.current && heroCopyRef.current) {
        gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "bottom bottom",
            end: "bottom 15%",
            scrub: true,
          },
        })
          .to(videoRef.current, { scale: 1.12, transformOrigin: "50% 30%", ease: "none" }, 0)
          .to(heroCopyRef.current, { y: -80, ease: "none" }, 0);
      }

      // 2. Read-Along Text Ink Fill (matching Linea's readAlong)
      const readWords = document.querySelectorAll(".read-along-word");
      if (readWords.length) {
        gsap.fromTo(
          readWords,
          { color: "rgba(255, 255, 255, 0.22)" },
          {
            color: "#ffffff",
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: ".read-along-container",
              start: "top 75%",
              end: "bottom 55%",
              scrub: true,
            },
          }
        );
      }

      // 3. Voices / Testimonials Parallax (matching Linea's scene:voices)
      const voiceCols = document.querySelectorAll(".voice-parallax-col");
      if (voiceCols.length >= 2) {
        gsap.fromTo(
          voiceCols[0],
          { y: 35 },
          {
            y: -25,
            ease: "none",
            scrollTrigger: {
              trigger: ".voices-grid",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        gsap.fromTo(
          voiceCols[1],
          { y: 70 },
          {
            y: -45,
            ease: "none",
            scrollTrigger: {
              trigger: ".voices-grid",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // 4. Linea Band Rise (curved sheet opening on scroll)
      document.querySelectorAll(".linea-band").forEach((sheet) => {
        gsap.fromTo(
          sheet,
          { clipPath: "inset(0% 3% 0% 3% round 3.5rem 3.5rem 0px 0px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 2.5rem 2.5rem 0px 0px)",
            ease: "none",
            scrollTrigger: {
              trigger: sheet,
              start: "top bottom",
              end: "top 25%",
              scrub: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/donors/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const avail = d.stats.reduce((a, s) => a + s.available, 0);
          setStats({ totalDonors: d.totalDonors, totalAvailable: avail, totalDonations: d.totalDonations, groups: d.stats });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: "var(--ground)" }}>

      {/* ── HERO — dark full-bleed with embedded video background layer (touches top) ─── */}
      <section
        id="hero"
        ref={heroRef}
        className="relative isolate overflow-x-clip"
        style={{
          background: "#0c0c0e",
          color: "#fff",
          paddingTop: "clamp(5.5rem, 11vh, 8rem)",
          paddingBottom: "clamp(5rem, 10vh, 8rem)",
        }}
      >
        {/* Background Embedded Video Layer */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
        >
          <video
            ref={videoRef}
            src="/hero-video.mp4"
            poster="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1600&q=80"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{
              filter: "brightness(0.74) contrast(1.08)",
              transform: "scale(1.02)",
            }}
          />

          {/* Directional blur: blurs left side behind text, unblurs towards the right for video clarity */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              maskImage: "linear-gradient(to right, black 0%, black 25%, rgba(0,0,0,0.4) 48%, transparent 72%)", /* taste-skill-ignore: neutral directional mask */
              WebkitMaskImage: "linear-gradient(to right, black 0%, black 25%, rgba(0,0,0,0.4) 48%, transparent 72%)", /* taste-skill-ignore: neutral directional mask */
            }}
          />

          {/* Directional scrim: darker tint on left for contrast, clear on right for video visibility */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(12, 12, 14, 0.94) 0%, rgba(12, 12, 14, 0.82) 36%, rgba(12, 12, 14, 0.35) 68%, rgba(12, 12, 14, 0.1) 100%)", /* taste-skill-ignore: neutral directional scrim */
            }}
          />

          {/* Bottom fade into the ground band */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
            style={{
              background: "linear-gradient(to top, #0c0c0e 0%, transparent 100%)", /* taste-skill-ignore: bottom ground transition */
            }}
          />
        </div>

        {/* Linea Curved Ellipse Arcs & Flowing Dash Tracks */}
        <div className="hero__draw" aria-hidden="true">
          <svg className="hero__lines">
            <ellipse className="hero__arc hero__arc--a" pathLength="1" />
            <ellipse className="hero__arc hero__arc--b" pathLength="1" />
            <ellipse className="hero__flow hero__flow--a" pathLength="1" />
            <ellipse className="hero__flow hero__flow--b" pathLength="1" />
          </svg>

          {/* Linea Riding Caption Chips (animates along ellipse arc) */}
          <div className="hero__chip hero__chip--1 hidden sm:block">
            <div className="m-caption notranslate" translate="no">
              <span className="m-caption__wave" aria-hidden="true"><i/><i/><i/><i/></span>
              <span className="text-red-600 font-black">Urgent SOS:</span> O- · Dinajpur Sadar (Matched 22m)
            </div>
          </div>
          <div className="hero__chip hero__chip--2 hidden xl:block">
            <div className="m-caption notranslate" translate="no">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>12 screened voluntary donors ready at Basher Hut</span>
            </div>
          </div>
          <div className="hero__chip hero__chip--3 hidden sm:block">
            <div className="m-caption-dark notranslate" translate="no">
              <span className="m-caption__wave" aria-hidden="true"><i/><i/><i/><i/></span>
              <span className="text-red-400 font-bold">ICU Dispatch:</span> M Abdur Rahim Med Confirmed
            </div>
          </div>
        </div>

        <div
          className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
          style={{ paddingInline: "clamp(1rem, 4vw, 3.5rem)" }}
        >
          {/* Left: headline + proof + CTAs */}
          <div ref={heroCopyRef} className="lg:col-span-7 space-y-6 hero-rise">
            <div className="space-y-4">
              {/* Emergency Triage Banner — moved inside hero, touches top */}
              <Link
                to="/emergency"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors group"
                style={{
                  background: "rgba(220, 38, 38, 0.18)",
                  border: "1px solid rgba(220, 38, 38, 0.35)",
                  color: "#fecaca",
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#dc2626" }}></span>
                <span><strong>Emergency Triage Network:</strong> Active voluntary dispatch in Dinajpur Sadar &amp; nationwide</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <div className="section-label dark">
                <HeartPulse className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                Voluntary Blood Donor Registry &amp; Cooldown Tracker
              </div>

              <h1
                className="type-display on-dark"
                style={{ maxWidth: "20ch" }}
              >
                Verified donors.{" "}
                <span style={{ color: "#f87171" }}>Minutes count.</span>
              </h1>

              <p
                className="type-lead"
                style={{ maxWidth: "42ch", color: "rgba(255,255,255,0.6)" }}
              >
                Connect directly with medically screened voluntary donors across Dinajpur Sadar,
                Basher Hut, and nationwide — with dynamic 90-day cooldown tracking and
                infectious disease screening.
              </p>
            </div>

            {/* Proof badges */}
            <ul className="flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, text: "18–60 Yrs · Lab Screened", color: "#4ade80" },
                { icon: Clock,       text: "90-Day Cooldown Protocol",  color: "#fbbf24" },
                { icon: Building2,   text: "Hospital Vicinity Matching", color: "#38bdf8" },
              ].map(({ icon: Icon, text, color }) => (
                <li key={text} className="chip" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                  {text}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/searchDonar" className="btn-roktika">
                <Search className="w-4 h-4 shrink-0" />
                <span className="btn-label">Find Donors by Blood Group</span>
                <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
              </Link>
              <Link to="/donarForm" className="btn-outline-roktika" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)", color: "#fff" }}>
                <Heart className="w-4 h-4 shrink-0" style={{ color: "#f87171" }} />
                Register as Voluntary Donor
              </Link>
            </div>
          </div>

          {/* Right: Multi-Mode Clinical & Impact Console */}
          <div className="lg:col-span-5 hero-settle relative space-y-4">
            {/* Floating urgent request chip */}
            <div
              className="animate-float chip flex items-center justify-between gap-3"
              style={{ background: "rgba(255,255,255,0.95)", color: "#09090b", border: "1px solid #e4e4e7" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#dc2626" }}></span>
                <span className="text-xs font-bold" style={{ color: "#dc2626" }}>
                  Urgent SOS: <span className="notranslate font-black" translate="no">O-</span> · Dinajpur Sadar
                </span>
              </div>
              <Link to="/emergency" className="text-[11px] font-bold text-red-600 hover:underline">
                View Needs →
              </Link>
            </div>

            {/* Floating ready donors counter chip */}
            <div
              className="animate-float-slow chip flex items-center gap-2 self-end"
              style={{ background: "rgba(255,255,255,0.95)", color: "#09090b", border: "1px solid #e4e4e7" }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#16a34a" }}></span>
              <span className="text-xs font-bold" style={{ color: "#15803d" }}>
                <span className="notranslate font-black" translate="no">{stats.totalAvailable}</span> verified donors ready now
              </span>
            </div>

            {/* Interactive Multi-Mode Card */}
            <div
              className="rounded-3xl p-5 space-y-4"
              style={{
                background: "rgba(12, 12, 14, 0.78)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
              }}
            >
              {/* Mode switcher tabs */}
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-1.5 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {[
                    { id: "story",  label: "Hero Stories", icon: Quote },
                    { id: "graph",  label: "Speed Graph",  icon: TrendingUp },
                    { id: "report", label: "Lab Report",   icon: FileText },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setHeroTab(id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      style={heroTab === id
                        ? { background: "#dc2626", color: "#fff" }
                        : { background: "transparent", color: "rgba(255,255,255,0.6)" }}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>

              {/* Tab 1: Hero Stories with Person Photo */}
              {heroTab === "story" && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={HERO_STORIES[activeStoryIdx].avatar}
                        alt={HERO_STORIES[activeStoryIdx].author}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                        style={{ border: "2px solid #dc2626" }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{HERO_STORIES[activeStoryIdx].author}</span>
                          <span
                            className="notranslate text-[11px] px-1.5 py-0.5 rounded font-black text-red-300"
                            translate="no"
                            style={{ background: "rgba(220,38,38,0.2)" }}
                          >
                            {HERO_STORIES[activeStoryIdx].blood}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {HERO_STORIES[activeStoryIdx].role}
                        </div>
                      </div>
                    </div>
                    <span
                      className="notranslate text-[11px] font-bold px-2 py-0.5 rounded-full"
                      translate="no"
                      style={{
                        background: "rgba(22, 163, 74, 0.2)",
                        color: "#4ade80",
                        border: "1px solid rgba(22, 163, 74, 0.35)",
                      }}
                    >
                      {HERO_STORIES[activeStoryIdx].badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-zinc-100 leading-relaxed italic min-h-[44px]">
                    {HERO_STORIES[activeStoryIdx].quote}
                  </p>

                  <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-1.5">
                      {HERO_STORIES.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveStoryIdx(idx)}
                          className="h-1.5 rounded-full transition-colors cursor-pointer"
                          style={{
                            width: activeStoryIdx === idx ? "1.5rem" : "0.375rem",
                            background: activeStoryIdx === idx ? "#dc2626" : "rgba(255,255,255,0.25)",
                          }}
                          aria-label={`Go to story ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <span className="notranslate text-xs font-black text-red-400 tabular-nums" translate="no">
                        {HERO_STORIES[activeStoryIdx].metric}
                      </span>
                      <span className="text-[11px] text-zinc-400 ml-1.5">
                        {HERO_STORIES[activeStoryIdx].metricSub}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Telemetry Response Speed Graph */}
              {heroTab === "graph" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">
                      Emergency Dispatch Speed (Mins)
                    </span>
                    <span className="notranslate text-xs font-black text-emerald-400" translate="no">
                      Avg 18.4 min
                    </span>
                  </div>

                  {/* SVG Sparkline Graph */}
                  <div className="p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <svg viewBox="0 0 280 65" className="w-full h-16 overflow-visible">
                      <path
                        d="M 0,55 C 40,50 70,42 110,34 C 150,26 200,18 280,10"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="280" cy="10" r="4.5" fill="#ef4444" className="animate-pulse" />
                    </svg>
                    <div className="flex justify-between text-[11px] text-zinc-400 pt-1 notranslate" translate="no">
                      <span>Hospital SOS (00m)</span>
                      <span>SMS Match (05m)</span>
                      <span>Arrival (18.4m)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="notranslate text-sm font-black text-white tabular-nums" translate="no">18.4m</div>
                      <div className="text-[11px] text-zinc-400">Match Speed</div>
                    </div>
                    <div className="p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="notranslate text-sm font-black text-emerald-400 tabular-nums" translate="no">98.7%</div>
                      <div className="text-[11px] text-zinc-400">Fulfilled</div>
                    </div>
                    <div className="p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="notranslate text-sm font-black text-red-400 tabular-nums" translate="no">42 Bags</div>
                      <div className="text-[11px] text-zinc-400">This Month</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Pathology Lab Report */}
              {heroTab === "report" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">
                      5-Panel Donor Safety Clearance
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.2)", border: "1px solid rgba(22,163,74,0.3)" }}>
                      All Clear
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { test: "HIV-1/2 Antibody", status: "Negative" },
                      { test: "Hepatitis B (HBsAg)", status: "Negative" },
                      { test: "Hepatitis C (HCV)", status: "Negative" },
                      { test: "Syphilis (VDRL)", status: "Non-Reactive" },
                    ].map(({ test, status }) => (
                      <div key={test} className="p-2 rounded-xl flex items-center justify-between" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <span className="notranslate text-zinc-300 text-[11px]" translate="no">{test}</span>
                        <span className="notranslate text-emerald-400 font-bold text-[11px] flex items-center gap-1" translate="no">
                          <Check className="w-3 h-3" /> {status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl flex items-center justify-between text-xs" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}>
                    <span className="text-red-200 text-[11px] font-semibold">90-Day Medical Rest Lock:</span>
                    <span className="notranslate text-white font-black text-xs" translate="no">Enforced · 72 Days Left</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Band bottom: rounded top of next section */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "3rem", background: "#0c0c0e",
            zIndex: 1,
          }}
        />
      </section>

      {/* ── 2. LINEA-STYLE SCROLL-SCRUBBED INK FILL (readAlong) ──────── */}
      <section
        className="read-along-container relative overflow-hidden py-24 sm:py-32"
        style={{
          background: "#0c0c0e",
          color: "#fff",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          className="max-w-5xl mx-auto text-center space-y-7"
          style={{ paddingInline: "clamp(1rem, 4vw, 3.5rem)" }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(220, 38, 38, 0.16)",
              color: "#fca5a5",
              border: "1px solid rgba(220, 38, 38, 0.35)",
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            Clinical Transfusion Mission
          </div>
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed max-w-4xl mx-auto">
            {READ_ALONG_WORDS.map((w, idx) => (
              <span
                key={idx}
                className="read-along-word inline-block mr-2 sm:mr-3 select-none"
                style={{ color: "rgba(255, 255, 255, 0.22)" }}
              >
                {w}
              </span>
            ))}
          </blockquote>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 max-w-xl mx-auto">
            Governed by WHO transfusion safety protocols with automated 90-day cooldown rest locks and 5-panel pathology screening.
          </p>
        </div>
      </section>

      {/* ── Remaining sections wrapper ──────────────────────────── */}
      <div className="space-y-12 pb-24 pt-8" style={{ paddingInline: "clamp(1rem, 4vw, 3.5rem)", maxWidth: "88rem", marginInline: "auto" }}>

        {/* ── 3. REAL VOICES & IMPACT TESTIMONIALS (Linea voices parallax) ── */}
        <section className="linea-band reveal bg-white rounded-3xl border p-7 sm:p-10 space-y-7" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="space-y-1.5">
              <div className="section-label red">
                <Quote className="w-3.5 h-3.5" />
                Verified Community Impact
              </div>
              <h2 className="type-h2">Real Stories of Lives Saved Across Dinajpur</h2>
              <p className="type-lead text-sm" style={{ maxWidth: "48ch" }}>
                Hear directly from voluntary blood donors, emergency recipient families, and regional hospital physicians.
              </p>
            </div>
            <Link to="/emergency" className="link-underline text-sm shrink-0 self-start" style={{ color: "var(--red)" }}>
              View Active SOS Cases <ArrowRight className="inline w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="voices-grid grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[
              {
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
                name: "Kamrul Islam",
                role: "Patient Relative · Dinajpur Sadar",
                blood: "O- Recipient",
                badge: "Emergency Transfusion",
                quote: "“When my sister had severe obstetric hemorrhage at M Abdur Rahim Medical College, the blood bank had no O-. Roktika matched two voluntary donors in 22 minutes. She survived because someone arrived at midnight.”",
                metric: "2 Bags Matched",
                metricLabel: "Sub-30 Min Emergency Response",
              },
              {
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
                name: "Tanvir Ahmed",
                role: "Voluntary Donor · Basher Hut",
                blood: "O+ Hero",
                badge: "14th Donation Milestone",
                quote: "“I have donated 14 times over 4 years. The automated 90-day cooldown reminds me exactly when my erythrocyte count is restored. There is no dizziness or fatigue — only the joy of keeping someone alive.”",
                metric: "42 Lives Supported",
                metricLabel: "Cumulative Regional Impact",
              },
              {
                avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=80",
                name: "Dr. M. A. Haque",
                role: "Assoc. Professor · Transfusion Medicine",
                blood: "Medical Director",
                badge: "Clinical Governance",
                quote: "“Pre-screening candidates for the 5 mandatory transfusion-transmissible infections eliminates bedside delays and ensures zero contamination. Roktika has become an essential emergency lifeline for our trauma ICU.”",
                metric: "100% Screened",
                metricLabel: "Pre-Vetted Pathology Safety",
              },
            ].map((story, sIdx) => (
              <div
                key={story.name}
                className={`voice-parallax-col p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-colors ${sIdx === 1 ? "lg:translate-y-4" : ""}`}
                style={{ background: "#fafafa", border: "1.5px solid var(--border)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                    >
                      {story.badge}
                    </span>
                    <span
                      className="notranslate text-xs font-black px-2 py-0.5 rounded-lg text-red-700"
                      translate="no"
                      style={{ background: "#fee2e2" }}
                    >
                      {story.blood}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed italic text-zinc-700">
                    {story.quote}
                  </p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <img
                      src={story.avatar}
                      alt={story.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      style={{ border: "2px solid #dc2626" }}
                    />
                    <div>
                      <div className="text-xs font-bold" style={{ color: "var(--ink)" }}>{story.name}</div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{story.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="notranslate text-xs font-black text-red-600 tabular-nums" translate="no">{story.metric}</div>
                    <div className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{story.metricLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. HOSPITAL PROXIMITY & DISPATCH NETWORK ─────────────── */}
        <section className="linea-band reveal bg-white rounded-3xl border p-7 sm:p-10 space-y-7" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="space-y-1.5">
              <div className="section-label red">
                <MapPin className="w-3.5 h-3.5" />
                Hospital Vicinity Dispatch
              </div>
              <h2 className="type-h2">Regional Medical Proximity Network</h2>
              <p className="type-lead text-sm" style={{ maxWidth: "48ch" }}>
                Active coordination linking verified candidates to major clinical centers across Dinajpur and Rangpur.
              </p>
            </div>
            <Link to="/searchDonar" className="link-underline text-sm shrink-0 self-start" style={{ color: "var(--red)" }}>
              Search by City Radius <ArrowRight className="inline w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-stagger">
            {[
              {
                hospital: "M Abdur Rahim Medical College",
                city: "Dinajpur Sadar",
                radius: "Within 5 km",
                donors: "12 Available",
                speed: "18 mins avg match",
                status: "Primary Trauma Center",
              },
              {
                hospital: "Dinajpur General Hospital",
                city: "Dinajpur Sadar",
                radius: "Within 4 km",
                donors: "8 Available",
                speed: "16 mins avg match",
                status: "Maternal Health Unit",
              },
              {
                hospital: "Basher Hut Health Center",
                city: "Basher Hut",
                radius: "Within 3 km",
                donors: "5 Available",
                speed: "14 mins avg match",
                status: "Community Clinic",
              },
              {
                hospital: "Rangpur Medical College Hospital",
                city: "Rangpur Division",
                radius: "Division-wide",
                donors: "24 Standby",
                speed: "35 mins express",
                status: "Tertiary Referral Center",
              },
            ].map((h) => (
              <div key={h.hospital} className="p-5 rounded-2xl space-y-3" style={{ background: "#fafafa", border: "1.5px solid var(--border)" }}>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                  {h.status}
                </span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>{h.hospital}</h3>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{h.city} · {h.radius}</p>
                </div>
                <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--border)" }}>
                  <span className="font-bold text-emerald-700">{h.donors}</span>
                  <span className="font-semibold text-zinc-500 tabular-nums">{h.speed}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 4-Step Emergency Protocol Workflow */}
          <div className="p-6 rounded-2xl" style={{ background: "#f8fafc", border: "1px solid var(--border)" }}>
            <span className="text-xs font-bold block mb-4" style={{ color: "var(--ink)" }}>
              Sub-30 Minute Hospital SOS Dispatch Protocol
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "SOS Broadcast", text: "Physician posts blood group and unit requirement with patient bed number." },
                { step: "Proximity Match", text: "System alerts screened donors within 10 km on non-cooldown status via SMS." },
                { step: "Lab Verification", text: "NID and 5-panel pathology clearance certificate confirmed prior to arrival." },
                { step: "Bedside Delivery", text: "Direct transfusion completed and donor 90-day cooldown timer activated." },
              ].map(({ step, text }) => (
                <div key={step} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: "#dc2626" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>{step}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. BLOOD GROUP INVENTORY ────────────────────────────── */}
        <section className="linea-band reveal bg-white rounded-3xl border p-7 sm:p-10 space-y-7" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="space-y-1.5">
              <div className="section-label red">
                <Activity className="w-3.5 h-3.5" />
                Blood Supply &amp; Donor Readiness
              </div>
              <h2 className="type-h2">Select Blood Group for Available Donors</h2>
              <p className="type-lead text-sm" style={{ maxWidth: "45ch" }}>
                Select any blood type to inspect vetted volunteer candidates and regional medical coverage.
              </p>
            </div>
            <Link to="/searchDonar" className="link-underline text-sm shrink-0 self-start" style={{ color: "var(--red)" }}>
              Advanced District Search <ArrowRight className="inline w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((grp) => {
              const s = stats.groups?.find((g) => g.group === grp) || { available: 1, total: 2 };
              return (
                <Link
                  key={grp}
                  to={`/searchDonar?group=${encodeURIComponent(grp)}`}
                  className="group p-4 rounded-2xl border text-center transition-colors hover:border-red-500"
                  style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2 font-black text-lg transition-colors notranslate"
                    translate="no"
                    style={{ background: "#f4f4f5", color: "#dc2626" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#dc2626"; }}
                  >
                    {grp}
                  </div>
                  <span className="block text-xs font-bold tabular-nums px-1 py-0.5 rounded-lg mb-1" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                    <span className="notranslate" translate="no">{s.available}</span> Ready
                  </span>
                  <span className="text-[11px] tabular-nums" style={{ color: "var(--muted)" }}>
                    <span className="notranslate" translate="no">{s.total}</span> Registered
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── 4. COMPATIBILITY MATRIX ─────────────────────────────── */}
        <section className="linea-band reveal bg-white rounded-3xl border p-7 sm:p-10 space-y-7" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-2xl space-y-1.5">
            <div className="section-label red"><Stethoscope className="w-3.5 h-3.5" /> Transfusion Medicine Standards</div>
            <h2 className="type-h2">Red Cell Compatibility Matrix</h2>
            <p className="type-lead text-sm">Proper antigenic compatibility prevents hemolytic transfusion reactions. Select any group to verify safety:</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedBlood(grp)}
                className="px-4 py-1.5 rounded-full text-sm font-bold transition-colors cursor-pointer notranslate"
                translate="no"
                style={selectedBlood === grp
                  ? { background: "var(--red)", color: "#fff" }
                  : { background: "#f4f4f5", color: "#3f3f46" }}
              >{grp}</button>
            ))}
          </div>

          {BLOOD_COMPATIBILITY[selectedBlood] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl" style={{ background: "#fafafa", border: "1px solid var(--border)" }}>
              {[
                { titleKey: "donate",
                  head: <><span className="notranslate font-black" translate="no">{selectedBlood}</span> Can Donate Red Cells To:</>,
                  groups: BLOOD_COMPATIBILITY[selectedBlood].canGiveTo,
                  note: BLOOD_COMPATIBILITY[selectedBlood].isUniversalDonor && "Universal Red Cell Donor (Critical in Trauma Emergency)",
                  chipStyle: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
                  noteStyle: { background: "#f0fdf4", color: "#14532d", border: "1px solid #bbf7d0" } },
                { titleKey: "receive",
                  head: <><span className="notranslate font-black" translate="no">{selectedBlood}</span> Can Safely Receive From:</>,
                  groups: BLOOD_COMPATIBILITY[selectedBlood].canReceiveFrom,
                  note: BLOOD_COMPATIBILITY[selectedBlood].isUniversalRecipient && "Universal Recipient (Can receive from all groups)",
                  chipStyle: { background: "#f4f4f5", color: "#18181b", border: "1px solid #e4e4e7" },
                  noteStyle: { background: "#f4f4f5", color: "#3f3f46", border: "1px solid #e4e4e7" } },
              ].map(({ titleKey, head, groups, note, chipStyle, noteStyle }) => (
                <div key={titleKey} className="bg-white p-5 rounded-2xl space-y-3" style={{ border: "1px solid var(--border)" }}>
                  <span className="text-sm font-bold block" style={{ color: "var(--ink)" }}>{head}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {groups.map((g) => (
                      <span key={g} className="px-2.5 py-1 rounded-lg font-black text-xs notranslate" translate="no" style={chipStyle}>{g}</span>
                    ))}
                  </div>
                  {note && <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold" style={noteStyle}>{note}</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 5. SAFETY PROTOCOLS ─────────────────────────────────── */}
        <section className="linea-band reveal bg-white rounded-3xl border p-7 sm:p-10 space-y-7" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-2xl space-y-1.5">
            <div className="section-label red"><Microscope className="w-3.5 h-3.5" /> Patient &amp; Donor Safety Standards</div>
            <h2 className="type-h2">Medical Qualification &amp; Screening Protocols</h2>
            <p className="type-lead text-sm">Every voluntary donor must fulfill guidelines governed by WHO and national transfusion safety standards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { code: "AGE", title: "Age & Weight Standards",
                body: "Donors must be 18–60 years of age with minimum body weight of 45 kg (50 kg for 450 mL whole blood)." },
              { code: "LAB", title: "Mandatory 5-Panel Test",
                body: "HIV-1/2, Hepatitis B (HBsAg), Hepatitis C (Anti-HCV), Syphilis (VDRL), and Malaria screening required." },
              { code: "REST", title: "90-Day Medical Cooldown",
                body: "3-month mandatory rest between donations to allow complete erythrocyte and ferritin replenishment." },
              { code: "HGB", title: "Hemoglobin Threshold",
                body: "≥ 12.5 g/dL for female donors and ≥ 13.0 g/dL for male donors to prevent post-donation fatigue." },
            ].map(({ code, title, body }) => (
              <div key={code} className="p-5 rounded-2xl space-y-3" style={{ background: "#fafafa", border: "1px solid var(--border)" }}>
                <span className="notranslate text-xs font-black px-2.5 py-1 rounded-lg" translate="no" style={{ background: "#e4e4e7", color: "#52525b" }}>{code}</span>
                <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. CLINICAL IMPACT — dark band ──────────────────────── */}
        <section className="reveal rounded-3xl p-7 sm:p-10" style={{ background: "#0c0c0e" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold" style={{ color: "#f87171" }}>Transfusion Clinical Impact</span>
              <h2 className="type-h2 on-dark">One Donation Saves Up to Three Lives</h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Whole blood is separated in hospital pathology centers into Packed Red Blood Cells (<span className="notranslate" translate="no">PRBC</span>), Platelet Concentrates, and Fresh Frozen Plasma (<span className="notranslate" translate="no">FFP</span>).
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: "Trauma & Surgery",       body: "Cardiac procedures, acute surgical emergencies, and vehicular trauma victims require immediate PRBC support." },
                { title: "Obstetric Hemorrhage",   body: "Postpartum hemorrhage during childbirth remains a primary cause of maternal mortality without ready blood." },
                { title: "Hematologic Disorders",  body: "Thalassemia major and aplastic anemia patients require recurring transfusions every 21–28 days." },
              ].map(({ title, body }) => (
                <div key={title} className="p-5 rounded-2xl space-y-2" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. RECOVERY FACTS ───────────────────────────────────── */}
        <section className="linea-band reveal bg-white rounded-3xl border p-7 sm:p-10 space-y-7" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-xl space-y-1.5">
            <h2 className="type-h2">Physiological Recovery</h2>
            <p className="type-lead text-sm">Evidence-based medical facts on bodily replenishment following donation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Rapid Plasma Recovery", time: "24 to 48 Hours",   body: "Fluid volume and blood pressure normalize within 48 hours with adequate oral hydration and rest." },
              { label: "Red Cell Replenishment",  time: "4 to 6 Weeks",   body: "Bone marrow accelerates erythropoiesis, restoring mature erythrocytes without compromising health." },
              { label: "Safe Sterile Collection", time: "8 to 10 Minutes", body: "Collection is performed using pre-packaged, sterile, single-use vacuum systems under trained clinical staff." },
            ].map(({ label, time, body }) => (
              <div key={label} className="p-5 rounded-2xl space-y-2" style={{ background: "#fafafa", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "#047857" }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {label}
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--ink)" }}>{time}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. JOIN THE VOLUNTARY MOVEMENT (Linea-style Dark CTA Band) ── */}
        <section
          className="reveal rounded-3xl p-8 sm:p-12 text-center md:text-left relative overflow-hidden"
          style={{
            background: "#0c0c0e",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span
                className="section-label inline-flex items-center gap-1.5"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                }}
              >
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                Community Lifeline
              </span>
              <h2 className="type-h2 on-dark max-w-2xl">
                Keep a heartbeat going in Dinajpur.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.62)" }}>
                Whether you are pledging your next voluntary donation or urgently seeking a matching donor for family at M Abdur Rahim Medical College, our verified registry ensures swift, safe dispatch without bureaucratic delay.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register" className="btn-roktika inline-flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-white" />
                  Register as Voluntary Donor
                </Link>
                <Link to="/search" className="btn-outline-roktika inline-flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Find Donors Instantly
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 gap-3">
              {[
                { title: "100% Free & Voluntary", desc: "No commercial fee, no intermediaries, zero exploitation." },
                { title: "Direct Hospital Liaison", desc: "Coordinated with Dinajpur Sadar & regional pathology units." },
                { title: "90-Day Donor Cooldown", desc: "Automatic health safeguards protecting our voluntary heroes." },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="p-4 rounded-2xl flex items-start gap-3 text-left"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#34d399" }} />
                  <div>
                    <h3 className="text-xs font-bold text-white">{title}</h3>
                    <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "rgba(255, 255, 255, 0.48)" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
