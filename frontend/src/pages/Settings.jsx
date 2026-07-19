import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  Upload, 
  ShieldAlert, 
  Check, 
  Loader2, 
  AlertTriangle,
  Wallet
} from 'lucide-react';
import Toast from '../components/Toast';

const Settings = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  
  // Profile settings state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState(user?.monthlyBudgetLimit || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle image conversion to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result); // Base64 representation
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMsg('Name and email are required fields.');
      return;
    }

    try {
      setLoadingProfile(true);
      setErrorMsg('');
      await updateProfile({
        name,
        email,
        monthlyBudgetLimit: monthlyBudgetLimit !== '' ? Number(monthlyBudgetLimit) : 0,
        profilePicture
      });
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoadingPassword(true);
      setErrorMsg('');
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setSuccessMsg('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm('WARNING: Are you absolutely sure you want to permanently delete your account? This action is irreversible.');
    if (!firstConfirm) return;
    
    const finalConfirm = window.confirm('DANGER ZONE: Proceeding will erase all your logged incomes, expenses, and account details. Press OK to verify account termination.');
    if (!finalConfirm) return;

    try {
      setLoadingDelete(true);
      await deleteAccount();
      // AuthContext will handle state wipe and route kick
    } catch (err) {
      setErrorMsg(err.message || 'Failed to terminate account.');
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Toast Feedbacks */}
      {errorMsg && <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />}
      {successMsg && <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Account Settings
        </h1>
        <p className="text-gray-400 text-sm font-light mt-0.5">
          Configure profile details, upload avatars, set budgets, and manage security.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Profile Settings Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Profile Details
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 py-2">
              <div className="relative">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Preview"
                    className="h-16 w-16 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-800 text-lg font-bold text-white flex items-center justify-center">
                    Avatar
                  </div>
                )}
                <label className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-primary-500 border border-white/15 flex items-center justify-center cursor-pointer hover:bg-primary-600 transition">
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Upload Avatar</p>
                <p className="text-[10px] text-gray-500 mt-0.5">PNG, JPG (Max. 2MB)</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input pl-10 w-full text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10 w-full text-sm"
                  required
                />
              </div>
            </div>

            {/* Budget Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-accent-cyan" />
                Monthly Budget Limit (INR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="No Limit"
                  value={monthlyBudgetLimit}
                  onChange={(e) => setMonthlyBudgetLimit(e.target.value)}
                  className="glass-input pl-8 w-full text-sm font-semibold"
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Receive dashboard progress alerts when spending exceeds this limit. Set blank or 0 to disable.
              </p>
            </div>

            {/* Save Profile Button */}
            <button
              type="submit"
              disabled={loadingProfile}
              className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 h-fit">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent-cyan" />
            Security & Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Old Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Old Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="glass-input w-full text-sm"
                required
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="glass-input w-full text-sm"
                required
              />
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input w-full text-sm"
                required
              />
            </div>

            {/* Submit Password */}
            <button
              type="submit"
              disabled={loadingPassword}
              className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Danger Zone</h3>
              <p className="text-xs text-gray-400 mt-1">
                Permanently delete your account and all associated transactional records. This cannot be undone.
              </p>
            </div>
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={loadingDelete}
            className="btn-danger rounded-xl px-5 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 self-start sm:self-center disabled:opacity-50 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
