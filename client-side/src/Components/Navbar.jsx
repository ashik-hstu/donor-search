import { useContext, useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router";
import { AdminContext } from "../context/AdminContext";
import LanguageToggle from "./LanguageToggle";
import {
  HeartHandshake,
  Search,
  Droplet,
  AlertCircle,
  UserCheck,
  Shield,
  LogOut,
  Menu,
  X,
  FileCheck2,
  ChevronDown,
  Heart,
  BookOpen,
} from "lucide-react";

const Navbar = () => {
  const { isAdmin, logoutAdmin, currentDonor, logoutDonor } = useContext(AdminContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donorMenuOpen, setDonorMenuOpen] = useState(false);
  const [donorSubmenuOpen, setDonorSubmenuOpen] = useState(false);
  const submenuRef = useRef(null);
  const submenuTimeout = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate("/admin");
  };

  // Primary core links in desktop nav
  const primaryNavLinks = [
    { to: "/", label: "Home", icon: HeartHandshake },
    { to: "/searchDonar", label: "Search Donors", icon: Search },
    { to: "/emergency", label: "Emergency", icon: AlertCircle, badge: "Live" },
  ];

  // Active check for Donors submenu items
  const isDonorSectionActive = [
    "/donarForm",
    "/donorPortal",
    "/information",
  ].includes(location.pathname);

  const handleMouseEnter = () => {
    if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
    setDonorSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    submenuTimeout.current = setTimeout(() => {
      setDonorSubmenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setDonorSubmenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
    };
  }, []);

  return (
    <>
      {/* ── Fixed full-width header (zero blank space, touches top edge) ── */}
      <header
        className="fixed z-50 top-0 left-0 right-0 w-full border-b transition-colors"
        style={{
          background: "rgba(12, 12, 14, 0.92)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        }}
      >
        <div
          className="flex items-center gap-6 max-w-7xl mx-auto h-16"
          style={{ paddingInline: "clamp(1rem, 4vw, 3.5rem)" }}
        >
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-sm">
              <Droplet className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="text-base font-black text-white notranslate tracking-tight" translate="no">
              Rok<span className="text-red-500">tika</span>
            </span>
          </Link>

          {/* Desktop nav links with breathing room & Submenu */}
          <nav className="hidden lg:flex items-center gap-1.5 ml-2">
            {primaryNavLinks.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-white/12 text-white shadow-xs font-semibold"
                      : "text-white/65 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{label}</span>
                {badge && (
                  <span className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}

            {/* Donors Submenu Dropdown */}
            <div
              ref={submenuRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setDonorSubmenuOpen(!donorSubmenuOpen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                  isDonorSectionActive || donorSubmenuOpen
                    ? "bg-white/12 text-white font-semibold"
                    : "text-white/65 hover:text-white hover:bg-white/8"
                }`}
                aria-expanded={donorSubmenuOpen}
              >
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Donors</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${
                    donorSubmenuOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {donorSubmenuOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                  style={{
                    background: "rgba(18, 18, 22, 0.96)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-white/40 uppercase">
                    Volunteer &amp; Donor Hub
                  </div>

                  <Link
                    to="/donarForm"
                    onClick={() => setDonorSubmenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-500/25 group-hover:text-red-300 transition-colors">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        Register as Donor
                      </div>
                      <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                        Join verified registry &amp; save lives locally
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/donorPortal"
                    onClick={() => setDonorSubmenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/25 group-hover:text-emerald-300 transition-colors">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        My Application &amp; Cooldown
                      </div>
                      <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                        Inspect verification status &amp; 90-day timer
                      </div>
                    </div>
                  </Link>

                  <div className="my-1 border-t border-white/8" />

                  <Link
                    to="/information"
                    onClick={() => setDonorSubmenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500/25 group-hover:text-blue-300 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        Eligibility &amp; Medical Rules
                      </div>
                      <div className="text-[11px] text-white/50 leading-tight mt-0.5">
                        5-panel criteria, weight, and safety protocols
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-3">
            {!mobileMenuOpen && (
              <div className="hidden sm:flex items-center">
                <LanguageToggle />
              </div>
            )}

            {currentDonor && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDonorMenuOpen(!donorMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/90 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[110px] truncate">{currentDonor.name}</span>
                </button>
                {donorMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95"
                    style={{
                      background: "rgba(18, 18, 22, 0.96)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 20px 40px -15px rgba(0,0,0,0.7)",
                    }}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      Donor Account
                    </div>
                    <Link
                      to="/donorPortal"
                      onClick={() => setDonorMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium transition-colors"
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>Application &amp; Cooldown</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDonorMenuOpen(false);
                        logoutDonor();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 font-semibold transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/adminControl"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-200 hover:text-white hover:bg-red-900/60 text-xs font-semibold transition-colors shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1 text-white/50 hover:text-red-400 text-xs px-2.5 py-1.5 rounded-full hover:bg-white/8 transition-colors"
                  title="Sign out of Admin session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/donarForm"
                className="hidden sm:flex btn-roktika !min-h-0 !py-2 !px-4 !text-xs"
              >
                <span className="btn-label">Donate Blood</span>
                <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-white/80 hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen menu ─────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950 flex flex-col pt-20 pb-8 px-6 overflow-y-auto lg:hidden">
          <button
            className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>

          <nav className="flex flex-col gap-6 mt-2">
            {/* Core Section */}
            <div className="space-y-1">
              <div className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                Navigation
              </div>
              {primaryNavLinks.map(({ to, label, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {badge && (
                    <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Donor & Volunteer Section */}
            <div className="space-y-1">
              <div className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                Donors &amp; Volunteers
              </div>
              <NavLink
                to="/donarForm"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`
                }
              >
                <UserCheck className="w-5 h-5 text-red-500" />
                <span>Register as Donor</span>
              </NavLink>
              <NavLink
                to="/donorPortal"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`
                }
              >
                <FileCheck2 className="w-5 h-5 text-emerald-500" />
                <span>My Application &amp; Cooldown</span>
              </NavLink>
              <NavLink
                to="/information"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`
                }
              >
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>Eligibility &amp; Medical Rules</span>
              </NavLink>
            </div>

            {/* Admin Section (if logged in) */}
            {isAdmin && (
              <div className="space-y-1">
                <div className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                  Administration
                </div>
                <NavLink
                  to="/adminControl"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                    }`
                  }
                >
                  <Shield className="w-5 h-5 text-red-400" />
                  <span>Admin Panel</span>
                </NavLink>
              </div>
            )}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between">
            <LanguageToggle />
            {isAdmin && (
              <button
                onClick={() => {
                  handleAdminLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-red-400 text-sm flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navbar spacer — floating nav doesn't push content */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
