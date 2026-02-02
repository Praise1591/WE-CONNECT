// SettingsPage.jsx — Fully backend-integrated with Supabase
import React, { useState, useEffect } from 'react';
import { 
  Moon, Sun, Bell, Shield, User, Trash2, ChevronRight,
  Edit3, Save, X, Upload, Palette, Mail, Lock,
  GraduationCap, Briefcase, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient'; // Use your provided init
import { useNavigate } from 'react-router-dom';

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    role: 'student',
    matric_number: '',
    school: '',
    faculty: '',
    department: '',
    specialization: '',
    years_experience: '',
    title: '',
    years_teaching: '',
    phone: '',
    address: '',
    gender: '',
    avatar_url: '',
    coins: 0,
    diamonds: 0,
  });

  const navigate = useNavigate();

  // Load profile
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in');
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
        } else {
          // Fallback if trigger failed
          const fallback = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'User',
            role: user.user_metadata?.role || 'student',
          };
          setProfile(fallback);
          // Optionally upsert fallback here
        }

        // Theme & notifs...
        const savedTheme = localStorage.getItem('theme') || 'light';
        setIsDarkMode(savedTheme === 'dark');
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');

        const notifPref = localStorage.getItem('notifications');
        setNotificationsEnabled(notifPref !== 'false');
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Sync dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updates = {
        id: profile.id,
        name: profile.name?.trim(),
        role: profile.role,
        matric_number: profile.matric_number?.trim() || null,
        school: profile.school?.trim() || null,
        faculty: profile.faculty?.trim() || null,
        department: profile.department?.trim() || null,
        specialization: profile.specialization?.trim() || null,
        years_experience: profile.years_experience ? Number(profile.years_experience) : null,
        title: profile.title?.trim() || null,
        years_teaching: profile.years_teaching ? Number(profile.years_teaching) : null,
        phone: profile.phone?.trim() || null,
        address: profile.address?.trim() || null,
        gender: profile.gender || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      // Sync metadata if needed
      await supabase.auth.updateUser({
        data: { name: updates.name, role: updates.role }
      });

      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Call the edge function
      const { error } = await supabase.functions.invoke('delete_account', {
        method: 'POST',
      });

      if (error) throw error;

      localStorage.clear();
      toast.success('Account permanently deleted');
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Deletion failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const RoleIcon = {
    student: GraduationCap,
    tutor: Briefcase,
    lecturer: Award,
  }[profile.role] || User;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // JSX remains similar to previous version, with edits for more fields if needed
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Settings</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account</p>
        </div>

        {/* Profile Section - Add more fields as in previous, e.g., phone, address, gender */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          {/* ... Similar structure, expand form fields for phone, address, etc. */}
          {/* For brevity, assume same as before, but add: */}
          {/* Example additional field in right column: */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Phone</label>
            {editing ? (
              <input name="phone" value={profile.phone || ''} onChange={handleInputChange} className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500" />
            ) : (
              <p className="text-lg">{profile.phone || '—'}</p>
            )}
          </div>
          {/* Add similar for address, gender (use Select if needed) */}
        </div>

        {/* Preferences & Danger Zone - same as before */}

        {/* Delete Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
              <Trash2 className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Delete Account?</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Permanent deletion.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={loading} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium disabled:opacity-70">
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;