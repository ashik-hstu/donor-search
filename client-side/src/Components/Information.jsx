import info1 from "./../assets/infomation-1.avif";
import info2 from "./../assets/information-2.avif";
import { CheckCircle2, AlertTriangle, ShieldCheck, Clock, Heart, Droplet } from "lucide-react";
import { Link } from "react-router";

const Information = () => {
  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Clinical Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            Essential Donor Guidelines &amp; Medical Criteria
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Learn about who can donate, mandatory health checks, and how the 3-month medical cooldown safeguards donor physiology.
          </p>
        </div>

        {/* Feature Section 1 */}
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 p-4 sm:p-6">
            <img
              src={info1}
              alt="Medical Blood Donation"
              className="w-full h-72 sm:h-80 object-cover rounded-2xl border border-zinc-100"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
              Transfusion Biology
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Why Should You Donate Blood Regularly?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Every voluntary whole blood donation yields red blood cells, platelets, and plasma. For patients suffering severe blood loss, leukemia, or postpartum hemorrhage, transfusions are literally the only hope.
            </p>
            <div className="bg-red-50/80 p-4 rounded-2xl border border-red-200/80 flex items-center gap-3">
              <Droplet className="w-8 h-8 text-red-600 fill-red-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-red-900 block">Life Impact</span>
                <span className="text-sm font-black text-red-700">1 Unit of Blood = Up to 3 Lives Saved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Qualification Standards Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Donor Qualification Standards</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Reviewed and confirmed for every registered donor candidate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Qualified Checklist */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Eligible Criteria (Who Can Donate)
              </h3>
              <ul className="space-y-3 text-xs text-emerald-900">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                  <span><strong>Age Requirement:</strong> At least 18 years old (Verified via National ID or Birth Certificate).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                  <span><strong>Body Weight:</strong> Minimum 45 kg for females and 50 kg for males.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                  <span><strong>Hemoglobin Level:</strong> At least 12.5 g/dL.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                  <span><strong>Healthy Vitals:</strong> Normal pulse (60-100 bpm) and stable blood pressure.</span>
                </li>
              </ul>
            </div>

            {/* Disqualification / Temporary Hold */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Temporary or Permanent Ineligibility
              </h3>
              <ul className="space-y-3 text-xs text-amber-900">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                  <span><strong>Under 18 Years:</strong> Underage candidates are strictly ineligible by medical law.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                  <span><strong>Recent Tattoo or Piercing:</strong> Wait at least 6 months after getting body ink or piercings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                  <span><strong>Positive Pathology Test:</strong> Active HIV, Hepatitis B/C, Malaria, or active chronic blood conditions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                  <span><strong>Cooldown Interval:</strong> Must wait 90 days (3 months) since the last whole blood donation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Section 2 */}
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4 order-2 lg:order-1">
            <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
              Scientific Safety
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Why Is There a 3-Month (90-Day) Waiting Interval?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              When you donate blood, your body takes around 24 to 48 hours to restore liquid plasma, while full replacement of red blood cells and ferritin (iron reserves) takes approximately 8 to 12 weeks. Our platform automatically enforces this cooldown countdown to protect donors from anemia.
            </p>
            <div className="pt-2">
              <Link
                to="/donarForm"
                className="btn-roktika !min-h-0 !py-3 !px-6 !text-xs sm:!text-sm"
              >
                <span className="btn-label">Apply as Verified Donor Candidate</span>
                <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 p-4 sm:p-6">
            <img
              src={info2}
              alt="Medical Examination"
              className="w-full h-72 sm:h-80 object-cover rounded-2xl border border-zinc-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
