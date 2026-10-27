import { useContext, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router";
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
} from "lucide-react";

const Navbar = () => {
  const { isAdmin, logoutAdmin, currentDonor, logoutDonor } = useContext(AdminContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogout = () => { logoutAdmin(); navigate("/admin"); };

  const navLinks = [
    { to: "/",           label: "Home",          icon: HeartHandshake },
    { to: "/searchDonar",label: "Search Donors", icon: Search },
    { to: "/emergency",  label: "Emergency",     icon: AlertCircle, badge: "Live" },
    { to: "/donarForm",  label: "Register",      icon: UserCheck },
    { to: "/donorPortal",label: "My Application",icon: FileCheck2 },
  ];

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
          className="flex items-center gap-4 max-w-7xl mx-auto h-16"
          style={{ paddingInline: "clamp(1rem, 4vw, 3.5rem)" }}
        >
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center group-hover:bg-red-700 transition-colors">
              <Droplet className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="text-base font-black text-white notranslate" translate="no">
              Rok<span className="text-red-500">tika</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {navLinks.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/12 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                {badge && (
                  <span className="ml-0.5 bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/adminControl"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive ? "bg-white/12 text-white" : "text-white/60 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />

            {currentDonor && (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[90px] truncate">{currentDonor.name}</span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 bg-white rounded-2xl w-48 z-50 text-xs border border-zinc-200 mt-2"
                >
                  <li className="menu-title text-zinc-400 text-xs">Donor Account</li>
                  <li><Link to="/donorPortal" className="text-zinc-700">Application &amp; Cooldown</Link></li>
                  <li><button onClick={logoutDonor} className="text-red-600">Sign Out</button></li>
                </ul>
              </div>
            )}

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1 bg-white/12 text-white text-xs px-2.5 py-1.5 rounded-full font-semibold border border-white/10">
                  <Shield className="w-3 h-3" /> Admin
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded-full hover:bg-white/8 transition-colors"
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

          <nav className="flex flex-col gap-1 mt-4">
            {navLinks.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-colors ${
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
            {isAdmin && (
              <NavLink
                to="/adminControl"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`
                }
              >
                <Shield className="w-5 h-5" />
                <span>Admin Panel</span>
              </NavLink>
            )}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between">
            <LanguageToggle />
            {isAdmin && (
              <button onClick={() => { handleAdminLogout(); setMobileMenuOpen(false); }} className="text-red-400 text-sm flex items-center gap-1.5">
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
