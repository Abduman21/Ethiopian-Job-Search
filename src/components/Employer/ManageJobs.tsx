import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Eye, Trash2 } from 'lucide-react';

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

export const ManageJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'jobs'),
        where('employer_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const docRef = doc(db, 'jobs', jobId);
      await deleteDoc(docRef);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';

    try {
      const docRef = doc(db, 'jobs', jobId);
      await updateDoc(docRef, { status: newStatus });

      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus as 'active' | 'closed' | 'draft' } : job
      ));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Manage Jobs</h1>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">You haven't posted any jobs yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' :
                      job.status === 'closed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.job_type && <span className="capitalize">{job.job_type.replace('_', ' ')}</span>}
                    <span>Posted {job.created_at?.toDate ? job.created_at.toDate().toLocaleDateString() : new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleJobStatus(job.id, job.status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      job.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
