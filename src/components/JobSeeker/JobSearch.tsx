import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, MapPin, Briefcase, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type Job = {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  job_type?: 'full_time' | 'part_time' | 'contract' | 'internship';
  salary_min?: number;
  salary_max?: number;
  skills_required: string[];
  experience_required: number;
  status: 'active' | 'closed' | 'draft';
  deadline?: string;
  created_at: any;
  updated_at: any;
};

type JobWithEmployer = Job & {
  employer_profiles: {
    company_name: string;
    company_logo?: string;
  };
};

export const JobSearch = () => {
  const [jobs, setJobs] = useState<JobWithEmployer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'jobs'),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const jobsData: JobWithEmployer[] = [];

      for (const jobDoc of querySnapshot.docs) {
        const job = { id: jobDoc.id, ...jobDoc.data() } as Job;
        
        // Fetch employer profile for each job
        const employerDocRef = doc(db, 'profiles', job.employer_id);
        const employerDocSnap = await getDoc(employerDocRef);
        
        const employerData = employerDocSnap.exists() 
          ? employerDocSnap.data() 
          : { full_name: 'Unknown Company' };

        jobsData.push({
          ...job,
          employer_profiles: {
            company_name: employerData.full_name,
            company_logo: employerData.avatar_url
          }
        });
      }

      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  };

  const fetchSavedJobs = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'saved_jobs'),
        where('job_seeker_id', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      setSavedJobs(new Set(querySnapshot.docs.map(doc => doc.data().job_id)));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!user) return;

    const savedJobId = `${user.uid}_${jobId}`;
    const docRef = doc(db, 'saved_jobs', savedJobId);

    try {
      if (savedJobs.has(jobId)) {
        await deleteDoc(docRef);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await setDoc(docRef, {
          job_id: jobId,
          job_seeker_id: user.uid,
          saved_at: new Date()
        });
        setSavedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Error toggling save job:', error);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employer_profiles.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Find Your Dream Job</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No jobs found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 relative">
              <button
                onClick={() => toggleSaveJob(job.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-emerald-600 transition-colors"
              >
                {savedJobs.has(job.id) ? (
                  <BookmarkCheck className="w-6 h-6 fill-current text-emerald-600" />
                ) : (
                  <Bookmark className="w-6 h-6" />
                )}
              </button>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 pr-8">{job.title}</h3>
                <p className="text-emerald-600 font-semibold">{job.employer_profiles.company_name}</p>
              </div>

              <div className="space-y-2 mb-4">
                {job.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                )}
                {job.job_type && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="text-sm capitalize">{job.job_type.replace('_', ' ')}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">Posted {job.created_at?.toDate ? job.created_at.toDate().toLocaleDateString() : new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {job.salary_min && job.salary_max && (
                <p className="text-lg font-semibold text-gray-800 mb-4">
                  ETB {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                </p>
              )}

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>

              {job.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills_required.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {job.skills_required.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      +{job.skills_required.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
