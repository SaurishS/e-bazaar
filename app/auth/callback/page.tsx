"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import ThemedAlert from '../../components/ThemedAlert';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Completing login...");
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const alertShown = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
        try {
            if (alertShown.current) return;
            console.log("handleAuth triggered. URL Hash exists:", !!window.location.hash);
            
            // 1. Exchange the code for a session (Required for PKCE flow)
            const code = searchParams.get('code');
            if (code) {
                console.log("Exchanging code for session...");
                await supabase.auth.exchangeCodeForSession(code);
            }

            // 2. Try to get session normally
            let { data: { session }, error } = await supabase.auth.getSession();
            
            // 3. MANUAL FALLBACK
            if (!session && window.location.hash) {
                console.log("No session but hash found. Attempting manual session recovery...");
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log("Manually setting session from hash...");
                    const { data, error: setSessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });
                    if (data.session) session = data.session;
                    if (setSessionError) console.error("Manual session error:", setSessionError);
                }
            }
            
            if (error) {
                console.error("Auth error:", error);
                router.push('/login/customer'); 
                return;
            }

            if (!session) {
                console.log("Still no session found...");
                return;
            }

            console.log("Session verified for user:", session.user.email);
            const user = session.user;
            const requestedRole = searchParams.get('role'); // 'customer' or 'seller'
            const existingRole = user.user_metadata.role;

            // 4. New User (No Role yet) - Assign it
            if (!existingRole && requestedRole) {
                console.log("Assigning role:", requestedRole);
                setStatus("Setting up your account...");
                await supabase.auth.updateUser({
                    data: { role: requestedRole }
                });
                console.log("Role assigned, redirecting...");
                router.replace('/'); 
                return;
            }

            // 5. Existing User - Check Role Match
            if (existingRole && requestedRole) {
                if (existingRole !== requestedRole) {
                    console.log("Role mismatch:", existingRole, "vs", requestedRole);
                    alertShown.current = true;
                    setAlert({
                        message: `This email is already registered as a ${existingRole}. Please use the ${existingRole} login.`,
                        type: 'warning'
                    });
                    await supabase.auth.signOut();
                    setTimeout(() => router.replace(`/login/${existingRole}`), 3000);
                    return;
                }
            }

            // 6. Success
            console.log("Login successful, redirecting home");
            router.replace('/'); 
        } catch (err) {
            console.error("Unexpected error in handleAuth:", err);
            router.push('/login/customer');
        }
    };

    handleAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, !!session);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) handleAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-vk-green-50">
      <ThemedAlert 
        isOpen={!!alert} 
        message={alert?.message || ""} 
        type={alert?.type || 'success'} 
        onClose={() => setAlert(null)} 
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-vk-green-200 border-t-vk-green-600 rounded-full animate-spin"></div>
        <p className="text-vk-green-800 font-medium">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
