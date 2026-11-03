import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://zdstgohvufnoafoiizvu.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkc3Rnb2h2dWZub2Fmb2lpenZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NjM1NDUsImV4cCI6MjEwOTIzOTU0NX0.s9rS79uuUXsN_9oSofmpXwXu7KLtd_lMikTt965bREw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
