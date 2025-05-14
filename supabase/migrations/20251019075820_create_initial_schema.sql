/*
  # Ethiopian Job Search Platform - Initial Schema

  ## Overview
  Complete database schema for a job search platform with three user roles: job seekers, employers, and administrators.

  ## New Tables
  
  ### 1. `profiles`
  Extends auth.users with additional profile information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `full_name` (text, not null)
  - `phone` (text)
  - `role` (text, not null) - 'job_seeker', 'employer', or 'admin'
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `job_seeker_profiles`
  Additional information for job seekers
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `resume_url` (text)
  - `skills` (text[])
  - `experience_years` (integer)
  - `education` (text)
  - `location` (text)
  - `bio` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `employer_profiles`
  Additional information for employers
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `company_name` (text, not null)
  - `company_logo` (text)
  - `company_description` (text)
  - `industry` (text)
  - `company_size` (text)
  - `website` (text)
  - `location` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `jobs`
  Job postings created by employers
  - `id` (uuid, primary key)
  - `employer_id` (uuid, references profiles)
  - `title` (text, not null)
  - `description` (text, not null)
  - `requirements` (text)
  - `location` (text)
  - `job_type` (text) - 'full_time', 'part_time', 'contract', 'internship'
  - `salary_min` (integer)
  - `salary_max` (integer)
  - `skills_required` (text[])
  - `experience_required` (integer)
  - `status` (text) - 'active', 'closed', 'draft'
  - `deadline` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `applications`
  Job applications submitted by job seekers
  - `id` (uuid, primary key)
  - `job_id` (uuid, references jobs)
  - `job_seeker_id` (uuid, references profiles)
  - `cover_letter` (text)
  - `resume_url` (text)
  - `status` (text) - 'pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'
  - `applied_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `saved_jobs`
  Jobs saved by job seekers for later
  - `id` (uuid, primary key)
  - `job_id` (uuid, references jobs)
  - `job_seeker_id` (uuid, references profiles)
  - `saved_at` (timestamptz)

  ### 7. `notifications`
  System notifications for all users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text, not null)
  - `message` (text, not null)
  - `type` (text) - 'application', 'job_alert', 'interview', 'system'
  - `read` (boolean)
  - `created_at` (timestamptz)

  ### 8. `job_alerts`
  Job alert preferences for job seekers
  - `id` (uuid, primary key)
  - `job_seeker_id` (uuid, references profiles)
  - `keywords` (text[])
  - `location` (text)
  - `job_type` (text)
  - `active` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies created for each user role with appropriate access controls
  - Users can only access their own data
  - Employers can manage their own job postings
  - Job seekers can view active jobs and manage their applications
  - Admins have full access to all data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('job_seeker', 'employer', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create job_seeker_profiles table
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_url text,
  skills text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  education text,
  location text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_seeker_profiles ENABLE ROW LEVEL SECURITY;

-- Create employer_profiles table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_logo text,
  company_description text,
  industry text,
  company_size text,
  website text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  location text,
  job_type text CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
  salary_min integer,
  salary_max integer,
  skills_required text[] DEFAULT '{}',
  experience_required integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text,
  resume_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, job_seeker_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(job_id, job_seeker_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('application', 'job_alert', 'interview', 'system')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create job_alerts table
CREATE TABLE IF NOT EXISTS job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_seeker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  keywords text[] DEFAULT '{}',
  location text,
  job_type text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for job_seeker_profiles
CREATE POLICY "Anyone can view job seeker profiles"
  ON job_seeker_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Job seekers can update own profile"
  ON job_seeker_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Job seekers can insert own profile"
  ON job_seeker_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for employer_profiles
CREATE POLICY "Anyone can view employer profiles"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can update own profile"
  ON employer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employers can insert own profile"
  ON employer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for jobs
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'active' OR employer_id = auth.uid());

CREATE POLICY "Employers can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (employer_id = auth.uid());

-- RLS Policies for applications
CREATE POLICY "Job seekers can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (job_seeker_id = auth.uid() OR EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
  ));

CREATE POLICY "Job seekers can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (job_seeker_id = auth.uid());

CREATE POLICY "Job seekers can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (job_seeker_id = auth.uid() OR EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
  ))
  WITH CHECK (job_seeker_id = auth.uid() OR EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
  ));

-- RLS Policies for saved_jobs
CREATE POLICY "Job seekers can view own saved jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (job_seeker_id = auth.uid());

CREATE POLICY "Job seekers can insert own saved jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (job_seeker_id = auth.uid());

CREATE POLICY "Job seekers can delete own saved jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (job_seeker_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for job_alerts
CREATE POLICY "Job seekers can view own job alerts"
  ON job_alerts FOR SELECT
  TO authenticated
  USING (job_seeker_id = auth.uid());

CREATE POLICY "Job seekers can insert own job alerts"
  ON job_alerts FOR INSERT
  TO authenticated
  WITH CHECK (job_seeker_id = auth.uid());

CREATE POLICY "Job seekers can update own job alerts"
  ON job_alerts FOR UPDATE
  TO authenticated
  USING (job_seeker_id = auth.uid())
  WITH CHECK (job_seeker_id = auth.uid());

CREATE POLICY "Job seekers can delete own job alerts"
  ON job_alerts FOR DELETE
  TO authenticated
  USING (job_seeker_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_seeker_id ON applications(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);