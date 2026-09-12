import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Building, Lock, Save, KeyRound, Check, BookOpen } from 'lucide-react';
import Modal from '../../components/Modal';
import { profileApi } from '../../api/profile.api';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../components/Toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [associatedBatches, setAssociatedBatches] = useState<any[]>([]);

  // Avatar Modal State
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    institute: user?.institute || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        institute: user.institute || '',
        bio: user.bio || '',
      });
      setAvatarUrl(user.avatar || '');
    }

    profileApi
      .getProfile()
      .then((res) => {
        if (res?.data?.associatedBatches) {
          setAssociatedBatches(res.data.associatedBatches);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await profileApi.updateProfile({
        name: form.name,
        phone: form.phone,
        city: form.city,
        institute: form.institute,
        bio: form.bio,
      });

      if (res?.data) {
        updateUser(res.data);
      }
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async (newAvatarUrl: string) => {
    try {
      setLoading(true);
      const res = await profileApi.updateProfile({ avatar: newAvatarUrl });
      if (res?.data) {
        updateUser(res.data);
      }
      setAvatarUrl(newAvatarUrl);
      showToast('Profile photo updated!', 'success');
      setAvatarModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update avatar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Please enter both current and new password', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      await profileApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Avatar Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={form.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-display font-bold shadow-sm">
                {form.name ? form.name[0].toUpperCase() : 'U'}
              </div>
            )}
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs hover:bg-slate-50 transition-colors text-slate-600"
              title="Change avatar photo"
            >
              <Camera size={13} />
            </button>
          </div>
          <div>
            <h2 className="font-display font-700 text-slate-900 text-lg">{form.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">
              {user?.role} Role · {form.institute}
            </p>
            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              Verified Member
            </span>
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-display font-600 text-slate-800 text-sm mb-4">
          Personal Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                disabled
                value={form.email}
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City / Location
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institute Name
            </label>
            <div className="relative">
              <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.institute}
                onChange={(e) => setForm({ ...form, institute: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bio / Academic Profile
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>

      {/* Enrolled Batches (Student) or Assigned Batches (Teacher) Card */}
      {(user?.role === 'student' || user?.role === 'teacher') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={17} className="text-indigo-600" />
              <h3 className="font-display font-600 text-slate-800 text-sm">
                {user.role === 'student' ? 'Enrolled Batches' : 'Assigned Teaching Batches'}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {associatedBatches.length} {associatedBatches.length === 1 ? 'Batch' : 'Batches'}
            </span>
          </div>

          {associatedBatches.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              {user.role === 'student'
                ? 'No active batch enrollments found.'
                : 'No batches currently assigned to you.'}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {associatedBatches.map((b: any, idx: number) => (
                <div
                  key={b.id || idx}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-700 text-xs text-slate-800 truncate">
                      {b.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        b.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                    {b.subject}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span>
                      {Array.isArray(b.scheduleDays) ? b.scheduleDays.join(', ') : 'Mon, Wed, Fri'}
                    </span>
                    <span>
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                  {user.role === 'student' && b.paymentStatus && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Payment Status</span>
                      <span
                        className={`font-semibold capitalize ${
                          b.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security & Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={17} className="text-indigo-600" />
          <h3 className="font-display font-600 text-slate-800 text-sm">
            Security & Change Password
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Lock size={14} />
            <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Avatar Change Modal */}
      <Modal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        title="Update Profile Photo"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Choose from avatar styles or enter a custom image URL:
          </p>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-3">
            {[
              `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=6366f1&color=fff`,
              `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=10b981&color=fff`,
              `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=ec4899&color=fff`,
              `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=f59e0b&color=fff`,
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(preset)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 ${
                  avatarUrl === preset ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img src={preset} alt="Preset" className="w-full h-14 rounded-lg object-cover" />
                {avatarUrl === preset && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
                    <Check size={10} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setAvatarModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveAvatar(avatarUrl)}
              disabled={loading || !avatarUrl}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;

