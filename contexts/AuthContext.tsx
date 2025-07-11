
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Database } from '../lib/supabaseClient';
import { AuthSession } from '../types';
import { AuthError, User, Session } from '@supabase/supabase-js';
import { useToast } from './ToastContext';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: AuthSession | null;
  profile: UserProfile | null;
  signUp: (args: { username: string; password: string; nickname: string; }) => Promise<{ user: User | null; session: Session | null; error: AuthError | null; }>;
  signIn: (args: { username: string; password: string; }) => Promise<{ error: AuthError | null; }>;
  signOut: () => Promise<{ error: AuthError | null; }>;
  authLoading: boolean;
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean, message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys for mock auth
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
        const storedSession = localStorage.getItem(MOCK_SESSION_KEY);
        if (storedSession) {
          const mockSession: AuthSession = JSON.parse(storedSession);
          setSession(mockSession);
          const storedProfile = mockSession.user?.user_metadata as UserProfile;
          if (storedProfile) {
            setProfile(storedProfile);
          }
        }
      } catch (e) {
        console.error("Failed to parse mock session from localStorage", e);
        localStorage.removeItem(MOCK_SESSION_KEY);
      }
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);

    // This function explicitly fetches the session on page load/refresh.
    // It's the "source of truth" for the initial auth state.
    const fetchInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error fetching initial session:", error.message);
      }

      setSession(session);

      if (session) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile on initial load:", profileError.message);
          setProfile(null);
        } else {
          setProfile(userProfile);
        }
      }
      // Crucially, we set loading to false only after the initial check is complete.
      setAuthLoading(false);
    };

    fetchInitialSession();

    // This listener handles auth changes that happen *after* initial load,
    // like user logging in or out in another tab.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
            const { data: userProfile, error } = await supabase
                .from('profiles').select('*').eq('id', session.user.id).single();
            if (error && error.code !== 'PGRST116') {
                setProfile(null);
            } else {
                setProfile(userProfile);
            }
        } else {
            setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isLocalMode, addToast]);


  const signUp = async ({ username, password, nickname }: { username: string; password: string; nickname: string; }) => {
    if (!isLocalMode) {
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

      // Handle case where email confirmation is required by mistake.
      if (data.user && !data.session) {
        return { 
            user: data.user, 
            session: null, 
            error: new AuthError("회원가입은 성공했으나 자동 로그인이 실패했습니다. 관리자는 Supabase 프로젝트의 'Confirm email' 설정을 비활성화해야 합니다.") 
        };
      }
      
      return { user: data.user, session: data.session, error };
    }

    // --- MOCK SIGN UP ---
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
      
      // Also create and set a session immediately for local mode
      const mockSession: AuthSession = {
        access_token: `mock-access-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000,
        refresh_token: `mock-refresh-${Date.now()}`,
        user: mockUser,
      };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      
      return { user: mockUser, session: mockSession, error: null };

    } catch (e: any) {
      return { user: null, session: null, error: new AuthError(e.message || 'An unknown error occurred') };
    }
  };
  
  const checkUsernameAvailability = async (username: string) => {
    if (!isLocalMode) {
      // Supabase logic
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

    // --- MOCK CHECK ---
    try {
      const mockUsers: UserProfile[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const userExists = mockUsers.some(user => user.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        return { available: false, message: '이미 사용 중인 아이디입니다.' };
      }
      return { available: true, message: '사용 가능한 아이디입니다.' };
    } catch (e) {
      return { available: false, message: '로컬 저장소 오류' };
    }
  };

  const signIn = async ({ username, password }: { username: string; password: string; }) => {
    if (!isLocalMode) {
      const email = `user.${username.toLowerCase()}@example.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    }

    // --- MOCK SIGN IN ---
    try {
      const mockUsers: UserProfile[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const foundUser = mockUsers.find(user => user.username.toLowerCase() === username.toLowerCase());

      if (!foundUser) {
        return { error: new AuthError('Invalid login credentials') };
      }

      // Create a mock session
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

      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
      setSession(mockSession);
      setProfile(foundUser);
      return { error: null };

    } catch (e: any) {
      return { error: new AuthError(e.message || 'An unknown error occurred') };
    }
  };
  
  const signOut = async () => {
    if (!isLocalMode) {
      // Supabase logic
      const { error } = await supabase.auth.signOut();
      if (!error) {
        // Manually clear session and profile for immediate UI update
        setSession(null);
        setProfile(null);
      }
      return { error };
    }
    
    // --- MOCK SIGN OUT ---
    try {
      localStorage.removeItem(MOCK_SESSION_KEY);
      setSession(null);
      setProfile(null);
      return { error: null };
    } catch (e: any) {
      return { error: new AuthError(e.message || 'An unknown error occurred') };
    }
  };


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