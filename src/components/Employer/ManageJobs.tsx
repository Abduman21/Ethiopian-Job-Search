import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  Briefcase,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import { useToast } from "../Toast";

export type Job = {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  job_type?: "full_time" | "part_time" | "contract" | "internship";
  salary_min?: number;
  salary_max?: number;
  skills_required: string[];
  experience_required: number;
  status: "active" | "closed" | "draft";
  deadline?: string;
  created_at: string;
  updated_at: string;
  applicationCount?: number;
};

const jobTypeColors: Record<string, string> = {
  full_time: "bg-blue-100 text-blue-700",
  part_time: "bg-purple-100 text-purple-700",
  contract: "bg-orange-100 text-orange-700",
  internship: "bg-pink-100 text-pink-700",
};

export const ManageJobs = ({ onPostJob }: { onPostJob?: () => void }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch application counts for each job
      const { data: appCounts, error: appError } = await supabase
        .from("applications")
        .select("job_id");

      if (appError) throw appError;

      const countMap: Record<string, number> = {};
      (appCounts ?? []).forEach((a) => {
        countMap[a.job_id] = (countMap[a.job_id] || 0) + 1;
      });

      setJobs(
        (jobsData ?? []).map((j) => ({ ...j, applicationCount: countMap[j.id] || 0 }))
      );
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
    setLoading(false);
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
      setJobs(jobs.filter((job) => job.id !== jobId));
      showToast("Job deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting job:", error);
      showToast("Failed to delete job", "error");
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);
      if (error) throw error;
      setJobs(jobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus as "active" | "closed" | "draft" } : job
      ));
      showToast(`Job ${newStatus === "active" ? "activated" : "closed"}`, "info");
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };


  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    closed: jobs.filter((j) => j.status === "closed").length,
    totalApps: jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Jobs</h1>
          <p className="text-gray-500 mt-1">Track and manage your job postings</p>
        </div>
        {onPostJob && (
          <button
            onClick={onPostJob}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            Post New Job
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Briefcase className="w-5 h-5" />, label: "Total Jobs", value: stats.total, color: "emerald" },
          { icon: <TrendingUp className="w-5 h-5" />, label: "Active", value: stats.active, color: "green" },
          { icon: <ToggleLeft className="w-5 h-5" />, label: "Closed", value: stats.closed, color: "gray" },
          { icon: <Users className="w-5 h-5" />, label: "Total Applications", value: stats.totalApps, color: "blue" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100`}>
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 text-${s.color}-600 flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-center">
          <div className="relative w-64 h-64 mb-3">
            <div className="absolute inset-0 bg-teal-100 rounded-full blur-2xl opacity-60 scale-90" />
            <img
              src="/employer-empty.jpg"
              alt="No jobs posted yet"
              className="relative w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No job postings yet</h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm leading-relaxed">
            Reach thousands of qualified Ethiopian job seekers by creating your first job opening today.
          </p>
          {onPostJob && (
            <button
              onClick={onPostJob}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              Post Your First Job
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          job.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                      {job.job_type && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${jobTypeColors[job.job_type] || "bg-gray-100 text-gray-600"}`}>
                          {job.job_type.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                      {job.salary_min && job.salary_max && (
                        <span className="font-medium text-gray-700">
                          ETB {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <Users className="w-4 h-4" />
                        {job.applicationCount} applications
                      </span>
                    </div>

                    {job.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills_required.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                            +{job.skills_required.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleJobStatus(job.id, job.status)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                        job.status === "active"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {job.status === "active" ? (
                        <><ToggleRight className="w-4 h-4" /> Close</>
                      ) : (
                        <><ToggleLeft className="w-4 h-4" /> Activate</>
                      )}
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium text-sm hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
