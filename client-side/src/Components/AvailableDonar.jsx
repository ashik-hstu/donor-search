import { useState, useEffect } from "react";
import { Link } from "react-router";
import CountdownBadge from "./CountdownBadge";
import {
  Droplet,
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Heart,
} from "lucide-react";
import { BLOOD_GROUPS } from "../data/hospitals";
import { API_BASE_URL } from "../config/api";

const AvailableDonar = () => {
  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [donorsRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/donors`),
          fetch(`${API_BASE_URL}/api/donors/stats`),
        ]);
        const dData = await donorsRes.json();
        const sData = await statsRes.json();
        if (dData.success) setDonors(dData.donors);
        if (sData.success) setStats(sData.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = donors.filter((d) => {
    if (selectedGroup !== "ALL" && d.group !== selectedGroup) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        d.name?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-2">
            <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600" />
            Verified Donor Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            Available Blood Donors
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Real-time donor directory with hospital assignments and dynamic 3-month cooldown verification.
          </p>
        </div>

        {/* Blood Group Availability Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedGroup("ALL")}
            className={`btn btn-sm rounded-lg font-bold text-xs transition-colors duration-150 ${
              selectedGroup === "ALL"
                ? "bg-red-600 text-white"
                : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            All Donors ({donors.length})
          </button>
          {BLOOD_GROUPS.map((grp) => {
            const stat = stats.find((s) => s.group === grp) || { available: 0, total: 0 };
            const isSelected = selectedGroup === grp;
            return (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`btn btn-sm rounded-lg font-bold text-xs transition-colors duration-150 ${
                  isSelected
                    ? "bg-red-600 text-white"
                    : "bg-white text-zinc-700 hover:bg-red-50 border border-zinc-200"
                }`}
              >
                <span className="notranslate" translate="no">{grp}</span>
                <span
                  className={`badge badge-xs text-[10px] font-bold ${
                    isSelected ? "bg-white text-red-600" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  <span className="notranslate" translate="no">{stat.available}</span> Ready
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search donor by name, location (e.g. Basher Hut, Dinajpur), or hospital..."
              className="input input-bordered w-full pl-10 rounded-2xl text-xs sm:text-sm shadow-xs"
            />
          </div>
        </div>

        {/* Donor Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <span className="loading loading-spinner loading-lg text-red-600"></span>
            <p className="text-xs text-gray-400 mt-2">Loading active donors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs max-w-lg mx-auto">
            <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Donors Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              No registered donors match your current search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((donor) => (
              <div
                key={donor._id}
                className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors duration-150 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {donor.photo ? (
                        <img
                          src={donor.photo}
                          alt={donor.name}
                          className="w-12 h-12 rounded-lg object-cover border border-zinc-200"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-lg bg-red-600 text-white font-extrabold text-lg flex items-center justify-center notranslate"
                          translate="no"
                        >
                          {donor.group}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-zinc-900">{donor.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Member" />
                        </div>
                        <span className="text-xs text-zinc-500">
                          {donor.age} yrs • {donor.gender}
                        </span>
                      </div>
                    </div>

                    <span
                      className="bg-red-50 text-red-700 border border-red-200 font-bold text-xs px-2.5 py-0.5 rounded notranslate"
                      translate="no"
                    >
                      {donor.group}
                    </span>
                  </div>

                  {/* Location & Hospital Details */}
                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 space-y-1.5 text-xs text-zinc-600 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="font-medium text-zinc-800">{donor.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="text-zinc-600 truncate">{donor.hospital}</span>
                    </div>
                  </div>

                  {/* Cooldown / Availability */}
                  <div className="mb-4">
                    {donor.isAvailable ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-900">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                          Available to Donate
                        </span>
                        <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          Ready
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-1 text-[11px] font-bold text-amber-800 flex items-center justify-between">
                          <span>Already Donated (3-Month Rest)</span>
                          <span className="badge badge-warning badge-xs">Resting</span>
                        </div>
                        <CountdownBadge targetDate={donor.nextEligibleDate} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Controls */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <a
                    href={`tel:${donor.contact}`}
                    className="btn btn-sm flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call {donor.contact}
                  </a>

                  <a
                    href={`https://wa.me/88${donor.contact}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold px-3"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableDonar;
