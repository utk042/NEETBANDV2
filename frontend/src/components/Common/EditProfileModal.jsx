import React, { useState, useEffect } from 'react';
import { IconX, IconLoader2 } from '@tabler/icons-react';
import { useDialog } from '../../contexts/DialogContext';
import { uploadFile } from '../../services/api';

export default function EditProfileModal({ isOpen, onClose, currentUser, onSave }) {
  const { toast } = useDialog();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Sync state with currentUser when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPassword('');
      setConfirmPassword('');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      setPreviewUrl(currentUser.profilePicture ? (currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `${API_URL}${currentUser.profilePicture}`) : '');
      setProfileFile(null);
    }
  }, [isOpen, currentUser]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setIsSaving(true);
    try {
      let uploadedUrl = currentUser.profilePicture || '';
      if (profileFile) {
        const uploadRes = await uploadFile(profileFile, 'profile_pictures');
        uploadedUrl = uploadRes.url;
      }

      const updatedUser = {
        name: name.trim(),
        profilePicture: uploadedUrl,
      };
      if (password) {
        updatedUser.password = password;
      }
      
      // Call onSave which handles calling the API, showing success/error toasts, and updating state
      await onSave(updatedUser);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative bg-surface p-6 md:p-8 rounded-3xl w-full max-w-md border border-outline-variant/30 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 text-on-surface">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={isSaving}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <IconX size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Edit Profile</h2>
          <p className="text-sm text-on-surface-variant mt-1">Update your personal and security credentials.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture Uploader */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-variant flex items-center justify-center text-on-surface-variant shadow-md">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold uppercase">{name.charAt(0) || '?'}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setProfileFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  disabled={isSaving}
                />
              </label>
            </div>
            <p className="text-[10px] text-on-surface-variant/60">Click to upload JPG, PNG, or GIF</p>
          </div>
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
              Full Name
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              placeholder="Enter your name"
              className="w-full bg-surface-variant/10 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
              Email Address
            </label>
            <input 
              type="text"
              value={email}
              disabled
              placeholder="Email address"
              className="w-full bg-surface-variant/20 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
              New Password (Optional)
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSaving}
              placeholder="Min. 6 characters"
              className="w-full bg-surface-variant/10 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-mono block">
              Confirm New Password
            </label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSaving}
              placeholder="Verify password"
              className="w-full bg-surface-variant/10 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 border border-outline-variant/30 text-on-surface font-semibold py-3.5 rounded-xl hover:bg-surface-variant/20 transition-all active:scale-[0.98] focus-visible:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary text-on-primary font-semibold py-3.5 rounded-xl hover:bg-primary/95 transition-all active:scale-[0.98] focus-visible:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
