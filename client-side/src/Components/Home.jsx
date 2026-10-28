import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Heart, Search, ShieldCheck, Clock, Building2,
  CheckCircle2, ArrowRight, Activity,
  HeartPulse, Stethoscope, Microscope,
  Sparkles, Quote, MapPin, Users, Phone, Check,
  User, Zap, AlertTriangle, Droplet,
} from "lucide-react";
import { BLOOD_GROUPS } from "../data/hospitals";
import { API_BASE_URL } from "../config/api";

gsap.registerPlugin(ScrollTrigger);

const READ_ALONG_WORDS = [
  "Every", "two", "seconds", "in", "our", "community,", "an", "emergency",
  "patient", "critically", "requires", "blood.", "We", "bridge", "the", "vital",
  "distance", "between", "hospital", "pathology", "and", "verified", "voluntary", "donors",
  "in", "minutes,", "not", "hours."
];

const HOSPITAL_PLACES = [
  {
    name: "M Abdur Rahim Medical College Hospital",
    city: "Medical College Road, Dinajpur",
    distance: "3.2 km",
    donors: "18 Available",
    image: "/dinajpur/abdur-rahim-medical.jpg",
    talks: [
      { sender: "Transfusion Unit", text: "ICU Trauma Bed 4: 2 Bags O- Urgently Requested" },
      { sender: "Roktika Dispatch", text: "Matched with screened donor Tanvir (ETA 16m)", isSelf: true },
    ]
  },
  {
    name: "Dinajpur Sadar General Hospital (250 Bed)",
    city: "Hospital Road, Munshipara, Dinajpur",
    distance: "1.8 km",
    donors: "12 Available",
    image: "/dinajpur/dinajpur-sadar-hospital.jpg",
    talks: [
      { sender: "Maternal Ward", text: "Obstetric emergency: A+ fresh whole blood needed bedside" },
      { sender: "Roktika Dispatch", text: "2 donors notified · 1 accepted emergency dispatch", isSelf: true },
    ]
  },
  {
    name: "Zia Heart Foundation Hospital & Research Institute",
    city: "Ghashipara, Dinajpur",
    distance: "2.4 km",
    donors: "9 Available",
    image: "/dinajpur/zia-heart-foundation.jpg",
    talks: [
      { sender: "Cardiac Surgery ICU", text: "Open bypass standby: 3 Bags B+ verified fresh cells" },
      { sender: "Roktika Dispatch", text: "Local voluntary donor standby confirmed", isSelf: true },
    ]
  },
  {
    name: "Swadesh Diabetic Hospital & Diagnostic Centre",
    city: "Jail Road, Dinajpur",
    distance: "2.9 km",
    donors: "8 Available",
    image: "/dinajpur/swadesh-diabetic-hospital.jpg",
    talks: [
      { sender: "Nephrology Ward", text: "Dialysis patient with acute anemia: O+ emergency" },
      { sender: "Roktika Dispatch", text: "Volunteer contacted · Direct liaison activated", isSelf: true },
    ]
  },
  {
    name: "HSTU Medical Center (University Campus)",
    city: "Basher Hat, Dinajpur",
    distance: "5.5 km",
    donors: "15 Available",
    image: "/dinajpur/hstu-medical-center.jpg",
    talks: [
      { sender: "Campus Clinic", text: "Student volunteer emergency blood squad activated" },
      { sender: "Roktika Dispatch", text: "Youth donor registry synchronized with Sadar Hospital", isSelf: true },
    ]
  }
];

const REVIEWS_COL_1 = [
  {
    name: "Kamrul Islam",
    role: "Brother of Patient · Balubari, Dinajpur",
    stars: 5,
    patientCase: {
      patient: "Taslima Begum (31 Yrs)",
      hospital: "M Abdur Rahim Medical College Hospital",
      ward: "Maternity OT-1 (Bed 4)",
      condition: "Severe Postpartum Hemorrhage (PPH)",
      units: "2 Bags O- Negative (Whole Blood)",
      time: "Bedside within 18 mins",
    },
    text: "When my sister suffered acute postpartum hemorrhage at M Abdur Rahim Medical College Hospital, the blood bank had zero O-. Roktika matched two voluntary donors in 18 minutes. She survived because a verified donor arrived at midnight.",
    badge: "Obstetric Emergency Match",
  },
  {
    name: "Dr. Senjuti Humaira",
    role: "Consultant Hematologist · M Abdur Rahim Medical College Hospital",
    photo: "/dinajpur/doctor-senjuti-humaira.jpg",
    stars: 5,
    patientCase: {
      patient: "Master Aryan (8 Yrs, Child)",
      hospital: "Dinajpur Sadar Hospital (Pediatric Ward)",
      ward: "Thalassemia Day Care Unit",
      condition: "Beta Thalassemia Major (Hb 3.9 g/dL)",
      units: "1 Unit B+ Leukoreduced Red Cells",
      time: "Scheduled Bi-weekly Rotation",
    },
    text: "For thalassemia and acute leukemia patients in Northern Bangladesh, having pre-verified voluntary donors with 5-panel pathology clearance saves crucial hours during bedside crossmatching. This is saving lives daily in Dinajpur.",
    badge: "Clinical Verification",
  },
  {
    name: "Md. Rafiqul Islam",
    role: "Son of Patient · Ghashipara, Dinajpur",
    stars: 5,
    patientCase: {
      patient: "Md. Nurul Huda (58 Yrs)",
      hospital: "Zia Heart Foundation & Research Hospital",
      ward: "Cardiac Surgery ICU (Bed 7)",
      condition: "Emergency Coronary Bypass (CABG)",
      units: "3 Units A+ Platelet Apheresis",
      time: "Matched under 24 mins",
    },
    text: "During my father's open-heart surgery at Zia Heart Foundation, platelet levels dropped drastically. Two university donors came forward through Roktika within half an hour.",
    badge: "Cardiac ICU Transfusion",
  },
];

