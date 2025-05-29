import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

type ApplicationWithJob = Application & {
  jobs: {
    title: string;
    employer_profiles: {
      company_name: string;
    };
  };
};

export const MyApplications = () => {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
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
        collection(db, 'applications'),
        where('job_seeker_id', '==', user.uid),
        orderBy('applied_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applicationsData: ApplicationWithJob[] = [];

      for (const appDoc of querySnapshot.docs) {
        const application = { id: appDoc.id, ...appDoc.data() } as Application;
        
        // Fetch job details
        const jobDocRef = doc(db, 'jobs', application.job_id);
        const jobDocSnap = await getDoc(jobDocRef);
        
        if (jobDocSnap.exists()) {
          const jobData = jobDocSnap.data();
          
          // Fetch employer profile for the job
          const employerDocRef = doc(db, 'profiles', jobData.employer_id);
          const employerDocSnap = await getDoc(employerDocRef);
          
          const employerData = employerDocSnap.exists()
            ? employerDocSnap.data()
            : { full_name: 'Unknown Company' };

          applicationsData.push({
            ...application,
            jobs: {
              title: jobData.title,
              employer_profiles: {
                company_name: employerData.full_name
              }
            }
          });
        }
      }

      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'reviewed':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">My Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">You haven't applied to any jobs yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {application.jobs.title}
                  </h3>
                  <p className="text-emerald-600 font-semibold mb-3">
                    {application.jobs.employer_profiles.company_name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Applied on {application.applied_at?.toDate ? application.applied_at.toDate().toLocaleDateString() : new Date(application.applied_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last updated: {application.updated_at?.toDate ? application.updated_at.toDate().toLocaleDateString() : new Date(application.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(application.status)}
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
