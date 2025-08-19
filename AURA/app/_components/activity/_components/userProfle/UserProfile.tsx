// USER PROFILE EDITOR - User profile with distinct content areas (Convex-enabled)
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/userProfle/UserProfile.tsx

"use client";

import { useEditorStore } from "@/lib/store";
import { useUser } from "@/lib/hooks";
import {
  Calendar,
  Copy,
  User,
  Database
} from "lucide-react";
import { useState, useEffect } from "react";

export function UserProfile() {
  // Use our custom hook that follows state architecture principles
  const { user, isLoading, updateProfile, stats, isStatsLoading } = useUser();
  const { markTabDirty, userProfileView } = useEditorStore();
  
  // Local ephemeral state (UI only) - temporary editing state, not persistent business data
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
      setIsEditMode(false);
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
    setIsEditMode(false);
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
      <div className="flex-shrink-0 bg-[#1e1e1e] border-b border-[#2d2d30] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#007acc] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#cccccc]">User Profile</h1>
              <p className="text-sm text-[#858585]">
                {userProfileView === 'profile' ? 'View account information' : 'Account settings'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userProfileView === 'settings' && (
              <>
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="text-[13px] text-[#858585] hover:text-[#cccccc] disabled:text-[#6a6a6a] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="text-[13px] text-[#007acc] hover:text-white disabled:text-[#6a6a6a] transition-colors ml-3"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="text-[13px] text-[#007acc] hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                )}
              </>
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
            isEditMode={isEditMode}
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
    <div className="flex-1 bg-[#1e1e1e]">
      {/* Account Information Section */}
      <div className="border-b border-[#2d2d30]">
        <div className="px-4 py-2">
          <h3 className="text-[11px] uppercase tracking-wide text-[#cccccc] font-semibold flex items-center">
            <Database className="w-3 h-3 mr-2" />
            ACCOUNT INFORMATION
          </h3>
        </div>
        
        {/* Table-like layout */}
        <div className="px-4 pb-4">
          {/* Table Headers */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-[#2d2d30]/50">
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Field</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide col-span-2">Value</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide text-left pl-4">Actions</div>
          </div>
          
          {/* Table Rows */}
          <div className="space-y-2 pt-2">
            {/* Display Name Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Display Name</div>
              <div className="text-[13px] text-[#cccccc] col-span-2">
                {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set'}
              </div>
              <div></div>
            </div>
            
            {/* Username Row */}
            {user?.username && (
              <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
                <div className="text-[13px] text-[#cccccc]">Username</div>
                <div className="text-[13px] text-[#007acc] col-span-2">@{user.username}</div>
                <div></div>
              </div>
            )}
            
            {/* Email Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Email</div>
              <div className="text-[13px] text-[#cccccc] font-mono col-span-2">
                {user?.email || 'Not provided'}
              </div>
              <div className="text-left pl-4">
                {user?.email && (
                  <button
                    onClick={() => copyToClipboard(user.email)}
                    className="text-[#858585] hover:text-[#cccccc] transition-colors text-[11px] uppercase tracking-wide inline-flex items-center gap-1"
                    title="Copy email"
                  >
                    <Copy className="w-3 h-3" />
                    COPY
                  </button>
                )}
              </div>
            </div>
            
            {/* User ID Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">User ID</div>
              <div className="text-[12px] text-[#cccccc] font-mono col-span-2">
                {user?._id || 'Loading...'}
              </div>
              <div className="text-left pl-4">
                {user?._id && (
                  <button
                    onClick={() => copyToClipboard(user._id)}
                    className="text-[#858585] hover:text-[#cccccc] transition-colors text-[11px] uppercase tracking-wide inline-flex items-center gap-1"
                    title="Copy user ID"
                  >
                    <Copy className="w-3 h-3" />
                    COPY
                  </button>
                )}
              </div>
            </div>
            
            {/* Member Since Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Member Since</div>
              <div className="text-[13px] text-[#cccccc] col-span-2 flex items-center">
                <Calendar className="w-3 h-3 mr-2 text-[#858585]" />
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
              <div></div>
            </div>
            
            {/* Last Updated Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Last Updated</div>
              <div className="text-[13px] text-[#cccccc] col-span-2 flex items-center">
                <Calendar className="w-3 h-3 mr-2 text-[#858585]" />
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Statistics Section */}
      <div>
        <div className="px-4 py-2">
          <h3 className="text-[11px] uppercase tracking-wide text-[#cccccc] font-semibold">
            ACTIVITY STATISTICS
          </h3>
        </div>
        
        <div className="px-4 pb-4">
          {isStatsLoading ? (
            <div className="text-[13px] text-[#858585]">Loading statistics...</div>
          ) : stats ? (
            <div>
              {/* Stats Table Headers */}
              <div className="grid grid-cols-4 gap-4 pb-2 border-b border-[#2d2d30]/50">
                <div className="text-[11px] uppercase text-[#858585] tracking-wide">Metric</div>
                <div className="text-[11px] uppercase text-[#858585] tracking-wide">Count</div>
                <div className="text-[11px] uppercase text-[#858585] tracking-wide">Status</div>
                <div className="text-[11px] uppercase text-[#858585] tracking-wide">Updated</div>
              </div>
              
              {/* Stats Table Rows */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
                  <div className="text-[13px] text-[#cccccc]">Projects</div>
                  <div className="text-[16px] font-bold text-[#007acc] font-mono">{stats?.projectCount || 0}</div>
                  <div className="text-[11px] text-[#4ec9b0] uppercase tracking-wide">ACTIVE</div>
                  <div className="text-[11px] text-[#858585] uppercase tracking-wide">RECENT</div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
                  <div className="text-[13px] text-[#cccccc]">Files</div>
                  <div className="text-[16px] font-bold text-[#007acc] font-mono">{stats?.fileCount || 0}</div>
                  <div className="text-[11px] text-[#4ec9b0] uppercase tracking-wide">SYNCED</div>
                  <div className="text-[11px] text-[#858585] uppercase tracking-wide">RECENT</div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
                  <div className="text-[13px] text-[#cccccc]">Connections</div>
                  <div className="text-[16px] font-bold text-[#007acc] font-mono">{stats?.socialConnectionCount || 0}</div>
                  <div className="text-[11px] text-[#858585] uppercase tracking-wide">IDLE</div>
                  <div className="text-[11px] text-[#858585] uppercase tracking-wide">24H</div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
                  <div className="text-[13px] text-[#cccccc]">Active Sessions</div>
                  <div className="text-[16px] font-bold text-[#007acc] font-mono">{stats?.activeConnections || 0}</div>
                  <div className="text-[11px] text-[#007acc] uppercase tracking-wide">ONLINE</div>
                  <div className="text-[11px] text-[#858585] uppercase tracking-wide">NOW</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-[#858585]">No statistics available</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Settings View Component - Editable form for user settings  
function SettingsViewContent({ user, editingState, isSaving, isEditMode, onInputChange, onSave, onCancel }: {
  user: NonNullable<ReturnType<typeof useUser>['user']>;
  editingState: { firstName: string; lastName: string; username: string };
  isSaving: boolean;
  isEditMode: boolean;
  onInputChange: (field: keyof { firstName: string; lastName: string; username: string }, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex-1 bg-[#1e1e1e]">
      {/* Profile Settings Section */}
      <div className="border-b border-[#2d2d30]">
        <div className="px-4 py-2">
          <h3 className="text-[11px] uppercase tracking-wide text-[#cccccc] font-semibold">
            USER SETTINGS
          </h3>
        </div>
        
        {/* Table-like layout */}
        <div className="px-4 pb-4">
          {/* Table Headers */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-[#2d2d30]/50">
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Field</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide col-span-2">
              {isEditMode ? 'Edit Value' : 'Current Value'}
            </div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide text-right">Status</div>
          </div>
          
          {/* Table Rows */}
          <div className="space-y-2 pt-2">
            {/* First Name Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">First Name</div>
              <div className="col-span-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editingState.firstName}
                    onChange={(e) => onInputChange('firstName', e.target.value)}
                    className="w-full px-2 py-1 bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-[13px] focus:outline-none focus:border-[#007acc] transition-colors"
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="text-[13px] text-[#cccccc] px-2 py-1">
                    {user?.firstName || 'Not set'}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#858585] uppercase tracking-wide">
                  {isEditMode ? 'EDITING' : 'EDITABLE'}
                </span>
              </div>
            </div>

            {/* Last Name Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Last Name</div>
              <div className="col-span-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editingState.lastName}
                    onChange={(e) => onInputChange('lastName', e.target.value)}
                    className="w-full px-2 py-1 bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-[13px] focus:outline-none focus:border-[#007acc] transition-colors"
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="text-[13px] text-[#cccccc] px-2 py-1">
                    {user?.lastName || 'Not set'}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#858585] uppercase tracking-wide">
                  {isEditMode ? 'EDITING' : 'EDITABLE'}
                </span>
              </div>
            </div>

            {/* Username Row */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Username</div>
              <div className="col-span-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editingState.username}
                    onChange={(e) => onInputChange('username', e.target.value)}
                    className="w-full px-2 py-1 bg-[#3c3c3c] border border-[#454545] text-[#cccccc] text-[13px] focus:outline-none focus:border-[#007acc] transition-colors"
                    placeholder="Enter username"
                  />
                ) : (
                  <div className="text-[13px] text-[#007acc] px-2 py-1">
                    {user?.username ? `@${user.username}` : 'Not set'}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#858585] uppercase tracking-wide">
                  {isEditMode ? 'EDITING' : 'EDITABLE'}
                </span>
              </div>
            </div>

            {/* Email Row (always read-only) */}
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Email</div>
              <div className="text-[13px] text-[#6a6a6a] px-2 py-1 col-span-2 font-mono">
                {user?.email || 'No email provided'}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#6a6a6a] uppercase tracking-wide">
                  CLERK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - only show when in edit mode */}
        {isEditMode && (
          <div className="px-4 pb-4 pt-2 border-t border-[#2d2d30]/50 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="text-[13px] text-[#858585] hover:text-[#cccccc] disabled:text-[#6a6a6a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="text-[13px] text-[#007acc] hover:text-white disabled:text-[#6a6a6a] transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Security & Privacy Section */}
      <div className="border-b border-[#2d2d30]">
        <div className="px-4 py-2">
          <h3 className="text-[11px] uppercase tracking-wide text-[#cccccc] font-semibold">
            SECURITY & PRIVACY
          </h3>
        </div>
        <div className="px-4 pb-4">
          {/* Table Headers */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-[#2d2d30]/50">
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Setting</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Description</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Status</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide text-right">Actions</div>
          </div>
          
          {/* Security Settings Rows */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Two-Factor Auth</div>
              <div className="text-[13px] text-[#858585]">Extra security layer</div>
              <div>
                <span className="text-[11px] text-[#6a6a6a] uppercase tracking-wide">DISABLED</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  ENABLE
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Email Notifications</div>
              <div className="text-[13px] text-[#858585]">Activity updates</div>
              <div>
                <span className="text-[11px] text-[#007acc] uppercase tracking-wide">ENABLED</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  DISABLE
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Session Timeout</div>
              <div className="text-[13px] text-[#858585]">Auto-logout timer</div>
              <div>
                <span className="text-[11px] text-[#858585] uppercase tracking-wide">24H</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  CHANGE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Preferences Section */}
      <div className="border-b border-[#2d2d30]">
        <div className="px-4 py-2">
          <h3 className="text-[11px] uppercase tracking-wide text-[#cccccc] font-semibold">
            EDITOR PREFERENCES
          </h3>
        </div>
        <div className="px-4 pb-4">
          {/* Table Headers */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-[#2d2d30]/50">
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Preference</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Description</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Value</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide text-right">Actions</div>
          </div>
          
          {/* Editor Settings Rows */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Auto-save</div>
              <div className="text-[13px] text-[#858585]">Save changes automatically</div>
              <div>
                <span className="text-[11px] text-[#007acc] uppercase tracking-wide">ENABLED</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  TOGGLE
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Word Wrap</div>
              <div className="text-[13px] text-[#858585]">Wrap long lines</div>
              <div>
                <span className="text-[11px] text-[#007acc] uppercase tracking-wide">ON</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  TOGGLE
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Font Size</div>
              <div className="text-[13px] text-[#858585]">Editor font size</div>
              <div>
                <span className="text-[11px] text-[#858585] uppercase tracking-wide">14PX</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  ADJUST
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Preferences Section */}
      <div>
        <div className="px-4 py-2">
          <h3 className="text-[11px] uppercase tracking-wide text-[#cccccc] font-semibold">
            WORKSPACE
          </h3>
        </div>
        <div className="px-4 pb-4">
          {/* Table Headers */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-[#2d2d30]/50">
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Setting</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Description</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide">Value</div>
            <div className="text-[11px] uppercase text-[#858585] tracking-wide text-right">Actions</div>
          </div>
          
          {/* Workspace Settings Rows */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Color Theme</div>
              <div className="text-[13px] text-[#858585]">Interface appearance</div>
              <div>
                <span className="text-[11px] text-[#007acc] uppercase tracking-wide">DARK+</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  CHANGE
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Activity Bar</div>
              <div className="text-[13px] text-[#858585]">Primary navigation</div>
              <div>
                <span className="text-[11px] text-[#007acc] uppercase tracking-wide">VISIBLE</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  HIDE
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-1 hover:bg-[#2a2d2e] transition-colors">
              <div className="text-[13px] text-[#cccccc]">Sidebar Position</div>
              <div className="text-[13px] text-[#858585]">Panel placement</div>
              <div>
                <span className="text-[11px] text-[#858585] uppercase tracking-wide">LEFT</span>
              </div>
              <div className="text-right">
                <button className="text-[11px] text-[#858585] hover:text-[#cccccc] uppercase tracking-wide transition-colors">
                  SWITCH
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
