import React, { useState } from 'react';
import {
  X,
  User,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Lock,
  Mail,
  Building,
  CheckCircle2,
  LogOut,
  Edit3,
  Save,
  Sparkles,
  ArrowRight,
  Key,
  GraduationCap
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import {
  formatDisplayName,
  saveRegisteredUser,
  authenticateUser,
  findRegisteredUserByEmail,
} from '../utils/authStorage';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSaveUser: (user: UserProfile) => void;
  onLogout: () => void;
  onAuthSuccess?: (user: UserProfile, isSignUp: boolean) => void;
  initialTab?: 'profile' | 'create' | 'signin';
  showToast: (msg: string) => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  onLogout,
  onAuthSuccess,
  initialTab = 'profile',
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'create' | 'signin'>(() => {
    if (!currentUser) return 'create';
    return initialTab;
  });

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editRole, setEditRole] = useState<UserRole>(currentUser?.role || 'Educator');
  const [editInstitution, setEditInstitution] = useState(currentUser?.institution || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [shareDataPreference, setShareDataPreference] = useState<boolean>(
    currentUser?.shareDataPublicly ?? false
  );

  // Create account form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Educator');
  const [newInstitution, setNewInstitution] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newShareData, setNewShareData] = useState<boolean>(false);

  // Sign in form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Switch tabs smoothly while keeping email in sync between Sign In and Sign Up
  const handleSwitchToSignIn = (prefillEmail?: string) => {
    const emailToUse = prefillEmail || newEmail.trim() || '';
    if (emailToUse) {
      setLoginEmail(emailToUse);
    }
    setActiveTab('signin');
  };

  const handleSwitchToSignUp = (prefillEmail?: string) => {
    const emailToUse = prefillEmail || loginEmail.trim() || '';
    if (emailToUse) {
      setNewEmail(emailToUse);
    }
    setActiveTab('create');
  };

  // Synchronize when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setEditName(formatDisplayName(currentUser.name, currentUser.email));
      setEditRole(currentUser.role);
      setEditInstitution(currentUser.institution);
      setEditBio(currentUser.bio || '');
      setShareDataPreference(currentUser.shareDataPublicly);
      if (activeTab === 'create' || activeTab === 'signin') {
        setActiveTab('profile');
      }
    } else {
      setActiveTab('create');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Profile display name formatting
  const profileDisplayName = currentUser
    ? formatDisplayName(currentUser.name, currentUser.email)
    : '';
  const profileInitials =
    profileDisplayName
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ED';

  // Handle Create Account Submission (Sign Up)
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const userEnteredName = newName.trim();
    if (!userEnteredName || !newEmail.trim()) {
      showToast('Please provide your name and email address.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: userEnteredName,
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      institution: newInstitution.trim() || 'Educational Institution',
      bio: newBio.trim(),
      shareDataPublicly: newShareData,
      avatarColor: 'bg-teal-600',
      createdAt: new Date().toISOString(),
      evaluationsCount: 1,
    };

    // Save to registered users storage
    const savedUser = saveRegisteredUser(newUser, newPassword.trim() || 'password123');

    if (onAuthSuccess) {
      onAuthSuccess(savedUser, true);
    } else {
      onSaveUser(savedUser);
    }
    showToast(`Account created successfully for ${savedUser.name}! Welcome to InsightEd.`);
    onClose();
  };

  // Handle Sign In Submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = loginEmail.trim().toLowerCase();
    if (!targetEmail) {
      showToast('Please enter your email address to sign in.');
      return;
    }

    // Authenticate against registered users
    const authResult = authenticateUser(targetEmail, loginPassword.trim());

    if (authResult.success && authResult.user) {
      const authenticatedUser = authResult.user;
      if (onAuthSuccess) {
        onAuthSuccess(authenticatedUser, false);
      } else {
        onSaveUser(authenticatedUser);
      }
      showToast(`Welcome back, ${authenticatedUser.name}!`);
      onClose();
    } else {
      // Check if password error
      if (authResult.message?.includes('Incorrect password')) {
        showToast(authResult.message);
        return;
      }

      // If user has not signed up yet, connect them to Sign Up seamlessly!
      showToast(`No account found for "${targetEmail}". Switching to Sign Up...`);
      handleSwitchToSignUp(targetEmail);
    }
  };

  // Handle Save Profile Edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const cleanName = editName.trim() || currentUser.name;
    const updatedUser: UserProfile = {
      ...currentUser,
      name: cleanName,
      role: editRole,
      institution: editInstitution.trim() || currentUser.institution,
      bio: editBio.trim(),
      shareDataPublicly: shareDataPreference,
    };

    saveRegisteredUser(updatedUser);
    onSaveUser(updatedUser);
    setIsEditingProfile(false);
    showToast('Profile and privacy settings saved successfully!');
  };

  // Quick toggle privacy directly from profile
  const handleTogglePrivacyDirect = (newValue: boolean) => {
    setShareDataPreference(newValue);
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        shareDataPublicly: newValue,
      };
      onSaveUser(updatedUser);
      showToast(
        newValue
          ? 'Data Sharing Enabled: Your data is now visible to everyone.'
          : 'Private Mode Enabled: Your data is now strictly private.'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-2xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {currentUser ? 'User Account & Profile' : 'InsightEd Account'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {currentUser
                  ? 'Manage your educator profile & data privacy preferences'
                  : 'Create an account to track evaluations and manage privacy'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs (if applicable) */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 gap-2 bg-white">
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                setIsEditingProfile(false);
              }}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Profile</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{currentUser ? 'Create Another Account' : 'Create Account'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'signin'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: VIEW OR EDIT CURRENT USER PROFILE */}
          {activeTab === 'profile' && currentUser && (
            <div className="space-y-5">
              {/* Profile Card Summary */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {profileInitials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{profileDisplayName}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-900 rounded-md border border-teal-200">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentUser.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentUser.institution}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {/* DATA VISIBILITY & PRIVACY OPTION (USER REQUEST REQUIREMENT) */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Data Sharing &amp; Visibility Setting
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      currentUser.shareDataPublicly
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {currentUser.shareDataPublicly ? (
                      <>
                        <Globe className="w-3 h-3" />
                        <span>Public (Everyone)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Private (Only You)</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose whether you want your student performance predictions and evaluation
                  records to be shared with everyone, or kept strictly private on your device:
                </p>

                {/* Option Toggle Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Option: Private */}
                  <button
                    type="button"
                    onClick={() => handleTogglePrivacyDirect(false)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      !currentUser.shareDataPublicly
                        ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Lock className="w-3.5 h-3.5 text-teal-700" />
                        <span>Keep Data Private</span>
                      </div>
                      {!currentUser.shareDataPublicly && (
                        <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Only visible to you. Evaluations never leave this device.
                    </p>
                  </button>

                  {/* Option: Show to Everyone (Public) */}
                  <button
                    type="button"
                    onClick={() => handleTogglePrivacyDirect(true)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      currentUser.shareDataPublicly
                        ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Globe className="w-3.5 h-3.5 text-amber-700" />
                        <span>Show Data to Everyone</span>
                      </div>
                      {currentUser.shareDataPublicly && (
                        <CheckCircle2 className="w-4 h-4 text-amber-700" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Publicly share predictions with academic researchers &amp; community.
                    </p>
                  </button>
                </div>
              </div>

              {/* Edit Profile Form (Expanded if editing) */}
              {isEditingProfile ? (
                <form
                  onSubmit={handleSaveProfile}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Edit Profile Information</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Professional Role
                      </label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-600"
                      >
                        <option value="Educator">Educator</option>
                        <option value="Student">Student</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Counselor">Counselor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Institution / University
                      </label>
                      <input
                        type="text"
                        value={editInstitution}
                        onChange={(e) => setEditInstitution(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Bio / Focus Area
                      </label>
                      <textarea
                        rows={2}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile Additional Bio */
                currentUser.bio && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Bio: </span>
                    {currentUser.bio}
                  </div>
                )
              )}

              {/* Account Quick Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  id="modal-signout-btn"
                  onClick={() => {
                    onLogout();
                    showToast('Signed out of account. Returned to Home.');
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <div className="text-[11px] text-slate-400">
                  Account Active • ID: {currentUser.id.slice(0, 10)}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT FORM */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Create New Account</h3>
                <p className="text-[11px] text-slate-500">
                  Register to personalize evaluations and configure privacy.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Anish Nath"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nathanish6@gmail.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Role / Designation
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-teal-600"
                    >
                      <option value="Educator">Educator</option>
                      <option value="Student">Student</option>
                      <option value="Researcher">Researcher</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Counselor">Counselor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kolkata University"
                      value={newInstitution}
                      onChange={(e) => setNewInstitution(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* USER REQUIREMENT: OPTION TO SHOW DATA TO EVERYONE OR NOT */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Shield className="w-4 h-4 text-teal-600" />
                      <span>Data Sharing &amp; Visibility</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        newShareData
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-teal-100 text-teal-900'
                      }`}
                    >
                      {newShareData ? 'Public' : 'Private'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Do you want to show your student evaluation data to everyone or keep it strictly
                    private?
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-start gap-2 cursor-pointer p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!newShareData}
                        onChange={() => setNewShareData(false)}
                        className="mt-0.5 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-teal-600" />
                          <span>Keep My Data Private (Only Me)</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Data remains strictly confidential on this device and hidden from everyone.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        checked={newShareData}
                        onChange={() => setNewShareData(true)}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-amber-600" />
                          <span>Show My Data to Everyone (Public)</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Make your evaluation metrics visible to educational researchers &amp; peers.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchToSignIn()}
                  className="text-xs text-teal-700 hover:text-teal-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Already have an account? Sign In &rarr;</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Sign In to Your Account</h3>
                <p className="text-[11px] text-slate-500">
                  Access your profile, student prediction records, and privacy preferences.
                </p>
              </div>

              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100/90 text-[11px] text-teal-900 flex items-center justify-between gap-2">
                <span>New to InsightEd? You can create your account in seconds.</span>
                <button
                  type="button"
                  onClick={() => handleSwitchToSignUp()}
                  className="font-bold underline hover:text-teal-950 shrink-0 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. nathanish6@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchToSignUp()}
                  className="text-xs text-teal-700 hover:text-teal-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Need an account? Create one &rarr;</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
