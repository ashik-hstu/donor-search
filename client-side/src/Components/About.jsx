import blood from "../assets/blood.jpg";
import { Heart, Droplet, ShieldCheck, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10">
          <div className="lg:col-span-5">
            <div className="relative">
              <img
                src={blood}
                alt="Voluntary Blood Donation"
                className="rounded-2xl border border-zinc-200 object-cover w-full h-[380px]"
              />
              <div className="absolute -bottom-3 -right-3 bg-red-600 text-white p-3 rounded-2xl flex items-center gap-2">
                <Heart className="w-5 h-5 fill-white" />
                <span className="font-bold text-xs">Saving Lives Everyday</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              About Our Humanitarian Mission
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
              Bridging the gap between voluntary donors and critical patients.
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Finding compatible blood during urgent surgical operations or traumatic emergencies shouldn't depend on frantic social media posts. Roktika provides a vetted, real-time blood registry connecting patients directly with eligible donors in their hospital vicinity—100% free and voluntary.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Medically Vetted
                </h4>
                <p className="text-xs text-zinc-600">
                  Strict 18+ age checks and pathology test verification.
                </p>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  90-Day Cooldown
                </h4>
                <p className="text-xs text-zinc-600">
                  Live timers ensure donors replenish blood safely.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/donarForm"
                className="btn-roktika !min-h-0 !py-3 !px-6 !text-xs sm:!text-sm"
              >
                <span className="btn-label">Join as Official Donor Candidate</span>
                <span className="btn-wave" aria-hidden="true"><i/><i/><i/></span>
              </Link>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950">What Sets Us Apart</h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Built with medical governance and rapid emergency access at the forefront.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-3">
              <Droplet className="w-5 h-5 fill-red-600" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Blood Group Directory</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Find exactly what you need without confusing menus. Filter directly by A+, B+, AB+, O- and inspect availability counts immediately.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-200">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Hospital Vicinity Matching</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Locate donors living directly around Dinajpur Sadar Hospital, Basher Hut, Dinajpur, Dhaka Medical College, and key regional centers to minimize transit time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-200">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Pathology Governance</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Mandatory submission of consolidated infectious test panels ensuring patient safety before donor activation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
