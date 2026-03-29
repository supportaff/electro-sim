import { supabase } from './supabase';

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getUser = () => supabase.auth.getUser();

export const onAuthChange = (cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
  supabase.auth.onAuthStateChange(cb);
