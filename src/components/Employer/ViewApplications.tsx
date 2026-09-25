import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  Briefcase,
  Filter,
} from "lucide-react";
import { useToast } from "../Toast";

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

type ApplicationWithDetails = Application & {
  jobs: { title: string };
  profiles: { full_name: string; email: string };
};

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending", icon: <Clock className="w-4 h-4" /> },
  reviewed: { color: "bg-blue-100 text-blue-800", label: "Reviewed", icon: <AlertCircle className="w-4 h-4" /> },
  shortlisted: { color: "bg-green-100 text-green-800", label: "Shortlisted", icon: <CheckCircle className="w-4 h-4" /> },
  accepted: { color: "bg-emerald-100 text-emerald-800", label: "Accepted", icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { color: "bg-red-100 text-red-800", label: "Rejected", icon: <XCircle className="w-4 h-4" /> },
};

function ApplicationCard({
  application,
  onUpdateStatus,
}: {
  application: ApplicationWithDetails;
  onUpdateStatus: (id: string, status: Application["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[application.status];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
            {application.profiles.full_name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-gray-800 text-base">{application.profiles.full_name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {application.profiles.email}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${config.color}`}>
                {config.icon}
                {config.label}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Applied for: <span className="font-semibold text-gray-700">{application.jobs.title}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(application.applied_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onUpdateStatus(application.id, "reviewed")}
            disabled={application.status === "reviewed"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Mark Reviewed
          </button>
          <button
            onClick={() => onUpdateStatus(application.id, "shortlisted")}
            disabled={application.status === "shortlisted"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Shortlist
          </button>
          <button
            onClick={() => onUpdateStatus(application.id, "accepted")}
            disabled={application.status === "accepted"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Accept
          </button>
          <button
            onClick={() => onUpdateStatus(application.id, "rejected")}
            disabled={application.status === "rejected"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      </div>

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

export const ViewApplications = () => {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch all applications for jobs belonging to this employer
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs!inner ( id, title, employer_id ),
          profiles ( full_name, email )
        `)
        .eq("jobs.employer_id", user.id);

      if (error) throw error;

      const applicationsData: ApplicationWithDetails[] = (data ?? []).map((row: any) => ({
        id: row.id,
        job_id: row.job_id,
        job_seeker_id: row.job_seeker_id,
        cover_letter: row.cover_letter,
        resume_url: row.resume_url,
        status: row.status,
        applied_at: row.applied_at,
        updated_at: row.updated_at,
        jobs: { title: row.jobs?.title ?? "Unknown Job" },
        profiles: {
          full_name: row.profiles?.full_name ?? "Unknown Candidate",
          email: row.profiles?.email ?? "N/A",
        },
      }));

      setApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };

  const updateApplicationStatus = async (applicationId: string, status: Application["status"]) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);
      if (error) throw error;
      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status } : app)));
      showToast(`Application marked as ${status}`, "success");
    } catch (error) {
      console.error("Error updating application:", error);
      showToast("Failed to update status", "error");
    }
  };


  const uniqueJobs = Array.from(new Set(applications.map((app) => app.jobs.title)));

  const filtered = applications.filter((app) => {
    const matchJob = selectedJob === "all" || app.jobs.title === selectedJob;
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchJob && matchStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Applications</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "blue" },
            { label: "Pending", value: stats.pending, color: "yellow" },
            { label: "Shortlisted", value: stats.shortlisted, color: "green" },
            { label: "Accepted", value: stats.accepted, color: "emerald" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        {applications.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Jobs</option>
                {uniqueJobs.map((job) => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "reviewed", "shortlisted", "accepted", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                    filterStatus === s
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-600">No applications found</p>
          <p className="text-gray-400 mt-1 text-sm">
            {applications.length === 0 ? "No one has applied to your jobs yet" : "Try different filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</p>
          {filtered.map((application) => (
            <ApplicationCard key={application.id} application={application} onUpdateStatus={updateApplicationStatus} />
          ))}
        </div>
      )}
    </div>
  );
};