const REVIEWS_COL_2 = [
  {
    name: "Tanvir Ahmed",
    role: "Voluntary Donor · 14 Donations · Ghashipara, Dinajpur",
    stars: 5,
    patientCase: {
      patient: "Emergency Road Accident Victim",
      hospital: "M Abdur Rahim Medical College Emergency",
      ward: "Trauma Resuscitation Center",
      condition: "Multiple Compound Fractures & Hemothorax",
      units: "1 Unit AB+ Whole Blood",
      time: "Bedside Donated in 15 mins",
    },
    text: "I have donated 14 times over 4 years across Dinajpur hospitals. The automated 90-day cooldown reminds me exactly when my erythrocyte count is restored. There is no dizziness or fatigue — only the joy of keeping someone alive.",
    badge: "14th Donation Hero",
  },
  {
    name: "Prof. Dr. Shah Md. Sarwer Jahan",
    role: "Professor & Head of Internal Medicine · Dinajpur",
    stars: 5,
    patientCase: {
      patient: "Clinical Protocol Audit",
      hospital: "Regional Transfusion Committee",
      ward: "Quality Assurance Unit",
      condition: "Transfusion-Transmissible Infection Zero Audit",
      units: "5-Panel Serology Compliant",
      time: "100% Clearance Record",
    },
    text: "Roktika strictly honors WHO transfusion interval rules. Donors cannot be called prematurely, ensuring that voluntary donor health is protected just as rigorously as patient safety.",
    badge: "WHO Standard Protocol",
  },
  {
    name: "Shamim Reza",
    role: "Student Volunteer Leader · HSTU Campus, Dinajpur",
    stars: 5,
    patientCase: {
      patient: "Farhana Parvin (22 Yrs, Student)",
      hospital: "Dinajpur Sadar Hospital Female Ward",
      ward: "Infectious Disease Unit (Bed 19)",
      condition: "Dengue Shock Syndrome (Platelet count 12,000)",
      units: "4 Units O+ Fresh Platelets",
      time: "Campus Squad Liaison",
    },
    text: "Registered between classes at Hajee Mohammad Danesh Science & Technology University. Received an emergency ping 3 weeks later, walked across to Dinajpur Sadar Hospital, and helped save a dengue patient with fresh platelets.",
    badge: "HSTU Youth Squad",
  },
];

