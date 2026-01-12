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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
            router.push('/login/customer'); // Default fallback
            return;
        }

        const user = session.user;
        const requestedRole = searchParams.get('role'); // 'customer' or 'seller'
        const existingRole = user.user_metadata.role;

        // 1. New User (No Role yet) - Assign it
        if (!existingRole && requestedRole) {
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
                // Mismatch!
                await supabase.auth.signOut();
                alert(`Error: This email is already registered as a ${existingRole}. Please use the ${existingRole} login.`);
                router.push(`/login/${existingRole}`);
                return;
            }
        }

        // 3. Success (Role matches or no specific role requested)
        router.push('/');
    };

    // Listen for the initial auth state change from the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        handleAuth();
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
