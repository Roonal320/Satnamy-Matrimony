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
import { MapPin, Briefcase, GraduationCap, Heart, MessageCircle, ArrowLeft, Phone, User as UserIcon, Users, Lock, Crown, Camera, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
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
  const { t, i18n } = useTranslation();

  const translateGender = (val) => {
    if (!val) return val;
    if (val === 'Male') return t('landing.male');
    if (val === 'Female') return t('landing.female');
    if (val === 'Transgender') return t('landing.transgender');
    return val;
  };

  const translateMaritalStatus = (val) => {
    if (!val) return val;
    if (val === 'Never Married') return t('landing.never_married');
    if (val === 'Divorced') return t('landing.divorced');
    if (val === 'Widowed') return t('landing.widowed');
    return val;
  };

  const translateFamilyType = (val) => {
    if (!val) return val;
    if (val === 'Nuclear') return t('profile.nuclear');
    if (val === 'Joint') return t('profile.joint');
    return val;
  };

  const translateReligion = (val) => {
    if (!val) return val;
    if (val === 'Satnami') return t('profile.satnami');
    if (val === 'Other') return t('profile.other_religion');
    return val;
  };

  const translateIncome = (val) => {
    if (!val) return val;
    const cleanVal = val.trim();
    const map = {
      'Below 3 Lakhs': t('landing.income_below_3'),
      '3-5 Lakhs': t('landing.income_3_5'),
      '5-7 Lakhs': t('landing.income_5_7'),
      '7-10 Lakhs': t('landing.income_7_10'),
      '10-15 Lakhs': t('landing.income_10_15'),
      '15-20 Lakhs': t('profile.income_15_20'),
      'Above 20 Lakhs': t('landing.income_above_20')
    };
    return map[cleanVal] || cleanVal;
  };

  const translateRelationship = (val) => {
    if (!val) return val;
    const key = val.toLowerCase();
    return t(`profile.relationship.${key}`, val);
  };

  const translateContactMode = (val) => {
    if (!val) return val;
    if (val === 'Phone' || val === 'Phone Call') return i18n.language === 'hi' ? 'फ़ोन कॉल' : 'Phone Call';
    if (val === 'WhatsApp') return i18n.language === 'hi' ? 'व्हाट्सएप' : 'WhatsApp';
    if (val === 'Both' || val === 'Either') return i18n.language === 'hi' ? 'दोनों' : 'Both';
    return val;
  };

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Cropper States
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  // Reporting States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    height: '',
    weight: '',
    marital_status: '',
    caste: '',
    mother_tongue: '',
    education: '',
    occupation: '',
    income: '',
    city: '',
    state: '',
    about: '',
    family_type: '',
    father_occupation: '',
    mother_occupation: '',
    siblings: ''
  });

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

  const submitReport = async () => {
    if (!profile || !reportReason) return;
    setSubmittingReport(true);
    try {
      await axios.post(
        `${API}/reports`,
        {
          reported_user_id: profile.id,
          reason: reportReason,
          details: reportDetails
        },
        { withCredentials: true }
      );
      toast.success(`Report submitted successfully. We will review it promptly.`);
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleOpenEditProfileModal = () => {
    if (profile) {
      setEditFormData({
        height: profile.height || '',
        weight: profile.weight || '',
        marital_status: profile.marital_status || '',
        caste: profile.caste || '',
        mother_tongue: profile.mother_tongue || '',
        education: profile.education || '',
        occupation: profile.occupation || '',
        income: profile.income || '',
        city: profile.city || '',
        state: profile.state || '',
        about: profile.about || '',
        family_type: profile.family_type || '',
        father_occupation: profile.father_occupation || '',
        mother_occupation: profile.mother_occupation || '',
        siblings: profile.siblings || ''
      });
    }
    setShowEditProfileModal(true);
  };

  const handleEditFormChange = (name, value) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setEditProfileLoading(true);
    try {
      const { data } = await axios.put(`${API}/profile`, editFormData, { withCredentials: true });
      toast.success('Profile updated successfully!');
      setProfile(data);
      if (updateUser) updateUser(data);
      setShowEditProfileModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setEditProfileLoading(false);
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

  const isFieldHidden = (fieldName) => {
    return profile?.hidden_fields?.includes(fieldName);
  };

  const toggleFieldPrivacy = async (fieldName) => {
    try {
      const currentHidden = profile.hidden_fields || [];
      const updatedHidden = currentHidden.includes(fieldName)
        ? currentHidden.filter(f => f !== fieldName)
        : [...currentHidden, fieldName];
      
      const { data } = await axios.put(`${API}/profile`, { hidden_fields: updatedHidden }, { withCredentials: true });
      setProfile(data);
      if (updateUser) updateUser(data);
      toast.success(currentHidden.includes(fieldName) ? "Field is now visible to others!" : "Field is now hidden from others!");
    } catch (err) {
      toast.error("Failed to update field privacy.");
    }
  };

  const renderPrivacyToggle = (fieldName) => {
    if (!isOwnProfile) return null;
    const hidden = isFieldHidden(fieldName);
    return (
      <button
        type="button"
        onClick={() => toggleFieldPrivacy(fieldName)}
        className="ml-2 inline-flex items-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        title={hidden ? "Hidden from others (Click to show)" : "Visible to others (Click to hide)"}
      >
        {hidden ? (
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <EyeOff className="w-3.5 h-3.5" />
            <span className="text-[10px]">Hidden</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px]">Visible</span>
          </span>
        )}
      </button>
    );
  };

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
          {t('profile.back')}
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
                      {t('profile.unblock_user')}
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
                          {t('profile.send_message')}
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full h-12 rounded-full font-body text-gray-400 bg-gray-100 cursor-not-allowed flex items-center justify-center"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {t('profile.chat_match_required')}
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
                            {t('profile.liked')}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleLike}
                            className="flex-1 h-12 rounded-full font-body text-white bg-pink-500 hover:bg-pink-600 transition-smooth"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            {profile.liked_by_them ? t('profile.like_back') : t('profile.like')}
                          </Button>
                        )}

                        <Button
                          onClick={handleBlock}
                          variant="ghost"
                          className="h-12 w-12 rounded-full p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-smooth flex-shrink-0"
                          title="Block User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        </Button>

                        <Button
                          onClick={() => setShowReportModal(true)}
                          variant="ghost"
                          className="h-12 w-12 rounded-full p-0 text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-smooth flex-shrink-0"
                          title="Report User"
                        >
                          <AlertCircle className="w-5 h-5" />
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
                {profile.gender && ` • ${translateGender(profile.gender)}`}
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
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>{t('profile.occupation')}</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>{profile.occupation}</p>
                    </div>
                  </div>
                )}

                {profile.education && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>{t('profile.education')}</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>{profile.education}</p>
                    </div>
                  </div>
                )}

                {profile.phone ? (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>{t('profile.phone')}</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>{profile.phone}</p>
                    </div>
                  </div>
                ) : (
                  !isOwnProfile && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 col-span-1 md:col-span-2">
                      <Lock className="w-5 h-5 flex-shrink-0 mt-1 text-orange-500" />
                      <div>
                        <p className="font-body font-semibold text-sm text-orange-900">{t('profile.contact_details_locked')}</p>
                        <p className="font-body text-xs text-orange-700 mb-2">{t('profile.upgrade_desc')}</p>
                        <Button 
                          size="sm" 
                          onClick={() => navigate('/premium')} 
                          className="bg-orange-500 hover:bg-orange-600 text-white font-body text-[10px] sm:text-xs rounded-full h-7 px-3"
                        >
                          {t('profile.upgrade_now')}
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Parent Managed Badge Card */}
            {profile.registration_type && profile.registration_type !== 'self' && (
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(184,148,31,0.05) 100%)',
                  border: '1.5px solid rgba(212,175,55,0.3)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)' }}
                  >
                    👨‍👩‍👧
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold" style={{ color: '#8B6914' }}>
                      {profile.registration_type === 'parent' ? t('profile.managed_by_parents') :
                       profile.registration_type === 'sibling' ? t('profile.managed_by_sibling') :
                       t('profile.managed_by_family')}
                    </h3>
                    <p className="font-body text-xs" style={{ color: '#A07D1C' }}>
                      {t('profile.managed_by_desc')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.guardian_name && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: '#B8941F' }} />
                      <span className="font-body text-sm flex items-center" style={{ color: 'var(--text-primary)' }}>
                        {translateRelationship(profile.relationship_to_candidate)}: <strong>{profile.guardian_name}</strong>
                        {renderPrivacyToggle('guardian_name')}
                      </span>
                    </div>
                  )}
                  {profile.guardian_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: '#B8941F' }} />
                      <span className="font-body text-sm flex items-center" style={{ color: 'var(--text-primary)' }}>
                        {t('profile.phone')}: <strong>{profile.guardian_phone}</strong>
                        {renderPrivacyToggle('guardian_phone')}
                      </span>
                    </div>
                  )}
                  {profile.guardian_whatsapp && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">💬</span>
                      <span className="font-body text-sm flex items-center" style={{ color: 'var(--text-primary)' }}>
                        WhatsApp: <strong>{profile.guardian_whatsapp}</strong>
                        {renderPrivacyToggle('guardian_whatsapp')}
                      </span>
                    </div>
                  )}
                  {profile.guardian_email && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✉️</span>
                      <span className="font-body text-sm text-ellipsis overflow-hidden whitespace-nowrap flex items-center" style={{ color: 'var(--text-primary)' }}>
                        Email: <strong>{profile.guardian_email}</strong>
                        {renderPrivacyToggle('guardian_email')}
                      </span>
                    </div>
                  )}
                  {profile.preferred_contact_person && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: '#B8941F' }} />
                      <span className="font-body text-sm flex items-center" style={{ color: 'var(--text-primary)' }}>
                        {t('profile.contact_person')}: <strong>{translateRelationship(profile.preferred_contact_person)}</strong>
                        {renderPrivacyToggle('preferred_contact_person')}
                      </span>
                    </div>
                  )}
                  {profile.preferred_contact_mode && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" style={{ color: '#B8941F' }} />
                      <span className="font-body text-sm flex items-center" style={{ color: 'var(--text-primary)' }}>
                        {t('profile.preferred_mode')}: <strong>{translateContactMode(profile.preferred_contact_mode)}</strong>
                        {renderPrivacyToggle('preferred_contact_mode')}
                      </span>
                    </div>
                  )}
                  {profile.preferred_contact_time && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: '#B8941F' }}>🕐</span>
                      <span className="font-body text-sm flex items-center" style={{ color: 'var(--text-primary)' }}>
                        {t('profile.best_time')}: <strong>{profile.preferred_contact_time}</strong>
                        {renderPrivacyToggle('preferred_contact_time')}
                      </span>
                    </div>
                  )}
                  {(!profile.guardian_phone && !isOwnProfile) && (
                    <div className="col-span-1 sm:col-span-2 mt-2 p-3 rounded-xl bg-amber-50/50 border border-amber-200/50 flex items-start gap-2">
                      <Lock className="w-4 h-4 mt-0.5 text-amber-600 animate-pulse" />
                      <div>
                        <p className="font-body font-semibold text-xs text-amber-800">{t('profile.guardian_contacts_locked')}</p>
                        <p className="font-body text-[10px] text-amber-700">{t('profile.guardian_contacts_locked_desc')}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold text-white" style={{ background: '#22C55E' }}>
                    ✅ {t('profile.mobile_verified')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold text-white" style={{ background: 'linear-gradient(135deg, #D4AF37, #B8941F)' }}>
                    👨‍👩‍👧 {t('profile.parent_verified')}
                  </span>
                </div>
              </div>
            )}

            {/* About */}
            {profile.about && (
              <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  {t('profile.about_heading')}
                  {renderPrivacyToggle('about')}
                </h2>
                <p className="font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {profile.about}
                </p>
              </div>
            )}

            {/* Personal Details */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid var(--border)' }}>
              <h2 className="font-heading text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                {t('profile.personal_details')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: t('profile.gender'), value: translateGender(profile.gender), field: 'gender' },
                  { label: t('profile.height'), value: profile.height ? `${profile.height} cm` : null, field: 'height' },
                  { label: t('profile.weight'), value: profile.weight ? `${profile.weight} kg` : null, field: 'weight' },
                  { label: t('profile.marital_status'), value: translateMaritalStatus(profile.marital_status), field: 'marital_status' },
                  { label: t('profile.religion'), value: translateReligion(profile.religion), field: 'religion' },
                  { label: t('profile.caste'), value: profile.caste, field: 'caste' },
                  { label: t('profile.mother_tongue'), value: profile.mother_tongue, field: 'mother_tongue' },
                  { label: t('profile.annual_income'), value: translateIncome(profile.income), field: 'income' },
                ].map(
                  (item, i) =>
                    item.value && (
                      <div key={i}>
                        <p className="font-body font-medium mb-1 flex items-center" style={{ color: 'var(--text-primary)' }}>
                          {item.label}
                          {renderPrivacyToggle(item.field)}
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
                {t('profile.family_details')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: t('profile.family_type'), value: translateFamilyType(profile.family_type), field: 'family_type' },
                  { label: t('profile.father_occ'), value: profile.father_occupation, field: 'father_occupation' },
                  { label: t('profile.mother_occ'), value: profile.mother_occupation, field: 'mother_occupation' },
                  { label: t('profile.siblings'), value: profile.siblings, field: 'siblings' },
                ].map(
                  (item, i) =>
                    item.value && (
                      <div key={i}>
                        <p className="font-body font-medium mb-1 flex items-center" style={{ color: 'var(--text-primary)' }}>
                          {item.label}
                          {renderPrivacyToggle(item.field)}
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
                    onClick={handleOpenEditProfileModal}
                    className="rounded-full font-body font-medium transition-smooth text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    Edit Profile Details
                  </Button>

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

            {/* Report User Modal */}
            {showReportModal && (
              <div 
                className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
                onClick={() => {
                  if (!submittingReport) setShowReportModal(false);
                }}
                style={{ animation: 'contextMenuAppear 0.2s ease-out' }}
              >
                <div 
                  className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border text-left"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-heading text-lg font-bold text-gray-900">Report User</h3>
                    <button 
                      disabled={submittingReport}
                      onClick={() => setShowReportModal(false)} 
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 font-body text-sm text-gray-700">
                    <p>Please select a reason for reporting <strong>{profile?.name}</strong>:</p>
                    
                    <div className="space-y-2">
                      {[
                        'Abusive language or harassment',
                        'Fake profile or inappropriate photo',
                        'Scammer, spammer, or financial solicitation',
                        'Misbehavior in messages or calls',
                        'Other'
                      ].map((r) => (
                        <label 
                          key={r} 
                          className={`flex items-center gap-3 p-2.5 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors ${reportReason === r ? 'border-[var(--primary)] bg-orange-50/20' : ''}`}
                          style={{ borderColor: reportReason === r ? 'var(--primary)' : 'var(--border)' }}
                        >
                          <input 
                            type="radio" 
                            name="reportReason" 
                            value={r}
                            checked={reportReason === r}
                            disabled={submittingReport}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="text-[var(--primary)] focus:ring-[var(--primary)] h-4 w-4"
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500">Additional details (optional)</label>
                      <textarea
                        value={reportDetails}
                        disabled={submittingReport}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="Please provide details about what happened..."
                        className="w-full p-3 border rounded-xl font-body text-sm h-24 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                        style={{ borderColor: 'var(--border)' }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="ghost"
                      disabled={submittingReport}
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 rounded-full h-11 border border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitReport}
                      disabled={!reportReason || submittingReport}
                      className="flex-1 rounded-full h-11 text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      {submittingReport ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Profile Dialog */}
            <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
              <DialogContent className="max-w-[90vw] sm:max-w-2xl bg-white p-6 rounded-2xl border">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Edit Profile Information
                  </DialogTitle>
                  <DialogDescription className="font-body text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Update your personal, professional, and family details below.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleEditProfileSubmit} className="space-y-4">
                  <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-6">
                    
                    {/* Section 1: Personal Details */}
                    <div>
                      <h3 className="font-heading text-md font-bold text-gray-800 mb-3 border-b pb-1">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-height" className="font-body text-xs text-gray-500">Height (cm)</Label>
                          <Input
                            id="edit-height"
                            type="text"
                            value={editFormData.height}
                            onChange={(e) => handleEditFormChange('height', e.target.value)}
                            placeholder="170"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-weight" className="font-body text-xs text-gray-500">Weight (kg)</Label>
                          <Input
                            id="edit-weight"
                            type="text"
                            value={editFormData.weight}
                            onChange={(e) => handleEditFormChange('weight', e.target.value)}
                            placeholder="65"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-marital-status" className="font-body text-xs text-gray-500">Marital Status</Label>
                          <select
                            id="edit-marital-status"
                            value={editFormData.marital_status}
                            onChange={(e) => handleEditFormChange('marital_status', e.target.value)}
                            className="mt-1 w-full h-11 px-3 border rounded-xl font-body text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select status</option>
                            <option value="Never Married">Never Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="edit-caste" className="font-body text-xs text-gray-500">Caste/Sub-caste</Label>
                          <Input
                            id="edit-caste"
                            type="text"
                            value={editFormData.caste}
                            onChange={(e) => handleEditFormChange('caste', e.target.value)}
                            placeholder="Caste"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-mother-tongue" className="font-body text-xs text-gray-500">Mother Tongue</Label>
                          <Input
                            id="edit-mother-tongue"
                            type="text"
                            value={editFormData.mother_tongue}
                            onChange={(e) => handleEditFormChange('mother_tongue', e.target.value)}
                            placeholder="Hindi"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Education & Career */}
                    <div>
                      <h3 className="font-heading text-md font-bold text-gray-800 mb-3 border-b pb-1">Education & Career</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-education" className="font-body text-xs text-gray-500">Education</Label>
                          <Input
                            id="edit-education"
                            type="text"
                            value={editFormData.education}
                            onChange={(e) => handleEditFormChange('education', e.target.value)}
                            placeholder="Education"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-occupation" className="font-body text-xs text-gray-500">Occupation</Label>
                          <Input
                            id="edit-occupation"
                            type="text"
                            value={editFormData.occupation}
                            onChange={(e) => handleEditFormChange('occupation', e.target.value)}
                            placeholder="Occupation"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-income" className="font-body text-xs text-gray-500">Annual Income</Label>
                          <select
                            id="edit-income"
                            value={editFormData.income}
                            onChange={(e) => handleEditFormChange('income', e.target.value)}
                            className="mt-1 w-full h-11 px-3 border rounded-xl font-body text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select range</option>
                            <option value="Below 3 Lakhs">Below 3 Lakhs</option>
                            <option value="3-5 Lakhs">3-5 Lakhs</option>
                            <option value="5-7 Lakhs">5-7 Lakhs</option>
                            <option value="7-10 Lakhs">7-10 Lakhs</option>
                            <option value="10-15 Lakhs">10-15 Lakhs</option>
                            <option value="15-20 Lakhs">15-20 Lakhs</option>
                            <option value="Above 20 Lakhs">Above 20 Lakhs</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="edit-city" className="font-body text-xs text-gray-500">City</Label>
                          <Input
                            id="edit-city"
                            type="text"
                            value={editFormData.city}
                            onChange={(e) => handleEditFormChange('city', e.target.value)}
                            placeholder="City"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-state" className="font-body text-xs text-gray-500">State</Label>
                          <Input
                            id="edit-state"
                            type="text"
                            value={editFormData.state}
                            onChange={(e) => handleEditFormChange('state', e.target.value)}
                            placeholder="State"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Family & About */}
                    <div>
                      <h3 className="font-heading text-md font-bold text-gray-800 mb-3 border-b pb-1">Family & About</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-family-type" className="font-body text-xs text-gray-500">Family Type</Label>
                          <select
                            id="edit-family-type"
                            value={editFormData.family_type}
                            onChange={(e) => handleEditFormChange('family_type', e.target.value)}
                            className="mt-1 w-full h-11 px-3 border rounded-xl font-body text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <option value="">Select type</option>
                            <option value="Nuclear">Nuclear</option>
                            <option value="Joint">Joint</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="edit-siblings" className="font-body text-xs text-gray-500">Siblings</Label>
                          <Input
                            id="edit-siblings"
                            type="text"
                            value={editFormData.siblings}
                            onChange={(e) => handleEditFormChange('siblings', e.target.value)}
                            placeholder="Siblings"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-father-occupation" className="font-body text-xs text-gray-500">Father's Occupation</Label>
                          <Input
                            id="edit-father-occupation"
                            type="text"
                            value={editFormData.father_occupation}
                            onChange={(e) => handleEditFormChange('father_occupation', e.target.value)}
                            placeholder="Father's Occupation"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-mother-occupation" className="font-body text-xs text-gray-500">Mother's Occupation</Label>
                          <Input
                            id="edit-mother-occupation"
                            type="text"
                            value={editFormData.mother_occupation}
                            onChange={(e) => handleEditFormChange('mother_occupation', e.target.value)}
                            placeholder="Mother's Occupation"
                            className="mt-1 h-11 font-body"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="edit-about" className="font-body text-xs text-gray-500">About Yourself</Label>
                          <textarea
                            id="edit-about"
                            value={editFormData.about}
                            onChange={(e) => handleEditFormChange('about', e.target.value)}
                            placeholder="Describe yourself..."
                            rows={3}
                            className="mt-1 w-full p-3 border rounded-xl font-body text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                            style={{ borderColor: 'var(--border)' }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <DialogFooter className="gap-2 mt-6 flex-row justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowEditProfileModal(false)}
                      className="rounded-full h-11 px-6 font-body"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={editProfileLoading}
                      className="rounded-full h-11 px-6 text-white font-body"
                      style={{ background: 'var(--primary)' }}
                    >
                      {editProfileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
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
