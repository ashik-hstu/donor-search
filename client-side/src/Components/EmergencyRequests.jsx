import { useState, useEffect, useContext, useRef } from "react";
import { AdminContext } from "../context/AdminContext";
import { BANGLADESH_HOSPITALS, BLOOD_GROUPS, BANGLADESH_DISTRICTS } from "../data/hospitals";
import { useCountdown } from "../hooks/useCountdown";
import {
  AlertCircle,
  PlusCircle,
  Building2,
  MapPin,
  Phone,
  Clock,
  Droplet,
  Heart,
  Share2,
  X,
  Send,
  Timer,
  Trash2,
} from "lucide-react";

// Live Countdown Badge for each Emergency Request (auto self-delete timer)
function RequestCountdown({ expiresAt, onExpire }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(expiresAt);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (isExpired && !triggeredRef.current) {
      triggeredRef.current = true;
      if (onExpire) {
        onExpire();
      }
    }
  }, [isExpired, onExpire]);

  if (isExpired || !expiresAt) {
    return null;
  }

  return (
    <div className="bg-red-50/80 border border-red-200/80 rounded-lg p-2.5 flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 font-bold text-red-800">
        <Clock className="w-3.5 h-3.5 text-red-600" />
        Self-Deletes In:
      </span>
      <span className="tabular-nums font-bold text-red-950 bg-white px-2 py-0.5 rounded border border-red-200">
        {hours + days * 24}h : {minutes}m : <span className="text-red-600">{seconds}s</span>
      </span>
    </div>
  );
}

