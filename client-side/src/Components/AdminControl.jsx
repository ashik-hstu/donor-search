import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { AdminContext } from "../context/AdminContext";
import CountdownBadge from "./CountdownBadge";
import { BANGLADESH_HOSPITALS, BLOOD_GROUPS } from "../data/hospitals";
import { API_BASE_URL } from "../config/api";
import {
  Shield,
  Users,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  LogOut,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Check,
  Send,
  Droplet,
  KeyRound,
  Lock,
  Mail,
  EyeOff,
} from "lucide-react";

export default function AdminControl() {
  const { logoutAdmin, showToast, adminUser, loginAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  // Active tab: 'candidates' | 'approved' | 'settings'
  const [activeTab, setActiveTab] = useState("candidates");

  // Admin security settings state
  const [currentEmail, setCurrentEmail] = useState(adminUser?.email || "admin@gmail.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState(adminUser?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState(adminUser?.name || "Admin");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  // Data states
  const [candidates, setCandidates] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for approved members
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("ALL");

  // Document lightbox modal
  const [viewDoc, setViewDoc] = useState(null);

  // Reject modal
  const [rejectCandidateId, setRejectCandidateId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Edit member modal
  const [editMember, setEditMember] = useState(null);

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [candRes, appRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/candidates`),
        fetch(`${API_BASE_URL}/api/admin/approved`),
      ]);

      const candData = await candRes.json();
      const appData = await appRes.json();

      if (candData.success) setCandidates(candData.candidates);
      if (appData.success) setApprovedMembers(appData.members);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch admin records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin");
  };

  // Approve a candidate
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/approve/${id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Candidate approved successfully!", "success");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Approval action failed.");
    }
  };

  // Submit candidate rejection with reason (Point 5)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectCandidateId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reject/${rejectCandidateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Candidate application rejected.", "info");
        setRejectCandidateId(null);
        setRejectionReason("");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Rejection action failed.");
    }
  };

  // Toggle or Record Blood Donation for a member
  const handleMarkDonated = async (memberId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/donor/${memberId}/donated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Admin-logged blood donation" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Donation logged! 3-month cooldown initiated.", "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Cooldown
  const handleResetCooldown = async (memberId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/donor/${memberId}/reset-cooldown`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Cooldown reset. Donor is now Available.", "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save admin edits to a member
  const handleSaveMemberEdits = async (e) => {
    e.preventDefault();
    if (!editMember?._id) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/donor/${editMember._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMember),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Member updated successfully!", "success");
        setEditMember(null);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a donor
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this member?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Member deleted permanently.", "info");
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin changes their own email or password
  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      alert("Please enter your current admin password to authorize credentials update.");
      return;
    }

    setUpdatingAdmin(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail,
          currentPassword,
          newEmail: newEmail.trim() || currentEmail,
          newPassword: newPassword.trim() || currentPassword,
          newName: newName.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Admin credentials updated successfully!", "success");
        loginAdmin(data.admin);
        setCurrentEmail(data.admin.email);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        alert(data.message || "Failed to update admin profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection error.");
    } finally {
      setUpdatingAdmin(false);
    }
  };

  // Filter approved members
  const filteredApproved = approvedMembers.filter((m) => {
    if (filterGroup !== "ALL" && m.group !== filterGroup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.contact?.includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.hospital?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Admin Header */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-zinc-900">Admin Control Center</h1>
                <span className="badge badge-primary font-bold text-xs">Medical Board</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Review candidate qualification documents, manage appeals, and regulate donor cooldowns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="btn btn-sm btn-ghost gap-1.5 text-xs text-zinc-600 hover:text-zinc-950"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline btn-error gap-1.5 rounded-lg text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Pending & Appealed
            </span>
            <span className="text-2xl font-black text-amber-600">{candidates.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Awaiting Document Review</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Official Donors
            </span>
            <span className="text-2xl font-black text-emerald-600">{approvedMembers.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Verified & Active</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              On 3-Month Cooldown
            </span>
            <span className="text-2xl font-black text-orange-600">
              {approvedMembers.filter((m) => !m.isAvailable).length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Resting Donors</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Total Donations
            </span>
            <span className="text-2xl font-black text-red-600">
              {approvedMembers.reduce((sum, m) => sum + (Number(m.donationCount) || 0), 0)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Lives Impacted</span>
          </div>
        </div>

        {/* Navigation Tabs (Point 9) */}
        <div className="flex border-b border-zinc-200 bg-white rounded-t-xl px-4 sm:px-6 pt-3 gap-2 sm:gap-4 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab("candidates")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors duration-150 shrink-0 ${
              activeTab === "candidates"
                ? "border-zinc-900 text-zinc-950"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            Candidate Applications ({candidates.length})
            {candidates.length > 0 && (
              <span className="badge badge-warning badge-xs font-bold text-amber-950">
                {candidates.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors duration-150 shrink-0 ${
              activeTab === "approved"
                ? "border-zinc-900 text-zinc-950"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Approved Members ({approvedMembers.length})
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors duration-150 shrink-0 ${
              activeTab === "settings"
                ? "border-zinc-900 text-zinc-950"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Admin Security &amp; Profile
          </button>
        </div>

        {/* TAB 1: CANDIDATE APPLICATIONS (Pending & Appealed) (Points 3, 5, 9) */}
        {activeTab === "candidates" && (
          <div className="bg-white rounded-b-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Verification Queue: Pending & Appealed Candidates
                </h2>
                <p className="text-xs text-slate-500">
                  Carefully examine NID and medical test results before approving candidates for public blood donation.
                </p>
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Verification Queue is Empty</p>
                <p className="text-xs text-slate-400">All registered candidate applications have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((cand) => {
                  const isAppealed = cand.status === "appealed" || cand.isAppealed;

                  return (
                    <div
                      key={cand._id}
                      className={`border rounded-2xl p-5 transition-colors ${
                        isAppealed
                          ? "border-blue-200 bg-blue-50/30"
                          : "border-amber-200 bg-amber-50/20"
                      }`}
                    >
                      {/* Top Header & Status Distinction (Point 5) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-base flex items-center justify-center shrink-0">
                            {cand.group}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{cand.name}</h3>
                              {/* POINT 5: DISTINCT STATUS BADGE */}
                              {isAppealed ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 gap-1 border border-blue-200">
                                  <RotateCcw className="w-3 h-3" /> Appealed / Previously Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  New Candidate
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              {cand.age} yrs • {cand.gender} • {cand.weight || "55"} kg • Resubmissions:{" "}
                              {cand.resubmitCount || 0}/3
                            </span>
                          </div>
                        </div>

                        {/* Location & Hospital */}
                        <div className="text-xs text-slate-600 text-right">
                          <span className="font-semibold block">{cand.location}</span>
                          <span className="text-slate-500">{cand.hospital}</span>
                        </div>
                      </div>

                      {/* POINT 5: IF APPEALED, SHOW REJECTION REASON & CANDIDATE EXPLANATION */}
                      {isAppealed && (
                        <div className="my-3 bg-white p-3 rounded-xl border border-blue-200 space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-red-600 font-bold">
                            <AlertOctagon className="w-4 h-4" />
                            Previous Rejection Reason:
                          </div>
                          <p className="text-slate-700 bg-red-50 p-2 rounded-lg">
                            {cand.rejectionReason || "Report unclear or incomplete"}
                          </p>

                          <div className="flex items-center gap-1.5 text-blue-700 font-bold mt-2">
                            <Send className="w-4 h-4" />
                            Candidate's Appeal Message:
                          </div>
                          <p className="text-slate-800 bg-blue-50 p-2 rounded-lg font-medium">
                            "{cand.appealMessage || "Please re-evaluate my updated documents."}"
                          </p>
                        </div>
                      )}

                      {/* Medical Habits & Health Summary */}
                      <div className="my-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[10px] uppercase">Smoking</span>
                          <span
                            className={`font-bold ${
                              cand.medicalRecords?.smoking ? "text-amber-600" : "text-emerald-600"
                            }`}
                          >
                            {cand.medicalRecords?.smoking ? "Yes (Smoker)" : "No (Clean)"}
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[10px] uppercase">Drinking</span>
                          <span
                            className={`font-bold ${
                              cand.medicalRecords?.drinking ? "text-amber-600" : "text-emerald-600"
                            }`}
                          >
                            {cand.medicalRecords?.drinking ? "Yes (Regular)" : "No"}
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[10px] uppercase">Blood Allergy</span>
                          <span
                            className={`font-bold ${
                              cand.medicalRecords?.bloodAllergy
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {cand.medicalRecords?.bloodAllergy
                              ? cand.medicalRecords.allergyDetails || "Yes"
                              : "None reported"}
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[10px] uppercase">
                            Pathology Check
                          </span>
                          <span className="font-bold text-emerald-600">HIV / Hepatitis Negative</span>
                        </div>
                      </div>

                      {/* DOCUMENT ATTACHMENTS (NID & Test Reports) */}
                      <div className="my-3 flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">Uploaded Documents:</span>

                        {cand.nidPhoto ? (
                          <button
                            onClick={() => setViewDoc({ title: "NID Card", src: cand.nidPhoto })}
                            className="btn btn-xs btn-outline gap-1 text-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            View NID Card
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No NID Photo</span>
                        )}

                        {cand.medicalRecords?.testReportPhotos?.[0] ? (
                          <button
                            onClick={() =>
                              setViewDoc({
                                title: "Medical Test Report",
                                src: cand.medicalRecords.testReportPhotos[0],
                              })
                            }
                            className="btn btn-xs btn-outline gap-1 text-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            View Pathology Report
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Report Uploaded</span>
                        )}

                        {cand.photo && (
                          <button
                            onClick={() =>
                              setViewDoc({ title: "Donor Portrait", src: cand.photo })
                            }
                            className="btn btn-xs btn-outline gap-1 text-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            View Portrait
                          </button>
                        )}
                      </div>

                      {/* APPROVAL / REJECTION BUTTONS (Points 3, 5, 9) */}
                      <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500 break-all">
                          Phone: <span className="tabular-nums font-bold text-slate-700">{cand.contact}</span> •
                          Email: {cand.email}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setRejectCandidateId(cand._id);
                              setRejectionReason("");
                            }}
                            className="btn btn-sm btn-outline btn-error text-xs rounded-xl font-bold"
                          >
                            Reject Candidate
                          </button>

                          <button
                            onClick={() => handleApprove(cand._id)}
                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Approve Candidate
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPROVED OFFICIAL MEMBERS (Point 9) */}
        {activeTab === "approved" && (
          <div className="bg-white rounded-b-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Approved Official Members Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Manage active donors, trigger/reset cooldown timers, edit details, or delete accounts.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, hospital, location..."
                    className="input input-sm input-bordered pl-8 rounded-xl text-xs w-52 sm:w-64"
                  />
                </div>

                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="select select-sm select-bordered rounded-xl text-xs font-bold text-red-600"
                >
                  <option value="ALL">All Groups</option>
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="table table-sm w-full min-w-[640px] text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th>Donor</th>
                    <th>Blood Group</th>
                    <th>Contact & Location</th>
                    <th>Hospital</th>
                    <th>Donations</th>
                    <th>Status / 3-Month Cooldown</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApproved.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50/80">
                      {/* Name & Photo */}
                      <td>
                        <div className="flex items-center gap-2">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                              {member.group}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block">{member.name}</span>
                            <span className="text-[10px] text-slate-400">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td>
                        <span className="badge badge-error text-white font-extrabold text-xs">
                          {member.group}
                        </span>
                      </td>

                      {/* Contact & Location */}
                      <td>
                        <div className="tabular-nums text-slate-800">{member.contact}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {member.location}
                        </div>
                      </td>

                      {/* Hospital */}
                      <td className="text-[11px] text-slate-600 truncate max-w-[180px]">
                        {member.hospital || "General Hospital"}
                      </td>

                      {/* Donation count */}
                      <td>
                        <span className="badge badge-neutral text-xs font-bold">
                          {member.donationCount || 0} Times
                        </span>
                      </td>

                      {/* Cooldown Status (Point 8) */}
                      <td>
                        {member.isAvailable ? (
                          <span className="badge badge-success text-white text-xs font-bold gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            Available
                          </span>
                        ) : (
                          <CountdownBadge targetDate={member.nextEligibleDate} compact={true} />
                        )}
                      </td>

                      {/* Admin Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                          {/* Cooldown Toggle */}
                          {member.isAvailable ? (
                            <button
                              onClick={() => handleMarkDonated(member._id)}
                              className="btn btn-xs btn-outline border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white"
                              title="Mark as Donated Blood Today"
                            >
                              <Droplet className="w-3 h-3 text-red-600" />
                              Log Donation
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResetCooldown(member._id)}
                              className="btn btn-xs btn-outline border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white"
                              title="Override and reset cooldown"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reset Ready
                            </button>
                          )}

                          {/* Edit Member */}
                          <button
                            onClick={() => setEditMember(member)}
                            className="btn btn-xs btn-ghost text-slate-600 hover:text-blue-600"
                            title="Edit Member Info"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Member */}
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="btn btn-xs btn-ghost text-slate-600 hover:text-red-600"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN SECURITY & PROFILE SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-b-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-zinc-900" />
                Change Admin Email & Password
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your administrative login credentials. You must provide your current password for security verification.
              </p>
            </div>

            <form onSubmit={handleUpdateAdminProfile} className="max-w-xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Admin Display Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Master Admin"
                  required
                  className="input input-bordered w-full rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new admin email"
                    required
                    className="input input-bordered w-full pl-9 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Admin Password (Leave blank to keep unchanged)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (at least 6 characters)"
                    minLength={6}
                    className="input input-bordered w-full pl-9 pr-10 rounded-xl text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-zinc-900 uppercase mb-1">
                  Current Password (Required for Verification) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Verify with current password"
                    required
                    className="input input-bordered border-zinc-300 focus:border-zinc-900 w-full pl-9 pr-10 rounded-xl text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingAdmin || !currentPassword}
                className="btn bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold px-6"
              >
                {updatingAdmin ? <span className="loading loading-spinner"></span> : "Save New Admin Credentials"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* REJECTION REASON MODAL (Point 5) */}
      {rejectCandidateId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-red-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              Specify Rejection Reason
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This message will be visible to the candidate on their portal so they can understand and submit an appeal if appropriate.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Uploaded NID or medical test report is blurry / Older than 6 months / Health condition requires doctor clearance."
                required
                className="textarea textarea-bordered w-full rounded-xl text-xs"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectCandidateId(null)}
                  className="btn btn-sm btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-error text-white rounded-xl text-xs font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {viewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewDoc(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <span className="text-sm font-bold text-slate-900">{viewDoc.title}</span>
              <button onClick={() => setViewDoc(null)} className="btn btn-xs btn-circle btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={viewDoc.src}
              alt={viewDoc.title}
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editMember && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Member: {editMember.name}
              </h3>
              <button
                onClick={() => setEditMember(null)}
                className="btn btn-xs btn-circle btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberEdits} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editMember.name || ""}
                  onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                  className="input input-sm input-bordered w-full rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={editMember.contact || ""}
                    onChange={(e) => setEditMember({ ...editMember, contact: e.target.value })}
                    className="input input-sm input-bordered w-full rounded-lg tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Blood Group
                  </label>
                  <select
                    value={editMember.group || ""}
                    onChange={(e) => setEditMember({ ...editMember, group: e.target.value })}
                    className="select select-sm select-bordered w-full rounded-lg font-bold"
                  >
                    {BLOOD_GROUPS.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Location / Area
                </label>
                <input
                  type="text"
                  value={editMember.location || ""}
                  onChange={(e) => setEditMember({ ...editMember, location: e.target.value })}
                  className="input input-sm input-bordered w-full rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Hospital Assignment
                </label>
                <select
                  value={editMember.hospital || ""}
                  onChange={(e) => setEditMember({ ...editMember, hospital: e.target.value })}
                  className="select select-sm select-bordered w-full rounded-lg"
                >
                  {BANGLADESH_HOSPITALS.map((hosp) => (
                    <option key={hosp.name} value={hosp.name}>
                      {hosp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Donations Count
                  </label>
                  <input
                    type="number"
                    value={editMember.donationCount || 0}
                    onChange={(e) =>
                      setEditMember({ ...editMember, donationCount: Number(e.target.value) })
                    }
                    className="input input-sm input-bordered w-full rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Availability
                  </label>
                  <select
                    value={editMember.isAvailable ? "true" : "false"}
                    onChange={(e) =>
                      setEditMember({ ...editMember, isAvailable: e.target.value === "true" })
                    }
                    className="select select-sm select-bordered w-full rounded-lg"
                  >
                    <option value="true">Available Now</option>
                    <option value="false">On Cooldown</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
                  className="btn btn-sm btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-zinc-900 text-white hover:bg-black rounded-xl text-xs font-bold"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
