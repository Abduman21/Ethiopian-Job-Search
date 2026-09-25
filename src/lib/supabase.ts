import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type JobSeekerProfile = {
  id: string;
  user_id: string;
  resume_url?: string;
  skills: string[];
  experience_years: number;
  education?: string;
  location?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
};

export type EmployerProfile = {
  id: string;
  user_id: string;
  company_name: string;
  company_logo?: string;
  company_description?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  location?: string;
  created_at: string;
  updated_at: string;
};

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
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  job_seeker_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  applied_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'application' | 'job_alert' | 'interview' | 'system';
  read: boolean;
  created_at: string;
};
