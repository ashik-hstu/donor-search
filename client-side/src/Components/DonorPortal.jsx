import { useState, useEffect, useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import CountdownBadge from "./CountdownBadge";
import { BANGLADESH_HOSPITALS, BLOOD_GROUPS } from "../data/hospitals";
import { API_BASE_URL } from "../config/api";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Heart,
  Droplet,
  Upload,
  Eye,
  X,
  Send,
  Calendar,
  ShieldAlert,
  ArrowRight,
  LogIn,
  LogOut,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

export default function DonorPortal() {
  const { currentDonor, loginDonor, logoutDonor, showToast } = useContext(AdminContext);

  const [donor, setDonor] = useState(currentDonor);
  const [loading, setLoading] = useState(false);

  // Login lookup state for donors who return (Using Email and Password - no phone number)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Edit / Resubmit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editNidPhoto, setEditNidPhoto] = useState(null);
  const [editReportPhoto, setEditReportPhoto] = useState(null);

  // Appeal state
  const [isAppealing, setIsAppealing] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [appealReportPhoto, setAppealReportPhoto] = useState(null);

  // Full-size image modal state
  const [modalImage, setModalImage] = useState(null);

  // Fetch latest donor profile from server
  const refreshDonorData = async (id) => {
    const donorId = id || donor?._id;
    if (!donorId) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}`);
      const data = await res.json();
      if (data.success && data.donor) {
        setDonor(data.donor);
        loginDonor(data.donor);
        setEditFormData(data.donor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentDonor?._id) {
      setDonor(currentDonor);
      setEditFormData(currentDonor);
      refreshDonorData(currentDonor._id);
    }
  }, [currentDonor?._id]);

  // Login donor candidate using registered Email and Password
  const handleDonorLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert("Please enter both your registered email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/donor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success && data.donor) {
        setDonor(data.donor);
        loginDonor(data.donor);
        setEditFormData(data.donor);
        showToast("Welcome back! Donor profile loaded.", "success");
      } else {
        alert(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to donor authentication service.");
    } finally {
      setLoading(false);
    }
  };

  const handleDonorLogout = () => {
    logoutDonor();
    setDonor(null);
    showToast("Logged out of donor portal.", "info");
  };

  // Convert image to base64
  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Resubmit / Edit application
  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!donor?._id) return;

    // Check resubmission limit during pending
    if (donor.status === "pending" && (donor.resubmitCount || 0) >= 3) {
      alert("Resubmission limit reached: You can only edit your application up to 3 times while on review pending.");
      return;
    }

    setLoading(true);

    const payload = {
      ...editFormData,
      nidPhoto: editNidPhoto || donor.nidPhoto,
      photo: editFormData.photo || donor.photo,
      medicalRecords: {
        ...(donor.medicalRecords || {}),
        smoking: Boolean(editFormData.smoking),
        drinking: Boolean(editFormData.drinking),
        bloodAllergy: Boolean(editFormData.bloodAllergy),
        allergyDetails: editFormData.allergyDetails || "",
        testReportPhotos: editReportPhoto
          ? [editReportPhoto]
          : donor.medicalRecords?.testReportPhotos || [],
      },
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/donor/${donor._id}/resubmit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setDonor(data.donor);
        loginDonor(data.donor);
        setIsEditing(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update application.");
    } finally {
      setLoading(false);
    }
  };

  // Submit appeal after rejection
  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    if (!donor?._id) return;

    if (!appealText.trim()) {
      alert("Please provide an explanation for your appeal.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/donor/${donor._id}/appeal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealMessage: appealText,
          correctedReports: appealReportPhoto ? [appealReportPhoto] : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Appeal submitted! Admin will re-review your application.", "success");
        setDonor(data.donor);
        loginDonor(data.donor);
        setIsAppealing(false);
        setAppealText("");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit appeal.");
    } finally {
      setLoading(false);
    }
  };

  // Record Blood Donation (Trigger 3-month cooldown)
  const handleRecordDonation = async () => {
    if (!donor?._id) return;
    const confirm = window.confirm(
      "Confirm Blood Donation: Did you donate blood today? This will start a 90-day (3-month) medical cooldown period."
    );
    if (!confirm) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/donor/${donor._id}/donated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital: donor.hospital || "Dinajpur Sadar Hospital (250 Bed)",
          notes: "Self-logged voluntary donation",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setDonor(data.donor);
        loginDonor(data.donor);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to record donation.");
    } finally {
      setLoading(false);
    }
  };

  // If no donor is logged in, show Candidate Access / Login Form
  if (!donor) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900">Donor Candidate Portal</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Check your application review status, submitted documents, resubmit info, or manage your donation cooldown.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8">
            <h2 className="text-base font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <LogIn className="w-4 h-4 text-red-600" />
              Access Your Application
            </h2>

            <form onSubmit={handleDonorLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. donor@gmail.com"
                    required
                    className="input input-bordered w-full pl-9 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="input input-bordered w-full pl-9 pr-10 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4 text-zinc-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !loginEmail || !loginPassword}
                className="btn bg-red-600 hover:bg-red-700 w-full text-white rounded-lg font-bold mt-2 transition-colors duration-150"
              >
                {loading ? <span className="loading loading-spinner"></span> : "Sign In to My Application"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-200 text-center text-xs text-zinc-500">
              Haven't registered as a donor candidate yet?{" "}
              <a href="/donarForm" className="text-red-600 font-bold hover:underline">
                Register here
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Donor Portal Dashboard
  const resubmitCount = donor.resubmitCount || 0;
  const canResubmit = donor.status !== "pending" || resubmitCount < 3;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Profile Header */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {donor.photo ? (
                <img
                  src={donor.photo}
                  alt={donor.name}
                  className="w-14 h-14 rounded-lg object-cover border border-zinc-200"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-lg bg-red-600 text-white font-extrabold text-2xl flex items-center justify-center notranslate"
                  translate="no"
                >
                  {donor.group || "B"}
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 bg-zinc-900 text-white font-bold text-[10px] px-1.5 py-0.5 rounded notranslate"
                translate="no"
              >
                {donor.group}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 truncate">{donor.name}</h1>
                <span className="text-xs bg-zinc-100 px-2.5 py-0.5 rounded font-semibold text-zinc-700 shrink-0">
                  {donor.age} yrs • {donor.gender}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 break-words">
                {donor.location} • {donor.hospital}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 break-all">
                Email: {donor.email} | Phone: {donor.contact}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => refreshDonorData()}
              className="btn btn-sm btn-ghost gap-1.5 text-xs text-zinc-600 hover:text-red-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleDonorLogout}
              className="btn btn-sm btn-outline btn-error gap-1.5 rounded-lg text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          </div>
        </div>

        {/* APPLICATION STATUS BANNER (Point 3, 4, 5) */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xs font-bold text-zinc-500 mb-3">
              Application &amp; Membership Verification Status
            </h2>

            {/* PENDING STATUS */}
            {donor.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-warning font-bold text-xs">
                        PENDING ADMIN REVIEW
                      </span>
                      <span className="text-xs font-bold text-amber-900">
                        Resubmissions Used: {resubmitCount} / 3 Allowed
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-1 max-w-xl">
                      Your registration and medical documents are currently under inspection by the medical administration. You cannot be searched publicly until verified.
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={!canResubmit}
                    className={`btn btn-sm rounded-xl text-xs font-bold ${
                      canResubmit
                        ? "btn-warning text-amber-950"
                        : "btn-disabled bg-gray-200 text-gray-400"
                    }`}
                  >
                    {canResubmit ? "Resubmit / Correct Info" : "Resubmit Limit Reached (3/3)"}
                  </button>
                </div>
              </div>
            )}

            {/* APPROVED STATUS */}
            {donor.status === "approved" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-success text-white font-bold text-xs">
                        OFFICIAL VERIFIED DONOR
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        Total Blood Donations: {donor.donationCount || 0}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/80 mt-1 max-w-xl">
                      Congratulations! Your documents were verified and approved by the medical board. Your donor profile is active and searchable.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-sm btn-outline border-emerald-600 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold"
                  >
                    Edit Profile Details
                  </button>
                </div>
              </div>
            )}

            {/* REJECTED STATUS & APPEAL (Point 5) */}
            {donor.status === "rejected" && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="badge badge-error text-white font-bold text-xs mb-1">
                      APPLICATION REJECTED
                    </span>
                    <h3 className="text-sm font-bold text-red-900">
                      Rejection Reason from Medical Admin:
                    </h3>
                    <p className="text-xs text-red-800 bg-white/80 border border-red-200 rounded-lg p-2.5 mt-1 font-medium">
                      "{donor.rejectionReason || "Uploaded documents were blurry or incomplete."}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-red-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-red-700">
                    If you have resolved the above concern, you may submit an appeal with clarification.
                  </span>
                  <button
                    onClick={() => setIsAppealing(!isAppealing)}
                    className="btn btn-sm btn-error text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    Submit Appeal
                  </button>
                </div>
              </div>
            )}

            {/* APPEALED STATUS */}
            {donor.status === "appealed" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <span className="badge badge-info font-bold text-xs mb-1">
                    APPEAL UNDER RE-REVIEW
                  </span>
                  <p className="text-xs text-blue-900 font-semibold">
                    You have appealed your previous rejection. The administration has received your appeal message:
                  </p>
                  <p className="text-xs text-blue-800 italic bg-white p-2 rounded-lg mt-1 border border-blue-200">
                    "{donor.appealMessage}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DONATION COOLDOWN & TIMER SECTION (Point 8) */}
        {donor.status === "approved" && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                  Donation Activity &amp; Cooldown Control
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Medically, donors must observe a 3-month (90-day) cooldown between whole blood donations to replenish iron and red blood cells.
                </p>
              </div>

              <div>
                <button
                  onClick={handleRecordDonation}
                  disabled={loading || !donor.isAvailable}
                  className={`btn btn-sm rounded-lg font-bold text-xs ${
                    donor.isAvailable
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "btn-disabled bg-zinc-200 text-zinc-400"
                  }`}
                >
                  <Droplet className="w-4 h-4 fill-white" />
                  I Donated Blood Today
                </button>
              </div>
            </div>

            {/* Cooldown Display */}
            {donor.nextEligibleDate && !donor.isAvailable ? (
              <div className="mt-3">
                <CountdownBadge targetDate={donor.nextEligibleDate} />
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs text-emerald-900">
                <span className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  You are currently marked Available to donate blood.
                </span>
                <span className="bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  Ready Now
                </span>
              </div>
            )}
          </div>
        )}

        {/* APPEAL FORM (Point 5) */}
        {isAppealing && (
          <div className="bg-white rounded-xl border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Submit Appeal to Administration
              </h3>
              <button
                onClick={() => setIsAppealing(false)}
                className="btn btn-xs btn-ghost btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAppealSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Appeal Explanation / Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="Explain why your application should be approved (e.g. attached updated clearer hospital pathology report, age clarification, etc.)"
                  required
                  className="textarea textarea-bordered w-full rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Upload Corrected Test Report / Document (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setAppealReportPhoto)}
                  className="file-input file-input-sm file-input-bordered w-full rounded-lg"
                />
                {appealReportPhoto && (
                  <img
                    src={appealReportPhoto}
                    alt="Corrected report preview"
                    className="h-24 mt-2 rounded-lg border object-cover"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAppealing(false)}
                  className="btn btn-sm btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold"
                >
                  {loading ? <span className="loading loading-spinner"></span> : "Send Appeal"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RESUBMIT / EDIT FORM (Point 4) */}
        {isEditing && (
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  {donor.status === "pending"
                    ? `Resubmit Information (${resubmitCount} of 3 Used)`
                    : "Update Donor Profile"}
                </h3>
                <p className="text-xs text-zinc-500">
                  Make corrections to your medical answers or upload clearer photos.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-xs btn-ghost btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="input input-bordered w-full rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.contact || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, contact: e.target.value }))
                    }
                    className="input input-bordered w-full rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Location / Area
                  </label>
                  <input
                    type="text"
                    value={editFormData.location || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="input input-bordered w-full rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Nearest Hospital
                  </label>
                  <select
                    value={editFormData.hospital || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, hospital: e.target.value }))
                    }
                    className="select select-bordered w-full rounded-xl text-xs"
                  >
                    {BANGLADESH_HOSPITALS.map((hosp) => (
                      <option key={hosp.name} value={hosp.name}>
                        {hosp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document updates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 border rounded-xl bg-gray-50">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Update NID Card Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setEditNidPhoto)}
                    className="file-input file-input-xs file-input-bordered w-full"
                  />
                  {editNidPhoto && (
                    <img
                      src={editNidPhoto}
                      alt="NID preview"
                      className="h-16 mt-2 rounded-md object-cover"
                    />
                  )}
                </div>

                <div className="p-3 border rounded-xl bg-gray-50">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Update Medical Test Report Photo
                  </label>
                  <p className="text-[10px] text-gray-500 mb-2">
                    Must show all required tests (HIV, Hepatitis B/C, Syphilis, Malaria, Hb) on <strong>one page</strong>.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setEditReportPhoto)}
                    className="file-input file-input-xs file-input-bordered w-full"
                  />
                  {editReportPhoto && (
                    <img
                      src={editReportPhoto}
                      alt="Report preview"
                      className="h-16 mt-2 rounded-md object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-sm btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sm btn-error text-white rounded-xl text-xs font-bold"
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : donor.status === "pending" ? (
                    "Resubmit Application"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUBMITTED DOCUMENTS & MEDICAL RECORDS VIEWER (Point 4) */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Your Submitted Documents &amp; Medical Records
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NID Card */}
            <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50/50">
              <span className="block text-xs font-bold text-zinc-700 mb-1">
                National ID (NID)
              </span>
              <p className="text-xs text-zinc-600 mb-3">
                Number: {donor.nid || "Verified on file"}
              </p>
              {donor.nidPhoto ? (
                <div
                  onClick={() => setModalImage(donor.nidPhoto)}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-300"
                >
                  <img
                    src={donor.nidPhoto}
                    alt="NID Document"
                    className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                    <Eye className="w-4 h-4" /> Click to Enlarge
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                  NID Document on file
                </div>
              )}
            </div>

            {/* Medical Test Reports */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <span className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Medical Pathology Test Reports
              </span>
              <p className="text-xs text-gray-600 mb-3">HIV & Hepatitis screening proof</p>
              {donor.medicalRecords?.testReportPhotos?.[0] ? (
                <div
                  onClick={() => setModalImage(donor.medicalRecords.testReportPhotos[0])}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-300"
                >
                  <img
                    src={donor.medicalRecords.testReportPhotos[0]}
                    alt="Medical Report"
                    className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                    <Eye className="w-4 h-4" /> Click to Enlarge
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-emerald-50 rounded-lg flex flex-col items-center justify-center text-xs text-emerald-800 p-2 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                  Pathology clearance affirmed
                </div>
              )}
            </div>

            {/* Health Questionnaire Summary */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <span className="block text-xs font-bold text-gray-700 uppercase mb-3">
                Health Habits & Screening
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-600">Smoking:</span>
                  <span
                    className={`font-bold ${
                      donor.medicalRecords?.smoking ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {donor.medicalRecords?.smoking ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-600">Drinking / Alcohol:</span>
                  <span
                    className={`font-bold ${
                      donor.medicalRecords?.drinking ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {donor.medicalRecords?.drinking ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-600">Blood Allergy:</span>
                  <span
                    className={`font-bold ${
                      donor.medicalRecords?.bloodAllergy ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {donor.medicalRecords?.bloodAllergy ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">HIV / Hepatitis:</span>
                  <span className="font-bold text-emerald-600">Negative Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SIZE IMAGE PREVIEW MODAL */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-3 right-3 btn btn-sm btn-circle btn-neutral z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={modalImage}
              alt="Enlarged Document Preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
