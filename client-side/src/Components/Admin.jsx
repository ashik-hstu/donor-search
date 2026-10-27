import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { AdminContext } from "../context/AdminContext";
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginAdmin, showToast } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        loginAdmin(data.admin);
        showToast("Welcome back, Administrator!", "success");
        navigate("/adminControl");
      } else {
        setError(data.message || "Invalid credentials");
        showToast("Login failed: " + (data.message || "Invalid credentials"), "error");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to authorization server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-zinc-950 flex items-center justify-center p-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Governance Portal</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Access candidate verification, document review, and donor cooldown governance.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-zinc-200">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  className="input input-bordered w-full pl-9 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="input input-bordered w-full pl-9 pr-10 rounded-xl text-sm"
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

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn bg-zinc-900 hover:bg-black text-white w-full rounded-full font-bold text-xs sm:text-sm mt-4 transition-colors duration-150 py-3"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  Enter Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
