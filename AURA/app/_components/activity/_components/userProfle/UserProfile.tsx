// USER PROFILE EDITOR - User profile with distinct content areas (Convex-enabled)
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/userProfle/UserProfile.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";
import { useUser } from "@/lib/hooks";
import {
  Calendar,
  Copy,
  Save,
  Shield,
  X,
  User,
  Database
} from "lucide-react";
import { useState, useEffect } from "react";

export function UserProfile() {
  // Use our custom hook that follows state architecture principles
  const { user, isLoading, updateProfile, stats, isStatsLoading } = useUser();
  const { markTabDirty, userProfileView, setUserProfileView } = useEditorStore();
  
  // Local ephemeral state (UI only) - temporary editing state, not persistent business data
  const [isSaving, setIsSaving] = useState(false);
  const [editingState, setEditingState] = useState({
    firstName: '',
    lastName: '',
    username: '',
  });

  // Update form data when user data loads (derived state)
  useEffect(() => {
    if (user) {
      setEditingState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof typeof editingState, value: string) => {
    setEditingState(prev => ({ ...prev, [field]: value }));
    markTabDirty('user-profile', true);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile({
        firstName: editingState.firstName || undefined,
        lastName: editingState.lastName || undefined, 
        username: editingState.username || undefined,
      });
      
      // Reset dirty state after successful save
      markTabDirty('user-profile', false);
      setUserProfileView('profile');
    } catch (error) {
      console.error('Failed to save user profile:', error);
      // TODO: Add proper error handling/toast notification
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditingState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
      });
    }
    markTabDirty('user-profile', false);
    setUserProfileView('profile');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <p>Unable to load user profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      {/* Header */}
      <div className="flex-shrink-0 bg-[#2d2d2d] border-b border-[#454545] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#007acc] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#cccccc]">User Profile</h1>
              <p className="text-sm text-[#858585]">
                {userProfileView === 'profile' ? 'View account information' : 'Edit account settings'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userProfileView === 'settings' && (
              <>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="text-[#858585] hover:text-[#cccccc] border border-[#2d2d2d] hover:border-[#454545]"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-[#007acc] hover:bg-[#005a9e] text-white"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
            {userProfileView === 'profile' && (
              <Button
                onClick={() => setUserProfileView('settings')}
                size="sm"
                className="bg-[#007acc] hover:bg-[#005a9e] text-white"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area - switches based on userProfileView */}
      <div className="flex-1 overflow-auto">
        {userProfileView === 'profile' ? (
          <ProfileViewContent user={user} stats={stats || null} isStatsLoading={isStatsLoading} />
        ) : (
          <SettingsViewContent 
            user={user}
            editingState={editingState}
            isSaving={isSaving}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

// Profile View Component - Read-only display of user information
function ProfileViewContent({ user, stats, isStatsLoading }: {
  user: NonNullable<ReturnType<typeof useUser>['user']>;
  stats: ReturnType<typeof useUser>['stats'] | null;
  isStatsLoading: boolean;
}) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      {/* User Overview Card */}
      <div className="bg-[#2d2d2d] rounded-lg p-6 border border-[#454545]">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[#007acc] rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#cccccc]">
              {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unnamed User'}
            </h3>
            <p className="text-[#858585]">{user?.email || 'No email provided'}</p>
            {user?.username && (
              <p className="text-[#007acc]">@{user.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-[#2d2d2d] rounded-lg p-6 border border-[#454545]">
        <h3 className="text-lg font-semibold text-[#cccccc] mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-[#007acc]" />
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#858585] mb-1">Email</label>
            <div className="flex items-center">
              <span className="text-[#cccccc]">{user?.email || 'Not provided'}</span>
              {user?.email && (
                <Button
                  onClick={() => copyToClipboard(user.email)}
                  variant="ghost"
                  size="sm"
                  className="ml-2 p-1 h-6 w-6 text-[#858585] hover:text-[#cccccc]"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#858585] mb-1">User ID</label>
            <div className="flex items-center">
              <span className="text-[#cccccc] font-mono text-xs">{user?._id || 'Loading...'}</span>
              {user?._id && (
                <Button
                  onClick={() => copyToClipboard(user._id)}
                  variant="ghost"
                  size="sm"
                  className="ml-2 p-1 h-6 w-6 text-[#858585] hover:text-[#cccccc]"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#858585] mb-1">Member Since</label>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#858585]" />
              <span className="text-[#cccccc]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#858585] mb-1">Last Updated</label>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#858585]" />
              <span className="text-[#cccccc]">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="bg-[#2d2d2d] rounded-lg p-6 border border-[#454545]">
        <h3 className="text-lg font-semibold text-[#cccccc] mb-4">Activity Statistics</h3>
        {isStatsLoading ? (
          <p className="text-[#858585]">Loading statistics...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#007acc]">{stats?.projectCount || 0}</div>
              <div className="text-sm text-[#858585]">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#007acc]">{stats?.fileCount || 0}</div>
              <div className="text-sm text-[#858585]">Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#007acc]">{stats?.socialConnectionCount || 0}</div>
              <div className="text-sm text-[#858585]">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#007acc]">{stats?.activeConnections || 0}</div>
              <div className="text-sm text-[#858585]">Active</div>
            </div>
          </div>
        ) : (
          <p className="text-[#858585]">No statistics available</p>
        )}
      </div>
    </div>
  );
}

// Settings View Component - Editable form for user settings  
function SettingsViewContent({ user, editingState, isSaving, onInputChange, onSave, onCancel }: {
  user: NonNullable<ReturnType<typeof useUser>['user']>;
  editingState: { firstName: string; lastName: string; username: string };
  isSaving: boolean;
  onInputChange: (field: keyof { firstName: string; lastName: string; username: string }, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Profile Settings */}
      <div className="bg-[#2d2d2d] rounded-lg p-6 border border-[#454545]">
        <h3 className="text-lg font-semibold text-[#cccccc] mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-[#007acc]" />
          Profile Settings
        </h3>
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-[#cccccc] mb-2">
              First Name
            </label>
            <input
              type="text"
              value={editingState.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#454545] rounded-md text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc]"
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-[#cccccc] mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={editingState.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#454545] rounded-md text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc]"
              placeholder="Enter your last name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#cccccc] mb-2">
              Username
            </label>
            <input
              type="text"
              value={editingState.username}
              onChange={(e) => onInputChange('username', e.target.value)}
              className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#454545] rounded-md text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc]"
              placeholder="Enter your username"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[#cccccc] mb-2">
              Email
              <span className="text-xs text-[#858585] ml-2">(managed by Clerk)</span>
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              title="Email address (managed by Clerk authentication)"
              placeholder="No email provided"
              className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#454545] rounded-md text-[#858585] text-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Save/Cancel Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#454545]">
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-[#858585] hover:text-[#cccccc] border border-[#2d2d2d] hover:border-[#454545]"
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onSave}
            size="sm"
            className="bg-[#007acc] hover:bg-[#005a9e] text-white"
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Additional Settings Sections */}
      <div className="bg-[#2d2d2d] rounded-lg p-6 border border-[#454545]">
        <h3 className="text-lg font-semibold text-[#cccccc] mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-[#007acc]" />
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#cccccc] font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-[#858585]">Add an extra layer of security to your account</p>
            </div>
            <Badge variant="outline" className="text-[#858585] border-[#454545]">
              Not Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#cccccc] font-medium">Email Notifications</p>
              <p className="text-sm text-[#858585]">Receive updates about your account activity</p>
            </div>
            <Badge variant="outline" className="text-[#007acc] border-[#007acc]">
              Enabled
            </Badge>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-[#2d2d2d] rounded-lg p-6 border border-[#454545]">
        <h3 className="text-lg font-semibold text-[#cccccc] mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#cccccc] font-medium">Dark Theme</p>
              <p className="text-sm text-[#858585]">Use dark mode interface</p>
            </div>
            <Badge variant="outline" className="text-[#007acc] border-[#007acc]">
              Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#cccccc] font-medium">Auto-save</p>
              <p className="text-sm text-[#858585]">Automatically save changes as you type</p>
            </div>
            <Badge variant="outline" className="text-[#007acc] border-[#007acc]">
              Enabled
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
