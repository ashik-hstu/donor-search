import { Outlet, Link, useLocation } from "react-router";
import Navbar from "./Navbar";
import { Droplet, Phone, MapPin, Shield, Mail } from "lucide-react";

const Root = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdminLogin = location.pathname === "/admin";
  const isDarkPage = isHome || isAdminLogin;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isDarkPage ? "#09090b" : "var(--ground)",
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: isDarkPage ? "#09090b" : "transparent",
        }}
      >
        <Outlet />
      </main>

      {/* ── Footer (Linea-inspired dark footer) ─────────────────── */}
      <footer style={{ background: "#0c0c0e", color: "rgba(255,255,255,0.5)" }}>
        <div
          className="max-w-7xl mx-auto py-16 grid grid-cols-1 md:grid-cols-4 gap-10 mb-8"
          style={{ paddingInline: "clamp(1rem, 4vw, 3.5rem)" }}
        >
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--red)" }}>
                <Droplet className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-xl font-black text-white notranslate" translate="no">
                Rok<span style={{ color: "#f87171" }}>tika</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "24ch" }}>
              Emergency voluntary blood donation network with strict medical qualification verification and dynamic cooldown tracking.
            </p>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
              Coverage: Basher Hut, Dinajpur Sadar &amp; Nationwide
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <span className="text-xs font-bold text-white block mb-4">Quick Navigation</span>
            <ul className="space-y-2.5 text-xs">
              {[
                { to: "/searchDonar", label: "Search Blood Groups" },
                { to: "/emergency",   label: "Urgent SOS Needs" },
                { to: "/donarForm",   label: "Apply as Donor Candidate" },
                { to: "/donorPortal", label: "Donor Status Portal" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="link-underline" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Standards */}
          <div>
            <span className="text-xs font-bold text-white block mb-4">Medical Standards</span>
            <ul className="space-y-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              {[
                "Strict 18+ Age Requirement",
                "90-Day (3-Month) Cooldown",
                "Pathology Screening",
                "Administrator Vetted Approvals",
                "Candidate Appeal Governance",
              ].map((s) => (
                <li key={s} className="flex items-start gap-1.5">
                  <span style={{ color: "#f87171", marginTop: 2 }}>—</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <span className="text-xs font-bold text-white block mb-4">Emergency &amp; Support</span>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="block text-xs font-bold mb-1" style={{ color: "#f87171" }}>National Emergency</span>
                <span className="flex items-center gap-1.5 text-sm font-black text-white">
                  <Phone className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                  999 / 16263 (Health)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Mail className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                support@roktika.org
              </div>
            </div>
          </div>
        </div>

        <div
          className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-3 py-6"
          style={{
            paddingInline: "clamp(1rem, 4vw, 3.5rem)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <span>© 2026 Roktika · Ashik</span>
          <div className="flex items-center gap-5">
            <Link to="/about"       className="link-underline" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>About Us</Link>
            <Link to="/information" className="link-underline" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Health Guidelines</Link>
            <Link to="/admin"       className="link-underline flex items-center gap-1" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
              <Shield className="w-3 h-3" /> Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Root;