export default function EmergencyRequests() {
  const { showToast } = useContext(AdminContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Active board filter (Default Rangpur district, Dinajpur city as requested)
  const [selectedDistrict, setSelectedDistrict] = useState("Rangpur");
  const [selectedCity, setSelectedCity] = useState("Dinajpur");

  // New Request Form state (Default 12 hours auto-delete, District -> City -> Area)
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "O+",
    unitsNeeded: 1,
    district: "Rangpur",
    city: "Dinajpur",
    area: "Basher Hut, Dinajpur Sadar",
    hospital: "Dinajpur Sadar Hospital (250 Bed General Hospital)",
    location: "Basher Hut, Dinajpur Sadar, Dinajpur",
    contact: "",
    hoursValid: 12,
    notes: "",
  });

  const handleModalDistrictChange = (distName) => {
    const distObj = BANGLADESH_DISTRICTS.find((d) => d.name === distName);
    const firstCity = distName === "Rangpur" ? "Dinajpur" : (distObj?.cities[0] || "");
    setFormData((prev) => ({
      ...prev,
      district: distName,
      city: firstCity,
      location: `${prev.area ? prev.area + ", " : ""}${firstCity}, ${distName}`,
    }));
  };

  const handleModalCityChange = (cityName) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      location: `${prev.area ? prev.area + ", " : ""}${cityName}, ${prev.district}`,
    }));
  };

  const handleModalAreaChange = (areaVal) => {
    setFormData((prev) => ({
      ...prev,
      area: areaVal,
      location: `${areaVal ? areaVal + ", " : ""}${prev.city}, ${prev.district}`,
    }));
  };

  const handleDistrictBoxClick = (distName) => {
    setSelectedDistrict(distName);
    const distObj = BANGLADESH_DISTRICTS.find((d) => d.name === distName);
    if (distName === "Rangpur") {
      setSelectedCity("Dinajpur");
    } else {
      setSelectedCity(distObj?.cities[0] || "");
    }
  };

  const handleCityBoxClick = (cityName) => {
    setSelectedCity(cityName);
  };

  // Fetch requests without whole-page blinking
  const fetchRequests = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch("http://localhost:3000/api/requests");
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(true);
    // Silent periodic refresh every 30s
    const interval = setInterval(() => fetchRequests(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          urgency: `Within ${formData.hoursValid} Hours`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          `Emergency request broadcasted! It will automatically expire and delete itself after ${formData.hoursValid} hours.`,
          "success"
        );
        setShowModal(false);
        fetchRequests();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit emergency request.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800">
          <div className="space-y-2">
            <div className="section-label dark">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              Live SOS Broadcast (Auto-Cleaning)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Emergency Patient Blood Noticeboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Urgent transfusions needed in Dinajpur Sadar, Dhaka, and nationwide. Notices auto-purge when their time window expires.
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-roktika !min-h-0 !py-3 !px-5 !text-xs sm:!text-sm"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="btn-label">Post Urgent Need</span>
              <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
            </button>
          </div>
        </div>

        {(() => {
          const activeRequests = requests.filter((r) => {
            if (!r.expiresAt) return true;
            return new Date(r.expiresAt).getTime() > Date.now();
          });

          const getDistrictCount = (distName) => {
            const dLower = distName.toLowerCase();
            return activeRequests.filter((r) => {
              const rDist = (r.district || "").toLowerCase();
              const rLoc = (r.location || "").toLowerCase();
              return rDist === dLower || rLoc.includes(dLower);
            }).length;
          };

          const getCityCount = (distName, cityName) => {
            const cLower = cityName.toLowerCase();
            const dLower = distName.toLowerCase();
            return activeRequests.filter((r) => {
              const rDist = (r.district || "").toLowerCase();
              const rCity = (r.city || "").toLowerCase();
              const rLoc = (r.location || "").toLowerCase();
              const rHosp = (r.hospital || "").toLowerCase();

              const distMatches = rDist === dLower || rLoc.includes(dLower);
              const cityMatches = rCity === cLower || rLoc.includes(cLower) || rHosp.includes(cLower);
              return distMatches && cityMatches;
            }).length;
          };

          // Filter by selectedDistrict & selectedCity (Default: Rangpur & Dinajpur)
          const filteredRequests = activeRequests.filter((r) => {
            const rDist = (r.district || "").toLowerCase();
            const rCity = (r.city || "").toLowerCase();
            const rLoc = (r.location || "").toLowerCase();
            const rHosp = (r.hospital || "").toLowerCase();

            const selDist = selectedDistrict.toLowerCase();
            const selCity = selectedCity.toLowerCase();

            const distMatches = rDist === selDist || rLoc.includes(selDist);
            const cityMatches = rCity === selCity || rLoc.includes(selCity) || rHosp.includes(selCity);

            return distMatches && cityMatches;
          });

          return (
            <div className="space-y-6">
              {/* 1. 8 BOXES CONTAINING 8 DISTRICTS */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    1. Select District (8 Administrative Regions)
                  </h2>
                  <span className="text-xs text-gray-500">
                    Active District: <strong className="text-red-600 font-bold">{selectedDistrict}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
                  {BANGLADESH_DISTRICTS.map((dist) => {
                    const isSelected = selectedDistrict === dist.name;
                    const dCount = getDistrictCount(dist.name);

                    return (
                      <div
                        key={dist.name}
                        onClick={() => handleDistrictBoxClick(dist.name)}
                        className={`cursor-pointer rounded-2xl p-3 text-center transition-colors duration-150 select-none ${
                          isSelected
                            ? "bg-red-600 text-white border-2 border-red-700 ring-2 ring-red-200"
                            : "bg-white text-zinc-900 border border-zinc-200 hover:border-red-300 hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`block text-xs sm:text-sm font-bold truncate ${
                            isSelected ? "text-white" : "text-zinc-900"
                          }`}
                        >
                          {dist.name}
                        </span>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : dCount > 0
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {dCount} {dCount === 1 ? "Notice" : "Notices"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. CITIES UNDER SELECTED DISTRICT (In Boxes with Outer Border as requested) */}
              <div className="border border-zinc-200 bg-white rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900">
                      2. Select City under {selectedDistrict} District:
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Click any city box to filter (Default: <strong className="text-red-600">Dinajpur</strong>)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {(BANGLADESH_DISTRICTS.find((d) => d.name === selectedDistrict)?.cities || []).map(
                    (cityName) => {
                      const isCitySelected = selectedCity === cityName;
                      const cCount = getCityCount(selectedDistrict, cityName);

                      return (
                        <div
                          key={cityName}
                          onClick={() => handleCityBoxClick(cityName)}
                          className={`cursor-pointer rounded-xl p-2.5 text-center border transition-colors duration-150 select-none ${
                            isCitySelected
                              ? "border-red-600 bg-red-50 text-red-900 font-bold"
                              : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 text-zinc-700 hover:bg-white"
                          }`}
                        >
                          <span className="block text-xs font-bold truncate">
                            {cityName}
                          </span>
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isCitySelected
                                ? "bg-red-600 text-white"
                                : cCount > 0
                                ? "bg-red-100 text-red-700"
                                : "bg-zinc-200 text-zinc-600"
                            }`}
                          >
                            {cCount} Active
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* 3. ACTIVE AREA NOTICES HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200">
                <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                  <span className="font-extrabold text-zinc-900">
                    Showing Emergency Notices in:
                  </span>
                  <span className="bg-red-100 text-red-700 font-extrabold px-2.5 py-1 rounded-full border border-red-200">
                    {selectedDistrict} &gt; {selectedCity}
                  </span>
                  <span className="text-zinc-500 font-medium">
                    ({filteredRequests.length} Active Urgent Request{filteredRequests.length !== 1 ? "s" : ""})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        district: selectedDistrict,
                        city: selectedCity,
                        location: `${prev.area ? prev.area + ", " : ""}${selectedCity}, ${selectedDistrict}`,
                      }));
                      setShowModal(true);
                    }}
                    className="btn btn-xs sm:btn-sm bg-red-600 hover:bg-red-700 text-white rounded-full font-bold gap-1 px-4"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Post Urgent Need in {selectedCity}
                  </button>
                </div>
              </div>

              {/* 4. EMERGENCY REQUESTS CARDS OR EMPTY STATE */}
              {loading ? (
                <div className="py-20 text-center">
                  <span className="loading loading-spinner loading-lg text-red-600"></span>
                  <p className="text-xs text-zinc-400 mt-2">Loading urgent requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-12 text-center max-w-md mx-auto">
                  <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-zinc-800">
                    No Active Requests in {selectedCity}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Currently there are no unfulfilled urgent blood requests in {selectedCity}, {selectedDistrict}.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          district: selectedDistrict,
                          city: selectedCity,
                          location: `${prev.area ? prev.area + ", " : ""}${selectedCity}, ${selectedDistrict}`,
                        }));
                        setShowModal(true);
                      }}
                      className="btn btn-xs sm:btn-sm bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-4"
                    >
                      Post Blood Request in {selectedCity}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors duration-150 p-5 flex flex-col justify-between"
                    >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl bg-red-600 text-white font-black text-xl flex items-center justify-center shrink-0 notranslate"
                          translate="no"
                        >
                          {req.bloodGroup}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                            {req.patientName}
                          </h4>
                          <span className="inline-block mt-0.5 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                            {req.unitsNeeded} Bag{req.unitsNeeded > 1 ? "s" : ""} Needed
                          </span>
                        </div>
                      </div>

                      <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {req.hoursValid ? `Within ${req.hoursValid} Hours` : req.urgency}
                      </span>
                    </div>

                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/60 space-y-1.5 text-xs text-zinc-700 mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-semibold text-zinc-900">{req.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{req.location}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-zinc-600 italic bg-red-50/50 p-2.5 rounded-xl mb-3 border border-red-100">
                        "{req.notes}"
                      </p>
                    )}

                    {/* LIVE AUTO-DELETE EXPIRY COUNTDOWN TIMER (User Request) */}
                    <div className="mb-3">
                      <RequestCountdown expiresAt={req.expiresAt} onExpire={fetchRequests} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                    <a
                      href={`tel:${req.contact}`}
                      className="btn btn-sm flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call {req.contact}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })()}
      </div>

      {/* POST REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Post Urgent Blood Need</h3>
                <p className="text-xs text-zinc-500">
                  Alert nearby donors immediately (Auto-purges after selected time)
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-xs btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) =>
                      setFormData({ ...formData, patientName: e.target.value })
                    }
                    placeholder="e.g. Asaduzzaman"
                    required
                    className="input input-sm input-bordered w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Blood Group Required <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value })
                    }
                    className="select select-sm select-bordered w-full rounded-xl font-bold text-red-600 notranslate"
                    translate="no"
                  >
                    {BLOOD_GROUPS.map((grp) => (
                      <option key={grp} value={grp} className="notranslate" translate="no">
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Units / Bags Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.unitsNeeded}
                    onChange={(e) =>
                      setFormData({ ...formData, unitsNeeded: Number(e.target.value) })
                    }
                    className="input input-sm input-bordered w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    required
                    className="input input-sm input-bordered w-full rounded-xl"
                  />
                </div>
              </div>

              {/* District & City Separately, then Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    District / Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleModalDistrictChange(e.target.value)}
                    className="select select-sm select-bordered w-full rounded-xl font-bold text-zinc-800"
                    required
                  >
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist.name} value={dist.name}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    City / Upazila <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleModalCityChange(e.target.value)}
                    className="select select-sm select-bordered w-full rounded-xl font-bold text-zinc-800"
                    required
                  >
                    {(BANGLADESH_DISTRICTS.find((d) => d.name === formData.district)?.cities || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Specific Area / Street <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleModalAreaChange(e.target.value)}
                  placeholder="e.g. Basher Hut, Dinajpur Sadar"
                  required
                  className="input input-sm input-bordered w-full rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Hospital Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="select select-sm select-bordered w-full rounded-xl"
                  required
                >
                  {BANGLADESH_HOSPITALS.map((hosp) => (
                    <option key={hosp.name} value={hosp.name}>
                      {hosp.name} ({hosp.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* AUTO-DELETE / EXPIRY HOURS SELECTION (User Request) */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Auto-Delete Time Window (Hours Needed) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hoursValid}
                  onChange={(e) =>
                    setFormData({ ...formData, hoursValid: Number(e.target.value) })
                  }
                  className="select select-sm select-bordered w-full rounded-xl font-bold text-red-600"
                >
                  <option value={2}>Within 2 Hours</option>
                  <option value={6}>Within 6 Hours</option>
                  <option value={12}>Within 12 Hours</option>
                  <option value={24}>Within 24 Hours</option>
                  <option value={48}>Within 48 Hours</option>
                </select>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  The request will display a live countdown timer and delete itself after this time so old requests never pile up.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Medical Notes / Special Instructions
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Emergency surgery at Basher Hut, Dinajpur Sadar Hospital ward 4"
                  className="input input-sm input-bordered w-full rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm btn-ghost text-xs rounded-full px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold gap-1 px-5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
