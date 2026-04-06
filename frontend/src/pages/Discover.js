import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import axios from 'axios';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Crown } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Discover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchProfiles();
  }, []);

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
    if (!path) return 'https://via.placeholder.com/400x500?text=No+Photo';
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
    return `${API}/files/${path}?auth=${token}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <Input
              data-testid="search-input"
              placeholder="Search by city, education, occupation..."
              className="pl-12 h-12 font-body"
              style={{ background: 'var(--surface)' }}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                data-testid="filter-button"
                className="h-12 px-6 rounded-full font-body transition-smooth"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-heading text-2xl" style={{ color: '#2E5090' }}>
                  Advanced Filters
                  <div className="font-heading text-lg font-bold mt-3 px-4 py-2 rounded-lg inline-block" style={{ color: '#2E5090', background: '#E8F0F8' }}>
                    जय सतनाम
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="font-body font-medium mb-2 block">Marital Status</label>
                  <Select onValueChange={(value) => setFilters({ ...filters, marital_status: value })}>
                    <SelectTrigger data-testid="filter-marital-status" className="h-12">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">Never Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block">Education</label>
                  <Input
                    data-testid="filter-education"
                    placeholder="e.g., Bachelor's"
                    onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block">City</label>
                  <Input
                    data-testid="filter-city"
                    placeholder="e.g., Mumbai"
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="font-body font-medium mb-2 block">Income Range</label>
                  <Select onValueChange={(value) => setFilters({ ...filters, income: value })}>
                    <SelectTrigger data-testid="filter-income" className="h-12">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Below 3 Lakhs">Below 3 Lakhs</SelectItem>
                      <SelectItem value="3-5 Lakhs">3-5 Lakhs</SelectItem>
                      <SelectItem value="5-7 Lakhs">5-7 Lakhs</SelectItem>
                      <SelectItem value="7-10 Lakhs">7-10 Lakhs</SelectItem>
                      <SelectItem value="10-15 Lakhs">10-15 Lakhs</SelectItem>
                      <SelectItem value="Above 20 Lakhs">Above 20 Lakhs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  data-testid="apply-filters-button"
                  onClick={applyFilters}
                  className="w-full h-12 rounded-full font-body text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Profile Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
            <p className="mt-4 font-body" style={{ color: 'var(--text-secondary)' }}>Loading profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-lg" style={{ color: 'var(--text-secondary)' }}>No profiles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                data-testid={`profile-card-${profile.id}`}
                onClick={() => navigate(`/profile/${profile.id}`)}
                className="profile-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-smooth"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="relative aspect-[4/5]">
                  <img
                    src={getImageUrl(profile.profile_photo)}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                  {profile.is_premium && (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full flex items-center gap-1"
                      style={{ background: 'var(--secondary)', color: 'white' }}
                    >
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-body font-medium">Premium</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 hero-overlay">
                    <h3 className="font-heading text-2xl font-semibold text-white mb-1">
                      {profile.name}
                    </h3>
                    <p className="font-body text-sm text-white/90">
                      {profile.date_of_birth && `${calculateAge(profile.date_of_birth)} years`}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {profile.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {profile.city}, {profile.state}
                      </span>
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {profile.occupation}
                      </span>
                    </div>
                  )}
                  {profile.education && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {profile.education}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
