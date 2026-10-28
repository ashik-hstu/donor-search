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
import { Button, Badge, Card, CardContent, Input } from "./ui";

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
          <Badge variant="outline" className="gap-1.5 bg-red-50 text-red-700 border-red-200 mb-2">
            <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600" />
            Verified Donor Directory
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            Available Blood Donors
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Real-time donor directory with hospital assignments and dynamic 3-month cooldown verification.
          </p>
        </div>

        {/* Blood Group Availability Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          <Button
            size="sm"
            variant={selectedGroup === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedGroup("ALL")}
            className="rounded-xl text-xs font-bold"
          >
            All Donors ({donors.length})
          </Button>
          {BLOOD_GROUPS.map((grp) => {
            const stat = stats.find((s) => s.group === grp) || { available: 0, total: 0 };
            const isSelected = selectedGroup === grp;
            return (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                  isSelected
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200 shadow-2xs"
                }`}
              >
                <span className="notranslate" translate="no">{grp}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
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
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, location, or hospital..."
              className="pl-10 rounded-2xl"
            />
          </div>
        </div>

        {/* Donor Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-zinc-400 mt-3 font-medium">Loading active donors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center max-w-lg mx-auto">
            <Droplet className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">No Donors Found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              No registered donors match your current search criteria.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((donor) => (
              <Card
                key={donor._id}
                className="overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {donor.photo ? (
                          <img
                            src={donor.photo}
                            alt={donor.name}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-200"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-xl bg-red-600 text-white font-extrabold text-lg flex items-center justify-center notranslate shadow-xs"
                            translate="no"
                          >
                            {donor.group}
                          </div>
                        )}
                        <span
                          className="absolute -bottom-1 -right-1 bg-zinc-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded notranslate"
                          translate="no"
                        >
                          {donor.group}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-zinc-900 text-sm leading-snug">
                            {donor.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                        <span className="text-xs text-zinc-500">
                          {donor.age} yrs • {donor.gender}
                        </span>
                      </div>
                    </div>

                    <Badge variant="secondary" size="sm">
                      {donor.donationCount || 0} Donations
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-200/70">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="font-medium text-zinc-800 truncate">
                        {donor.location || "Location not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">
                        {donor.hospital || "Dinajpur Sadar Hospital"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    {donor.isAvailable ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-900">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 animate-pulse"></span>
                          Available to Donate
                        </span>
                        <Badge variant="success" size="sm">
                          Ready
                        </Badge>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-1 text-[11px] font-bold text-amber-800 flex items-center justify-between">
                          <span>Already Donated (3-Month Rest)</span>
                          <Badge variant="warning" size="sm">Resting</Badge>
                        </div>
                        <CountdownBadge targetDate={donor.nextEligibleDate} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center gap-2">
                  <a
                    href={`tel:${donor.contact}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors duration-150 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="truncate">Call {donor.contact}</span>
                  </a>

                  <a
                    href={`https://wa.me/88${donor.contact}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-9 px-3 rounded-xl text-xs font-bold border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors duration-150"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableDonar;
