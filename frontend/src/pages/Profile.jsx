import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import axios from 'axios';
import { MapPin, Briefcase, GraduationCap, Heart, MessageCircle, ArrowLeft, Phone, User as UserIcon, Users, Lock, Crown, Camera, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { getCroppedImg } from '../lib/cropImage';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

const Profile = () => {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Cropper States
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  // Password Recovery / Settings States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setChangePasswordError('');
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');

    if (newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('New passwords do not match.');
      return;
    }

    setChangePasswordLoading(true);
    try {
      await axios.post(
        `${API}/auth/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success(t('profile.change_password_success'));
      handleCloseChangePasswordModal();
    } catch (err) {
      setChangePasswordError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteError('');
    setDeleteLoading(true);

    try {
      await axios.delete(`${API}/profile`, { withCredentials: true });
      toast.success(t('profile.delete_profile_success'));
      if (updateUser) updateUser(false);
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Failed to delete profile.');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/profiles/${userId}`, { withCredentials: true });
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await axios.post(`${API}/match/like`, { target_id: userId }, { withCredentials: true });
      if (data.success) {
        toast.success(data.is_mutual_match ? "🎉 It's a match!" : "Liked profile!");
        fetchProfile();
      }
    } catch (err) {
      toast.error("Failed to like profile");
    }
  };

  const handleUnlike = async () => {
    try {
      const { data } = await axios.post(`${API}/match/unlike`, { target_id: userId }, { withCredentials: true });
      if (data.success) {
        toast.success("Unliked profile");
        fetchProfile();
      }
    } catch (err) {
      toast.error("Failed to unlike profile");
    }
  };

  const handleBlock = async () => {
    if (window.confirm("Are you sure you want to block this user?")) {
      try {
        const { data } = await axios.post(`${API}/match/block`, { target_id: userId }, { withCredentials: true });
        if (data.success) {
          toast.success("Blocked user");
          fetchProfile();
        }
      } catch (err) {
        toast.error("Failed to block user");
      }
    }
  };

  const handleUnblock = async () => {
    try {
      const { data } = await axios.post(`${API}/match/unblock`, { target_id: userId }, { withCredentials: true });
      if (data.success) {
        toast.success("Unblocked user");
        fetchProfile();
      }
    } catch (err) {
      toast.error("Failed to unblock user");
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%23f0e8f0'/%3E%3Ccircle cx='300' cy='280' r='110' fill='%23c9a0c9'/%3E%3Cellipse cx='300' cy='620' rx='180' ry='150' fill='%23c9a0c9'/%3E%3Ctext x='300' y='760' font-family='Arial' font-size='28' fill='%23888' text-anchor='middle'%3ENo Photo%3C/text%3E%3C/svg%3E`;
    // New uploads: full S3 URL stored directly in DB
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    // Legacy: local path — serve via /api/files proxy
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
    return `${API}/files/${photoPath}?auth=${token}`;
  };

  const handleSendMessage = () => {
    navigate(`/chat?user=${userId}`);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels || !cropImageSrc) return;
    setUploadingPhoto(true);
    setShowCropper(false);
    
    try {
      const croppedImageBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedImageBlob], 'cropped-profile-photo.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', croppedFile);
      
      const { data } = await axios.post(`${API}/profile/photo`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Update local profile state with new S3 URL
      setProfile((prev) => ({ ...prev, profile_photo: data.url }));
      if (updateUser) updateUser({ ...user, profile_photo: data.url });
      toast.success('Photo updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Photo upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
          <p className="mt-4 font-body" style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <p className="font-body text-lg" style={{ color: 'var(--text-secondary)' }}>Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          data-testid="back-button"
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 transition-smooth"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl overflow-hidden sticky top-8 relative" style={{ border: '1px solid var(--border)' }}>
              <div className="relative overflow-hidden aspect-[3/4]">
                <img
                  src={getImageUrl(profile.profile_photo)}
                  alt={profile.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%23f0e8f0'/%3E%3Ccircle cx='300' cy='280' r='110' fill='%23c9a0c9'/%3E%3Cellipse cx='300' cy='620' rx='180' ry='150' fill='%23c9a0c9'/%3E%3Ctext x='300' y='760' font-family='Arial' font-size='28' fill='%23888' text-anchor='middle'%3ENo Photo%3C/text%3E%3C/svg%3E`;
                  }}
                />

                {/* Photo upload overlay — visible only on own profile */}
                {isOwnProfile && (
                  <>
                    <input
                      id="profile-photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <label
                      htmlFor="profile-photo-input"
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(0,0,0,0.55)' }}
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-2" />
                          <span className="font-body text-white text-sm">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-10 h-10 text-white mb-2" />
                          <span className="font-body text-white text-sm font-medium">Change Photo</span>
                        </>
                      )}
                    </label>
                  </>
                )}
              </div>
              {!isOwnProfile && (
                <div className="p-4 space-y-3">
                  {profile.blocked_by_me ? (
                    <Button
                      onClick={handleUnblock}
                      className="w-full h-12 rounded-full font-body text-white bg-gray-600 hover:bg-gray-700 transition-smooth"
                    >
                      Unblock User
                    </Button>
                  ) : (
                    <>
                      {/* Messaging Button */}
                      {profile.is_mutual_match ? (
                        <Button
                          data-testid="send-message-button"
                          onClick={handleSendMessage}
                          className="w-full h-12 rounded-full font-body text-white transition-smooth bg-blue-500 hover:bg-blue-600"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Send Message
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full h-12 rounded-full font-body text-gray-400 bg-gray-100 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Match Required to Chat
                        </Button>
                      )}

                      {/* Like / Unlike Action */}
                      <div className="flex gap-2">
                        {profile.liked_by_me ? (
                          <Button
                            onClick={handleUnlike}
                            variant="outline"
                            className="flex-1 h-12 rounded-full font-body border-pink-500 text-pink-500 hover:bg-pink-50 transition-smooth"
                          >
                            <Heart className="w-4 h-4 mr-2 fill-current text-pink-500" />
                            Liked
                          </Button>
                        ) : (
                          <Button
                            onClick={handleLike}
                            className="flex-1 h-12 rounded-full font-body text-white bg-pink-500 hover:bg-pink-600 transition-smooth"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            {profile.liked_by_them ? "Like Back" : "Like"}
                          </Button>
                        )}

                        <Button
                          onClick={handleBlock}
                          variant="ghost"
                          className="h-12 w-12 rounded-full p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-smooth"
                          title="Block User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border)' }}>
              <h1 className="font-heading text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {profile.name}
              </h1>
              <p className="font-body text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                {profile.date_of_birth && `${calculateAge(profile.date_of_birth)} ${t('profile.years_old')}`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>{t('profile.location')}</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                        {profile.city}, {profile.state}, {profile.country}
                      </p>
                    </div>
                  </div>
                )}

                {profile.occupation && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>Occupation</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>{profile.occupation}</p>
                    </div>
                  </div>
                )}

                {profile.education && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>Education</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>{profile.education}</p>
                    </div>
                  </div>
                )}

                {profile.phone ? (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>Phone</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>{profile.phone}</p>
                    </div>
                  </div>
                ) : (
                  !isOwnProfile && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 col-span-1 md:col-span-2">
                      <Lock className="w-5 h-5 flex-shrink-0 mt-1 text-orange-500" />
                      <div>
                        <p className="font-body font-semibold text-sm text-orange-900">Contact Details Locked</p>
                        <p className="font-body text-xs text-orange-700 mb-2">Upgrade to Gold, Diamond, or Platinum to view contact details.</p>
                        <Button 
                          size="sm" 
                          onClick={() => navigate('/premium')} 
                          className="bg-orange-500 hover:bg-orange-600 text-white font-body text-[10px] sm:text-xs rounded-full h-7 px-3"
                        >
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* About */}
            {profile.about && (
              <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-heading text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  About
                </h2>
                <p className="font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {profile.about}
                </p>
              </div>
            )}

            {/* Personal Details */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border)' }}>
              <h2 className="font-heading text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Height', value: profile.height ? `${profile.height} cm` : null },
                  { label: 'Weight', value: profile.weight ? `${profile.weight} kg` : null },
                  { label: 'Marital Status', value: profile.marital_status },
                  { label: 'Religion', value: profile.religion },
                  { label: 'Caste', value: profile.caste },
                  { label: 'Mother Tongue', value: profile.mother_tongue },
                  { label: 'Annual Income', value: profile.income },
                ].map(
                  (item, i) =>
                    item.value && (
                      <div key={i}>
                        <p className="font-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {item.label}
                        </p>
                        <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                          {item.value}
                        </p>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Family Details */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border)' }}>
              <h2 className="font-heading text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                Family Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Family Type', value: profile.family_type },
                  { label: 'Father\'s Occupation', value: profile.father_occupation },
                  { label: 'Mother\'s Occupation', value: profile.mother_occupation },
                  { label: 'Siblings', value: profile.siblings },
                ].map(
                  (item, i) =>
                    item.value && (
                      <div key={i}>
                        <p className="font-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {item.label}
                        </p>
                        <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                          {item.value}
                        </p>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Account Settings (only visible on own profile) */}
            {isOwnProfile && (
              <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-heading text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  {t('profile.account_settings')}
                </h2>
                
                {profile.auth_provider === 'google' && !profile.password_hash && (
                  <p className="font-body text-xs mb-6 p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-800">
                    {t('profile.google_linked')}
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => setShowChangePasswordModal(true)}
                    variant="outline"
                    className="rounded-full font-body font-medium transition-smooth border-2"
                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    {t('profile.change_password')}
                  </Button>
                  
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="destructive"
                    className="rounded-full font-body font-medium transition-smooth bg-red-600 hover:bg-red-700 text-white"
                  >
                    {t('profile.delete_profile')}
                  </Button>
                </div>
              </div>
            )}

            {/* Change Password Dialog */}
            <Dialog open={showChangePasswordModal} onOpenChange={handleCloseChangePasswordModal}>
              <DialogContent className="max-w-[90vw] sm:max-w-md bg-white p-6 rounded-2xl border">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {t('profile.change_password')}
                  </DialogTitle>
                  <DialogDescription className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Enter your password details below to change your password.
                  </DialogDescription>
                </DialogHeader>

                {changePasswordError && (
                  <div className="p-3 rounded-lg flex items-start gap-2 bg-red-50 border-l-4 border-red-500">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                    <p className="text-xs font-body text-red-700">{changePasswordError}</p>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
                  {profile?.password_hash && (
                    <div>
                      <Label htmlFor="current-pwd" className="font-body">{t('profile.current_password')}</Label>
                      <Input
                        id="current-pwd"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="mt-1 h-11 font-body"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="new-pwd" className="font-body">{t('profile.new_password')}</Label>
                    <Input
                      id="new-pwd"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="mt-1 h-11 font-body"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-new-pwd" className="font-body">{t('profile.confirm_new_password')}</Label>
                    <Input
                      id="confirm-new-pwd"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="mt-1 h-11 font-body"
                    />
                  </div>

                  <DialogFooter className="gap-2 mt-6 flex-row justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseChangePasswordModal}
                      className="rounded-full h-11 px-6 font-body"
                    >
                      {t('profile.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={changePasswordLoading}
                      className="rounded-full h-11 px-6 text-white font-body"
                      style={{ background: 'var(--primary)' }}
                    >
                      {changePasswordLoading ? 'Saving...' : t('profile.save_changes')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Profile Dialog */}
            <Dialog open={showDeleteModal} onOpenChange={handleCloseDeleteModal}>
              <DialogContent className="max-w-[90vw] sm:max-w-md bg-white p-6 rounded-2xl border">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl font-bold mb-1 text-red-600">
                    {t('profile.delete_confirm_title')}
                  </DialogTitle>
                  <DialogDescription className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('profile.delete_confirm_desc')}
                  </DialogDescription>
                </DialogHeader>

                {deleteError && (
                  <div className="p-3 rounded-lg flex items-start gap-2 bg-red-50 border-l-4 border-red-500">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                    <p className="text-xs font-body text-red-700">{deleteError}</p>
                  </div>
                )}

                <div className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="delete-confirm-input" className="font-body text-neutral-700 font-semibold">
                      Type DELETE to confirm:
                    </Label>
                    <Input
                      id="delete-confirm-input"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      required
                      className="mt-1 h-11 font-body uppercase border-red-200 focus-visible:ring-red-500"
                    />
                  </div>

                  <DialogFooter className="gap-2 mt-6 flex-row justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseDeleteModal}
                      className="rounded-full h-11 px-6 font-body"
                    >
                      {t('profile.cancel')}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDeleteProfile}
                      disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                      className="rounded-full h-11 px-6 text-white font-body bg-red-600 hover:bg-red-700"
                    >
                      {deleteLoading ? 'Deleting...' : t('profile.delete_confirm_btn')}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            {/* Image Cropper Dialog */}
            <Dialog open={showCropper} onOpenChange={setShowCropper}>
              <DialogContent className="max-w-[90vw] sm:max-w-xl bg-white border border-neutral-200 shadow-xl rounded-2xl p-6">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl font-bold text-center">Crop Profile Photo</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-[320px] bg-neutral-900 rounded-xl overflow-hidden mt-4">
                  <Cropper
                    image={cropImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label className="font-body text-sm font-medium text-neutral-600">Zoom</Label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-label="Zoom"
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowCropper(false)}
                    className="flex-1 h-12 rounded-full font-body font-medium transition-all duration-200 border border-neutral-300"
                    style={{ background: 'transparent', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveCrop}
                    className="flex-1 h-12 rounded-full font-body font-medium text-white transition-all duration-200 shadow-md"
                    style={{ background: 'var(--primary)' }}
                  >
                    Apply Crop
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
