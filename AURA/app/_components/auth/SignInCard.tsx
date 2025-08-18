// Sign In Component - Simple authentication UI for AURA
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/auth/SignInCard.tsx

"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function SignInCard() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold text-[#cccccc] mb-4">
          Welcome to AURA
        </h1>
        <p className="text-[#858585] text-lg mb-8">
          Your AI-powered development environment. Sign in to get started.
        </p>
        
        <div className="space-y-4">
          <SignInButton mode="modal">
            <button className="w-full bg-[#007acc] hover:bg-[#005a9e] text-white px-6 py-3 rounded text-sm font-medium transition-colors">
              Sign In
            </button>
          </SignInButton>
          
          <SignUpButton mode="modal">
            <button className="w-full bg-transparent border border-[#454545] hover:bg-[#2d2d2d] text-[#cccccc] px-6 py-3 rounded text-sm font-medium transition-colors">
              Create Account
            </button>
          </SignUpButton>
        </div>
        
        <p className="text-[#858585] text-xs mt-6">
          By signing in, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
