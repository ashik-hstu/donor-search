import { createContext, useState, useEffect } from "react";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("is_admin") === "true";
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentDonor, setCurrentDonor] = useState(() => {
    const saved = localStorage.getItem("current_donor");
    return saved ? JSON.parse(saved) : null;
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loginAdmin = (adminData) => {
    setIsAdmin(true);
    setAdminUser(adminData);
    localStorage.setItem("is_admin", "true");
    localStorage.setItem("admin_user", JSON.stringify(adminData));
    showToast("Welcome Admin! Logged in successfully.", "success");
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem("is_admin");
    localStorage.removeItem("admin_user");
    showToast("Admin logged out.", "info");
  };

  const loginDonor = (donorData) => {
    setCurrentDonor(donorData);
    localStorage.setItem("current_donor", JSON.stringify(donorData));
    showToast(`Logged in as ${donorData.name}`, "success");
  };

  const logoutDonor = () => {
    setCurrentDonor(null);
    localStorage.removeItem("current_donor");
    showToast("Donor session ended.", "info");
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
        adminUser,
        loginAdmin,
        logoutAdmin,
        currentDonor,
        setCurrentDonor,
        loginDonor,
        logoutDonor,
        toast,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div
            className={`alert ${
              toast.type === "error"
                ? "alert-error text-white"
                : toast.type === "info"
                ? "alert-info text-white"
                : "alert-success text-white"
            } shadow-lg rounded-xl flex items-center gap-2`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
};
