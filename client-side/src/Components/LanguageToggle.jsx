import { useState, useEffect } from "react";
import { Languages } from "lucide-react";

/**
 * LanguageToggle Component
 * Toggles Google Translate between English ('en') and Bangla ('bn') mode.
 * Persists user choice via googtrans cookie & localStorage.
 */
const LanguageToggle = ({ className = "" }) => {
  const [currentLang, setCurrentLang] = useState("en");

  // Read current language on mount
  useEffect(() => {
    const checkCurrentLang = () => {
      try {
        const cookies = document.cookie.split(";");
        const gtCookie = cookies.find((c) => c.trim().startsWith("googtrans="));
        if (gtCookie && gtCookie.includes("/bn")) {
          setCurrentLang("bn");
          return;
        }

        const localLang = localStorage.getItem("roktika_lang");
        if (localLang === "bn") {
          setCurrentLang("bn");
          return;
        }

        setCurrentLang("en");
      } catch (err) {
        console.error("Error reading language state:", err);
      }
    };

    checkCurrentLang();
  }, []);

  const handleLanguageSwitch = (targetLang) => {
    if (targetLang === currentLang) return;

    try {
      const hostname = window.location.hostname;

      if (targetLang === "bn") {
        // Set googtrans cookie to /en/bn
        document.cookie = "googtrans=/en/bn; path=/; max-age=31536000;";
        if (hostname !== "localhost" && hostname !== "127.0.0.1") {
          document.cookie = `googtrans=/en/bn; domain=.${hostname}; path=/; max-age=31536000;`;
        }
        localStorage.setItem("roktika_lang", "bn");
      } else {
        // Reset back to English
        document.cookie = "googtrans=/en/en; path=/; max-age=31536000;";
        document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        if (hostname !== "localhost" && hostname !== "127.0.0.1") {
          document.cookie = `googtrans=; domain=.${hostname}; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        }
        localStorage.setItem("roktika_lang", "en");
      }

      setCurrentLang(targetLang);

      // Trigger translate element dropdown if present
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        combo.value = targetLang;
        combo.dispatchEvent(new Event("change"));
      }

      // Fast reload to apply full DOM translation cleanly without React reconciliation conflicts
      window.location.reload();
    } catch (err) {
      console.error("Language switch error:", err);
    }
  };

  return (
    <div
      className={`notranslate inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 transition-colors ${className}`}
      role="group"
      aria-label="Language selection toggle"
      translate="no"
    >
      <div className="flex items-center pl-2 pr-1 text-slate-500">
        <Languages className="w-3.5 h-3.5 text-red-600" />
      </div>

      {/* English Button */}
      <button
        type="button"
        onClick={() => handleLanguageSwitch("en")}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors select-none notranslate ${
          currentLang === "en"
            ? "bg-white text-red-600 ring-1 ring-slate-200"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="Switch to English"
        translate="no"
      >
        EN
      </button>

      {/* Bangla Button */}
      <button
        type="button"
        onClick={() => handleLanguageSwitch("bn")}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors select-none notranslate ${
          currentLang === "bn"
            ? "bg-red-600 text-white"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="Switch to বাংলা (Bangla)"
        translate="no"
      >
        বাংলা
      </button>
    </div>
  );
};

export default LanguageToggle;
