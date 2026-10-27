import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import { AdminContext } from "../context/AdminContext";
import { BANGLADESH_HOSPITALS, BLOOD_GROUPS, POPULAR_LOCATIONS, BANGLADESH_DISTRICTS } from "../data/hospitals";
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  Upload,
  AlertTriangle,
  User,
  Heart,
  Droplet,
  Info,
  Building2,
  Lock,
  Eye,
  EyeOff,
  History,
  Calendar,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

const DonarForm = () => {
  const { loginDonor, showToast } = useContext(AdminContext);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    group: "",
    dob: "",
    gender: "Male",
    weight: "",
    district: "Rangpur",
    city: "Dinajpur",
    areaAddress: "Basher Hut, Dinajpur Sadar",
    location: "Basher Hut, Dinajpur Sadar, Dinajpur",
    hospital: "Dinajpur Sadar Hospital (250 Bed General Hospital)",
    nid: "",
    smoking: false,
    drinking: false,
    bloodAllergy: false,
    allergyDetails: "",
    hivTest: true,
    hepatitisTest: true,
    recentTattooOrSurgery: false,
    chronicDisease: false,
    diseaseDetails: "",
    hasDonatedBefore: false,
    lastDonationDate: "",
    previousDonationCount: 0,
  });

  const handleDistrictChange = (selectedDistrict) => {
    const distObj = BANGLADESH_DISTRICTS.find((d) => d.name === selectedDistrict);
    const newCity = distObj?.cities[0] || "";
    setFormData((prev) => ({
      ...prev,
      district: selectedDistrict,
      city: newCity,
      location: `${prev.areaAddress ? prev.areaAddress + ", " : ""}${newCity}, ${selectedDistrict}`,
    }));
  };

  const handleCityChange = (selectedCity) => {
    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      location: `${prev.areaAddress ? prev.areaAddress + ", " : ""}${selectedCity}, ${prev.district}`,
    }));
  };

  const handleAreaAddressChange = (addr) => {
    setFormData((prev) => ({
      ...prev,
      areaAddress: addr,
      location: `${addr ? addr + ", " : ""}${prev.city}, ${prev.district}`,
    }));
  };

  // Seen capacity for password
  const [showPassword, setShowPassword] = useState(false);

  // Images state (base64)
  const [nidPhoto, setNidPhoto] = useState(null);
  const [testReportPhoto, setTestReportPhoto] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [ageWarning, setAgeWarning] = useState(null);
  const [calculatedAge, setCalculatedAge] = useState(null);

  // Helper to calculate age from DOB
  const handleDobChange = (e) => {
    const dobValue = e.target.value;
    setFormData((prev) => ({ ...prev, dob: dobValue }));

    if (!dobValue) {
      setCalculatedAge(null);
      setAgeWarning(null);
      return;
    }

    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setCalculatedAge(age);

    if (age < 18) {
      setAgeWarning(
        `Underage Warning: You are ${age} years old. Medical regulation requires blood donors to be at least 18 years old.`
      );
    } else {
      setAgeWarning(null);
    }
  };

  // Convert uploaded image file to Base64
  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("File size exceeds 8MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calculatedAge !== null && calculatedAge < 18) {
      alert("Qualification check failed: You must be at least 18 years old to apply.");
      return;
    }

    if (!formData.group) {
      alert("Please select your blood group.");
      return;
    }

    if (!nidPhoto) {
      alert("Please upload your NID document scan / photo.");
      return;
    }

    if (!testReportPhoto) {
      alert(
        "Mandatory requirement: Please upload your Medical Test Result photo. All required tests (HIV, Hepatitis B/C, Syphilis, Malaria, Hemoglobin) must be consolidated on one page."
      );
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      age: calculatedAge || 20,
      photo: profilePhoto,
      nidPhoto: nidPhoto,
      testReportPhotos: testReportPhoto ? [testReportPhoto] : [],
      lastDonationDate: formData.hasDonatedBefore ? formData.lastDonationDate : null,
      previousDonationCount: formData.hasDonatedBefore ? Number(formData.previousDonationCount) || 1 : 0,
    };

    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showToast("Application submitted! Placed on Pending Review for admin approval.", "success");
        loginDonor(data.donor);
        navigate("/donorPortal");
      } else {
        alert(data.message || "Failed to submit registration");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-3">
            <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600" />
            Official Donor Candidate Registration
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Apply to Become a Verified Blood Donor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto">
            To ensure patient safety, all donor candidates undergo age verification, health qualification checks, and document review before approval.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 text-left max-w-xl mx-auto">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Approval Notice:</span> New registrations are placed on{" "}
              <span className="badge badge-warning badge-sm font-bold">Pending Review</span>. You can track, preview, and resubmit documents up to 3 times in your Donor Portal.
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden">
          {/* STEP 1: Basic Information */}
          <div className="p-6 sm:p-8 border-b border-zinc-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-md bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900">Personal &amp; Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Rakib Hasan"
                  required
                  className="input input-bordered w-full rounded-lg focus:border-red-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. donor@gmail.com"
                  required
                  className="input input-bordered w-full rounded-xl focus:border-red-500"
                />
              </div>

              {/* Contact / Phone */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Contact / WhatsApp (11 Digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  pattern="[0-9]{11}"
                  maxLength={11}
                  placeholder="01XXXXXXXXX"
                  required
                  className="input input-bordered w-full rounded-lg focus:border-red-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Format: 01711223344</span>
              </div>

              {/* Password with Seen / Visibility Toggle */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Portal Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength={6}
                    placeholder="At least 6 characters"
                    required
                    className="input input-bordered w-full rounded-lg pr-10 focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-zinc-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  required
                  className="select select-bordered w-full rounded-xl font-bold text-red-600 focus:border-red-500 notranslate"
                  translate="no"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp} className="notranslate" translate="no">
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-lg"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: Qualification & Age Check */}
          <div className="p-6 sm:p-8 border-b border-zinc-100 bg-red-50/20">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-md bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                Mandatory Qualification Check (Age 18+ &amp; Weight)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
              {/* Date of Birth & Live Age calculation */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Date of Birth (Must be 18+) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleDobChange}
                  required
                  className="input input-bordered w-full rounded-lg focus:border-red-500"
                />
                {calculatedAge !== null && (
                  <div className="mt-2 text-xs font-semibold flex items-center gap-1.5">
                    {calculatedAge >= 18 ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Qualified: Age is {calculatedAge} years old (Eligible 18+)
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Disqualified: Age is {calculatedAge} years old (Must be 18+)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Body Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min={45}
                  max={200}
                  placeholder="Minimum 45 kg (e.g. 60)"
                  required
                  className="input input-bordered w-full rounded-xl focus:border-red-500"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  International standard: Donors must weigh at least 45 - 50 kg.
                </span>
              </div>
            </div>

            {/* Age Warning banner if underage */}
            {ageWarning && (
              <div className="p-4 bg-red-100 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Age Restriction Error:</span> {ageWarning}
                </div>
              </div>
            )}

            {/* Previous Blood Donation History (User Request) */}
            <div className="mt-4 pt-4 border-t border-red-200/60">
              <label className="cursor-pointer label p-3.5 bg-white rounded-lg border border-red-200 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-bold text-sm text-zinc-900 block">
                      Have you donated blood before?
                    </span>
                    <span className="text-xs text-zinc-500">
                      Check this if you have previously donated whole blood or platelets.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="hasDonatedBefore"
                  checked={formData.hasDonatedBefore}
                  onChange={handleInputChange}
                  className="checkbox checkbox-error"
                />
              </label>

              {formData.hasDonatedBefore && (
                <div className="bg-white p-4 rounded-lg border border-red-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Previous / Last Blood Donation Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="lastDonationDate"
                        value={formData.lastDonationDate}
                        onChange={handleInputChange}
                        required={formData.hasDonatedBefore}
                        className="input input-bordered w-full rounded-lg text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Total Previous Donations
                      </label>
                      <input
                        type="number"
                        name="previousDonationCount"
                        min={1}
                        max={100}
                        value={formData.previousDonationCount || 1}
                        onChange={handleInputChange}
                        placeholder="e.g. 1, 3, 5"
                        className="input input-bordered w-full rounded-xl text-xs sm:text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Medical Cooldown Protocol:</strong> If your previous donation was <strong>more than 90 days ago</strong>, you will be marked <em>Ready to Donate</em> immediately upon admin approval. If it was <strong>less than 90 days ago</strong>, your remaining cooldown countdown timer will be calculated automatically.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: Medical Records & Bad Habits */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h2 className="text-xl font-bold text-gray-900">Medical Record & Habits Screening</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Smoking */}
                <label className="cursor-pointer label p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-gray-800 block">Smoking Habits</span>
                    <span className="text-xs text-gray-500">Do you smoke cigarettes or tobacco?</span>
                  </div>
                  <input
                    type="checkbox"
                    name="smoking"
                    checked={formData.smoking}
                    onChange={handleInputChange}
                    className="toggle toggle-error"
                  />
                </label>

                {/* Drinking */}
                <label className="cursor-pointer label p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-gray-800 block">Drinking / Alcohol</span>
                    <span className="text-xs text-gray-500">Do you consume alcohol regularly?</span>
                  </div>
                  <input
                    type="checkbox"
                    name="drinking"
                    checked={formData.drinking}
                    onChange={handleInputChange}
                    className="toggle toggle-error"
                  />
                </label>

                {/* Blood Allergy */}
                <label className="cursor-pointer label p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-gray-800 block">Blood Allergy / Asthma</span>
                    <span className="text-xs text-gray-500">Any active blood disorder or allergies?</span>
                  </div>
                  <input
                    type="checkbox"
                    name="bloodAllergy"
                    checked={formData.bloodAllergy}
                    onChange={handleInputChange}
                    className="toggle toggle-error"
                  />
                </label>

                {/* Recent Tattoo or Surgery */}
                <label className="cursor-pointer label p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-gray-800 block">Recent Tattoo / Piercing / Surgery</span>
                    <span className="text-xs text-gray-500">Within the last 6 months</span>
                  </div>
                  <input
                    type="checkbox"
                    name="recentTattooOrSurgery"
                    checked={formData.recentTattooOrSurgery}
                    onChange={handleInputChange}
                    className="toggle toggle-error"
                  />
                </label>
              </div>

              {/* Allergy / Chronic details if checked */}
              {formData.bloodAllergy && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Describe Allergy / Condition Details
                  </label>
                  <input
                    type="text"
                    name="allergyDetails"
                    value={formData.allergyDetails}
                    onChange={handleInputChange}
                    placeholder="e.g. Mild seasonal allergy, non-medicated"
                    className="input input-bordered w-full rounded-xl text-sm"
                  />
                </div>
              )}

              {/* Lab Screening confirmations */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-3">
                <span className="text-xs font-bold text-emerald-800 block">
                  Pathology Confirmations (Mandatory for Transfusion Safety)
                </span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hivTest"
                      checked={formData.hivTest}
                      onChange={handleInputChange}
                      className="checkbox checkbox-success checkbox-sm"
                    />
                    <span>I confirm I am tested HIV Negative</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hepatitisTest"
                      checked={formData.hepatitisTest}
                      onChange={handleInputChange}
                      className="checkbox checkbox-success checkbox-sm"
                    />
                    <span>I confirm I am tested Hepatitis B/C Negative</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Document Uploads & Pictures */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                4
              </span>
              <h2 className="text-xl font-bold text-gray-900">
                Document Uploads & Verification Evidence
              </h2>
            </div>

            {/* Medical Test Instructions Box */}
            <div className="mb-6 bg-blue-50/70 border border-blue-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                      Required Medical Screening Tests
                      <span className="badge badge-error badge-xs text-white font-bold">Mandatory</span>
                    </h3>
                    <span className="text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      All tests must be in ONE single page
                    </span>
                  </div>

                  <p className="text-xs text-blue-900 leading-relaxed">
                    Prior to blood donation, every donor candidate must provide a lab screening report verifying safe, transfusion-ready blood. Please ensure your uploaded report includes the following test results:
                  </p>

                  {/* List of Required Tests */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100 text-xs text-gray-800 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>1. HIV 1 & 2:</strong> Screening (Negative)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100 text-xs text-gray-800 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>2. Hepatitis B:</strong> HBsAg (Negative)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100 text-xs text-gray-800 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>3. Hepatitis C:</strong> Anti-HCV (Negative)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100 text-xs text-gray-800 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>4. Syphilis:</strong> VDRL / RPR (Non-reactive)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100 text-xs text-gray-800 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>5. Malaria:</strong> MP Test (Negative)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-blue-100 text-xs text-gray-800 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>6. Hemoglobin (CBC):</strong> Hb ≥ 12.5 g/dL</span>
                    </div>
                  </div>

                  {/* Important Consolidation Note */}
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5 mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-amber-900">
                        Important Upload Instruction: All test results must be on ONE page!
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Before uploading, ensure all the test results listed above appear on a <strong>single document page or composite photo</strong>. If you received individual test slips from the lab, arrange them side-by-side on a desk and take <strong>one clear photo</strong> containing all results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* National ID (NID) info and Document Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center bg-white hover:border-red-400 transition-colors">
                <FileText className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <span className="block text-xs font-bold text-gray-800 mb-1">
                  NID Document Scan / Photo <span className="text-red-500">*</span>
                </span>
                <p className="text-[11px] text-gray-500 mb-3">Upload your National ID card photo</p>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleInputChange}
                  placeholder="Enter NID Number"
                  required
                  className="input input-sm input-bordered w-full rounded-lg mb-2 text-xs"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setNidPhoto)}
                  className="file-input file-input-xs file-input-bordered w-full rounded-lg"
                />
                {nidPhoto && (
                  <div className="mt-2 relative">
                    <img
                      src={nidPhoto}
                      alt="NID Preview"
                      className="h-20 mx-auto rounded-lg object-cover border border-emerald-300 shadow-xs"
                    />
                    <span className="badge badge-success badge-xs absolute top-1 right-1 font-bold">
                      Attached
                    </span>
                  </div>
                )}
              </div>

              {/* Medical Test Results Report Upload (MANDATORY) */}
              <div className="border-2 border-dashed border-red-300 rounded-2xl p-4 text-center bg-white hover:border-red-500 transition-colors">
                <Upload className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <span className="block text-xs font-bold text-gray-800 mb-1">
                  Medical Test Result Photo <span className="text-red-500">*</span>
                </span>
                <p className="text-[11px] text-gray-500 mb-2">
                  All tests consolidated on <strong>1 page</strong>
                </p>
                <div className="mb-2">
                  <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                    Mandatory Qualification *
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setTestReportPhoto)}
                  required
                  className="file-input file-input-xs file-input-bordered w-full rounded-lg"
                />
                {testReportPhoto ? (
                  <div className="mt-2 relative">
                    <img
                      src={testReportPhoto}
                      alt="Medical Report Preview"
                      className="h-20 mx-auto rounded-lg object-cover border border-emerald-300 shadow-xs"
                    />
                    <span className="badge badge-success badge-xs absolute top-1 right-1 font-bold">
                      Report Added
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-red-500 font-semibold mt-2">
                    * Medical test photo is mandatory
                  </p>
                )}
              </div>

              {/* Donor Picture (Optional) */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center bg-white hover:border-red-400 transition-colors">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="block text-xs font-bold text-gray-800 mb-1">
                  Donor Profile Photo (Optional)
                </span>
                <p className="text-[11px] text-gray-500 mb-3">
                  Upload portrait for your donor badge
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setProfilePhoto)}
                  className="file-input file-input-xs file-input-bordered w-full rounded-lg mt-8"
                />
                {profilePhoto && (
                  <div className="mt-2 relative">
                    <img
                      src={profilePhoto}
                      alt="Profile Preview"
                      className="h-20 w-20 mx-auto rounded-full object-cover border-2 border-red-500 shadow-xs"
                    />
                    <span className="badge badge-success badge-xs absolute top-1 right-2 font-bold">
                      Photo Added
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 5: Location & Hospital Vicinity (District & City Separately, then Address) */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                5
              </span>
              <h2 className="text-xl font-bold text-gray-900">
                Location & Nearest Hospital Assignment
              </h2>
            </div>

            <div className="space-y-5">
              {/* Row 1: District and City Separately */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. District Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    1. District / Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    required
                    className="select select-bordered w-full rounded-lg focus:border-red-500 font-bold text-zinc-800"
                  >
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist.name} value={dist.name}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. City Selection under selected District */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    2. City / Sub-District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    required
                    className="select select-bordered w-full rounded-lg focus:border-red-500 font-bold text-zinc-800"
                  >
                    {(BANGLADESH_DISTRICTS.find((d) => d.name === formData.district)?.cities || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Specific Living Address and Hospital Vicinity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 3. Detailed Specific Living Address */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    3. Detailed Living Address / Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="areaAddress"
                    value={formData.areaAddress}
                    onChange={(e) => handleAreaAddressChange(e.target.value)}
                    placeholder="e.g. Basher Hut, Dinajpur Sadar"
                    required
                    className="input input-bordered w-full rounded-lg focus:border-red-500"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] text-zinc-500">
                    <span className="font-semibold text-zinc-700">Full Location:</span>
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-semibold border border-red-200">
                      {formData.location}
                    </span>
                  </div>
                </div>

                {/* 4. Nearest / Preferred Hospital Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    4. Nearest / Preferred Hospital <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    required
                    className="select select-bordered w-full rounded-lg focus:border-red-500"
                  >
                    {BANGLADESH_HOSPITALS.map((hosp) => (
                      <option key={hosp.name} value={hosp.name}>
                        {hosp.name} ({hosp.district})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Used for proximity matching when patients search near specific hospitals.
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Section */}
            <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-500">
                By registering, you agree to our voluntary blood donation ethics and confirm that all medical reports are authentic.
              </div>

              <button
                type="submit"
                disabled={loading || (calculatedAge !== null && calculatedAge < 18)}
                className={`btn btn-lg w-full sm:w-auto px-8 rounded-full font-bold text-white transition-colors duration-150 ${
                  calculatedAge !== null && calculatedAge < 18
                    ? "btn-disabled bg-zinc-300"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <Droplet className="w-5 h-5 fill-white" />
                    Submit Donor Application
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonarForm;
