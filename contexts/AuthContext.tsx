

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase, Database } from '../lib/supabaseClient';
import { AuthSession, Profile } from '../types';
import { AuthError, User, Session } from '@supabase/supabase-js';
import { useToast } from './ToastContext';
import { authStorage } from '../lib/authStorage';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: AuthSession | null;
  profile: UserProfile | null;
  signUp: (args: { username: string; password: string; nickname: string; }) => Promise<{ user: User | null; session: Session | null; error: AuthError | null; }>;
  signIn: (args: { username: string; password: string; rememberMe: boolean; }) => Promise<{ error: AuthError | null; }>;
  signOut: () => Promise<{ error: AuthError | null; }>;
  authLoading: boolean;
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean, message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS_KEY = 'soccer-vote-mock-users';
const MOCK_SESSION_KEY = 'soccer-vote-mock-session';


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { addToast } = useToast();
  const isLocalMode = supabase === null;

  useEffect(() => {
    if (isLocalMode) {
      try {
        const storedSessionJson = localStorage.getItem(MOCK_SESSION_KEY) || sessionStorage.getItem(MOCK_SESSION_KEY);
        if (storedSessionJson) {
          const mockSession: AuthSession = JSON.parse(storedSessionJson);
          setSession(mockSession);
          const storedProfile = mockSession.user?.user_metadata as UserProfile;
          if (storedProfile) {
            setProfile(storedProfile);
          }
        }
      } catch (e) {
        console.error("Failed to parse mock session from storage", e);
        localStorage.removeItem(MOCK_SESSION_KEY);
        sessionStorage.removeItem(MOCK_SESSION_KEY);
      }
      setAuthLoading(false);
      return;
    }

    // This function handles the initial check and sets up the listener.
    const initializeAuth = async () => {
      try {
        // Step 1: Reliably get the session on initial load.
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          addToast("세션 정보를 가져오는 중 오류가 발생했습니다.", "error");
        } else if (initialSession) {
            setSession(initialSession as AuthSession);
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', initialSession.user.id)
              .single();
  
            if (profileError && profileError.code !== 'PGRST116') {
              console.error("Error fetching profile on init:", profileError);
            } else {
              setProfile(userProfile);
            }
        }
      } catch (e) {
          console.error("Unexpected error during auth initialization:", e);
      } finally {
        // Step 2: Crucially, set loading to false *after* the initial check is complete.
        setAuthLoading(false);
      }
    };

    initializeAuth();

    // Step 3: Set up the listener for subsequent auth state changes (login, logout, etc).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession as AuthSession | null);
      
      if (newSession?.user) {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile on auth state change:", error);
          setProfile(null);
        } else {
          setProfile(userProfile);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isLocalMode, addToast]);


  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!isLocalMode) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
  
      if (error && error.code !== 'PGRST116') {
        return { available: false, message: `오류가 발생했습니다: ${error.message}` };
      }
      if (data) {
        return { available: false, message: '이미 사용 중인 아이디입니다.' };
      }
      return { available: true, message: '사용 가능한 아이디입니다.' };
    }

    try {
      const mockUsers: Profile[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const userExists = mockUsers.some(user => user.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        return { available: false, message: '이미 사용 중인 아이디입니다.' };
      }
      return { available: true, message: '사용 가능한 아이디입니다.' };
    } catch (e) {
      return { available: false, message: '로컬 저장소 오류' };
    }
  }, [isLocalMode]);

  const signUp = useCallback(async ({ username, password, nickname }: { username: string; password: string; nickname: string; }) => {
    if (!isLocalMode) {
      authStorage.setPersistence(true); // Always persist on sign-up for better UX
      const { available } = await checkUsernameAvailability(username);
      if (!available) {
          return { user: null, session: null, error: new AuthError('이미 사용 중인 아이디입니다.') };
      }
      
      const email = `user.${username.toLowerCase()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            nickname: nickname,
          },
        },
      });

      if (error) return { user: null, session: null, error };

      if (data.user && !data.session) {
        return { 
            user: data.user, 
            session: null, 
            error: new AuthError("회원가입은 성공했으나 자동 로그인이 실패했습니다. 관리자는 Supabase 프로젝트의 'Confirm email' 설정을 비활성화해야 합니다.") 
        };
      }
      
      return { user: data.user, session: data.session, error };
    }

    try {
      const { available } = await checkUsernameAvailability(username);
      if (!available) {
        return { user: null, session: null, error: new AuthError('이미 사용 중인 아이디입니다.') };
      }

      const mockUsers: UserProfile[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const newUser: UserProfile = {
        id: `mock-user-${Date.now()}`,
        username,
        nickname,
        updated_at: new Date().toISOString()
      };
      mockUsers.push(newUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));

      const mockUser: User = {
        id: newUser.id,
        app_metadata: {},
        user_metadata: { ...newUser },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      
      const mockSession: AuthSession = {
        access_token: `mock-access-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000,
        refresh_token: `mock-refresh-${Date.now()}`,
        user: mockUser,
      };
      // In mock mode, sign-up always persists the session.
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      
      // Manually update state for mock mode
      setSession(mockSession);
      setProfile(newUser);
      
      return { user: mockUser, session: mockSession, error: null };
    } catch (e: any) {
      return { user: null, session: null, error: new AuthError(e.message || 'An unknown error occurred') };
    }
  }, [isLocalMode, checkUsernameAvailability]);
  
  const signIn = useCallback(async ({ username, password, rememberMe }: { username: string; password: string; rememberMe: boolean; }) => {
    if (!isLocalMode) {
      authStorage.setPersistence(rememberMe);
      const email = `user.${username.toLowerCase()}@example.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    }

    try {
      const mockUsers: UserProfile[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const foundUser = mockUsers.find(user => user.username.toLowerCase() === username.toLowerCase());

      if (!foundUser) {
        return { error: new AuthError('Invalid login credentials') };
      }

      const mockSession: AuthSession = {
        access_token: `mock-access-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000,
        refresh_token: `mock-refresh-${Date.now()}`,
        user: {
          id: foundUser.id,
          app_metadata: {},
          user_metadata: { ...foundUser },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        }
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      // Clear the other storage to prevent conflicts
      if (rememberMe) sessionStorage.removeItem(MOCK_SESSION_KEY); else localStorage.removeItem(MOCK_SESSION_KEY);
      storage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      
      setSession(mockSession);
      setProfile(foundUser);
      return { error: null };
    } catch (e: any) {
      return { error: new AuthError(e.message || 'An unknown error occurred') };
    }
  }, [isLocalMode]);
  
  const signOut = useCallback(async () => {
    if (!isLocalMode) {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setSession(null);
        setProfile(null);
      }
      return { error };
    }
    
    try {
      localStorage.removeItem(MOCK_SESSION_KEY);
      sessionStorage.removeItem(MOCK_SESSION_KEY);
      setSession(null);
      setProfile(null);
      return { error: null };
    } catch (e: any) {
      return { error: new AuthError(e.message || 'An unknown error occurred') };
    }
  }, [isLocalMode]);


  const value = {
    session,
    profile,
    signUp,
    signIn,
    signOut,
    authLoading,
    checkUsernameAvailability
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};