import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'job_seeker' | 'employer' | 'admin';
  created_at?: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'job_seeker' | 'employer') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!error && data) {
        return data as Profile;
      }

      // Fallback: If profile row is missing in `profiles` table (e.g. account created before DB trigger),
      // create it automatically using user metadata or defaults.
      const fullName = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User';
      const role = (currentUser.user_metadata?.role as 'job_seeker' | 'employer') || 'job_seeker';

      const fallbackProfile: Profile = {
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: fullName,
        role: role,
      };

      // Try inserting into profiles table
      await supabase.from('profiles').upsert(fallbackProfile);

      if (role === 'job_seeker') {
        await supabase.from('job_seeker_profiles').upsert({ user_id: currentUser.id });
      } else if (role === 'employer') {
        await supabase.from('employer_profiles').upsert({ user_id: currentUser.id, company_name: fullName });
      }

      return fallbackProfile;
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      // Return a basic profile so user is never blocked from logging in
      return {
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
        role: (currentUser.user_metadata?.role as 'job_seeker' | 'employer') || 'job_seeker',
      };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser).then(setProfile);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const profileData = await fetchProfile(currentUser);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'job_seeker' | 'employer') => {
    try {
      // Pass metadata so the DB trigger (handle_new_user) auto-creates the profile
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });
      if (error) throw error;
      // Profile + role-specific record are created by the DB trigger on auth.users insert
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
