import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import CountdownBadge from "./CountdownBadge";
import { BANGLADESH_HOSPITALS, BLOOD_GROUPS, BANGLADESH_DISTRICTS, BLOOD_COMPATIBILITY } from "../data/hospitals";
import { API_BASE_URL } from "../config/api";
import { Button, Badge, Card, Input, Select, TabsList, TabsTrigger } from "./ui";
import {
  Search,
  Droplet,
  MapPin,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  X,
  ArrowRight,
  Info,
  Navigation,
  Lock,
  RotateCcw,
} from "lucide-react";

const SearchDonar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlGroup = searchParams.get("group") || "";

  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter states (District & City separately, then Address Area & Hospital)
  const [selectedGroup, setSelectedGroup] = useState(urlGroup);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all"); // 'all' | 'ready' | 'cooldown'
  const [includeCompatible, setIncludeCompatible] = useState(false);

  // ONLY show donor profiles AFTER the user actively searches
  const [hasSearched, setHasSearched] = useState(false);

  // Executed search query (frozen and applied when user clicks "Search Donors")
  const [activeSearch, setActiveSearch] = useState({
    group: "",
    district: "",
    city: "",
    area: "",
    hospital: "",
    includeCompatible: false,
  });

  // Sync state if URL query params exist on initial mount (pre-fill form only, never auto-search)
  useEffect(() => {
    const g = searchParams.get("group") || "";
    const d = searchParams.get("district") || "";
    const h = searchParams.get("hospital") || "";
    if (g) setSelectedGroup(g);
    if (d) setSelectedDistrict(d);
    if (h) setSelectedHospital(h);
  }, []);

  const handleDistrictBoxClick = (distName) => {
    if (hasSearched) return;
    if (selectedDistrict === distName) {
      setSelectedDistrict("");
      setSelectedCity("");
    } else {
      setSelectedDistrict(distName);
      setSelectedCity("");
    }
  };

  const handleCityBoxClick = (cityName) => {
    if (hasSearched) return;
    if (selectedCity === cityName) {
      setSelectedCity("");
    } else {
      setSelectedCity(cityName);
    }
  };

  // Load stats and donors from server
  const fetchDonorsAndStats = async () => {
    try {
      setLoading(true);

      const [statsRes, donorsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/donors/stats`),
        fetch(`${API_BASE_URL}/api/donors`),
      ]);

      const statsData = await statsRes.json();
      const donorsData = await donorsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (donorsData.success) setDonors(donorsData.donors);
    } catch (err) {
      console.error("Failed to fetch donor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorsAndStats();
  }, []);

  // When clicking a blood group box, update selection in the form without auto-triggering search
  const handleGroupSelect = (group) => {
    if (hasSearched) return;
    if (selectedGroup === group) {
      setSelectedGroup("");
      setIncludeCompatible(false);
    } else {
      setSelectedGroup(group);
    }
  };

  // Unlock selectors without clearing choices so user can adjust criteria
  const handleUnlockForm = () => {
    setHasSearched(false);
  };

  // Trigger search on form submit / clicking "Search Donors"
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    setActiveSearch({
      group: selectedGroup,
      district: selectedDistrict,
      city: selectedCity,
      area: searchArea.trim(),
      hospital: selectedHospital,
      includeCompatible: includeCompatible,
    });
    setHasSearched(true);

    setTimeout(() => {
      document.getElementById("donor-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  // Clear search and reset back to clean state
  const handleClearSearch = () => {
    setSelectedGroup("");
    setSelectedDistrict("");
    setSelectedCity("");
    setSearchArea("");
    setSelectedHospital("");
    setAvailabilityFilter("all");
    setIncludeCompatible(false);
    setHasSearched(false);
    setActiveSearch({
      group: "",
      district: "",
      city: "",
      area: "",
      hospital: "",
      includeCompatible: false,
    });
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("group");
    setSearchParams(nextParams);
  };

  // Remove individual active query criteria and refresh results
  const handleRemoveGroupQuery = () => {
    setSelectedGroup("");
    setIncludeCompatible(false);
    setActiveSearch((prev) => {
      const next = { ...prev, group: "", includeCompatible: false };
      if (!next.district && !next.city && !next.area && !next.hospital) {
        setHasSearched(false);
      }
      return next;
    });
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("group");
    setSearchParams(nextParams);
  };

  const handleRemoveDistrictQuery = () => {
    setSelectedDistrict("");
    setSelectedCity("");
    setActiveSearch((prev) => {
      const next = { ...prev, district: "", city: "" };
      if (!next.group && !next.area && !next.hospital) {
        setHasSearched(false);
      }
      return next;
    });
  };

  const handleRemoveCityQuery = () => {
    setSelectedCity("");
    setActiveSearch((prev) => ({ ...prev, city: "" }));
  };

  const handleRemoveAreaQuery = () => {
    setSearchArea("");
    setActiveSearch((prev) => {
      const next = { ...prev, area: "" };
      if (!next.group && !next.district && !next.city && !next.hospital) {
        setHasSearched(false);
      }
      return next;
    });
  };

  const handleRemoveHospitalQuery = () => {
    setSelectedHospital("");
    setActiveSearch((prev) => {
      const next = { ...prev, hospital: "" };
      if (!next.group && !next.district && !next.city && !next.area) {
        setHasSearched(false);
      }
      return next;
    });
  };

  // Search Matching Algorithm based on active search query:
  // Returns empty results until user executes a search!
  const computeSearchResults = () => {
    if (!hasSearched) {
      return { results: [], counts: { all: 0, ready: 0, cooldown: 0 }, fallbackUsed: false, fallbackNote: "" };
    }

    const searchGrp = activeSearch.group;
    const searchDist = (activeSearch.district || "").toLowerCase();
    const searchCity = (activeSearch.city || "").toLowerCase();
    const searchAddr = (activeSearch.area || "").trim().toLowerCase();
    const searchHosp = (activeSearch.hospital || "").trim().toLowerCase();
    const searchCompatible = activeSearch.includeCompatible;

    // 1. Filter by Blood Group or Compatibility
    let groupFiltered = donors;
    if (searchGrp) {
      if (searchCompatible && BLOOD_COMPATIBILITY[searchGrp]?.canReceiveFrom) {
        const compTypes = BLOOD_COMPATIBILITY[searchGrp].canReceiveFrom;
        groupFiltered = donors.filter((d) => compTypes.includes(d.group));
      } else {
        groupFiltered = donors.filter((d) => d.group === searchGrp);
      }
    }

    const hospitalObj = BANGLADESH_HOSPITALS.find((h) => h.name === activeSearch.hospital);
    const hospDistrict = (hospitalObj?.district || "").toLowerCase();
    const hospArea = (hospitalObj?.area || "").toLowerCase();

    const tier1 = []; // Same District + Same City + Area Match + Hospital Match
    const tier2 = []; // Same District + Same City + Area Match
    const tier3 = []; // Same District + Same City + Hospital Match
    const tier4 = []; // Same District + Same City
    const tier5 = []; // Same District, nearby cities in district (fallback)
    const tier6 = []; // Hospital match anywhere

    groupFiltered.forEach((donor) => {
      const donorLoc = (donor.location || "").toLowerCase();
      const donorDist = (donor.district || "").toLowerCase();
      const donorCity = (donor.city || "").toLowerCase();
      const donorHosp = (donor.hospital || "").toLowerCase();

      const distMatches = searchDist ? donorDist === searchDist || donorLoc.includes(searchDist) : true;
      const cityMatches = searchCity ? donorCity === searchCity || donorLoc.includes(searchCity) || donorHosp.includes(searchCity) : true;
      const addrMatches = searchAddr ? donorLoc.includes(searchAddr) || donorHosp.includes(searchAddr) : false;
      const hospMatches = searchHosp
        ? donorHosp.includes(searchHosp) ||
          (hospDistrict && (donorLoc.includes(hospDistrict) || donorDist.includes(hospDistrict))) ||
          (hospArea && donorLoc.includes(hospArea))
        : false;

      if (distMatches && cityMatches) {
        if (searchAddr && addrMatches && searchHosp && hospMatches) {
          tier1.push({ ...donor, matchType: `Exact Area & Hospital Match in ${donor.city || activeSearch.city}` });
        } else if (searchAddr && addrMatches) {
          tier2.push({ ...donor, matchType: `Exact Area Match in ${donor.city || activeSearch.city}` });
        } else if (searchHosp && hospMatches) {
          tier3.push({ ...donor, matchType: `Hospital Vicinity Match (${donor.hospital || activeSearch.hospital})` });
        } else if (searchCity) {
          tier4.push({ ...donor, matchType: `City Match in ${donor.city || activeSearch.city}` });
        } else if (searchDist) {
          tier4.push({ ...donor, matchType: `District Match in ${donor.district || activeSearch.district}` });
        } else {
          tier4.push({ ...donor, matchType: searchGrp ? `Blood Group ${donor.group} Match` : "Verified Volunteer" });
        }
      } else if (distMatches && searchCity) {
        tier5.push({ ...donor, matchType: `Nearby City Match in ${donor.city || donor.district}` });
      } else if (searchHosp && hospMatches) {
        tier6.push({ ...donor, matchType: `Hospital Match (${activeSearch.hospital})` });
      }
    });

    let combined = [];
    let fallbackUsed = false;
    let fallbackNote = "";

    if (tier1.length > 0 || tier2.length > 0) {
      combined = [...tier1, ...tier2];
      [...tier3, ...tier4].forEach((d) => {
        if (!combined.some((c) => c._id === d._id)) combined.push(d);
      });
    } else if (tier3.length > 0) {
      combined = [...tier3, ...tier4];
    } else if (tier4.length > 0) {
      combined = tier4;
    } else if (tier5.length > 0) {
      combined = tier5;
      fallbackUsed = true;
      fallbackNote = `No direct matches in "${activeSearch.city}", but matched ${tier5.length} nearby volunteer${tier5.length > 1 ? "s" : ""} in other cities of ${activeSearch.district} District.`;
    } else if (tier6.length > 0) {
      combined = tier6;
      fallbackUsed = true;
      fallbackNote = `Hospital vicinity match applied for "${activeSearch.hospital}".`;
    }

    const counts = {
      all: combined.length,
      ready: combined.filter((d) => d.isAvailable).length,
      cooldown: combined.filter((d) => !d.isAvailable).length,
    };

    let finalResults = combined;
    if (availabilityFilter === "ready") {
      finalResults = combined.filter((d) => d.isAvailable);
    } else if (availabilityFilter === "cooldown") {
      finalResults = combined.filter((d) => !d.isAvailable);
    }

    return { results: finalResults, counts, fallbackUsed, fallbackNote };
  };

  const { results: relevantDonors, counts, fallbackUsed, fallbackNote } = computeSearchResults();
  const hasActiveQuery = Boolean(
    activeSearch.group ||
    activeSearch.district ||
    activeSearch.city ||
    activeSearch.area ||
    activeSearch.hospital ||
    activeSearch.includeCompatible
  );
  const hasFormSelection = Boolean(
    selectedGroup ||
    selectedDistrict ||
    selectedCity ||
    searchArea ||
    selectedHospital ||
    includeCompatible
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-1">
            <Droplet className="w-3.5 h-3.5 fill-red-600 text-red-600" />
            Regional Donor Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Search Blood Donors by Group &amp; Proximity
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Select a blood group and enter your district, city, or hospital vicinity. Click <strong>"Search Donors"</strong> to inspect verified volunteer profiles and cooldown statuses.
          </p>
        </div>

        {/* 1. BLOOD GROUP SELECTOR & COMPATIBILITY MATRIX */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
                1. Choose Blood Group
              </h2>
              {hasSearched && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-700" /> Selectors Locked to Active Search
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasSearched ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn btn-xs btn-outline border-zinc-300 text-zinc-700 hover:text-red-700 hover:bg-red-50 text-xs font-bold gap-1 rounded-full"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Form &amp; Re-enable
                </button>
              ) : selectedGroup ? (
                <button
                  type="button"
                  onClick={() => handleGroupSelect(selectedGroup)}
                  className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50 text-xs font-bold gap-1 rounded-full"
                >
                  <X className="w-3 h-3" /> Deselect {selectedGroup}
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {BLOOD_GROUPS.map((grp) => {
              const grpStat = stats.find((s) => s.group === grp) || {
                total: 0,
                available: 0,
              };
              const isSelected = selectedGroup === grp;

              return (
                <button
                  key={grp}
                  type="button"
                  disabled={hasSearched}
                  onClick={() => handleGroupSelect(grp)}
                  className={`relative rounded-2xl p-3.5 text-center transition-all duration-150 select-none w-full ${
                    hasSearched
                      ? isSelected
                        ? "bg-red-600 text-white border-2 border-red-700 ring-2 ring-red-200 cursor-not-allowed opacity-95 shadow-sm"
                        : "bg-zinc-50 border border-zinc-200 text-zinc-400 opacity-40 grayscale cursor-not-allowed"
                      : isSelected
                      ? "cursor-pointer bg-red-600 text-white border-2 border-red-700 ring-2 ring-red-200 shadow-sm"
                      : "cursor-pointer bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-red-400"
                  }`}
                >
                  {/* Blood Group Badge */}
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={`notranslate text-2xl sm:text-3xl font-black tracking-tight ${
                        isSelected ? "text-white" : hasSearched ? "text-zinc-400" : "text-zinc-900"
                      }`}
                      translate="no"
                    >
                      {grp}
                    </span>
                  </div>

                  {/* Available Count */}
                  <div className="mt-1">
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : hasSearched
                          ? "bg-zinc-100 text-zinc-400"
                          : grpStat.available > 0
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {grpStat.available} Ready
                    </span>
                  </div>

                  {/* Total Donors */}
                  <div
                    className={`text-[10px] mt-1 font-medium ${
                      isSelected ? "text-red-100" : "text-zinc-500"
                    }`}
                  >
                    {grpStat.total} Registered
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SEARCH FORM (EMERGENCY BLOOD DONOR STYLE: DISTRICT -> CITY -> AREA / HOSPITAL) */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-red-600" />
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900">
                2. Regional &amp; Vicinity Search (Emergency Style)
              </h2>
            </div>
            {(hasFormSelection || hasSearched) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn btn-xs btn-ghost text-red-600 text-xs font-bold rounded-full gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Form
              </button>
            )}
          </div>

          {/* Emergency Style Step A: District boxes */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Step A: Select District (8 Administrative Divisions)
                </h3>
                {hasSearched && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    <Lock className="w-2.5 h-2.5 text-amber-700" /> Locked
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                {selectedDistrict ? (
                  <>
                    Selected: <strong className="text-red-600 font-bold">{selectedDistrict}</strong>
                  </>
                ) : (
                  <span className="text-zinc-400 italic">No district selected (Search all districts or choose one)</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
              {BANGLADESH_DISTRICTS.map((dist) => {
                const isSelected = selectedDistrict === dist.name;
                const distDonorsCount = donors.filter((d) => {
                  if (selectedGroup && d.group !== selectedGroup) return false;
                  const dDist = (d.district || "").toLowerCase();
                  const dLoc = (d.location || "").toLowerCase();
                  const target = dist.name.toLowerCase();
                  return dDist === target || dLoc.includes(target);
                }).length;

                return (
                  <button
                    key={dist.name}
                    type="button"
                    disabled={hasSearched}
                    onClick={() => handleDistrictBoxClick(dist.name)}
                    className={`rounded-2xl p-3 text-center transition-all duration-150 select-none w-full ${
                      hasSearched
                        ? isSelected
                          ? "bg-red-600 text-white border-2 border-red-700 ring-2 ring-red-200 cursor-not-allowed opacity-95 shadow-sm"
                          : "bg-zinc-50 border border-zinc-200 text-zinc-400 opacity-40 grayscale cursor-not-allowed"
                        : isSelected
                        ? "cursor-pointer bg-red-600 text-white border-2 border-red-700 ring-2 ring-red-200 shadow-sm"
                        : "cursor-pointer bg-white text-zinc-900 border border-zinc-200 hover:border-red-300 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`block text-xs sm:text-sm font-bold truncate ${
                        isSelected ? "text-white" : hasSearched ? "text-zinc-400" : "text-zinc-900"
                      }`}
                    >
                      {dist.name}
                    </span>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : hasSearched
                          ? "bg-zinc-100 text-zinc-400"
                          : distDonorsCount > 0
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {distDonorsCount} {distDonorsCount === 1 ? "Donor" : "Donors"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Style Step B: City boxes (under selected district) */}
          {selectedDistrict && (
            <div className="border border-zinc-200 bg-zinc-50/50 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-200/60">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-600" />
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                    Step B: Select City under {selectedDistrict} District
                  </h4>
                  {hasSearched && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <Lock className="w-2.5 h-2.5 text-amber-700" /> Locked
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-500">
                  {selectedCity ? (
                    <>
                      Selected City: <strong className="text-red-600 font-bold">{selectedCity}</strong>
                    </>
                  ) : (
                    <span className="text-zinc-400 italic">None selected (Click to narrow down)</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {(BANGLADESH_DISTRICTS.find((d) => d.name === selectedDistrict)?.cities || []).map(
                  (cityName) => {
                    const isCitySelected = selectedCity === cityName;
                    const cCount = donors.filter((d) => {
                      if (selectedGroup && d.group !== selectedGroup) return false;
                      const dDist = (d.district || "").toLowerCase();
                      const dCity = (d.city || "").toLowerCase();
                      const dLoc = (d.location || "").toLowerCase();
                      const dHosp = (d.hospital || "").toLowerCase();
                      const distMatches = dDist === selectedDistrict.toLowerCase() || dLoc.includes(selectedDistrict.toLowerCase());
                      const cityMatches = dCity === cityName.toLowerCase() || dLoc.includes(cityName.toLowerCase()) || dHosp.includes(cityName.toLowerCase());
                      return distMatches && cityMatches;
                    }).length;

                    return (
                      <button
                        key={cityName}
                        type="button"
                        disabled={hasSearched}
                        onClick={() => handleCityBoxClick(cityName)}
                        className={`rounded-xl p-2.5 text-center border transition-all duration-150 select-none w-full ${
                          hasSearched
                            ? isCitySelected
                              ? "border-red-600 bg-red-50 text-red-900 font-bold shadow-sm cursor-not-allowed opacity-95"
                              : "border-zinc-200 bg-zinc-50 text-zinc-400 opacity-40 grayscale cursor-not-allowed"
                            : isCitySelected
                            ? "cursor-pointer border-red-600 bg-red-50 text-red-900 font-bold shadow-sm"
                            : "cursor-pointer border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span className="block text-xs font-bold truncate">
                          {cityName}
                        </span>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isCitySelected
                              ? "bg-red-600 text-white"
                              : hasSearched
                              ? "bg-zinc-100 text-zinc-400"
                              : cCount > 0
                              ? "bg-red-100 text-red-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {cCount} Donors
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Emergency Style Step C: Area Address & Nearby Hospital */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-600" />
              Step C: Address Area &amp; Hospital Vicinity (Optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Specific Area / Street Address */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Area / Street / Thana
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={searchArea}
                    disabled={hasSearched}
                    onChange={(e) => setSearchArea(e.target.value)}
                    placeholder="e.g. Basher Hut, Dinajpur Sadar, Hospital Road..."
                    className={`input input-bordered w-full pl-9 rounded-xl text-xs sm:text-sm transition-all ${
                      hasSearched ? "bg-zinc-100 text-zinc-500 cursor-not-allowed opacity-60" : "bg-white"
                    }`}
                  />
                </div>
              </div>

              {/* Nearby Hospital */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Nearby Hospital Vicinity
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <select
                    value={selectedHospital}
                    disabled={hasSearched}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className={`select select-bordered w-full pl-9 rounded-xl text-xs sm:text-sm transition-all ${
                      hasSearched ? "bg-zinc-100 text-zinc-500 cursor-not-allowed opacity-60" : "bg-white"
                    }`}
                  >
                    <option value="">Any / Not Specific</option>
                    <optgroup label="Government Hospitals">
                      {BANGLADESH_HOSPITALS.filter((h) => h.type.includes("Government")).map(
                        (hosp) => (
                          <option key={hosp.name} value={hosp.name}>
                            {hosp.name} ({hosp.district})
                          </option>
                        )
                      )}
                    </optgroup>
                    <optgroup label="Private Hospitals & Clinics">
                      {BANGLADESH_HOSPITALS.filter((h) => !h.type.includes("Government")).map(
                        (hosp) => (
                          <option key={hosp.name} value={hosp.name}>
                            {hosp.name}
                          </option>
                        )
                      )}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Scope Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-100">
            <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-zinc-700">Search criteria:</span>
              <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
                {selectedGroup ? `Blood: ${selectedGroup}` : "Any Blood Group"}
              </span>
              <span>•</span>
              <span className="font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                {selectedDistrict ? (selectedCity ? `${selectedDistrict} > ${selectedCity}` : selectedDistrict) : "All Districts"}
              </span>
              {searchArea && <span>• Area: "{searchArea}"</span>}
              {selectedHospital && <span>• Hospital: {selectedHospital}</span>}
              {includeCompatible && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Compatible Types Included
                </span>
              )}
              {hasSearched && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  <Lock className="w-3 h-3 text-amber-700" /> Selectors Locked
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasSearched ? (
                <>
                  <button
                    type="button"
                    onClick={handleUnlockForm}
                    className="btn btn-sm btn-outline border-zinc-300 rounded-full text-xs px-4 text-zinc-700 hover:bg-zinc-100 font-bold"
                  >
                    Modify Selection
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="btn-roktika !min-h-0 !py-3 !px-6 !text-xs sm:!text-sm w-full sm:w-auto"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span className="btn-label">Reset Form</span>
                    <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
                  </button>
                </>
              ) : (
                <>
                  {(selectedDistrict || selectedCity || selectedGroup || searchArea || selectedHospital || availabilityFilter !== "all" || includeCompatible) && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="btn btn-sm btn-outline border-zinc-300 rounded-full text-xs px-4"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-roktika !min-h-0 !py-3 !px-6 !text-xs sm:!text-sm w-full sm:w-auto"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <span className="btn-label">Search Donors</span>
                    <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
                  </button>
                </>
              )}
            </div>
          </div>
        </form>

        {/* RESULTS SECTION: SEARCH REQUIRED */}
        <div id="donor-results" className="space-y-6 pt-2">
          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-zinc-200">
              <span className="loading loading-spinner loading-lg text-red-600"></span>
              <p className="text-xs text-zinc-400 mt-2">Connecting to verified donor registry...</p>
            </div>
          ) : !hasSearched ? (
            /* DEFAULT STATE: PROMPT USER TO SEARCH (DO NOT SHOW ALL DONORS) */
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-zinc-950">
                  Ready to Find Blood Donors
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                  Select your blood group and location criteria above, then click <strong className="text-zinc-900">"Search Donors"</strong> to query matching verified volunteers and check instant availability.
                </p>
              </div>

              {hasFormSelection ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="btn-roktika !py-3.5 !px-8 text-sm"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <span className="btn-label">
                      Search with Selected Criteria {selectedGroup ? `(${selectedGroup})` : ""}
                    </span>
                    <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                    Quick Search by Group
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {["A+", "B+", "O+", "AB+", "O-"].map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => {
                          setSelectedGroup(grp);
                          setActiveSearch({
                            group: grp,
                            district: "",
                            city: "",
                            area: "",
                            hospital: "",
                            includeCompatible: false,
                          });
                          setHasSearched(true);
                        }}
                        className="btn btn-sm btn-outline border-zinc-200 hover:border-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold"
                      >
                        <Droplet className="w-3 h-3 text-red-600 fill-red-600" />
                        Search {grp}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Search Summary Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-zinc-900">
                      Search Results: <span className="text-red-600 font-black">{relevantDonors.length}</span> matching donor{relevantDonors.length !== 1 ? "s" : ""}
                    </h3>
                  </div>

                  {/* Active Search Query Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {activeSearch.group && (
                      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full shadow-xs">
                        Group: {activeSearch.group}
                        <button
                          type="button"
                          onClick={handleRemoveGroupQuery}
                          className="hover:opacity-75 focus:outline-hidden"
                          title="Remove blood group query"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}

                    {activeSearch.district && (
                      <span className="inline-flex items-center gap-1.5 bg-zinc-900 text-white font-semibold px-3 py-1 rounded-full shadow-xs">
                        {activeSearch.city ? `${activeSearch.district} > ${activeSearch.city}` : `District: ${activeSearch.district}`}
                        <button
                          type="button"
                          onClick={handleRemoveDistrictQuery}
                          className="hover:opacity-75 focus:outline-hidden"
                          title="Remove district query"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}

                    {activeSearch.city && (
                      <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-800 font-bold px-3 py-1 rounded-full border border-zinc-300">
                        City: {activeSearch.city}
                        <button
                          type="button"
                          onClick={handleRemoveCityQuery}
                          className="hover:text-red-600 focus:outline-hidden"
                          title="Remove city query"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}

                    {activeSearch.area && (
                      <span className="inline-flex items-center gap-1.5 border border-zinc-300 text-zinc-700 px-3 py-1 rounded-full">
                        Area: "{activeSearch.area}"
                        <button
                          type="button"
                          onClick={handleRemoveAreaQuery}
                          className="hover:text-red-600 focus:outline-hidden"
                          title="Clear area query"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}

                    {activeSearch.hospital && (
                      <span className="inline-flex items-center gap-1.5 border border-blue-200 text-blue-700 bg-blue-50 px-3 py-1 rounded-full truncate max-w-[240px]">
                        Hospital: {activeSearch.hospital}
                        <button
                          type="button"
                          onClick={handleRemoveHospitalQuery}
                          className="hover:text-blue-900 focus:outline-hidden shrink-0"
                          title="Clear hospital query"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-xs text-red-600 hover:text-red-800 hover:underline font-bold ml-1"
                    >
                      Reset Search
                    </button>
                  </div>
                </div>

                {/* Availability Filter Segmented Controls */}
                <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-2xl shrink-0 self-start lg:self-auto">
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      availabilityFilter === "all"
                        ? "bg-white text-zinc-950 shadow-xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    All ({counts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter("ready")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      availabilityFilter === "ready"
                        ? "bg-white text-emerald-800 shadow-xs"
                        : "text-zinc-600 hover:text-emerald-700"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Ready Now ({counts.ready})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter("cooldown")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      availabilityFilter === "cooldown"
                        ? "bg-white text-amber-900 shadow-xs"
                        : "text-zinc-600 hover:text-amber-800"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    On Cooldown ({counts.cooldown})
                  </button>
                </div>
              </div>

              {/* Blood Compatibility Guide (Only shown in search results when a blood group is queried) */}
              {activeSearch.group && BLOOD_COMPATIBILITY[activeSearch.group] && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-zinc-100">
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-red-600" />
                      Antigenic Compatibility &amp; Replacement for Group {activeSearch.group}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Safe emergency match options for <strong>{activeSearch.group}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Can Donate To */}
                    <div className="bg-red-50/40 border border-red-200/80 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-zinc-900">
                          <span className="text-red-600 font-black">{activeSearch.group}</span> Can Donate Red Cells To:
                        </span>
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          Recipient Types
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {BLOOD_COMPATIBILITY[activeSearch.group].canGiveTo.map((g) => (
                          <span
                            key={g}
                            className="px-2.5 py-0.5 rounded-lg font-black text-xs bg-white text-red-800 border border-red-200 shadow-2xs"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                      {BLOOD_COMPATIBILITY[activeSearch.group].isUniversalDonor && (
                        <div className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Universal Red Cell Donor (Life-saving emergency transfusion)
                        </div>
                      )}
                    </div>

                    {/* Can Receive From */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-zinc-900">
                          Patient Needing <span className="text-red-600 font-black">{activeSearch.group}</span> Can Receive From:
                        </span>
                        <span className="text-[10px] font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded-full">
                          Compatible Donors
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {BLOOD_COMPATIBILITY[activeSearch.group].canReceiveFrom.map((g) => (
                          <span
                            key={g}
                            className="px-2.5 py-0.5 rounded-lg font-black text-xs bg-white text-zinc-900 border border-zinc-300 shadow-2xs"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                      {BLOOD_COMPATIBILITY[activeSearch.group].isUniversalRecipient && (
                        <div className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                          Universal Recipient (Can accept red cells from all groups)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Proximity / Fallback Notice */}
              {fallbackUsed && fallbackNote && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Regional Vicinity Match Applied:</span>
                    <span>{fallbackNote}</span>
                  </div>
                </div>
              )}

              {/* Zero matching results */}
              {relevantDonors.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-12 text-center max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <Droplet className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900">
                      No Matching Donors Found
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                      {activeSearch.group
                        ? `No verified ${activeSearch.group} donors found matching your exact search criteria.`
                        : "No verified donors matched your current search criteria."}
                    </p>
                  </div>

                  {/* Contextual Suggestion Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {activeSearch.group && BLOOD_COMPATIBILITY[activeSearch.group]?.canReceiveFrom && !activeSearch.includeCompatible && (
                      <button
                        type="button"
                        onClick={() => {
                          setIncludeCompatible(true);
                          setActiveSearch((prev) => ({ ...prev, includeCompatible: true }));
                        }}
                        className="btn btn-sm bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold px-4"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Show Compatible Groups for {activeSearch.group} ({BLOOD_COMPATIBILITY[activeSearch.group].canReceiveFrom.join(", ")})
                      </button>
                    )}

                    {activeSearch.city && (
                      <button
                        type="button"
                        onClick={handleRemoveCityQuery}
                        className="btn btn-sm btn-outline border-zinc-300 text-zinc-800 rounded-full text-xs font-bold px-4"
                      >
                        Search All {activeSearch.district || "Districts"}
                      </button>
                    )}

                    {activeSearch.district && (
                      <button
                        type="button"
                        onClick={handleRemoveDistrictQuery}
                        className="btn btn-sm btn-outline border-zinc-300 text-zinc-800 rounded-full text-xs font-bold px-4"
                      >
                        Search Nationwide
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="btn btn-sm btn-ghost text-red-600 rounded-full text-xs font-bold px-4"
                    >
                      Reset Search
                    </button>
                  </div>
                </div>
              ) : (
                /* RELEVANT DONORS CARDS GRID (BOTH AVAILABLE & NOT AVAILABLE) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relevantDonors.map((donor) => (
                    <div
                      key={donor._id}
                      className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors duration-150 overflow-hidden flex flex-col justify-between shadow-xs"
                    >
                      <div className="p-5">
                        {/* Match Badge Tag */}
                        {donor.matchType && (
                          <div className="mb-2">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                donor.matchType.includes("Exact")
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : donor.matchType.includes("Hospital")
                                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {donor.matchType}
                            </span>
                          </div>
                        )}

                        {/* Top Header & Photo */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            {/* Donor Photo or Blood Badge */}
                            <div className="relative">
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
                              <span
                                className="absolute -bottom-1 -right-1 bg-zinc-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded notranslate"
                                translate="no"
                              >
                                {donor.group}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                                  {donor.name}
                                </h4>
                                <ShieldCheck
                                  className="w-4 h-4 text-emerald-600 shrink-0"
                                  title="Verified Donor Member"
                                />
                              </div>
                              <span className="text-[11px] text-zinc-500 block">
                                {donor.age} yrs • {donor.gender}
                              </span>
                            </div>
                          </div>

                          {/* Donation Counter Badge */}
                          <div className="text-right">
                            <span className="inline-block text-[11px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                              {donor.donationCount || 0} Donations
                            </span>
                          </div>
                        </div>

                        {/* Location & Hospital */}
                        <div className="space-y-1.5 text-xs text-zinc-600 mb-3 bg-zinc-50 p-3 rounded-lg border border-zinc-200/70">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="font-medium text-zinc-800 truncate">
                              {donor.location || "Location on record"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span className="text-zinc-600 truncate">
                              {donor.hospital || "Dinajpur Sadar Hospital"}
                            </span>
                          </div>
                        </div>

                        {/* Medical Clearance Checklist */}
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-zinc-600 mb-3">
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {donor.medicalRecords?.smoking ? "Smoker" : "Non-Smoker"}
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            HIV / Hepatitis Clear
                          </span>
                          {donor.weight && (
                            <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                              {donor.weight} kg
                            </span>
                          )}
                        </div>

                        {/* AVAILABILITY / 3-MONTH COOLDOWN COUNTDOWN */}
                        <div className="mt-3">
                          {donor.isAvailable ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-900">
                              <span className="font-bold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                                Ready to Donate Now
                              </span>
                              <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Available
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="mb-1 text-[11px] font-bold text-amber-800 flex items-center justify-between">
                                <span>Recently Donated (3-Month Rest)</span>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Resting</span>
                              </div>
                              <CountdownBadge targetDate={donor.nextEligibleDate} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTION BUTTONS (Direct Call, WhatsApp, Email) */}
                      <div className="p-3.5 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2">
                        <a
                          href={`tel:${donor.contact}`}
                          className="btn btn-sm flex-1 min-w-0 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Call {donor.contact}</span>
                        </a>

                        <a
                          href={`https://wa.me/88${donor.contact}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-full text-xs font-bold px-3"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {donor.email && (
                          <a
                            href={`mailto:${donor.email}?subject=Blood Request for ${donor.group}`}
                            className="btn btn-sm btn-ghost text-zinc-600 hover:text-red-600 rounded-full px-2.5"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDonar;
