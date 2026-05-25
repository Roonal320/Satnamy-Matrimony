import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import axios from 'axios';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Crown, Heart, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

const Landing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'viewers' ? 'viewers' : 'discover');
  const [viewers, setViewers] = useState([]);
  const [viewersLoading, setViewersLoading] = useState(false);

  useEffect(() => {
    if (tabParam === 'viewers') {
      setActiveTab('viewers');
    } else {
      setActiveTab('discover');
    }
  }, [tabParam]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfiles();
    }
  }, [authLoading, user]);

  const fetchProfiles = async () => {
    try {
      const { data } = await axios.get(`${API}/profiles`, { withCredentials: true });
      setProfiles(data);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/profiles/search`, filters, { withCredentials: true });
      setProfiles(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewers = async () => {
    try {
      setViewersLoading(true);
      const { data } = await axios.get(`${API}/views`, { withCredentials: true });
      setViewers(data);
    } catch (error) {
      console.error('Failed to fetch viewers:', error);
    } finally {
      setViewersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'viewers' && user?.is_premium) {
      fetchViewers();
    }
  }, [activeTab, user]);

  const getCardStyle = (p) => {
    if (!p.is_premium) return { border: '1px solid var(--border)' };
    const plan = p.premium_plan || '';
    if (plan.includes('platinum')) {
      return { border: '2px solid #1F1A17', boxShadow: '0 0 12px rgba(31, 26, 23, 0.2)' };
    }
    if (plan.includes('diamond')) {
      return { border: '2px solid #6C63FF', boxShadow: '0 0 10px rgba(108, 99, 255, 0.15)' };
    }
    if (plan.includes('gold')) {
      return { border: '1.5px solid #D4AF37' };
    }
    return { border: '1px solid var(--border)' };
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
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
    if (!photoPath) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f0e8f0'/%3E%3Ccircle cx='200' cy='180' r='80' fill='%23c9a0c9'/%3E%3Cellipse cx='200' cy='420' rx='130' ry='110' fill='%23c9a0c9'/%3E%3Ctext x='200' y='490' font-family='Arial' font-size='22' fill='%23888' text-anchor='middle'%3ENo Photo%3C/text%3E%3C/svg%3E`;
    // New uploads: full S3 URL stored directly in DB
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    // Legacy: local path — serve via /api/files proxy
    if (user) {
      const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
      return `${API}/files/${photoPath}?auth=${token}`;
    }
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f0e8f0'/%3E%3Ccircle cx='200' cy='180' r='80' fill='%23c9a0c9'/%3E%3Cellipse cx='200' cy='420' rx='130' ry='110' fill='%23c9a0c9'/%3E%3Ctext x='200' y='490' font-family='Arial' font-size='22' fill='%23888' text-anchor='middle'%3EProfile Photo%3C/text%3E%3C/svg%3E`;
  };

  const handleProfileClick = (profileId) => {
    if (user) {
      navigate(`/profile/${profileId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />

      {/* Hero Section */}
      <div
        className="relative py-12 sm:py-16 md:py-24 lg:py-32 px-4 text-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1722952934661-dde241aeb591?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlfGVufDB8fHx8MTc3NTQ4OTI1Nnww&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          minHeight: '500px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 flex flex-col justify-center" style={{ minHeight: '400px' }}>
          <h1
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight drop-shadow-lg"
            data-testid="hero-heading"
          >
            {t('landing.hero_title')}
          </h1>
          <p className="font-body text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8 px-2 drop-shadow-md max-w-3xl mx-auto">
            {t('landing.hero_subtitle')}
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                data-testid="hero-register-button"
                onClick={() => navigate('/register')}
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-full font-body font-medium text-white text-base sm:text-lg transition-smooth shadow-lg w-full sm:w-auto hover:scale-105"
                style={{ background: 'var(--primary)' }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--primary-hover)')}
                onMouseLeave={(e) => (e.target.style.background = 'var(--primary)')}
              >
                {t('landing.register_free')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--text-secondary)' }} />
            <Input
              data-testid="search-input"
              placeholder={t('landing.search_placeholder')}
              className="pl-10 sm:pl-12 h-11 sm:h-12 font-body text-sm sm:text-base"
              style={{ background: 'var(--surface)' }}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                data-testid="filter-button"
                className="h-11 sm:h-12 px-4 sm:px-6 rounded-full font-body transition-smooth text-sm sm:text-base w-full sm:w-auto"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('landing.advanced_filters')}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[85vw] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-heading text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                  {t('landing.advanced_filters')}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                <div>
                  <label className="font-body font-medium mb-2 block text-sm">{t('landing.gender')}</label>
                  <Select onValueChange={(value) => setFilters({ ...filters, gender: value })}>
                    <SelectTrigger data-testid="filter-gender" className="h-10 sm:h-12">
                      <SelectValue placeholder={t('landing.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{t('landing.male')}</SelectItem>
                      <SelectItem value="Female">{t('landing.female')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block text-sm">{t('landing.marital_status')}</label>
                  <Select onValueChange={(value) => setFilters({ ...filters, marital_status: value })}>
                    <SelectTrigger data-testid="filter-marital-status" className="h-10 sm:h-12">
                      <SelectValue placeholder={t('landing.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">{t('landing.never_married')}</SelectItem>
                      <SelectItem value="Divorced">{t('landing.divorced')}</SelectItem>
                      <SelectItem value="Widowed">{t('landing.widowed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block text-sm">{t('landing.education')}</label>
                  <Input
                    data-testid="filter-education"
                    placeholder={t('landing.education_placeholder')}
                    onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                    className="h-10 sm:h-12"
                  />
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block text-sm">{t('landing.city')}</label>
                  <Input
                    data-testid="filter-city"
                    placeholder={t('landing.city_placeholder')}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="h-10 sm:h-12"
                  />
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block text-sm">{t('landing.state')}</label>
                  <Input
                    data-testid="filter-state"
                    placeholder={t('landing.state_placeholder')}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                    className="h-10 sm:h-12"
                  />
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block text-sm">{t('landing.income')}</label>
                  <Select onValueChange={(value) => setFilters({ ...filters, income: value })}>
                    <SelectTrigger data-testid="filter-income" className="h-10 sm:h-12">
                      <SelectValue placeholder={t('landing.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Below 3 Lakhs">{t('landing.income_below_3')}</SelectItem>
                      <SelectItem value="3-5 Lakhs">{t('landing.income_3_5')}</SelectItem>
                      <SelectItem value="5-7 Lakhs">{t('landing.income_5_7')}</SelectItem>
                      <SelectItem value="7-10 Lakhs">{t('landing.income_7_10')}</SelectItem>
                      <SelectItem value="10-15 Lakhs">{t('landing.income_10_15')}</SelectItem>
                      <SelectItem value="Above 20 Lakhs">{t('landing.income_above_20')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  data-testid="apply-filters-button"
                  onClick={applyFilters}
                  className="w-full h-11 sm:h-12 rounded-full font-body text-white font-medium shadow-md text-sm sm:text-base"
                  style={{ background: 'var(--primary)' }}
                  onMouseEnter={(e) => (e.target.style.background = 'var(--primary-hover)')}
                  onMouseLeave={(e) => (e.target.style.background = 'var(--primary)')}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Personal Matchmaker VIP Support Banner */}
        {user?.is_premium && user?.premium_plan?.includes('platinum') && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl border bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/30 flex-shrink-0">
                <Crown className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-heading font-bold text-base text-amber-400">Platinum VIP Matchmaker Active</h4>
                <p className="font-body text-xs text-gray-300">Your dedicated expert matchmaker: <strong>Shreya Sharma</strong> (+91 98765 43210)</p>
              </div>
            </div>
            <a href="tel:+919876543210" className="bg-amber-500 hover:bg-amber-600 text-black font-body font-bold text-xs rounded-full py-2.5 px-5 transition-all shadow-md w-full sm:w-auto text-center">
              Call Matchmaker
            </a>
          </div>
        )}

        {/* Tab Navigation */}
        {user && (
          <div className="flex border-b mb-6 gap-6" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setActiveTab('discover')}
              className={`pb-3 font-heading font-semibold text-lg relative transition-all ${activeTab === 'discover' ? 'text-primary font-bold' : 'text-gray-400'}`}
              style={{ color: activeTab === 'discover' ? 'var(--primary)' : undefined }}
            >
              {t('discover.title') || 'Discover Matches'}
              {activeTab === 'discover' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('viewers')}
              className={`pb-3 font-heading font-semibold text-lg relative transition-all flex items-center gap-1.5 ${activeTab === 'viewers' ? 'text-primary font-bold' : 'text-gray-400'}`}
              style={{ color: activeTab === 'viewers' ? 'var(--primary)' : undefined }}
            >
              Who Viewed Me
              {!user?.is_premium && <Lock className="w-3.5 h-3.5 text-orange-500" />}
              {activeTab === 'viewers' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
            </button>
          </div>
        )}

        {/* Profiles Grid */}
        {(!user || activeTab === 'discover') && (
          <>
            <div className="mb-6 sm:mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3" style={{ color: 'var(--text-primary)' }}>
                <Heart className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'var(--primary)' }} />
                <span className="text-xl sm:text-3xl">{t('landing.perfect_match')}</span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-16 sm:py-20">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
                <p className="mt-4 font-body text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>{t('landing.loading')}</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <p className="font-body text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>{t('landing.no_profiles')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    data-testid={`profile-card-${profile.id}`}
                    onClick={() => handleProfileClick(profile.id)}
                    className="profile-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-smooth"
                    style={getCardStyle(profile)}
                  >
                    <div className="relative aspect-[3/4] sm:aspect-[4/5]">
                      <img
                        src={getImageUrl(profile.profile_photo)}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        style={!user ? { filter: 'blur(20px)' } : {}}
                      />
                      {!user && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Button
                            className="rounded-full font-body font-medium text-white px-3 sm:px-6 text-xs sm:text-sm"
                            style={{ background: 'var(--primary)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/login');
                            }}
                          >
                            {t('landing.login_to_view')}
                          </Button>
                        </div>
                      )}
                      {profile.is_premium && user && (
                        <div
                          className="absolute top-2 right-2 px-2 py-1 rounded-full flex items-center gap-1"
                          style={{ background: 'var(--secondary)', color: 'white' }}
                        >
                          <Crown className="w-3 h-3" />
                          <span className="text-xs font-body font-medium hidden sm:inline">{t('landing.premium')}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 hero-overlay">
                        <h3 className="font-heading text-base sm:text-xl md:text-2xl font-semibold text-white mb-0.5 sm:mb-1 truncate">
                          {profile.name}
                        </h3>
                        <p className="font-body text-xs sm:text-sm text-white/90">
                          {profile.date_of_birth && `${calculateAge(profile.date_of_birth)} ${t('landing.years')}`}
                        </p>
                      </div>
                    </div>

                    <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
                      {profile.city && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                          <span className="font-body text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                            {profile.city}, {profile.state}
                          </span>
                        </div>
                      )}
                      {profile.occupation && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                          <span className="font-body text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                            {profile.occupation}
                          </span>
                        </div>
                      )}
                      {profile.education && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                          <span className="font-body text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                            {profile.education}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Who Viewed Me Content */}
        {user && activeTab === 'viewers' && (
          !user?.is_premium ? (
            <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">See Who Viewed Your Profile</h3>
              <p className="font-body text-gray-600 mb-6 text-sm">
                Gold, Diamond, and Platinum subscribers can see visitors who viewed their profile. Upgrade now to start connecting!
              </p>
              <Button onClick={() => navigate('/premium')} className="w-full h-12 rounded-full font-body text-white font-semibold" style={{ background: 'var(--primary)' }}>
                Upgrade to Premium
              </Button>
            </div>
          ) : viewersLoading ? (
            <div className="text-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
              <p className="mt-4 font-body text-sm" style={{ color: 'var(--text-secondary)' }}>Loading visitors...</p>
            </div>
          ) : viewers.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
              <p className="font-body text-lg text-gray-500">No one has viewed your profile yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {viewers.map((profile) => (
                <div
                  key={profile.id}
                  data-testid={`profile-card-${profile.id}`}
                  onClick={() => handleProfileClick(profile.id)}
                  className="profile-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-smooth"
                  style={getCardStyle(profile)}
                >
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
                    <img
                      src={getImageUrl(profile.profile_photo)}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    {profile.is_premium && (
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full flex items-center gap-1 shadow-md"
                        style={{
                          background: profile.premium_plan?.includes('platinum')
                            ? 'linear-gradient(135deg, #1F1A17 0%, #3D3530 100%)'
                            : profile.premium_plan?.includes('diamond')
                              ? 'linear-gradient(135deg, #6C63FF 0%, #4B47B3 100%)'
                              : 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                          color: 'white'
                        }}
                      >
                        <Crown className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-body font-bold uppercase tracking-wider">
                          {profile.premium_name || 'Premium'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 hero-overlay">
                      <h3 className={`font-heading text-base sm:text-xl md:text-2xl font-semibold text-white mb-0.5 sm:mb-1 truncate ${profile.is_premium && (profile.premium_plan?.includes('diamond') || profile.premium_plan?.includes('platinum')) ? 'font-black tracking-wide' : ''}`}>
                        {profile.name}
                      </h3>
                      <p className="font-body text-xs sm:text-sm text-white/90">
                        {profile.date_of_birth && `${calculateAge(profile.date_of_birth)} ${t('landing.years')}`}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
                    {profile.city && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                        <span className="font-body text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                          {profile.city}, {profile.state}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 italic">
                      Viewed you {new Date(profile.viewed_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* CTA Section */}
        {!user && profiles.length > 0 && (
          <div className="mt-16 text-center py-12 px-4 rounded-2xl shadow-md" style={{ background: 'var(--surface-secondary)' }}>
            <h3 className="font-heading text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('landing.ready_connect')}
            </h3>
            <p className="font-body text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
              {t('landing.ready_subtitle')}
            </p>
            <Button
              data-testid="cta-register-button"
              onClick={() => navigate('/register')}
              className="h-14 px-8 rounded-full font-body font-medium text-white text-lg transition-smooth shadow-lg"
              style={{ background: 'var(--primary)' }}
              onMouseEnter={(e) => (e.target.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.target.style.background = 'var(--primary)')}
            >
              {t('landing.register_free')}
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Landing;
