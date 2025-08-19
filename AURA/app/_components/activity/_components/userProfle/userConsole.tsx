// USER CONSOLE - User account management panel in activity sidebar
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/userConsole.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";
import { SignInButton, SignOutButton, useSignIn, useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  AtSign,
  Calendar,
  CheckCircle,
  Copy,
  Eye,
  Mail,
  Shield,
  User
} from "lucide-react";
import { useState } from "react";

export function UserConsole() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { openSpecialTab, setUserProfileView } = useEditorStore();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [signInMethod, setSignInMethod] = useState<'google' | 'email' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Custom authentication handlers
  const handleGoogleSignIn = async () => {
    if (!signInLoaded) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/',
        redirectUrlComplete: '/'
      });
    } catch (err: unknown) {
      const error = err as { errors?: { message?: string }[] };
      setError(error.errors?.[0]?.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message?: string }[] };
      setError(error.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowCustomForm(false);
    setSignInMethod(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex items-center justify-center">
        <div className="text-xs text-[#858585]">Loading...</div>
      </div>
    );
  }

  // Show inline sign-in when not authenticated
  if (!isSignedIn) {
    // Show custom email form
    if (showCustomForm && signInMethod === 'email') {
      return (
        <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
          <div className="p-2">
            <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
              <button 
                onClick={resetForm}
                className="flex items-center gap-1 hover:text-[#cccccc] transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
              <span>Email Sign In</span>
            </div>

            {/* Custom Email Form */}
            <div className="space-y-1 mt-2">
              <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
                <div className="p-2 space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Mail className="w-3.5 h-3.5 text-[#858585]" />
                    <span className="text-xs font-medium">Sign In with Email</span>
                  </div>
                  
                  {error && (
                    <div className="text-[10px] text-red-400 px-1 py-1 bg-red-400/10 rounded">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleEmailSignIn} className="space-y-2">
                    <div>
                      <label className="text-[10px] text-[#858585] px-1 block mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-xs py-1.5 px-2 rounded"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-[#858585] px-1 block mb-1">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-xs py-1.5 px-2 rounded"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#007acc] hover:bg-[#005a9e] disabled:bg-[#454545] text-white text-xs py-1.5 px-2 rounded font-medium transition-colors"
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show main sign-in options
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>User Console</span>
          </div>

          {/* Custom Sign-In Form - Compact Panel Design */}
          <div className="space-y-1 mt-2">
            {/* Authentication Methods */}
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-2 space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <User className="w-3.5 h-3.5 text-[#858585]" />
                  <span className="text-xs font-medium">Sign In Methods</span>
                </div>
                
                {error && (
                  <div className="text-[10px] text-red-400 px-1 py-1 bg-red-400/10 rounded">
                    {error}
                  </div>
                )}
                
                {/* Social Sign-In Options */}
                <div className="space-y-1">
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[#cccccc] bg-[#2d2d30] border border-[#454545] rounded hover:bg-[#3e3e42] disabled:bg-[#454545] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                        <span className="text-[8px] font-bold text-black">G</span>
                      </div>
                      <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowCustomForm(true);
                      setSignInMethod('email');
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[#cccccc] bg-[#2d2d30] border border-[#454545] rounded hover:bg-[#3e3e42] disabled:bg-[#454545] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#858585]" />
                      <span>Continue with Email</span>
                    </div>
                  </button>
                </div>
                
                <div className="text-[10px] text-[#858585] px-1 mt-2">
                  Choose your preferred authentication method
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-[#858585]">Need an account?</span>
                  <SignInButton mode="modal">
                    <button className="text-xs text-[#007acc] hover:text-[#0099ff] underline-offset-2 hover:underline">
                      Sign Up
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
            
            {/* Security Notice */}
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-2">
                <div className="flex items-center gap-2 px-1">
                  <Shield className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-medium">Security</span>
                </div>
                
                <div className="text-[10px] text-[#858585] px-1 mt-1">
                  Protected by industry-standard encryption
                </div>
              </div>
            </div>
            
            {/* Trust & Compliance */}
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-2">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-medium">A Trusted Solution</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-[#858585]">SOC 2</span>
                    <span className="text-[10px] text-green-400">Type II Compliant</span>
                  </div>
                  
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-[#858585]">HIPAA</span>
                    <span className="text-[10px] text-green-400">Compliant</span>
                  </div>
                  
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-[#858585]">GDPR</span>
                    <span className="text-[10px] text-green-400">Verified</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Protection */}
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-2">
                <div className="flex items-center gap-2 px-1 mb-1">
                  <Eye className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-medium">Privacy</span>
                </div>
                
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-[#858585]">Personal Data</span>
                  <span className="text-[10px] text-green-400">Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User not found
  if (!user) {
    return (
      <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
        <div className="p-2">
          <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
            <span>User Console</span>
          </div>

          <div className="space-y-1 mt-2">
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <div className="p-4 text-center">
                <div className="text-[#858585] text-xs">User information not available.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>User Console</span>
        </div>

        {/* User Console Sections */}
        <div className="space-y-1 mt-2">
          
          {/* User Profile Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#007acc] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {getUserInitial()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#cccccc] truncate">
                    {user.fullName || "User"}
                  </div>
                  <div className="text-[10px] text-[#858585] truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </div>
                </div>
                <Badge 
                  variant={user.emailAddresses[0]?.verification?.status === "verified" ? "default" : "secondary"}
                  className="text-[10px] h-4 px-1"
                >
                  {user.emailAddresses[0]?.verification?.status === "verified" ? "✓" : "!"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2 space-y-2">
              <div className="text-[10px] text-[#858585] uppercase font-medium">Account Details</div>
              
              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Mail className="w-3 h-3 text-[#858585]" />
                  <span className="text-[10px] text-[#858585] truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.emailAddresses[0]?.emailAddress || "")}
                  className="h-4 w-4 p-0 text-[#858585] hover:text-[#cccccc]"
                >
                  <Copy className="w-2.5 h-2.5" />
                </Button>
              </div>

              {/* Username if available */}
              {user.username && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <AtSign className="w-3 h-3 text-[#858585]" />
                    <span className="text-[10px] text-[#858585] truncate font-mono">
                      {user.username}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.username!)}
                    className="h-4 w-4 p-0 text-[#858585] hover:text-[#cccccc]"
                  >
                    <Copy className="w-2.5 h-2.5" />
                  </Button>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#858585]" />
                <span className="text-[10px] text-[#858585]">
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  }) : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2 space-y-2">
              <div className="text-[10px] text-[#858585] uppercase font-medium">Quick Actions</div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585]">Edit Profile</span>
                <button
                  onClick={() => {
                    setUserProfileView('profile');
                    openSpecialTab('user-profile', 'User Profile', 'user-profile');
                  }}
                  className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585]">Account Settings</span>
                <button
                  onClick={() => {
                    setUserProfileView('settings');
                    openSpecialTab('user-profile', 'User Profile', 'user-profile');
                  }}
                  className="text-xs text-[#007acc] hover:text-[#1e90ff] underline-offset-2 hover:underline"
                >
                  Settings
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585] flex items-center gap-1">
                  Subscription Plans
                </span>
                <button
                  onClick={() => {
                    openSpecialTab('subscription', 'Subscription Plans', 'subscription');
                  }}
                  className="text-xs text-[#f1c40f] hover:text-[#e1b404] underline-offset-2 hover:underline font-medium"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#858585]">Sign Out</span>
                <SignOutButton>
                  <button className="text-xs text-red-400 hover:text-red-300 underline-offset-2 hover:underline">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
