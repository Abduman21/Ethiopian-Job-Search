import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
  X,
  DollarSign,
  Award,
  Send,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
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
};

type JobWithEmployer = Job & {
  employer_profiles: {
    company_name: string;
    company_logo?: string;
  };
};

const JOB_TYPES = [
  { value: "all", label: "All Types" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const jobTypeColors: Record<string, string> = {
  full_time: "bg-blue-100 text-blue-700",
  part_time: "bg-purple-100 text-purple-700",
  contract: "bg-orange-100 text-orange-700",
  internship: "bg-pink-100 text-pink-700",
};

function JobDetailModal({
  job,
  isSaved,
  onClose,
  onToggleSave,
  onApply,
}: {
  job: JobWithEmployer;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onApply: (job: JobWithEmployer, coverLetter: string) => Promise<void>;
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    await onApply(job, coverLetter);
    setApplying(false);
    setShowApplyForm(false);
    setCoverLetter("");
    setApplied(true);
    // Auto-close after 3 seconds
    setTimeout(() => onClose(), 3000);
  };

  // ── Success screen ──────────────────────────────────────────────────
  if (applied) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center animate-in zoom-in-95 duration-300">
          {/* Gradient top strip */}
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

          <div className="px-8 py-8">
            {/* Illustration */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-70 scale-90" />
              <img
                src="/apply-success.jpg"
                alt="Application submitted!"
                className="relative w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Text */}
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              Application Sent! 🎉
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              Your application for
            </p>
            <p className="font-bold text-emerald-600 text-base mb-1">{job.title}</p>
            <p className="text-gray-400 text-sm mb-6">
              at {job.employer_profiles.company_name}
            </p>

            {/* Progress dots / closing hint */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-xs text-gray-400">Closing automatically…</p>
            </div>

            {/* What's next chips */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                <p className="text-2xl mb-1">📬</p>
                <p className="font-medium text-gray-600">Check My Applications</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                <p className="text-2xl mb-1">🔔</p>
                <p className="font-medium text-gray-600">Watch for updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-emerald-600 font-semibold mt-1">{job.employer_profiles.company_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(job.id)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck className="w-6 h-6 text-emerald-600 fill-current" />
              ) : (
                <Bookmark className="w-6 h-6 text-gray-400" />
              )}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            {job.location && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-gray-700 font-medium">{job.location}</span>
              </div>
            )}
            {job.job_type && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-gray-700 font-medium capitalize">{job.job_type.replace("_", " ")}</span>
              </div>
            )}
            {job.salary_min && job.salary_max && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-gray-700 font-medium">
                  ETB {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Award className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-gray-700 font-medium">{job.experience_required} yrs experience</span>
            </div>
          </div>

          {job.deadline && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Job Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Requirements</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {/* Skills */}
          {job.skills_required.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Section */}
          {!showApplyForm ? (
            <button
              onClick={() => setShowApplyForm(true)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Apply for this Position
            </button>
          ) : (
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h3 className="font-bold text-gray-800 mb-3">Write a Cover Letter (Optional)</h3>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white"
                placeholder="Tell the employer why you are a great fit for this role..."
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const JobSearch = () => {
  const [jobs, setJobs] = useState<JobWithEmployer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<JobWithEmployer | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
      fetchAppliedJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`*, profiles ( full_name, avatar_url )`)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const jobsData: JobWithEmployer[] = (data ?? []).map((row: any) => ({
        ...row,
        employer_profiles: {
          company_name: row.profiles?.full_name ?? "Unknown Company",
          company_logo: row.profiles?.avatar_url,
        },
      }));

      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
    setLoading(false);
  };

  const fetchSavedJobs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("job_seeker_id", user.id);
      if (error) throw error;
      setSavedJobs(new Set((data ?? []).map((d) => d.job_id)));
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const fetchAppliedJobs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("job_seeker_id", user.id);
      if (error) throw error;
      setAppliedJobs(new Set((data ?? []).map((d) => d.job_id)));
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!user) return;
    try {
      if (savedJobs.has(jobId)) {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("job_seeker_id", user.id)
          .eq("job_id", jobId);
        setSavedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        showToast("Job removed from saved", "info");
      } else {
        await supabase.from("saved_jobs").insert({ job_id: jobId, job_seeker_id: user.id });
        setSavedJobs((prev) => new Set(prev).add(jobId));
        showToast("Job saved successfully!", "success");
      }
    } catch (error) {
      console.error("Error toggling save job:", error);
    }
  };

  const applyToJob = async (job: JobWithEmployer, coverLetter: string) => {
    if (!user) return;
    if (appliedJobs.has(job.id)) {
      showToast("You already applied to this job", "warning");
      return;
    }
    try {
      const { error } = await supabase.from("applications").insert({
        job_id: job.id,
        job_seeker_id: user.id,
        cover_letter: coverLetter,
        status: "pending",
      });
      if (error) throw error;
      setAppliedJobs((prev) => new Set(prev).add(job.id));
      setSelectedJob(null);
      showToast(`Applied to ${job.title} successfully!`, "success");
    } catch (error) {
      console.error("Error applying:", error);
      showToast("Failed to submit application. Try again.", "error");
    }
  };


  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer_profiles.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || job.job_type === filterType;
    const matchesLocation =
      !filterLocation || (job.location && job.location.toLowerCase().includes(filterLocation.toLowerCase()));
    return matchesSearch && matchesType && matchesLocation;
  });

  const locations = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="h-10 bg-gray-200 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Dream Job</h1>
        <p className="text-gray-500 mb-5">{jobs.length} opportunities available in Ethiopia</p>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, company, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border font-semibold transition-all shadow-sm ${
              showFilters
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Job Type
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setFilterType(t.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filterType === t.value
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  list="locations"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <datalist id="locations">
                  {locations.map((loc) => (
                    <option key={loc} value={loc ?? ""} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Illustration */}
          <div className="relative w-56 h-56 mb-2">
            {/* Soft glow behind image */}
            <div className="absolute inset-0 bg-teal-100 rounded-full blur-2xl opacity-60 scale-90" />
            <img
              src="/search-empty.jpg"
              alt="No jobs found"
              className="relative w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mt-2">
            {searchTerm || filterType !== "all" || filterLocation
              ? "No matching jobs found"
              : "No jobs available right now"}
          </h3>
          <p className="text-gray-400 mt-2 text-sm max-w-xs text-center">
            {searchTerm || filterType !== "all" || filterLocation
              ? "Try different keywords or adjust your filters"
              : "Check back soon — new opportunities are posted daily"}
          </p>
          {(searchTerm || filterType !== "all" || filterLocation) && (
            <button
              onClick={() => { setSearchTerm(""); setFilterType("all"); setFilterLocation(""); }}
              className="mt-5 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filteredJobs.length} results</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden group cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="p-6">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {job.employer_profiles.company_name.charAt(0)}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {savedJobs.has(job.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-emerald-600 fill-current" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-emerald-600 font-semibold text-sm mb-3">{job.employer_profiles.company_name}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    )}
                    {job.job_type && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${jobTypeColors[job.job_type] || "bg-gray-100 text-gray-600"}`}>
                        {job.job_type.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {job.salary_min && job.salary_max && (
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      ETB {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()}
                    </p>
                  )}

                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>

                  {job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills_required.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {job.skills_required.length > 3 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          +{job.skills_required.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  {appliedJobs.has(job.id) ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      ✓ Applied
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 group-hover:underline">
                      View & Apply →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isSaved={savedJobs.has(selectedJob.id)}
          onClose={() => setSelectedJob(null)}
          onToggleSave={toggleSaveJob}
          onApply={applyToJob}
        />
      )}
    </div>
  );
};
