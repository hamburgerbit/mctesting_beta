import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Check if profile exists, if not create one
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select()
          .eq('id', currentUser.id)
          .single();

        if (!existingProfile) {
          // Create new profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              username: currentUser.user_metadata.full_name || currentUser.user_metadata.name || 'Unknown Player',
              avatar_url: currentUser.user_metadata.avatar_url,
              title: 'New Player',
              region: 'NA' // Default region
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        checkAdminStatus(currentUser.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdminStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setIsAdmin(data.is_admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  return { user, isAdmin, loading };
}