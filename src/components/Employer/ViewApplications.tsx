import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export type Application = {
  id: string;
  job_id: string;
  job_seeker_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  applied_at: any;
  updated_at: any;
};

type ApplicationWithDetails = Application & {
  jobs: {
    title: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
};

export const ViewApplications = () => {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'applications')
      );

      const querySnapshot = await getDocs(q);
      const applicationsData: ApplicationWithDetails[] = [];

      for (const appDoc of querySnapshot.docs) {
        const application = { id: appDoc.id, ...appDoc.data() } as Application;
        
        // Fetch job details to check employer_id matching
        const jobDocRef = doc(db, 'jobs', application.job_id);
        const jobDocSnap = await getDoc(jobDocRef);
        
        if (jobDocSnap.exists()) {
          const jobData = jobDocSnap.data();
          
          // Only show applications for jobs owned by this employer
          if (jobData.employer_id === user.uid) {
            // Fetch job seeker profile
            const seekerDocRef = doc(db, 'profiles', application.job_seeker_id);
            const seekerDocSnap = await getDoc(seekerDocRef);
            
            const seekerData = seekerDocSnap.exists()
              ? seekerDocSnap.data()
              : { full_name: 'Unknown Candidate', email: 'N/A' };

            applicationsData.push({
              ...application,
              jobs: {
                title: jobData.title,
              },
              profiles: {
                full_name: seekerData.full_name,
                email: seekerData.email
              }
            });
          }
        }
      }

      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      const docRef = doc(db, 'applications', applicationId);
      await updateDoc(docRef, { status });

      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const uniqueJobs = Array.from(new Set(applications.map(app => app.jobs.title)));
  const filteredApplications = selectedJob === 'all'
    ? applications
    : applications.filter(app => app.jobs.title === selectedJob);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No applications received yet</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Job</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Jobs</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {application.profiles.full_name}
                    </h3>
                    <p className="text-gray-600">{application.profiles.email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Applied for: <span className="font-semibold text-gray-700">{application.jobs.title}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Applied on: {application.applied_at?.toDate ? application.applied_at.toDate().toLocaleDateString() : new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                      disabled={application.status === 'reviewed'}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Reviewed
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                      disabled={application.status === 'shortlisted'}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Shortlist
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      disabled={application.status === 'rejected'}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>

                {application.cover_letter && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Cover Letter</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                  </div>
                )}

                <div className="mt-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                    application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                    application.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
