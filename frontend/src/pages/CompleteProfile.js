import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';
import { Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompleteProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
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
    siblings: '',
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return true;

    const formDataObj = new FormData();
    formDataObj.append('file', photoFile);

    try {
      await axios.post(`${API}/profile/photo`, formDataObj, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return true;
    } catch (error) {
      toast.error('Photo upload failed');
      return false;
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setLoading(true);
      
      const photoUploaded = await uploadPhoto();
      if (!photoUploaded) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.put(`${API}/profile`, formData, { withCredentials: true });
        updateUser(data);
        toast.success('Profile completed successfully!');
        navigate('/discover');
      } catch (error) {
        toast.error('Failed to update profile');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: '1px solid var(--border)' }}>
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Complete Your Profile
            </h1>
            <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
              Step {step} of 3: {step === 1 ? 'Personal Details' : step === 2 ? 'Professional Details' : 'About & Family'}
            </p>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="h-2 flex-1 rounded-full transition-smooth"
                  style={{ background: s <= step ? 'var(--primary)' : 'var(--border)' }}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="height" className="font-body">Height (cm)</Label>
                  <Input
                    id="height"
                    data-testid="profile-height-input"
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="170"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="weight" className="font-body">Weight (kg)</Label>
                  <Input
                    id="weight"
                    data-testid="profile-weight-input"
                    type="text"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="65"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="marital_status" className="font-body">Marital Status</Label>
                  <Select onValueChange={(value) => handleChange('marital_status', value)}>
                    <SelectTrigger data-testid="profile-marital-status-select" className="mt-2 h-12 font-body">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">Never Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="caste" className="font-body">Caste/Sub-caste</Label>
                  <Input
                    id="caste"
                    data-testid="profile-caste-input"
                    type="text"
                    value={formData.caste}
                    onChange={(e) => handleChange('caste', e.target.value)}
                    placeholder="Enter caste"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="mother_tongue" className="font-body">Mother Tongue</Label>
                  <Input
                    id="mother_tongue"
                    data-testid="profile-mother-tongue-input"
                    type="text"
                    value={formData.mother_tongue}
                    onChange={(e) => handleChange('mother_tongue', e.target.value)}
                    placeholder="Hindi"
                    className="mt-2 h-12 font-body"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="education" className="font-body">Education</Label>
                  <Input
                    id="education"
                    data-testid="profile-education-input"
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    placeholder="Bachelor's Degree"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="occupation" className="font-body">Occupation</Label>
                  <Input
                    id="occupation"
                    data-testid="profile-occupation-input"
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    placeholder="Software Engineer"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="income" className="font-body">Annual Income</Label>
                  <Select onValueChange={(value) => handleChange('income', value)}>
                    <SelectTrigger data-testid="profile-income-select" className="mt-2 h-12 font-body">
                      <SelectValue placeholder="Select income range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Below 3 Lakhs">Below 3 Lakhs</SelectItem>
                      <SelectItem value="3-5 Lakhs">3-5 Lakhs</SelectItem>
                      <SelectItem value="5-7 Lakhs">5-7 Lakhs</SelectItem>
                      <SelectItem value="7-10 Lakhs">7-10 Lakhs</SelectItem>
                      <SelectItem value="10-15 Lakhs">10-15 Lakhs</SelectItem>
                      <SelectItem value="15-20 Lakhs">15-20 Lakhs</SelectItem>
                      <SelectItem value="Above 20 Lakhs">Above 20 Lakhs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city" className="font-body">City</Label>
                  <Input
                    id="city"
                    data-testid="profile-city-input"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Mumbai"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="state" className="font-body">State</Label>
                  <Input
                    id="state"
                    data-testid="profile-state-input"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Maharashtra"
                    className="mt-2 h-12 font-body"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="photo" className="font-body">Profile Photo</Label>
                <div className="mt-2">
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-2xl object-cover"
                        style={{ border: '2px solid var(--border)' }}
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('photo-upload').click()}
                        className="mt-2 font-body"
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="photo-upload"
                      data-testid="profile-photo-upload"
                      className="flex flex-col items-center justify-center w-full h-48 rounded-2xl cursor-pointer transition-smooth hover:border-primary"
                      style={{ border: '2px dashed var(--border)', background: 'var(--surface-secondary)' }}
                    >
                      <Upload className="w-12 h-12 mb-3" style={{ color: 'var(--text-secondary)' }} />
                      <p className="font-body" style={{ color: 'var(--text-secondary)' }}>Click to upload photo</p>
                    </label>
                  )}
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="about" className="font-body">About Yourself</Label>
                <Textarea
                  id="about"
                  data-testid="profile-about-textarea"
                  value={formData.about}
                  onChange={(e) => handleChange('about', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="mt-2 font-body"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="family_type" className="font-body">Family Type</Label>
                  <Select onValueChange={(value) => handleChange('family_type', value)}>
                    <SelectTrigger data-testid="profile-family-type-select" className="mt-2 h-12 font-body">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nuclear">Nuclear</SelectItem>
                      <SelectItem value="Joint">Joint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="siblings" className="font-body">Siblings</Label>
                  <Input
                    id="siblings"
                    data-testid="profile-siblings-input"
                    type="text"
                    value={formData.siblings}
                    onChange={(e) => handleChange('siblings', e.target.value)}
                    placeholder="1 brother, 1 sister"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="father_occupation" className="font-body">Father's Occupation</Label>
                  <Input
                    id="father_occupation"
                    data-testid="profile-father-occupation-input"
                    type="text"
                    value={formData.father_occupation}
                    onChange={(e) => handleChange('father_occupation', e.target.value)}
                    placeholder="Business"
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div>
                  <Label htmlFor="mother_occupation" className="font-body">Mother's Occupation</Label>
                  <Input
                    id="mother_occupation"
                    data-testid="profile-mother-occupation-input"
                    type="text"
                    value={formData.mother_occupation}
                    onChange={(e) => handleChange('mother_occupation', e.target.value)}
                    placeholder="Homemaker"
                    className="mt-2 h-12 font-body"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <Button
                type="button"
                data-testid="profile-back-button"
                onClick={() => setStep(step - 1)}
                className="px-8 h-12 rounded-full font-body font-medium transition-smooth"
                style={{ background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              data-testid="profile-next-button"
              onClick={handleNext}
              disabled={loading}
              className="flex-1 h-12 rounded-full font-body font-medium text-white transition-smooth"
              style={{ background: loading ? 'var(--text-secondary)' : 'var(--primary)' }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--primary)')}
            >
              {loading ? 'Saving...' : step === 3 ? 'Complete Profile' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompleteProfile;