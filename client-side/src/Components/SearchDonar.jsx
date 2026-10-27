import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import CountdownBadge from "./CountdownBadge";
import { BANGLADESH_HOSPITALS, BLOOD_GROUPS, BANGLADESH_DISTRICTS } from "../data/hospitals";
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
} from "lucide-react";

const SearchDonar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlGroup = searchParams.get("group") || "";

  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter states (District & City separately, then Address Area & Hospital)
  const [selectedGroup, setSelectedGroup] = useState(urlGroup);
  const [selectedDistrict, setSelectedDistrict] = useState("Rangpur");
  const [selectedCity, setSelectedCity] = useState("Dinajpur");
  const [searchArea, setSearchArea] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");

  // ONLY show donor profiles AFTER the user actively clicks "Search Donors"
  const [hasSearched, setHasSearched] = useState(false);

  // Executed search criteria (frozen when user clicks Search)
  const [activeSearch, setActiveSearch] = useState({
    group: "",
    district: "Rangpur",
    city: "Dinajpur",
    area: "",
    hospital: "",
  });

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    const distObj = BANGLADESH_DISTRICTS.find((d) => d.name === dist);
    setSelectedCity(distObj?.cities[0] || "");
  };

  // Load stats and donors from server
  const fetchDonorsAndStats = async () => {
    try {
      setLoading(true);

      const [statsRes, donorsRes] = await Promise.all([
        fetch("http://localhost:3000/api/donors/stats"),
        fetch("http://localhost:3000/api/donors"),
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

  // When clicking a blood group box, ONLY select that blood group in the form
  // DO NOT show donor profiles yet until user clicks "Search Donors"
  const handleGroupSelect = (group) => {
    if (selectedGroup === group) {
      setSelectedGroup("");
      searchParams.delete("group");
      setSearchParams(searchParams);
    } else {
      setSelectedGroup(group);
      searchParams.set("group", group);
      setSearchParams(searchParams);
    }
    // Note: hasSearched is NOT set to true here!
    // The user must click the "Search Donors" button to trigger profile rendering.
  };

  // Trigger search ONLY on form submit / clicking "Search Donors"
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    setActiveSearch({
      group: selectedGroup,
      district: selectedDistrict,
      city: selectedCity,
      area: searchArea.trim(),
      hospital: selectedHospital,
    });
    setHasSearched(true);
  };

  // Clear search and reset back to clean state
  const handleClearSearch = () => {
    setSelectedGroup("");
    setSelectedDistrict("Rangpur");
    setSelectedCity("Dinajpur");
    setSearchArea("");
    setSelectedHospital("");
    setHasSearched(false);
    setActiveSearch({
      group: "",
      district: "Rangpur",
      city: "Dinajpur",
      area: "",
      hospital: "",
    });
    searchParams.delete("group");
    setSearchParams(searchParams);
  };

  // Intelligent Search Matching Algorithm with Prioritization:
  // 1. Blood group match
  // 2. Same District + Same City + Address Area Match + Hospital Match
  // 3. Same District + Same City + Address Area Match
  // 4. Same District + Same City + Hospital Match
  // 5. Same District + Same City
  // 6. Same District (nearby city fallback)
  // 7. Hospital vicinity fallback
  const computeSearchResults = () => {
    if (!hasSearched) return { results: [], fallbackUsed: false };

    const searchGrp = activeSearch.group;
    const searchDist = (activeSearch.district || "").toLowerCase();
    const searchCity = (activeSearch.city || "").toLowerCase();
    const searchAddr = (activeSearch.area || "").toLowerCase();
    const searchHosp = activeSearch.hospital;

    const hospitalObj = BANGLADESH_HOSPITALS.find((h) => h.name === searchHosp);
    const hospDistrict = (hospitalObj?.district || "").toLowerCase();
    const hospArea = (hospitalObj?.area || "").toLowerCase();

    // 1. Filter by Blood Group first (if selected)
    const groupMatches = donors.filter((d) => {
      if (searchGrp && d.group !== searchGrp) return false;
      return true;
    });

    const tier1 = []; // Same District + Same City + Area Match + Hospital Match
    const tier2 = []; // Same District + Same City + Area Match
    const tier3 = []; // Same District + Same City + Hospital Match
    const tier4 = []; // Same District + Same City
    const tier5 = []; // Same District, nearby cities
    const tier6 = []; // Hospital match anywhere

    groupMatches.forEach((donor) => {
      const donorLoc = (donor.location || "").toLowerCase();
      const donorDist = (donor.district || "").toLowerCase();
      const donorCity = (donor.city || "").toLowerCase();
      const donorHosp = (donor.hospital || "").toLowerCase();

      const distMatches = searchDist ? donorDist === searchDist || donorLoc.includes(searchDist) : true;
      const cityMatches = searchCity ? donorCity === searchCity || donorLoc.includes(searchCity) : true;
      const addrMatches = searchAddr ? donorLoc.includes(searchAddr) : false;
      const hospMatches = searchHosp
        ? donorHosp.includes(searchHosp.toLowerCase()) ||
          (hospDistrict && (donorLoc.includes(hospDistrict) || donorDist.includes(hospDistrict))) ||
          (hospArea && donorLoc.includes(hospArea))
        : false;

      if (distMatches && cityMatches) {
        if (searchAddr && addrMatches && searchHosp && hospMatches) {
          tier1.push({ ...donor, matchType: `Exact Area & Hospital Match in ${donor.city || activeSearch.city}` });
        } else if (searchAddr && addrMatches) {
          tier2.push({ ...donor, matchType: `Exact Area Match in ${donor.city || activeSearch.city}` });
        } else if (searchHosp && hospMatches) {
          tier3.push({ ...donor, matchType: `Hospital Vicinity Match (${donor.hospital || searchHosp})` });
        } else {
          tier4.push({ ...donor, matchType: `City Match in ${donor.city || activeSearch.city}` });
        }
      } else if (distMatches) {
        tier5.push({ ...donor, matchType: `District Match (${donor.district || activeSearch.district})` });
      } else if (searchHosp && hospMatches) {
        tier6.push({ ...donor, matchType: `Hospital Match (${searchHosp})` });
      } else if (!searchDist && !searchCity && !searchAddr && !searchHosp) {
        tier4.push({ ...donor, matchType: `Blood Group ${donor.group} Match` });
      }
    });

    let combined = [];
    let fallbackUsed = false;

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
    } else if (tier6.length > 0) {
      combined = tier6;
      fallbackUsed = true;
    }

    return { results: combined, fallbackUsed };
  };

  const { results: relevantDonors, fallbackUsed } = computeSearchResults();

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

        {/* 1. BLOOD GROUP SELECTOR */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
              1. Choose Blood Group
            </h2>
            {selectedGroup && (
              <button
                type="button"
                onClick={() => handleGroupSelect(selectedGroup)}
                className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50 text-xs font-bold gap-1 rounded-full"
              >
                <X className="w-3 h-3" /> Deselect {selectedGroup}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {BLOOD_GROUPS.map((grp) => {
              const grpStat = stats.find((s) => s.group === grp) || {
                total: 0,
                available: 0,
              };
              const isSelected = selectedGroup === grp;

              return (
                <div
                  key={grp}
                  onClick={() => handleGroupSelect(grp)}
                  className={`relative cursor-pointer rounded-2xl p-3.5 text-center transition-colors duration-150 select-none ${
                    isSelected
                      ? "bg-red-600 text-white border-2 border-red-700 ring-2 ring-red-200"
                      : "bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-red-400"
                  }`}
                >
                  {/* Blood Group Badge */}
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={`notranslate text-2xl sm:text-3xl font-black tracking-tight ${
                        isSelected ? "text-white" : "text-zinc-900"
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
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SEARCH FORM */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-red-600" />
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900">
                2. Select District, City, Address &amp; Hospital
              </h2>
            </div>
            {hasSearched && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn btn-xs btn-ghost text-red-600 text-xs font-bold rounded-full"
              >
                Reset Search
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. District Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                District / Division <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-600 absolute left-3 top-3.5" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="select select-bordered w-full pl-9 rounded-xl text-xs sm:text-sm font-bold text-zinc-800"
                >
                  {BANGLADESH_DISTRICTS.map((dist) => (
                    <option key={dist.name} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. City Selection under selected District */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                City / Sub-District <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-red-600 absolute left-3 top-3.5" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="select select-bordered w-full pl-9 rounded-xl text-xs sm:text-sm font-bold text-zinc-800"
                >
                  {(BANGLADESH_DISTRICTS.find((d) => d.name === selectedDistrict)?.cities || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Specific Area / Street Address (Optional) */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Area / Street (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                  placeholder="e.g. Basher Hut, Sadar..."
                  className="input input-bordered w-full pl-9 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* 4. Nearby Hospital (Optional) */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Nearby Hospital (Optional)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="select select-bordered w-full pl-9 rounded-xl text-xs sm:text-sm"
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

          {/* Action & Scope Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-100">
            <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-zinc-700">Search scope:</span>
              <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
                {selectedGroup ? `Blood: ${selectedGroup}` : "All Blood Groups"}
              </span>
              <span>•</span>
              <span className="font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                {selectedDistrict} &gt; {selectedCity}
              </span>
              {searchArea && <span>• Area: {searchArea}</span>}
              {selectedHospital && <span>• Hospital: {selectedHospital}</span>}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasSearched && (
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
            </div>
          </div>
        </form>

        {/* RESULTS SECTION: BEFORE SEARCH = NOTHING / PROMPT; AFTER SEARCH = RELEVANT DONORS ONLY */}
        {loading ? (
          <div className="py-20 text-center">
            <span className="loading loading-spinner loading-lg text-red-600"></span>
            <p className="text-xs text-zinc-400 mt-2">Connecting to verified donor registry...</p>
          </div>
        ) : !hasSearched ? (
          /* BEFORE SEARCH: ZERO PROFILES SHOWN! */
          <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-12 sm:p-16 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">Ready to Find Blood Donors</h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
              No donor information is shown until you search. Select your <strong>Blood Group</strong> above, enter your <strong>Address Area</strong> or <strong>Nearby Hospital</strong>, and click <strong>"Search Donors"</strong>.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup("O+");
                  setSelectedDistrict("Rangpur");
                  setSelectedCity("Dinajpur");
                  setSearchArea("Basher Hut, Dinajpur Sadar");
                  setActiveSearch({
                    group: "O+",
                    district: "Rangpur",
                    city: "Dinajpur",
                    area: "Basher Hut, Dinajpur Sadar",
                    hospital: "",
                  });
                  setHasSearched(true);
                }}
                className="btn btn-sm btn-outline border-red-200 text-red-700 hover:bg-red-600 hover:text-white rounded-full text-xs font-bold px-4"
              >
                Try: O+ in Basher Hut, Dinajpur Sadar, Dinajpur
              </button>
            </div>
          </div>
        ) : (
          /* AFTER SEARCH: SHOW RELEVANT DONORS ONLY (BOTH AVAILABLE AND ON COOLDOWN) */
          <div className="space-y-6">
            {/* Search Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="font-bold text-zinc-900">
                  Search Results: {relevantDonors.length} matching donor{relevantDonors.length !== 1 ? "s" : ""}
                </span>
                {activeSearch.group && (
                  <span className="bg-red-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                    Group: {activeSearch.group}
                  </span>
                )}
                {activeSearch.district && (
                  <span className="bg-zinc-900 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {activeSearch.district} &gt; {activeSearch.city}
                  </span>
                )}
                {activeSearch.area && (
                  <span className="border border-zinc-300 text-zinc-700 text-xs px-2.5 py-0.5 rounded-full">
                    Area: {activeSearch.area}
                  </span>
                )}
                {activeSearch.hospital && (
                  <span className="border border-blue-200 text-blue-700 bg-blue-50 text-xs px-2.5 py-0.5 rounded-full truncate max-w-[220px]">
                    Hospital: {activeSearch.hospital}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {relevantDonors.filter((d) => d.isAvailable).length} Ready •{" "}
                  {relevantDonors.filter((d) => !d.isAvailable).length} On Cooldown
                </span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50 text-xs font-bold rounded-full px-3"
                >
                  Clear Results
                </button>
              </div>
            </div>

            {/* HOSPITAL FALLBACK NOTICE IF AREA HAD NO DONORS BUT HOSPITAL DID */}
            {fallbackUsed && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Hospital Proximity Match Applied:</span>
                  No donors were listed directly in <em>"{activeSearch.location}"</em>, but we successfully matched nearby donors located in the vicinity of{" "}
                  <strong>{activeSearch.hospital}</strong>.
                </div>
              </div>
            )}

            {/* Zero matching results */}
            {relevantDonors.length === 0 ? (
              <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center max-w-md mx-auto">
                <Droplet className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-zinc-900">No Matching Donors Found</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  No verified donors matched this blood group and location. Try selecting a nearby government hospital to find regional donors.
                </p>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn btn-sm btn-outline btn-error mt-4 rounded-full text-xs font-bold px-4"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              /* RELEVANT DONORS CARDS GRID (BOTH AVAILABLE & NOT AVAILABLE) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {relevantDonors.map((donor) => (
                  <div
                    key={donor._id}
                    className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors duration-150 overflow-hidden flex flex-col justify-between"
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
                        className="btn btn-sm flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call {donor.contact}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDonar;
