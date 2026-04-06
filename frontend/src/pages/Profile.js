import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { MapPin, Briefcase, GraduationCap, Heart, MessageCircle, ArrowLeft, Phone, User as UserIcon, Users } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/600x800?text=No+Photo';
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
    return `${API}/files/${path}?auth=${token}`;
  };

  const handleSendMessage = () => {
    navigate(`/chat?user=${userId}`);
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
            <div className="bg-white rounded-2xl overflow-hidden sticky top-8" style={{ border: '1px solid var(--border)' }}>
              <img
                src={getImageUrl(profile.profile_photo)}
                alt={profile.name}
                className="w-full aspect-[3/4] object-cover"
              />
              {!isOwnProfile && (
                <div className="p-4 space-y-3">
                  <Button
                    data-testid="send-message-button"
                    onClick={handleSendMessage}
                    className="w-full h-12 rounded-full font-body text-white transition-smooth"
                    style={{ background: 'var(--primary)' }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send Message
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
                {profile.date_of_birth && `${calculateAge(profile.date_of_birth)} years old`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>Location</p>
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

                {profile.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-body font-medium" style={{ color: 'var(--text-primary)' }}>Phone</p>
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>{profile.phone}</p>
                    </div>
                  </div>
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
    </div>
  );
};

export default Profile;