import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import axios from 'axios';
import { Upload, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { getCroppedImg } from '../lib/cropImage';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

const CompleteProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Cropper States
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

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

  useEffect(() => {
    if (user) {
      setFormData({
        height: user.height || '',
        weight: user.weight || '',
        marital_status: user.marital_status || '',
        caste: user.caste || '',
        mother_tongue: user.mother_tongue || '',
        education: user.education || '',
        occupation: user.occupation || '',
        income: user.income || '',
        city: user.city || '',
        state: user.state || '',
        about: user.about || '',
        family_type: user.family_type || '',
        father_occupation: user.father_occupation || '',
        mother_occupation: user.mother_occupation || '',
        siblings: user.siblings || '',
      });
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedImageBlob], 'cropped-profile-photo.jpg', { type: 'image/jpeg' });
      setPhotoFile(croppedFile);
      setPhotoPreview(URL.createObjectURL(croppedImageBlob));
      setShowCropper(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image. Please try again.');
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
      if (!formData.marital_status) {
        toast.error('Please fill in all required fields.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.education || !formData.city || !formData.state) {
        toast.error('Please fill in all required fields.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // No required fields in step 3, proceed directly
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
        navigate('/');
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
              {user?.registration_type && user?.registration_type !== 'self' ? "Complete Your Child's Profile" : "Complete Your Profile"}
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
                    required
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
                  <Label htmlFor="marital_status" className="font-body">Marital Status <span style={{ color: 'var(--error)' }}>*</span></Label>
                  <Select value={formData.marital_status} onValueChange={(value) => handleChange('marital_status', value)}>
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
                    required
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
                    required
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
                  <Label htmlFor="education" className="font-body">Education <span style={{ color: 'var(--error)' }}>*</span></Label>
                  <Input
                    id="education"
                    data-testid="profile-education-input"
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    placeholder="Bachelor's Degree"
                    required
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
                  <Select value={formData.income} onValueChange={(value) => handleChange('income', value)}>
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
                  <Label htmlFor="city" className="font-body">City <span style={{ color: 'var(--error)' }}>*</span></Label>
                  <Input
                    id="city"
                    data-testid="profile-city-input"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Mumbai"
                    required
                    className="mt-2 h-12 font-body"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="state" className="font-body">State <span style={{ color: 'var(--error)' }}>*</span></Label>
                  <Input
                    id="state"
                    data-testid="profile-state-input"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Maharashtra"
                    required
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
                  required
                  className="mt-2 font-body"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="family_type" className="font-body">Family Type</Label>
                  <Select value={formData.family_type} onValueChange={(value) => handleChange('family_type', value)}>
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

      {/* Image Cropper Dialog */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="sm:max-w-xl bg-white border border-neutral-200 shadow-xl rounded-2xl p-6">
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

      <Footer />
    </div>
  );
};

export default CompleteProfile;
