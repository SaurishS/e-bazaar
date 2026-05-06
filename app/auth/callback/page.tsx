"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Completing login...");

  useEffect(() => {
    const handleAuth = async () => {
        try {
            console.log("handleAuth triggered");
            // Exchange the code for a session (Required for PKCE flow)
            const code = searchParams.get('code');
            if (code) {
                console.log("Exchanging code for session...");
                await supabase.auth.exchangeCodeForSession(code);
            }

            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Auth error:", error);
                router.push('/login/customer'); 
                return;
            }

            if (!session) {
                console.log("No session found yet...");
                // Don't redirect yet, wait for the listener if we're still loading
                return;
            }

            console.log("Session found for user:", session.user.email);
            const user = session.user;
            const requestedRole = searchParams.get('role'); // 'customer' or 'seller'
            const existingRole = user.user_metadata.role;

            // 1. New User (No Role yet) - Assign it
            if (!existingRole && requestedRole) {
                console.log("Assigning role:", requestedRole);
                setStatus("Setting up your account...");
                await supabase.auth.updateUser({
                    data: { role: requestedRole }
                });
                router.push('/');
                return;
            }

            // 2. Existing User - Check Role Match
            if (existingRole && requestedRole) {
                if (existingRole !== requestedRole) {
                    console.log("Role mismatch:", existingRole, "vs", requestedRole);
                    await supabase.auth.signOut();
                    alert(`Error: This email is already registered as a ${existingRole}. Please use the ${existingRole} login.`);
                    router.push(`/login/${existingRole}`);
                    return;
                }
            }

            // 3. Success (Role matches or no specific role requested)
            console.log("Login successful, redirecting home");
            router.push('/');
        } catch (err) {
            console.error("Unexpected error in handleAuth:", err);
            router.push('/login/customer');
        }
    };

    // Run once immediately on mount in case session is already there
    handleAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
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
