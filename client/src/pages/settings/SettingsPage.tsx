import React, { useState } from 'react';
import { Bell, Shield, Mail, Globe, Save } from 'lucide-react';
import { showToast } from '../../components/Toast';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    emailReceipts: true,
    smsAlerts: false,
    attendanceNotifications: true,
    systemAnnouncements: true,
    instituteTimezone: 'Asia/Kolkata (IST +5:30)',
    currency: 'INR (₹)',
    fiscalYearStart: 'April',
  });

  const handleSave = () => {
    showToast('Platform settings saved successfully!', 'success');
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Notifications Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-indigo-600" />
          <h3 className="font-display font-600 text-slate-800 text-sm">
            Notification Preferences
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            {
              id: 'emailReceipts',
              title: 'Automated Email Fee Receipts',
              desc: 'Dispatch branded PDF tax invoices to students upon Razorpay signature verification.',
            },
            {
              id: 'attendanceNotifications',
              title: 'Low Attendance Warnings',
              desc: 'Automatically flag students with attendance falling below 75% threshold.',
            },
            {
              id: 'smsAlerts',
              title: 'SMS Transaction Alerts',
              desc: 'Send quick SMS notifications for payment receipts and critical schedule shifts.',
            },
            {
              id: 'systemAnnouncements',
              title: 'Institute Circular Popups',
              desc: 'Display pinned notices as prominent dashboard banners for all active batches.',
            },
          ].map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings[item.id as keyof typeof settings] as boolean}
                  onChange={(e) =>
                    setSettings({ ...settings, [item.id]: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Regional & Financial Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-indigo-600" />
          <h3 className="font-display font-600 text-slate-800 text-sm">
            Regional & Localization Standards
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Timezone
            </label>
            <input
              disabled
              value={settings.instituteTimezone}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Platform Currency
            </label>
            <input
              disabled
              value={settings.currency}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Save size={14} />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
