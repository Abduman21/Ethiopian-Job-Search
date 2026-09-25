import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
} from "lucide-react";

export type Application = {
  id: string;
  job_id: string;
  job_seeker_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
  applied_at: string;
  updated_at: string;
};

type ApplicationWithJob = Application & {
  jobs: {
    title: string;
    location?: string;
    job_type?: string;
    employer_profiles: {
      company_name: string;
    };
  };
};

const statusConfig = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Pending Review",
  },
  reviewed: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Under Review",
  },
  shortlisted: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Shortlisted",
  },
  accepted: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    label: "Accepted! 🎉",
  },
  rejected: {
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Not Selected",
  },
};

const statusSteps = ["pending", "reviewed", "shortlisted", "accepted"];

function ApplicationCard({ application }: { application: ApplicationWithJob }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[application.status];
  const stepIndex = statusSteps.indexOf(application.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                {application.jobs.employer_profiles.company_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 text-base truncate">{application.jobs.title}</h3>
                <p className="text-emerald-600 text-sm font-medium">{application.jobs.employer_profiles.company_name}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 ml-12 text-xs text-gray-500">
              {application.jobs.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {application.jobs.location}
                </span>
              )}
              {application.jobs.job_type && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="capitalize">{application.jobs.job_type.replace("_", " ")}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Applied {new Date(application.applied_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
              {config.icon}
              {config.label}
            </span>
          </div>
        </div>

        {/* Progress bar for non-rejected */}
        {application.status !== "rejected" && (
          <div className="mt-4 ml-12">
            <div className="flex items-center gap-1">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`h-1.5 rounded-full flex-1 transition-all ${
                      i <= stepIndex ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                  {i < statusSteps.length - 1 && <div className="w-1" />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {statusSteps.map((step, i) => (
                <span key={step} className={`text-[10px] capitalize ${i <= stepIndex ? "text-emerald-600 font-medium" : "text-gray-400"}`}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand cover letter */}
      {application.cover_letter && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-5 py-2.5 border-t border-gray-100 text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <span>Cover Letter</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded && (
            <div className="px-5 pb-5 bg-gray-50">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const MyApplications = () => {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            title,
            location,
            job_type,
            employer_id,
            profiles ( full_name )
          )
        `)
        .eq("job_seeker_id", user.id)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      const applicationsData: ApplicationWithJob[] = (data ?? []).map((row: any) => ({
        id: row.id,
        job_id: row.job_id,
        job_seeker_id: row.job_seeker_id,
        cover_letter: row.cover_letter,
        resume_url: row.resume_url,
        status: row.status,
        applied_at: row.applied_at,
        updated_at: row.updated_at,
        jobs: {
          title: row.jobs?.title ?? "Unknown Job",
          location: row.jobs?.location,
          job_type: row.jobs?.job_type,
          employer_profiles: {
            company_name: row.jobs?.profiles?.full_name ?? "Unknown Company",
          },
        },
      }));

      setApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };


  const filtered = filterStatus === "all"
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Applications</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "emerald" },
            { label: "Pending", value: stats.pending, color: "yellow" },
            { label: "Shortlisted", value: stats.shortlisted, color: "green" },
            { label: "Accepted", value: stats.accepted, color: "teal" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "reviewed", label: "Reviewed" },
            { value: "shortlisted", label: "Shortlisted" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterStatus === tab.value
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Illustration with glow */}
          <div className="relative w-56 h-56 mb-3">
            <div className="absolute inset-0 bg-teal-100 rounded-full blur-2xl opacity-60 scale-90" />
            <img
              src="/applications-empty.jpg"
              alt="No applications yet"
              className="relative w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          <h3 className="text-xl font-bold text-gray-700">
            {filterStatus === "all" ? "No applications yet" : `No ${filterStatus} applications`}
          </h3>
          <p className="text-gray-400 mt-2 text-sm max-w-xs text-center leading-relaxed">
            {filterStatus === "all"
              ? "You haven't applied to any jobs yet. Browse available positions and start your journey!"
              : `You have no applications with status "${filterStatus}". Try a different filter.`}
          </p>

          {filterStatus === "all" ? (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                <span>📄</span> CV / Cover Letter ready?
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                <span>🔍</span> Browse Jobs tab
              </div>
            </div>
          ) : (
            <button
              onClick={() => setFilterStatus("all")}
              className="mt-5 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm text-sm"
            >
              View all applications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};
