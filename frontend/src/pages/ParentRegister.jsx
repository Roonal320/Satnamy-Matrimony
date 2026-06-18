import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle, Users, User, Heart, MapPin, GraduationCap, Briefcase, Utensils, Eye, EyeOff, Check, X, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logAnalyticsEvent } from '../lib/firebase';
import { toast } from 'sonner';
import SEO from '../components/SEO';

const TOTAL_STEPS = 6;

const STEP_INFO = [
  { title: 'Your Details', subtitle: 'Parent/Guardian information', icon: <Users className="w-5 h-5" /> },
  { title: 'Candidate Info', subtitle: 'Basic details of the candidate', icon: <User className="w-5 h-5" /> },
  { title: 'Education & Career', subtitle: 'Academic and professional details', icon: <GraduationCap className="w-5 h-5" /> },
  { title: 'Location & Family', subtitle: 'Where the family is based', icon: <MapPin className="w-5 h-5" /> },
  { title: 'Lifestyle & About', subtitle: 'Habits and personality', icon: <Utensils className="w-5 h-5" /> },
  { title: 'Partner Preferences', subtitle: 'What kind of match you are looking for', icon: <Heart className="w-5 h-5" /> },
];

const ParentRegister = () => {
  const [searchParams] = useSearchParams();
  const isRelative = searchParams.get('type') === 'relative';
  const navigate = useNavigate();
  const { parentRegister } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Parent/Guardian
    relationship_to_candidate: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_whatsapp: '',
    guardian_email: '',
    email: '',
    password: '',
    confirmPassword: '',
    guardian_city: '',
    guardian_state: '',
    // Step 2: Candidate Basic Info
    name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    height: '',
    weight: '',
    marital_status: '',
    manglik: '',
    // Step 3: Education & Career
    education: '',
    highest_degree: '',
    college_name: '',
    occupation: '',
    company_name: '',
    income: '',
    // Step 4: Location & Family
    native_place: '',
    city: '',
    state: '',
    father_name: '',
    father_occupation: '',
    mother_name: '',
    mother_occupation: '',
    num_brothers: '',
    num_sisters: '',
    family_type: '',
    family_values: '',
    // Step 5: Lifestyle & About
    diet: '',
    smoking: '',
    drinking: '',
    guru_ghar: '',
    gotra: '',
    about: '',
    // Step 6: Partner Preferences
    partner_age_min: '',
    partner_age_max: '',
    partner_height_min: '',
    partner_height_max: '',
    partner_education: '',
    partner_occupation: '',
    partner_state: '',
    partner_city: '',
    partner_marital_status: '',
    partner_manglik: '',
    // Communication Preferences
    preferred_contact_person: '',
    preferred_contact_time: '',
    preferred_contact_mode: '',
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const getMinDOB = () => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const checkPasswordRules = (pwd) => ({
    hasLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const rules = checkPasswordRules(formData.password);
  const isPasswordValid = rules.hasLength && rules.hasUpper && rules.hasNumber && rules.hasSpecial;

  const relationshipOptions = isRelative
    ? ['Brother', 'Sister', 'Uncle', 'Aunt', 'Guardian', 'Other']
    : ['Father', 'Mother', 'Uncle', 'Aunt', 'Guardian', 'Other'];

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.relationship_to_candidate) return 'Please select your relationship to the candidate';
        if (!formData.guardian_name) return 'Your name is required';
        if (!formData.guardian_phone) return 'Your phone number is required';
        if (!formData.email) return 'Email is required for account login';
        if (!formData.password) return 'Password is required';
        if (!isPasswordValid) return 'Password does not meet complexity requirements';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        return null;
      case 2:
        if (!formData.name) return "Candidate's name is required";
        if (!formData.gender) return "Candidate's gender is required";
        if (!formData.date_of_birth) return "Candidate's date of birth is required";
        if (calculateAge(formData.date_of_birth) < 18) return 'Candidate must be at least 18 years old';
        if (!formData.marital_status) return 'Marital status is required';
        return null;
      case 3:
        if (!formData.education) return 'Education level is required';
        return null;
      case 4:
        if (!formData.city) return 'City is required';
        if (!formData.state) return 'State is required';
        return null;
      case 5:
        return null; // All optional
      case 6:
        if (!agreeTerms) return 'You must agree to the Terms & Conditions';
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setError(error);
      toast.error(error);
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    logAnalyticsEvent('signup_attempt', { method: 'parent' });

    const registrationType = isRelative ? 'relative' :
      ['Brother', 'Sister'].includes(formData.relationship_to_candidate) ? 'sibling' : 'parent';

    const result = await parentRegister({
      ...formData,
      registration_type: registrationType,
    });

    setLoading(false);

    if (result.success) {
      logAnalyticsEvent('signup_success', { method: 'parent' });
      toast.success('Registration successful! Complete the profile to make it visible.');
      navigate('/complete-profile');
    } else {
      logAnalyticsEvent('signup_failure', { method: 'parent', error: result.error });
      setError(result.error);
      toast.error(result.error);
    }
  };

  const stepColor = step <= 2 ? '#D4AF37' : step <= 4 ? 'var(--primary)' : '#6C63FF';

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <SEO
        title="Parent Registration | Satnami Matrimony"
        description="Register your son or daughter on Satnami Matrimony. A trusted family-oriented platform for the Satnami community."
        keywords="parent registration matrimony, family matrimony registration, satnami parent"
        canonicalUrl="https://satnamishaadiii.com/parent-register"
      />
      <Header />

      <div className="py-8 md:py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Top Badge */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-semibold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)' }}
            >
              <Shield className="w-4 h-4" />
              {isRelative ? '👫 Relative Registration' : '👨‍👩‍👧 Parent / Guardian Registration'}
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg" style={{ border: '1px solid var(--border)' }}>
            {/* Header */}
            <div className="mb-6">
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {STEP_INFO[step - 1].title}
              </h1>
              <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                Step {step} of {TOTAL_STEPS} — {STEP_INFO[step - 1].subtitle}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1.5 mb-8">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-all duration-500"
                  style={{
                    background: i < step ? stepColor : 'var(--border)',
                    opacity: i < step ? 1 : 0.4,
                  }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'var(--surface-secondary)', borderLeft: '4px solid var(--error)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                <p className="text-sm font-body" style={{ color: 'var(--error)' }}>{error}</p>
              </div>
            )}

            {/* ─── STEP 1: Parent/Guardian Details ─── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label className="font-body">Your Relationship to the Candidate <span className="text-red-500">*</span></Label>
                  <Select value={formData.relationship_to_candidate} onValueChange={(v) => handleChange('relationship_to_candidate', v)}>
                    <SelectTrigger data-testid="parent-relationship-select" className="mt-2 h-12 font-body">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="font-body">Your Name <span className="text-red-500">*</span></Label>
                    <Input id="guardian_name" data-testid="parent-name-input" type="text" value={formData.guardian_name} onChange={(e) => handleChange('guardian_name', e.target.value)} placeholder="e.g. Ramesh Kumar" required className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Your Mobile Number <span className="text-red-500">*</span></Label>
                    <Input id="guardian_phone" data-testid="parent-phone-input" type="tel" value={formData.guardian_phone} onChange={(e) => handleChange('guardian_phone', e.target.value)} placeholder="9876543210" required className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">WhatsApp Number</Label>
                    <Input id="guardian_whatsapp" type="tel" value={formData.guardian_whatsapp} onChange={(e) => handleChange('guardian_whatsapp', e.target.value)} placeholder="Same as mobile or different" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Your Email (Optional)</Label>
                    <Input id="guardian_email" type="email" value={formData.guardian_email} onChange={(e) => handleChange('guardian_email', e.target.value)} placeholder="your@email.com" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Your City</Label>
                    <Input id="guardian_city" type="text" value={formData.guardian_city} onChange={(e) => handleChange('guardian_city', e.target.value)} placeholder="Raipur" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Your State</Label>
                    <Input id="guardian_state" type="text" value={formData.guardian_state} onChange={(e) => handleChange('guardian_state', e.target.value)} placeholder="Chhattisgarh" className="mt-2 h-12 font-body" />
                  </div>
                </div>

                {/* Account Credentials Section */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Account Login Credentials</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Label className="font-body">Account Email <span className="text-red-500">*</span></Label>
                      <Input id="email" data-testid="parent-email-input" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="This email will be used for login" required className="mt-2 h-12 font-body" />
                    </div>
                    <div className="relative">
                      <Label className="font-body">Password <span className="text-red-500">*</span></Label>
                      <div className="relative mt-2">
                        <Input id="password" data-testid="parent-password-input" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="••••••••" required className="h-12 pr-10 font-body" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Label className="font-body">Confirm Password <span className="text-red-500">*</span></Label>
                      <div className="relative mt-2">
                        <Input id="confirmPassword" data-testid="parent-confirm-password-input" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="••••••••" required className="h-12 pr-10 font-body" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700">
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Password Rules */}
                  <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs font-semibold font-body text-neutral-500 mb-2 uppercase tracking-wider">Password Requirements</p>
                    <div className="grid grid-cols-2 gap-2 text-sm font-body">
                      {[
                        { key: 'hasLength', label: '8 characters' },
                        { key: 'hasUpper', label: 'Uppercase letter' },
                        { key: 'hasNumber', label: 'Number' },
                        { key: 'hasSpecial', label: 'Special character' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          {rules[key] ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-neutral-400" />}
                          <span className={rules[key] ? 'text-green-700' : 'text-neutral-500'}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Candidate Basic Info ─── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Label className="font-body">Candidate's Full Name <span className="text-red-500">*</span></Label>
                    <Input id="name" data-testid="candidate-name-input" type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Full name of the candidate" required className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Gender <span className="text-red-500">*</span></Label>
                    <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                      <SelectTrigger data-testid="candidate-gender-select" className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Transgender">Transgender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-body">Date of Birth <span className="text-red-500">*</span></Label>
                    <Input id="dob" data-testid="candidate-dob-input" type="date" value={formData.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} max={getMinDOB()} required className="mt-2 h-12 font-body" />
                    {formData.date_of_birth && (
                      <p className="mt-1 text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                        Age: {calculateAge(formData.date_of_birth)} years
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="font-body">Candidate's Phone</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Candidate's phone (if different)" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Height (cm)</Label>
                    <Input id="height" type="text" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="170" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Weight (kg)</Label>
                    <Input id="weight" type="text" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="65" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Marital Status <span className="text-red-500">*</span></Label>
                    <Select value={formData.marital_status} onValueChange={(v) => handleChange('marital_status', v)}>
                      <SelectTrigger data-testid="candidate-marital-select" className="mt-2 h-12 font-body">
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
                    <Label className="font-body">Manglik</Label>
                    <Select value={formData.manglik} onValueChange={(v) => handleChange('manglik', v)}>
                      <SelectTrigger className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Don't Know">Don't Know</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Education & Career ─── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="font-body">Education Level <span className="text-red-500">*</span></Label>
                    <Select value={formData.education} onValueChange={(v) => handleChange('education', v)}>
                      <SelectTrigger data-testid="candidate-education-select" className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10th">10th</SelectItem>
                        <SelectItem value="12th">12th</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                        <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-body">Highest Degree</Label>
                    <Input id="highest_degree" type="text" value={formData.highest_degree} onChange={(e) => handleChange('highest_degree', e.target.value)} placeholder="B.Tech, MBA, etc." className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">College / University</Label>
                    <Input id="college_name" type="text" value={formData.college_name} onChange={(e) => handleChange('college_name', e.target.value)} placeholder="College name" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Occupation</Label>
                    <Input id="occupation" type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} placeholder="Software Engineer, Teacher, etc." className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Company Name</Label>
                    <Input id="company_name" type="text" value={formData.company_name} onChange={(e) => handleChange('company_name', e.target.value)} placeholder="Company name" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Annual Income</Label>
                    <Select value={formData.income} onValueChange={(v) => handleChange('income', v)}>
                      <SelectTrigger className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Below 3 Lakhs">Below 3 LPA</SelectItem>
                        <SelectItem value="3-5 Lakhs">3–5 LPA</SelectItem>
                        <SelectItem value="5-7 Lakhs">5–10 LPA</SelectItem>
                        <SelectItem value="7-10 Lakhs">10–20 LPA</SelectItem>
                        <SelectItem value="10-15 Lakhs">10–15 LPA</SelectItem>
                        <SelectItem value="Above 20 Lakhs">20+ LPA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 4: Location & Family ─── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="font-body">Native Place</Label>
                    <Input id="native_place" type="text" value={formData.native_place} onChange={(e) => handleChange('native_place', e.target.value)} placeholder="Village / Town" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Current City <span className="text-red-500">*</span></Label>
                    <Input id="city" data-testid="candidate-city-input" type="text" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="Raipur" required className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">State <span className="text-red-500">*</span></Label>
                    <Input id="state" data-testid="candidate-state-input" type="text" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="Chhattisgarh" required className="mt-2 h-12 font-body" />
                  </div>
                </div>

                {/* Family Details */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Family Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label className="font-body">Father's Name</Label>
                      <Input type="text" value={formData.father_name} onChange={(e) => handleChange('father_name', e.target.value)} placeholder="Father's full name" className="mt-2 h-12 font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Father's Occupation</Label>
                      <Input type="text" value={formData.father_occupation} onChange={(e) => handleChange('father_occupation', e.target.value)} placeholder="Business, Service, etc." className="mt-2 h-12 font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Mother's Name</Label>
                      <Input type="text" value={formData.mother_name} onChange={(e) => handleChange('mother_name', e.target.value)} placeholder="Mother's full name" className="mt-2 h-12 font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Mother's Occupation</Label>
                      <Input type="text" value={formData.mother_occupation} onChange={(e) => handleChange('mother_occupation', e.target.value)} placeholder="Homemaker, Service, etc." className="mt-2 h-12 font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Number of Brothers</Label>
                      <Input type="text" value={formData.num_brothers} onChange={(e) => handleChange('num_brothers', e.target.value)} placeholder="0" className="mt-2 h-12 font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Number of Sisters</Label>
                      <Input type="text" value={formData.num_sisters} onChange={(e) => handleChange('num_sisters', e.target.value)} placeholder="0" className="mt-2 h-12 font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Family Type</Label>
                      <Select value={formData.family_type} onValueChange={(v) => handleChange('family_type', v)}>
                        <SelectTrigger className="mt-2 h-12 font-body">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Joint">Joint Family</SelectItem>
                          <SelectItem value="Nuclear">Nuclear Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-body">Family Values</Label>
                      <Select value={formData.family_values} onValueChange={(v) => handleChange('family_values', v)}>
                        <SelectTrigger className="mt-2 h-12 font-body">
                          <SelectValue placeholder="Select values" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Traditional">Traditional</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Liberal">Liberal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 5: Lifestyle & About ─── */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label className="font-body">Diet</Label>
                    <Select value={formData.diet} onValueChange={(v) => handleChange('diet', v)}>
                      <SelectTrigger className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Select diet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-body">Smoking</Label>
                    <Select value={formData.smoking} onValueChange={(v) => handleChange('smoking', v)}>
                      <SelectTrigger className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-body">Drinking</Label>
                    <Select value={formData.drinking} onValueChange={(v) => handleChange('drinking', v)}>
                      <SelectTrigger className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Religion & Community */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Religion & Community</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                      <p className="text-xs font-body text-neutral-500 mb-1">Community</p>
                      <p className="font-body font-semibold" style={{ color: 'var(--text-primary)' }}>Satnami</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
                      <p className="text-xs font-body text-neutral-500 mb-1">Religion</p>
                      <p className="font-body font-semibold" style={{ color: 'var(--text-primary)' }}>Hindu</p>
                    </div>
                    <div>
                      <Label className="font-body">Guru Ghar</Label>
                      <Input type="text" value={formData.guru_ghar} onChange={(e) => handleChange('guru_ghar', e.target.value)} placeholder="Enter Guru Ghar (optional)" className="mt-2 h-12 font-body" />
                    </div>
                    <div>
                      <Label className="font-body">Gotra</Label>
                      <Input type="text" value={formData.gotra} onChange={(e) => handleChange('gotra', e.target.value)} placeholder="Enter Gotra (optional)" className="mt-2 h-12 font-body" />
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Label className="font-body">About the Candidate</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => handleChange('about', e.target.value)}
                    placeholder="Our daughter is a caring and well-educated person with strong family values. She is currently working in Raipur and we are looking for a suitable life partner from a respectable Satnami family."
                    rows={4}
                    className="mt-2 font-body"
                  />
                </div>
              </div>
            )}

            {/* ─── STEP 6: Partner Preferences & Submit ─── */}
            {step === 6 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="font-body">Preferred Age (Min)</Label>
                    <Input type="number" value={formData.partner_age_min} onChange={(e) => handleChange('partner_age_min', e.target.value)} placeholder="21" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Preferred Age (Max)</Label>
                    <Input type="number" value={formData.partner_age_max} onChange={(e) => handleChange('partner_age_max', e.target.value)} placeholder="30" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Education Preference</Label>
                    <Input type="text" value={formData.partner_education} onChange={(e) => handleChange('partner_education', e.target.value)} placeholder="Graduate or above" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Occupation Preference</Label>
                    <Input type="text" value={formData.partner_occupation} onChange={(e) => handleChange('partner_occupation', e.target.value)} placeholder="Any" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Preferred State</Label>
                    <Input type="text" value={formData.partner_state} onChange={(e) => handleChange('partner_state', e.target.value)} placeholder="Chhattisgarh" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Preferred City</Label>
                    <Input type="text" value={formData.partner_city} onChange={(e) => handleChange('partner_city', e.target.value)} placeholder="Any" className="mt-2 h-12 font-body" />
                  </div>
                  <div>
                    <Label className="font-body">Marital Status Preference</Label>
                    <Select value={formData.partner_marital_status} onValueChange={(v) => handleChange('partner_marital_status', v)}>
                      <SelectTrigger className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Never Married">Never Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-body">Manglik Preference</Label>
                    <Select value={formData.partner_manglik} onValueChange={(v) => handleChange('partner_manglik', v)}>
                      <SelectTrigger className="mt-2 h-12 font-body">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Any">Doesn't Matter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Communication Preferences</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <Label className="font-body">Contact Person</Label>
                      <Select value={formData.preferred_contact_person} onValueChange={(v) => handleChange('preferred_contact_person', v)}>
                        <SelectTrigger className="mt-2 h-12 font-body">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Candidate">Candidate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-body">Preferred Time</Label>
                      <Select value={formData.preferred_contact_time} onValueChange={(v) => handleChange('preferred_contact_time', v)}>
                        <SelectTrigger className="mt-2 h-12 font-body">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                          <SelectItem value="Evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-body">Contact Mode</Label>
                      <Select value={formData.preferred_contact_mode} onValueChange={(v) => handleChange('preferred_contact_mode', v)}>
                        <SelectTrigger className="mt-2 h-12 font-body">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 pt-4">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-1 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                    required
                  />
                  <Label htmlFor="agreeTerms" className="font-body text-xs leading-normal select-none cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>Terms & Conditions</Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>.
                    I confirm that I have the authority to register on behalf of the candidate.
                  </Label>
                </div>
              </div>
            )}

            {/* ─── Navigation Buttons ─── */}
            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={handleBack}
                  className="px-6 h-12 rounded-full font-body font-medium transition-smooth flex items-center gap-2"
                  style={{ background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-full font-body font-medium text-white transition-smooth flex items-center justify-center gap-2"
                  style={{ background: stepColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 h-12 rounded-full font-body font-medium text-white transition-smooth shadow-lg"
                  style={{ background: loading ? 'var(--text-secondary)' : 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)' }}
                >
                  {loading ? 'Creating Account...' : '✨ Complete Registration'}
                </Button>
              )}
            </div>
          </div>

          {/* Already have an account */}
          <div className="mt-6 text-center">
            <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
              Want to register yourself instead?{' '}
              <Link to="/register" className="font-medium" style={{ color: 'var(--primary)' }}>
                Self Registration
              </Link>
              {' · '}
              Already have an account?{' '}
              <Link to="/login" className="font-medium" style={{ color: 'var(--primary)' }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ParentRegister;
