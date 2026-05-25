import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { MapPin, Briefcase, GraduationCap, Heart, MessageCircle, ArrowLeft, Phone, User as UserIcon, Users, Lock, Crown, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

const Profile = () => {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
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
      // Reset input so same file can be re-selected
      e.target.value = '';
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
                  className={`w-full h-full object-cover transition-all duration-300 ${!isOwnProfile && !user?.is_premium ? 'blur-md select-none scale-105' : ''}`}
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

                {!isOwnProfile && !user?.is_premium && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                    <Crown className="w-10 h-10 text-yellow-400 mb-2 animate-bounce" />
                    <p className="text-white font-heading font-semibold text-lg">Photo Blurred</p>
                    <p className="text-white/80 font-body text-xs mb-4">Upgrade to premium to view unblurred photos</p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/premium')} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-body text-xs font-bold rounded-full h-8 px-4"
                    >
                      Unlock Photo
                    </Button>
                  </div>
                )}
              </div>
              {!isOwnProfile && (
                <div className="p-4 space-y-3">
                  <Button
                    data-testid="send-message-button"
                    onClick={user?.is_premium ? handleSendMessage : () => navigate('/premium')}
                    className="w-full h-12 rounded-full font-body text-white transition-smooth"
                    style={{ background: user?.is_premium ? 'var(--primary)' : 'var(--text-secondary)' }}
                  >
                    {user?.is_premium ? (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock Messaging
                      </>
                    )}
                  </Button>
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