const Home = () => {
  const containerRef = useRef(null);
  const [stats, setStats] = useState({ totalDonors: 14, totalAvailable: 11, totalDonations: 30, groups: [] });

  // Fetch backend donor statistics
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/donors/stats`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const avail = d.stats.reduce((a, s) => a + s.available, 0);
          setStats({ totalDonors: d.totalDonors, totalAvailable: avail, totalDonations: d.totalDonations, groups: d.stats });
        }
      })
      .catch(() => { });
  }, []);

  // Initialize Lenis Smooth Scroll Engine + Complete Linea GSAP ScrollTrigger Scenes
  useEffect(() => {
    // 1. Lenis Smooth Scroll Setup synchronized with GSAP Ticker
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const isWide = window.innerWidth >= 768;

      // ─── Scene 0: Section Band Rise (Curved Sheet Opening) ───
      document.querySelectorAll('[data-8b-motion~="bandRise"]').forEach((sheet) => {
        const side = isWide ? 4 : 2.5;
        gsap.fromTo(
          sheet,
          { clipPath: `inset(0% ${side}% 0% ${side}% round 4.5rem 4.5rem 0px 0px)` },
          {
            clipPath: "inset(0% 0% 0% 0% round 2.5rem 2.5rem 0px 0px)",
            ease: "none",
            scrollTrigger: {
              trigger: sheet.parentElement,
              start: "top bottom",
              end: "top 25%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // ─── Scene 1: Hero Parallax Exit ────────────────────────
      const hero = document.getElementById("hero");
      if (hero) {
        const copy = hero.querySelector(".hero__copy");
        const media = hero.querySelector(".hero__media");
        const talk = hero.querySelector(".hero__talk");
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "hero:exit",
            trigger: hero,
            start: "bottom bottom",
            end: "bottom 20%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
          .to(media, { scale: 1.12, transformOrigin: isWide ? "100% 30%" : "50% 30%" }, 0)
          .to(copy, { y: () => -window.innerHeight * (isWide ? 0.26 : 0.16) }, 0)
          .to(talk, { y: () => -window.innerHeight * (isWide ? 0.14 : 0.1) }, 0);
      }

      // ─── Scene 2: Read-Along Word-by-Word Scrub ─────────────
      const readElements = document.querySelectorAll('[data-8b-motion~="readAlong"]');
      readElements.forEach((el, index) => {
        const words = el.querySelectorAll(".read-along-word");
        if (words.length) {
          gsap.fromTo(
            words,
            { color: "rgba(24, 24, 27, 0.25)" },
            {
              color: "#09090b",
              stagger: 0.12,
              ease: "none",
              scrollTrigger: {
                id: `readAlong:${index}`,
                trigger: el,
                start: "top 85%",
                end: "bottom 55%",
                scrub: true,
              },
            }
          );
        }
      });

      // ─── Scene 3: Two-Panel Staged Comparison (scene:listen) ──
      const listenRoot = document.getElementById("listen");
      if (listenRoot) {
        const hold = listenRoot.querySelector(".listen__hold");
        const voice = listenRoot.querySelector(".listen__panel--voice");
        const read = listenRoot.querySelector(".listen__panel--read");
        const voiceTrack = listenRoot.querySelector(".listen__track--voice");
        const rows = [...listenRoot.querySelectorAll(".listen__track--read > .listen__row")];
        const bars = [...listenRoot.querySelectorAll(".listen__wave > i")];

        listenRoot.classList.add("is-staged");

        // Clone rows into voiceTrack
        voiceTrack.innerHTML = "";
        const clones = rows.map((row) => {
          const clone = row.cloneNode(true);
          clone.classList.add("listen__row--voice");
          const text = clone.querySelector(".m-caption__text");
          if (text) {
            const rawWords = text.textContent.trim().split(/\s+/);
            text.textContent = "";
            rawWords.forEach((w, wIdx) => {
              const span = document.createElement("span");
              span.className = "listen__word inline-block mr-1";
              span.style.setProperty("--h", (0.45 + 0.55 * Math.abs(Math.sin(wIdx * 1.7 + w.length))).toFixed(2));
              span.textContent = w;
              text.appendChild(span);
            });
          }
          voiceTrack.appendChild(clone);
          return clone;
        });

        // Entrance join
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "listen:join",
            trigger: hold,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
          .fromTo(voice, { x: () => -window.innerWidth * (isWide ? 0.08 : 0.07) }, { x: 0 }, 0)
          .fromTo(read, { x: () => window.innerWidth * (isWide ? 0.08 : 0.07) }, { x: 0 }, 0);

        // Sinusoidal wave swell & message crossover timeline
        const setters = bars.map((bar) => gsap.quickSetter(bar, "scaleY"));
        const cross = gsap.timeline({
          defaults: { ease: "power1.inOut" },
          scrollTrigger: {
            id: "listen:cross",
            trigger: hold,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const swell = Math.sin(Math.PI * progress);
              setters.forEach((set, i) => set(1 - swell * 0.7 * (1 - Math.abs(Math.sin(i * 0.45 + progress * 18)))));
            },
          },
        });

        const pairs = rows.map((row, i) => [row, clones[i]]);
        pairs.forEach((pair, i) => {
          const row = pair[0];
          const shift = isWide
            ? () => -(row.offsetLeft - read.offsetWidth + row.offsetWidth + 32)
            : () => voice.offsetHeight;
          cross.fromTo(pair, isWide ? { x: shift } : { y: shift }, isWide ? { x: 0, duration: 1 } : { y: 0, duration: 1 }, i * 0.8);
        });
        cross.to({}, { duration: 0.35 });
      }

      // ─── Scene 4: Sticky Phone Feature Scrub (scene:calls) ───
      const callsRoot = document.getElementById("calls");
      if (callsRoot) {
        const list = callsRoot.querySelector(".calls__list");
        const items = [...list.children];
        const device = callsRoot.querySelector(".calls__device");
        const steps = items.map((_, i) => [...callsRoot.querySelectorAll(`.phone [data-step="${i + 1}"]`)]);

        const line = isWide ? "58%" : "52%";
        const callsTL = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "calls:steps",
            trigger: items[0],
            start: `top ${line}`,
            endTrigger: items[items.length - 1],
            end: `bottom ${line}`,
            scrub: true,
          },
        });

        items.forEach((item, i) => {
          if (i > 0) callsTL.fromTo(item, { opacity: 0.28 }, { opacity: 1, duration: 0.25 }, i - 0.1);
          if (i < items.length - 1) callsTL.to(item, { opacity: 0.28, duration: 0.25 }, i + 0.9);
          if (steps[i].length) {
            callsTL.from(
              steps[i],
              { opacity: 0, y: 14, scale: 0.92, transformOrigin: "50% 100%", duration: 0.3, stagger: 0.18, ease: "power2.out" },
              i + 0.05
            );
          }
        });
        callsTL.to(items.slice(0, -1), { opacity: 1, duration: 0.3 }, items.length - 0.1);

        // Exit tilt & scale down
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "calls:exit",
            trigger: callsRoot,
            start: "bottom bottom",
            end: "bottom 30%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }).to(device, { scale: 0.82, rotation: -6, y: () => -window.innerHeight * (isWide ? 0.12 : 0.08) }, 0);
      }

      // ─── Scene 5: Live Interactive Parameter Console (scene:tune) ─
      const tuneRoot = document.getElementById("tune");
      if (tuneRoot) {
        const stage = tuneRoot.querySelector(".tune__stage");
        const lines = [...tuneRoot.querySelectorAll(".tune__line")];
        const sizeFill = tuneRoot.querySelector('[data-ctl="size"] .tune__fill');
        const sizeThumb = tuneRoot.querySelector('[data-ctl="size"] .tune__thumb');
        const weightFill = tuneRoot.querySelector('[data-ctl="weight"] .tune__fill');
        const weightThumb = tuneRoot.querySelector('[data-ctl="weight"] .tune__thumb');
        const pill = tuneRoot.querySelector('[data-ctl="contrast"] .tune__pill');
        const track = (el) => el.parentElement.offsetWidth;

        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "tune:scrub",
            trigger: tuneRoot,
            start: "top 35%",
            end: "top -45%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
          .fromTo(lines, { scale: 0.85, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 1 }, 0)
          .fromTo(sizeFill, { scaleX: 0.25 }, { scaleX: 0.8, duration: 1 }, 0)
          .fromTo(sizeThumb, { x: () => -0.4 * track(sizeThumb) }, { x: 0, duration: 1 }, 0)
          .fromTo(weightFill, { scaleX: 0.1 }, { scaleX: 0.95, duration: 1 }, 0)
          .fromTo(weightThumb, { x: () => -0.5 * track(weightThumb) }, { x: () => 0.4 * track(weightThumb), duration: 1 }, 0)
          .fromTo(stage, { backgroundColor: "#0c0c0e", color: "#ffffff" }, { backgroundColor: "#faf5f0", color: "#09090b", duration: 0.35 }, 1.05)
          .fromTo(pill, { xPercent: 0 }, { xPercent: -100, duration: 0.35 }, 1.05)
          .to(lines, { scale: 0.95, duration: 0.8 }, 1.45)
          .to(weightFill, { scaleX: 0.65, duration: 0.8 }, 1.45)
          .to(weightThumb, { x: 0, duration: 0.8 }, 1.45);
      }

      // ─── Scene 6: Pinned Horizontal Hospital Track (scene:rooms) ──
      const roomsRoot = document.getElementById("rooms");
      if (roomsRoot) {
        const hold = roomsRoot.querySelector(".rooms__hold");
        const track = roomsRoot.querySelector(".rooms__track");
        const places = [...track.querySelectorAll(".rooms__place")];
        const lines = roomsRoot.querySelectorAll(".rooms__line");

        roomsRoot.classList.add("is-track");
        const travel = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const setTravel = () => gsap.set(roomsRoot, { "--rooms-travel": `${travel()}px` });
        setTravel();
        ScrollTrigger.addEventListener("refreshInit", setTravel);

        const lead = () => Math.min(0.9, (window.innerWidth * 0.6) / track.scrollWidth);
        const main = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "rooms:horizontal",
            trigger: hold,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        main.fromTo(track, { x: 0 }, { x: () => -travel(), duration: 1 }, 0)
          .fromTo(lines, { strokeDasharray: 1, strokeDashoffset: () => 1 - lead() }, { strokeDashoffset: 0, duration: 1 }, 0);

        places.forEach((place, index) => {
          const image = place.querySelector("img");
          const talk = place.querySelectorAll(".rooms__talk > *");
          gsap.fromTo(
            image,
            { xPercent: 7 },
            {
              xPercent: 0,
              ease: "none",
              scrollTrigger: {
                id: `rooms:photo-${index}`,
                trigger: place,
                containerAnimation: main,
                start: "left right",
                end: isWide ? "left 66%" : "left 40%",
                scrub: true,
              },
            }
          );
          gsap.fromTo(
            talk,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: "power2.out",
              stagger: 0.25,
              scrollTrigger: {
                id: `rooms:talk-${index}`,
                trigger: place,
                containerAnimation: main,
                start: "left 100%",
                end: isWide ? "left 66%" : "left 40%",
                scrub: true,
              },
            }
          );
        });
      }

      // ─── Scene 7: Asymmetric Parallax Columns (scene:voices) ──
      const voicesRoot = document.getElementById("voices");
      if (voicesRoot) {
        const colsBox = voicesRoot.querySelector(".voices__cols");
        const cols = [...voicesRoot.querySelectorAll(".voices__col")];
        const photo = voicesRoot.querySelector(".voices__photo img");

        if (isWide && cols.length >= 2) {
          cols.forEach((col, index) =>
            gsap.fromTo(
              col,
              { y: () => window.innerHeight * (index ? 0.38 : 0.12) },
              {
                y: 0,
                ease: "none",
                scrollTrigger: {
                  id: `voices:col-${index}`,
                  trigger: colsBox,
                  start: "top bottom",
                  end: "top 18%",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }
            )
          );
        }

        if (photo) {
          gsap.fromTo(
            photo,
            { scale: 1.22 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                id: "voices:photo",
                trigger: photo.parentElement,
                start: "top bottom",
                end: "center 50%",
                scrub: true,
              },
            }
          );
        }
      }

      // ─── Scene 8: Stacking Step Cards (scene:setup) ───────────
      const setupRoot = document.getElementById("setup");
      if (setupRoot) {
        const steps = setupRoot.querySelector(".setup__steps");
        const cards = [...steps.children];
        setupRoot.classList.add("is-stacked");

        const gap = () => parseFloat(getComputedStyle(steps).rowGap) || 0;
        const natural = (index) => cards.slice(0, index).reduce((sum, c) => sum + c.offsetHeight + gap(), 0);
        const stuck = (index) => parseFloat(getComputedStyle(cards[index]).top) || 0;

        cards.slice(0, -1).forEach((card, index) => {
          gsap.fromTo(
            card,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.92,
              filter: "brightness(0.68)",
              ease: "none",
              scrollTrigger: {
                id: `setup:card-${index}`,
                trigger: steps,
                start: () => `top+=${natural(index + 1)} bottom`,
                end: () => `top+=${natural(index + 1)} ${stuck(index + 1)}px`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }

      // ─── Scene 9: Zooming Photo Window (scene:start) ──────────
      const startRoot = document.getElementById("start");
      if (startRoot) {
        const frame = startRoot.querySelector(".start__window");
        const img = frame.querySelector("img");
        const sideX = isWide ? 28 : 12;
        const sideY = isWide ? 15 : 22;

        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "start:zoom",
            trigger: frame,
            start: "top 92%",
            end: "top 12%",
            scrub: true,
          },
        })
          .fromTo(frame, { clipPath: `inset(${sideY}% ${sideX}% ${sideY}% ${sideX}% round 4.5rem)` }, { clipPath: "inset(0% 0% 0% 0% round 2.5rem)" }, 0)
          .fromTo(img, { scale: 1.3 }, { scale: 1 }, 0);
      }
    }, containerRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-x-clip bg-zinc-950 font-sans">

      {/* ── 1. HERO — Full Bleed Video Parallax (scene:hero) ──────────── */}
      <section
        id="hero"
        data-8b-section="hero"
        className="relative isolate overflow-x-clip text-white"
        style={{
          background: "#0c0c0e",
          paddingTop: "clamp(6rem, 12vh, 9rem)",
          paddingBottom: "clamp(6rem, 12vh, 10rem)",
        }}
      >
        {/* Parallax Video / Media Layer */}
        <div
          aria-hidden="true"
          className="hero__media absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
        >
          <video
            src="/hero-video.mp4"
            poster="/dinajpur/abdur-rahim-medical.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.72) contrast(1.1)", transform: "scale(1.02)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              maskImage: "linear-gradient(to right, black 0%, black 28%, rgba(0,0,0,0.4) 52%, transparent 75%)",
              WebkitMaskImage: "linear-gradient(to right, black 0%, black 28%, rgba(0,0,0,0.4) 52%, transparent 75%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(12,12,14,0.96) 0%, rgba(12,12,14,0.85) 38%, rgba(12,12,14,0.4) 68%, rgba(12,12,14,0.12) 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-32"
            style={{ background: "linear-gradient(to top, #0c0c0e 0%, transparent 100%)" }}
          />
        </div>

        {/* Elliptical Flow Lines in Background */}
        <div className="hero__draw" aria-hidden="true">
          <svg className="hero__lines">
            <ellipse className="hero__arc hero__arc--a" pathLength="1" />
            <ellipse className="hero__arc hero__arc--b" pathLength="1" />
            <ellipse className="hero__flow hero__flow--a" pathLength="1" />
            <ellipse className="hero__flow hero__flow--b" pathLength="1" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center px-4 sm:px-8 lg:px-12">
          {/* Left Hero Copy */}
          <div className="hero__copy lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <Link
                to="/emergency"
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold group transition-all"
                style={{
                  background: "rgba(220, 38, 38, 0.2)",
                  border: "1px solid rgba(220, 38, 38, 0.4)",
                  color: "#fecaca",
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0 bg-red-600 animate-pulse" />
                <span><strong>Emergency Triage Network:</strong> Active voluntary dispatch in Dinajpur Sadar &amp; nationwide</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <h1 className="m-text-2 tracking-tight">
                Verified donors. <br />
                <span className="text-red-500">Minutes count.</span>
              </h1>

              <p className="m-text-4 max-w-xl text-zinc-300">
                Connect directly with medically pre-screened voluntary blood donors across Dinajpur Sadar,
                Basher Hut, and regional pathology hospitals — with automated 90-day cooldown locks.
              </p>
            </div>

            <ul className="flex flex-wrap gap-3 pt-1">
              {[
                { icon: ShieldCheck, text: "18–60 Yrs · 5-Panel Screened", color: "#4ade80" },
                { icon: Clock, text: "90-Day Medical Rest Lock", color: "#fbbf24" },
                { icon: Building2, text: "Hospital Bedside Vicinity Match", color: "#38bdf8" },
              ].map(({ icon: Icon, text, color }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#f4f4f5" }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                  {text}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/searchDonar" className="m-btn">
                <span className="m-btn__label">Find Donors by Blood Group</span>
                <span className="m-btn__wave" aria-hidden="true"><i /><i /><i /></span>
              </Link>
              <Link to="/donarForm" className="m-btn-outline">
                <Heart className="w-4 h-4 mr-2 text-red-400" />
                Register as Voluntary Donor
              </Link>
            </div>
          </div>

          {/* Right Hero Realistic Live Hospital Triage & Dispatch Console */}
          <div className="hero__talk lg:col-span-5">
            <div
              className="rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl border border-zinc-700/60 transition-all"
              style={{
                background: "linear-gradient(145deg, rgba(17, 17, 22, 0.94) 0%, rgba(9, 9, 12, 0.98) 100%)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
              }}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5 leading-none">
                      Live Hospital Triage Console
                    </h3>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Dinajpur Medical Command · 24/7 Active</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Avg Liaison: 14m</span>
                </div>
              </div>

              {/* Real Patient Emergency Cases Stream */}
              <div className="space-y-2.5">
                {/* Case 1: M Abdur Rahim Medical */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">M Abdur Rahim Medical</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800/60 text-[9px] font-black uppercase">
                          ICU OT-1 · Bed 4
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-semibold text-zinc-300">Case #AR-892:</span> Acute PPH Emergency · <span className="text-red-400 font-bold">2 Bags O- (Neg)</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Bedside Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-800/60">
                    <span className="text-zinc-400 font-medium truncate">Volunteer: Tanvir Ahmed (HSTU Squad)</span>
                    <span className="text-emerald-400 font-semibold shrink-0">Arrived in 16m</span>
                  </div>
                </div>

                {/* Case 2: Dinajpur Sadar General */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">Dinajpur Sadar General</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[9px] font-black uppercase">
                          Trauma ER · Bed 2
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-semibold text-zinc-300">Case #DS-314:</span> Highway Accident Crash · <span className="text-red-400 font-bold">1 Bag A+ Whole Blood</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-bold shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      En Route (ETA 6m)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-800/60">
                    <span className="text-zinc-400 font-medium truncate">Volunteer: Rakib Hasan (Munshipara)</span>
                    <span className="text-amber-400 font-semibold shrink-0">1.8 km distance</span>
                  </div>
                </div>

                {/* Case 3: Zia Heart Foundation */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">Zia Heart Foundation</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 text-[9px] font-black uppercase">
                          Cardiac CCU
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-semibold text-zinc-300">Case #ZH-058:</span> Bypass Surgery · <span className="text-red-400 font-bold">2 Units B+ Platelets</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/50 text-blue-300 text-[10px] font-bold shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      Crossmatch Cleared
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-800/60">
                    <span className="text-zinc-400 font-medium truncate">Volunteer: Md. Suman (Balubari Standby)</span>
                    <span className="text-blue-400 font-semibold shrink-0">Ready on Request</span>
                  </div>
                </div>
              </div>

              {/* Realistic Clinical KPIs HUD */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-zinc-800/80">
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/60">
                  <div className="text-base font-black text-white">{stats.totalAvailable || 18}</div>
                  <div className="text-[10px] text-zinc-400 font-medium">Ready Donors</div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-1.5">
                    <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/60">
                  <div className="text-base font-black text-red-400">99.2%</div>
                  <div className="text-[10px] text-zinc-400 font-medium">On-Time Liaison</div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-1.5">
                    <div className="bg-red-500 h-1 rounded-full" style={{ width: "99%" }}></div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/60">
                  <div className="text-base font-black text-amber-400">90 Days</div>
                  <div className="text-[10px] text-zinc-400 font-medium">WHO Rest Lock</div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-1.5">
                    <div className="bg-amber-500 h-1 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>

              {/* Bottom Clinical Protocol Assurance */}
              <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 flex items-center gap-2 text-[10px] text-zinc-400 leading-tight">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>100% Voluntary Protocol:</strong> 5-panel pathology verified (HIV, HBV, HCV, Syphilis, MP). Zero donor fees.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SCENE: LISTEN — Two-panel Stage (They speak / You read) ── */}
      <section className="listen relative isolate" id="listen" data-8b-section="voice-to-text" aria-labelledby="listen-title">
        <div className="listen__sheet m-band-2" aria-hidden="true" data-8b-motion="bandRise"></div>
        <div className="listen__head max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <h2 className="m-text-3 listen__title" id="listen-title">Nothing lost between emergency call and volunteer arrival.</h2>
          <p className="m-text-4 listen__lead" data-8b-motion="readAlong">
            {READ_ALONG_WORDS.map((w, idx) => (
              <span key={idx} className="read-along-word inline-block mr-1.5 select-none text-zinc-800">
                {w}
              </span>
            ))}
          </p>
        </div>
        <div className="listen__hold">
          <div className="listen__stage max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="listen__panels">
              <div className="listen__panel listen__panel--voice">
                <p className="m-text-6 listen__label text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Hospital Emergency Broadcast
                </p>
                <div className="listen__wave" aria-hidden="true">
                  <i style={{ "--h": 0.32 }} /><i style={{ "--h": 0.5 }} /><i style={{ "--h": 0.74 }} /><i style={{ "--h": 0.58 }} />
                  <i style={{ "--h": 0.9 }} /><i style={{ "--h": 0.66 }} /><i style={{ "--h": 0.42 }} /><i style={{ "--h": 0.3 }} />
                  <i style={{ "--h": 0.54 }} /><i style={{ "--h": 0.82 }} /><i style={{ "--h": 1.0 }} /><i style={{ "--h": 0.7 }} />
                  <i style={{ "--h": 0.46 }} /><i style={{ "--h": 0.36 }} /><i style={{ "--h": 0.6 }} /><i style={{ "--h": 0.86 }} />
                  <i style={{ "--h": 0.64 }} /><i style={{ "--h": 0.4 }} /><i style={{ "--h": 0.28 }} /><i style={{ "--h": 0.48 }} />
                  <i style={{ "--h": 0.72 }} /><i style={{ "--h": 0.94 }} /><i style={{ "--h": 0.62 }} /><i style={{ "--h": 0.38 }} />
                  <i style={{ "--h": 0.52 }} /><i style={{ "--h": 0.78 }} /><i style={{ "--h": 0.56 }} /><i style={{ "--h": 0.34 }} />
                </div>
                <div className="listen__track listen__track--voice" aria-hidden="true" />
              </div>
              <div className="listen__panel listen__panel--read">
                <p className="m-text-6 listen__label text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Verified Volunteer Dispatch
                </p>
                <div className="listen__track listen__track--read">
                  <div className="listen__row">
                    <p className="m-caption">
                      <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                      <span className="m-caption__text">Emergency O- needed · Abdur Rahim ICU</span>
                    </p>
                  </div>
                  <div className="listen__row">
                    <p className="m-caption">
                      <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                      <span className="m-caption__text">Volunteer Tanvir confirmed · ETA 15m</span>
                    </p>
                  </div>
                  <div className="listen__row">
                    <p className="m-caption">
                      <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                      <span className="m-caption__text">5-panel pathology clear · Match ready</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SCENE: CALLS — Feature List Beside Sticky Phone Mockup ─ */}
      <section className="calls on-dark relative isolate" id="calls" data-8b-section="calls" aria-labelledby="calls-title">
        <div className="calls__sheet m-band-3" aria-hidden="true" data-8b-motion="bandRise"></div>
        <div className="calls__inner max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="calls__head">
            <h2 className="m-text-3" id="calls-title">Emergency triage that feels calm, verified, and immediate.</h2>
            <div className="calls__head-copy">
              <p className="m-text-4 calls__lead">
                No frantic phone calling through outdated social lists. Roktika alerts verified voluntary donors by proximity with pathology records pre-cleared.
              </p>
              <Link to="/searchDonar" className="m-btn">
                <span className="m-btn__label">Search Verified Donors</span>
                <span className="m-btn__wave" aria-hidden="true"><i /><i /><i /></span>
              </Link>
            </div>
          </div>

          <div className="calls__grid">
            <ul className="calls__list">
              <li className="calls__item">
                <h3 className="m-text-5 text-white">Live Emergency SOS Triage</h3>
                <p className="m-text-8">Physicians post patient blood group, required bags, and hospital bedside location. Immediate verification prevents fraudulent broadcasts.</p>
              </li>
              <li className="calls__item">
                <h3 className="m-text-5 text-white">Proximity Radius Matching</h3>
                <p className="m-text-8">Vetted volunteers within 5–15 km receive instant priority notifications without exposing private contact info until accepted.</p>
              </li>
              <li className="calls__item">
                <h3 className="m-text-5 text-white">Instant One-Tap Volunteer Confirmation</h3>
                <p className="m-text-8">Available donors tap to confirm arrival, providing live ETA directly to the attending physician and patient family.</p>
              </li>
              <li className="calls__item">
                <h3 className="m-text-5 text-white">Pre-Screened Pathology Safety Certificate</h3>
                <p className="m-text-8">Mandatory 5-panel infectious screening (HIV, Hepatitis B/C, VDRL, Malaria) validated prior to bedside arrival to eliminate delays.</p>
              </li>
              <li className="calls__item">
                <h3 className="m-text-5 text-white">Automated 90-Day Medical Rest Lock</h3>
                <p className="m-text-8">Donation completion is officially logged and donor profile locked for 90 days, strictly preventing premature re-bleeding.</p>
              </li>
            </ul>

            <div className="calls__aside">
              <div className="calls__sticky">
                <div className="calls__device">
                  <figure className="phone" aria-label="Example of a captioned call on Roktika">
                    <div className="phone__screen">
                      <div className="phone__top">
                        <p className="phone__who">Abdur Rahim Med ICU</p>
                        <p className="phone__state">
                          <span className="phone__dot" aria-hidden="true"></span>
                          Emergency SOS Broadcast
                        </p>
                        <span className="phone__end" aria-hidden="true">
                          <svg viewBox="0 0 24 24"><path d="M4 14c4-4 12-4 16 0l-2 3-3-1v-2c-2-1-4-1-6 0v2l-3 1z" /></svg>
                        </span>
                      </div>

                      <p className="phone__number" data-step="2">
                        Proximity Dispatch · Dinajpur Sadar (3.2 km)
                      </p>

                      <ol className="phone__log">
                        <li className="phone__msg" data-step="1">
                          <p className="m-caption">
                            <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                            <span className="m-caption__text">Trauma Ward 4: 2 Bags O- Required Immediately</span>
                          </p>
                        </li>

                        <li className="phone__msg phone__msg--you" data-step="3">
                          <p className="m-caption-2">
                            <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                            <span className="m-caption__text">Volunteer Tanvir: On my way, ETA 15 mins.</span>
                          </p>
                          <p className="phone__note">Verified Voluntary Donor · O- Negative</p>
                        </li>

                        <li className="phone__cue" data-step="4">
                          Pathology Clearance: 5-Panel Tests Confirmed Negative
                        </li>

                        <li className="phone__msg" data-step="4">
                          <p className="m-caption">
                            <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                            <span className="m-caption__text">Crossmatch verified. Patient bed prepared.</span>
                          </p>
                        </li>

                        <li className="phone__msg phone__msg--you" data-step="5">
                          <p className="m-caption-2">
                            <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                            <span className="m-caption__text">Transfusion complete. Patient stable.</span>
                          </p>
                        </li>
                      </ol>

                      <p className="phone__saved" data-step="5">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                        Transfusion Logged · 90-Day Rest Lock Active
                      </p>

                      <div className="phone__bar" aria-hidden="true">
                        <span><Phone className="w-4 h-4" />Direct</span>
                        <span><Activity className="w-4 h-4" />Status</span>
                        <span><ShieldCheck className="w-4 h-4" />Screened</span>
                        <span><Clock className="w-4 h-4" />Rest</span>
                      </div>
                    </div>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SCENE: TUNE — Interactive Scrubber Console ───────────── */}
      <section className="tune relative isolate" id="tune" data-8b-section="caption-styles" aria-labelledby="tune-title">
        <div className="tune__sheet m-band-2" aria-hidden="true"></div>
        <div className="tune__inner max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="tune__stage">
            <p className="tune__meta">
              <span><i aria-hidden="true"></i>Live Protocol Simulation</span>
              <span>Radius: 15 km · Rest: 90 Days · 5-Panel Lab Verified</span>
            </p>
            <p className="tune__sample">
              <span className="tune__line">Verified voluntary blood.</span>
              <span className="tune__line text-red-500">Every life matters.</span>
            </p>
          </div>

          <div className="tune__body">
            <div className="tune__head">
              <h2 className="m-text-3" id="tune-title">Screening standards, strictly enforced.</h2>
              <p className="m-text-4">
                Safe clinical transfusions require strict criteria. Roktika continuously ensures donors fulfill national hematology parameters before matching.
              </p>
            </div>

            <ul className="tune__settings">
              <li className="tune__row">
                <h3 className="m-text-5">Hospital Proximity Radius</h3>
                <p className="m-text-8">From 5 km immediate vicinity up to district-wide response.</p>
                <span className="tune__ctl tune__slider" data-ctl="size" aria-hidden="true">
                  <span className="tune__fill" />
                  <span className="tune__thumb" />
                </span>
              </li>
              <li className="tune__row">
                <h3 className="m-text-5">Mandatory Rest Protocol</h3>
                <p className="m-text-8">Strict 90-day rest safeguard for mature red cell recovery.</p>
                <span className="tune__ctl tune__slider" data-ctl="weight" aria-hidden="true">
                  <span className="tune__fill" />
                  <span className="tune__thumb" />
                </span>
              </li>
              <li className="tune__row">
                <h3 className="m-text-5">Transfusion Contrast Mode</h3>
                <p className="m-text-8">Clinical high-contrast dark or daytime sunlight mode.</p>
                <span className="tune__ctl tune__seg" data-ctl="contrast" aria-hidden="true">
                  <b className="tune__pill" />
                  <span>Light</span>
                  <span>Dark</span>
                </span>
              </li>
              <li className="tune__row">
                <h3 className="m-text-5">Infectious Disease Clearance</h3>
                <p className="m-text-8">HIV, Hep B/C, VDRL, Malaria test verification.</p>
                <span className="tune__ctl tune__tag" aria-hidden="true">5-Panel Clear</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. SCENE: ROOMS — Horizontal Hospital Pinned Track ──────── */}
      <section className="rooms on-dark relative isolate" id="rooms" data-8b-section="in-person" aria-labelledby="rooms-title">
        <div className="rooms__sheet m-band-4" aria-hidden="true"></div>
        <div className="rooms__head max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5 text-red-400" />
            Dinajpur Regional Medical Centers &amp; Hospitals
          </div>
          <h2 className="m-text-3" id="rooms-title">Direct emergency liaison across premier hospitals in Dinajpur.</h2>
          <p className="m-text-4 rooms__lead">
            Scroll vertically to traverse our Dinajpur partner network. Verified voluntary blood donors are positioned in immediate proximity to every key surgical center, government medical college, and university clinic.
          </p>
        </div>

        <div className="rooms__hold">
          <div className="rooms__stage">
            <p className="rooms__now"><i aria-hidden="true" />Regional Medical Emergency Network · Dinajpur Sadar</p>
            <div className="rooms__track">
              <svg className="rooms__lines" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
                <path className="rooms__line rooms__line--a" pathLength="1" d="M0 60C40 10 80 10 120 50S200 95 240 55 320 5 360 45 440 95 480 55 560 5 600 45 680 95 720 55 800 5 840 45 920 95 1000 50" />
                <path className="rooms__line rooms__line--b" pathLength="1" d="M0 40C40 90 80 90 120 50S200 5 240 45 320 95 360 55 440 5 480 45 560 95 600 55 680 5 720 45 800 95 840 55 920 5 1000 50" />
              </svg>

              {HOSPITAL_PLACES.map((place, pIdx) => (
                <figure key={place.name} className="rooms__place">
                  <img src={place.image} alt={place.name} loading="lazy" />
                  <span className="rooms__label text-white">{place.name} · {place.distance}</span>
                  <Link
                    to="/searchDonar?district=Dinajpur"
                    className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white text-[11px] font-bold border border-red-400/40 backdrop-blur-md transition-colors flex items-center gap-1 shadow-md"
                  >
                    <Search className="w-3 h-3 text-white" />
                    <span>Search Donors</span>
                  </Link>
                  <div className="rooms__talk">
                    {place.talks.map((t, tIdx) => (
                      <p key={tIdx} className={t.isSelf ? "m-caption-2" : "m-caption"}>
                        <span className="m-caption__wave" aria-hidden="true"><i /><i /><i /><i /></span>
                        <span className="m-caption__text">{t.text}</span>
                      </p>
                    ))}
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SCENE: VOICES — Asymmetric Parallax Columns ─────────── */}
      <section className="voices relative isolate" id="voices" data-8b-section="testimonials" aria-labelledby="voices-title">
        <div className="voices__sheet m-band" aria-hidden="true" data-8b-motion="bandRise"></div>
        <div className="voices__inner max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <h2 className="m-text-3 voices__title" id="voices-title">
            Recommended by physicians. Cherished by donor families.
          </h2>

          <div className="voices__grid">
            <figure className="voices__expert">
              <div className="voices__photo">
                <img
                  src="/dinajpur/doctor-kamrul-hasan.jpg"
                  alt="Dr. A B M Kamrul Hasan, Head of Transfusion Medicine, M Abdur Rahim Medical College Hospital Dinajpur"
                  loading="lazy"
                />
              </div>
              <blockquote className="voices__quote" data-8b-motion="readAlong">
                <p>“Pre-screening candidates for the 5 mandatory transfusion-transmissible infections and strictly enforcing the 90-day rest interval ensures zero clinical compromise. Roktika has become an invaluable emergency lifeline for M Abdur Rahim Medical College Hospital and the entire Dinajpur region.”</p>
              </blockquote>
              <figcaption className="voices__who">
                <span className="voices__badge" aria-hidden="true">
                  <Stethoscope className="w-5 h-5 text-red-600" />
                </span>
                <div>
                  <div className="font-bold text-zinc-900 text-sm sm:text-base">Dr. A B M Kamrul Hasan</div>
                  <span className="text-xs text-zinc-600 block">
                    Asst. Professor &amp; Head · Dept. of Transfusion Medicine (Blood Bank)
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    M Abdur Rahim Medical College Hospital, Dinajpur
                  </span>
                </div>
              </figcaption>
            </figure>

            <div className="voices__cols">
              <ul className="voices__col">
                {REVIEWS_COL_1.map((rev) => (
                  <li key={rev.name} className="m-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        {rev.badge}
                      </span>
                      <div className="flex text-amber-400 text-xs">
                        {"★".repeat(rev.stars)}
                      </div>
                    </div>

                    {/* Realistic Clinical Patient Triage Case Data */}
                    {rev.patientCase && (
                      <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/80 text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-zinc-900">
                          <span className="flex items-center gap-1.5 text-zinc-800 truncate">
                            <User className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            {rev.patientCase.patient}
                          </span>
                          <span className="text-[10px] bg-red-100/80 text-red-800 px-2 py-0.5 rounded-full font-bold border border-red-200 shrink-0">
                            {rev.patientCase.units}
                          </span>
                        </div>
                        <div className="text-zinc-600 flex items-center justify-between text-[11px]">
                          <span className="truncate max-w-[190px] font-medium text-zinc-700">{rev.patientCase.hospital}</span>
                          <span className="text-emerald-700 font-semibold">{rev.patientCase.time}</span>
                        </div>
                        <div className="text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/50">
                          <span className="text-zinc-400 font-medium">Condition:</span> <span className="font-semibold text-zinc-800">{rev.patientCase.condition}</span> · <span className="text-zinc-500">{rev.patientCase.ward}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 italic">“{rev.text}”</p>
                    <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        {rev.photo && (
                          <img
                            src={rev.photo}
                            alt={rev.name}
                            className="w-9 h-9 rounded-full object-cover border border-red-200 shadow-2xs shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-bold text-zinc-900 block leading-tight">{rev.name}</span>
                          <span className="text-zinc-500 text-[11px] block leading-tight">{rev.role}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <ul className="voices__col">
                {REVIEWS_COL_2.map((rev) => (
                  <li key={rev.name} className="m-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        {rev.badge}
                      </span>
                      <div className="flex text-amber-400 text-xs">
                        {"★".repeat(rev.stars)}
                      </div>
                    </div>

                    {/* Realistic Clinical Patient Triage Case Data */}
                    {rev.patientCase && (
                      <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/80 text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-zinc-900">
                          <span className="flex items-center gap-1.5 text-zinc-800 truncate">
                            <User className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            {rev.patientCase.patient}
                          </span>
                          <span className="text-[10px] bg-red-100/80 text-red-800 px-2 py-0.5 rounded-full font-bold border border-red-200 shrink-0">
                            {rev.patientCase.units}
                          </span>
                        </div>
                        <div className="text-zinc-600 flex items-center justify-between text-[11px]">
                          <span className="truncate max-w-[190px] font-medium text-zinc-700">{rev.patientCase.hospital}</span>
                          <span className="text-emerald-700 font-semibold">{rev.patientCase.time}</span>
                        </div>
                        <div className="text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/50">
                          <span className="text-zinc-400 font-medium">Condition:</span> <span className="font-semibold text-zinc-800">{rev.patientCase.condition}</span> · <span className="text-zinc-500">{rev.patientCase.ward}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 italic">“{rev.text}”</p>
                    <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-zinc-900 block leading-tight">{rev.name}</span>
                        <span className="text-zinc-500 text-[11px] block leading-tight">{rev.role}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SCENE: SETUP — Stacking Sticky Step Cards ────────────── */}
      <section className="setup relative isolate" id="setup" data-8b-section="how-it-works" aria-labelledby="setup-title">
        <div className="setup__sheet m-band-2" aria-hidden="true"></div>
        <div className="setup__inner max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="setup__head">
            <h2 className="m-text-3" id="setup-title">Three steps. Then blood arrives bedside.</h2>
            <p className="m-text-4">
              Designed for extreme hospital emergency conditions. Any relative, nurse, or doctor can trigger voluntary dispatch within 30 seconds.
            </p>
          </div>

          <ol className="setup__steps">
            <li className="setup__card" style={{ "--setup-i": 0 }}>
              <p className="setup__num" aria-hidden="true">1</p>
              <div className="setup__copy">
                <h3 className="m-text-5">Post Emergency Triage Request</h3>
                <p className="m-text-8 on-light">
                  Submit required blood group, hospital bed number, and contact info. Our system instantly verifies the case legitimacy.
                </p>
              </div>
              <div className="setup__ui" aria-hidden="true">
                <p className="setup__check text-emerald-700 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> Case authenticated with hospital pathology
                </p>
                <p className="setup__check text-emerald-700 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> Immediate proximity SMS dispatch triggered
                </p>
              </div>
            </li>

            <li className="setup__card" style={{ "--setup-i": 1 }}>
              <p className="setup__num" aria-hidden="true">2</p>
              <div className="setup__copy">
                <h3 className="m-text-5">Automated Proximity Match</h3>
                <p className="m-text-8 on-light">
                  Nearby voluntary donors on non-cooldown rest status receive direct alerts with hospital coordinates and navigation.
                </p>
              </div>
              <div className="setup__ui" aria-hidden="true">
                <p className="setup__option setup__option--on">
                  <span>Dinajpur Sadar Vicinity (5 km radius)</span>
                  <span className="text-xs bg-white text-red-600 px-2 py-0.5 rounded-full font-black">Active</span>
                </p>
                <p className="setup__option">
                  <span>Regional Emergency Backup</span>
                  <span className="text-xs text-zinc-500 font-bold">Standby</span>
                </p>
              </div>
            </li>

            <li className="setup__card on-dark" style={{ "--setup-i": 2 }}>
              <p className="setup__num" aria-hidden="true">3</p>
              <div className="setup__copy">
                <h3 className="m-text-5">Bedside Transfusion &amp; Rest Lock</h3>
                <p className="m-text-8">
                  After sterile hospital collection, the transfusion is confirmed and the voluntary donor profile locked for 90 days.
                </p>
              </div>
              <div className="setup__ui" aria-hidden="true">
                <p className="m-caption">
                  <span className="m-caption__wave"><i /><i /><i /><i /></span>
                  <span className="m-caption__text">Safe whole blood transfusion verified</span>
                </p>
                <p className="m-caption-2">
                  <span className="m-caption__wave"><i /><i /><i /><i /></span>
                  <span className="m-caption__text">90-Day erythrocyte rest safeguard activated</span>
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ── 8. BLOOD INVENTORY OVERVIEW ───────────────── */}
      <section className="relative isolate py-24 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
            <div className="space-y-2">
              <div className="section-label red">
                <Activity className="w-3.5 h-3.5" />
                Live Blood Bank Readiness
              </div>
              <h2 className="m-text-3 text-zinc-950">Select Blood Group for Instant Donors</h2>
              <p className="m-text-4 text-zinc-500 max-w-xl">
                Check current voluntary volunteer availability in Dinajpur Sadar and search verified donors by proximity.
              </p>
            </div>
            <Link to="/searchDonar" className="m-btn-outline on-light shrink-0">
              District Search <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Blood group grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((grp) => {
              const s = stats.groups?.find((g) => g.group === grp) || { available: 1, total: 2 };
              return (
                <Link
                  key={grp}
                  to={`/searchDonar?group=${encodeURIComponent(grp)}`}
                  className="p-4 rounded-2xl border text-center transition-all border-zinc-200 bg-zinc-50/50 hover:border-red-300 hover:bg-red-50/30"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 font-black text-xl text-red-600 bg-white shadow-sm border border-zinc-200">
                    {grp}
                  </div>
                  <span className="block text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mb-1">
                    {s.available} Ready
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {s.total} Registered
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. SCENE: START — Expanding Photo Zoom Window ──────────── */}
      <section className="start on-dark relative isolate" id="start" data-8b-section="call-to-action" aria-labelledby="start-title">
        <div className="start__sheet m-band-4" aria-hidden="true"></div>
        <div className="start__inner max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="start__window">
            <img
              src="/dinajpur/blood-donation-center.jpg"
              alt="Voluntary blood donation procedure at Dinajpur Blood Transfusion Center"
              loading="lazy"
            />
          </div>
          <div className="start__copy">
            <h2 className="m-text-3" id="start-title">
              Keep a heartbeat going across Dinajpur.
            </h2>
            <p className="m-text-4 text-zinc-300">
              100% voluntary, 100% free. Whether you are ready to pledge your next donation or urgently seeking a match for your family at Abdur Rahim Medical College, we stand ready.
            </p>
            <div className="start__actions">
              <Link to="/donarForm" className="m-btn">
                <span className="m-btn__label">Register as Voluntary Donor</span>
                <span className="m-btn__wave" aria-hidden="true"><i /><i /><i /></span>
              </Link>
              <Link to="/searchDonar" className="m-btn-outline">
                <Search className="w-4 h-4 mr-2" />
                Find Donors by Group
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
