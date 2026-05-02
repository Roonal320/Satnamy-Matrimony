import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { Crown, Check, ArrowLeft, Sparkles, MessageCircle, Eye, TrendingUp, Star, UserCheck, Headphones } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Premium = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('6');

  const tiers = [
    {
      id: 'gold',
      name: 'Gold',
      tagline: 'Start Connecting',
      color: '#D4AF37',
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
      prices: { '3': 1499, '6': 2499, '12': 3999 },
      features: [
        { icon: <MessageCircle className="w-4 h-4" />, text: 'Unlimited Messaging' },
        { icon: <Eye className="w-4 h-4" />, text: 'View Contact Details' },
        { icon: <TrendingUp className="w-4 h-4" />, text: 'Profile Boost (1x/month)' },
        { icon: <Check className="w-4 h-4" />, text: 'See Who Viewed You' },
        { icon: <Check className="w-4 h-4" />, text: 'Priority in Search' },
      ],
    },
    {
      id: 'diamond',
      name: 'Diamond',
      tagline: 'Get Noticed Faster',
      color: '#6C63FF',
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #4B47B3 100%)',
      popular: true,
      prices: { '3': 2999, '6': 4999, '12': 7999 },
      features: [
        { icon: <MessageCircle className="w-4 h-4" />, text: 'Unlimited Messaging' },
        { icon: <Eye className="w-4 h-4" />, text: 'View Contact Details' },
        { icon: <TrendingUp className="w-4 h-4" />, text: 'Profile Boost (3x/month)' },
        { icon: <Star className="w-4 h-4" />, text: 'Bold Listing in Search' },
        { icon: <Sparkles className="w-4 h-4" />, text: 'Spotlight Profile' },
        { icon: <Check className="w-4 h-4" />, text: 'Advanced Match Filters' },
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      tagline: 'VIP Experience',
      color: '#1F1A17',
      gradient: 'linear-gradient(135deg, #1F1A17 0%, #3D3530 100%)',
      prices: { '3': 4999, '6': 7999, '12': 12999 },
      features: [
        { icon: <MessageCircle className="w-4 h-4" />, text: 'Unlimited Messaging' },
        { icon: <Eye className="w-4 h-4" />, text: 'View Contact Details' },
        { icon: <TrendingUp className="w-4 h-4" />, text: 'Profile Boost (Unlimited)' },
        { icon: <Star className="w-4 h-4" />, text: 'Bold Listing in Search' },
        { icon: <Sparkles className="w-4 h-4" />, text: 'Top Spotlight Profile' },
        { icon: <UserCheck className="w-4 h-4" />, text: 'Personal Matchmaker' },
        { icon: <Headphones className="w-4 h-4" />, text: 'Priority Support 24/7' },
      ],
    },
  ];

  const freeFeatures = [
    'Create Your Profile',
    'Upload Photos',
    'Browse Profiles',
    'Basic Search Filters',
    'View Blurred Photos',
    'Limited Daily Profile Views',
  ];

  const handleSubscribe = async (tier) => {
    const planKey = `${tier.id}_${selectedDuration}`;
    const price = tier.prices[selectedDuration];
    setLoading(planKey);

    try {
      const { data: order } = await axios.post(
        `${API}/premium/create-order`,
        { plan: planKey, amount: price * 100 },
        { withCredentials: true }
      );

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_dummy',
          amount: order.amount,
          currency: 'INR',
          order_id: order.id,
          name: 'Satnami Matrimony',
          description: `${tier.name} Plan - ${selectedDuration} Months`,
          handler: async (response) => {
            try {
              await axios.post(
                `${API}/premium/verify`,
                {
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                },
                { withCredentials: true }
              );
              await checkAuth();
              toast.success(`${tier.name} plan activated!`);
              navigate('/discover');
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: tier.color },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      toast.error('Failed to create payment order');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4" style={{ color: 'var(--secondary)' }}>
            <Crown className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Choose Your Plan
          </h1>
          <p className="font-body text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Free profile creation and browsing for everyone. Upgrade to unlock messaging, contact viewing, and increased visibility.
          </p>
        </div>

        {/* Duration Selector */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex rounded-full p-1" style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
            {[
              { value: '3', label: '3 Months' },
              { value: '6', label: '6 Months' },
              { value: '12', label: '12 Months' },
            ].map((duration) => (
              <button
                key={duration.value}
                data-testid={`duration-${duration.value}`}
                onClick={() => setSelectedDuration(duration.value)}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full font-body text-xs sm:text-sm font-medium transition-all duration-200"
                style={{
                  background: selectedDuration === duration.value ? 'var(--primary)' : 'transparent',
                  color: selectedDuration === duration.value ? 'white' : 'var(--text-secondary)',
                }}
              >
                {duration.label}
                {duration.value === '12' && (
                  <span className="hidden sm:inline ml-1 text-xs opacity-80">Save 30%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Free Tier */}
        <div className="mb-8 sm:mb-12 bg-white rounded-2xl p-5 sm:p-8 max-w-4xl mx-auto" style={{ border: '1px solid var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Free
              </h3>
              <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                Start your journey at no cost
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-heading text-3xl sm:text-4xl font-bold" style={{ color: 'var(--success)' }}>
                &#8377;0
              </span>
              <span className="font-body text-sm block" style={{ color: 'var(--text-secondary)' }}>forever free</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {freeFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                <span className="font-body text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              data-testid={`plan-${tier.id}`}
              className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative flex flex-col"
              style={{ border: tier.popular ? `2px solid ${tier.color}` : '1px solid var(--border)' }}
            >
              {tier.popular && (
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] sm:text-xs font-body font-bold text-white z-10"
                  style={{ background: tier.color }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Tier Header */}
              <div className="p-5 sm:p-6 md:p-8" style={{ background: tier.gradient }}>
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-white" />
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-1">
                  {tier.name}
                </h3>
                <p className="font-body text-xs sm:text-sm text-white/80">{tier.tagline}</p>
              </div>

              {/* Price */}
              <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col">
                <div className="mb-4 sm:mb-6">
                  <span className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    &#8377;{tier.prices[selectedDuration].toLocaleString()}
                  </span>
                  <span className="font-body text-xs sm:text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
                    / {selectedDuration} months
                  </span>
                  <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    &#8377;{Math.round(tier.prices[selectedDuration] / parseInt(selectedDuration)).toLocaleString()}/month
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 sm:mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: tier.color }}>{feature.icon}</span>
                      <span className="font-body text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  data-testid={`subscribe-${tier.id}-button`}
                  onClick={() => handleSubscribe(tier)}
                  disabled={loading === `${tier.id}_${selectedDuration}` || (user?.premium_name === tier.name)}
                  className="w-full h-11 sm:h-12 md:h-14 rounded-full font-body font-medium text-sm sm:text-base text-white transition-all duration-200 hover:scale-[1.02] shadow-md"
                  style={{
                    background: loading === `${tier.id}_${selectedDuration}` ? 'var(--text-secondary)' : tier.gradient,
                  }}
                >
                  {loading === `${tier.id}_${selectedDuration}`
                    ? 'Processing...'
                    : user?.premium_name === tier.name
                    ? 'Current Plan'
                    : `Get ${tier.name}`}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Already Active */}
        {user?.is_premium && (
          <div className="mt-8 sm:mt-12 text-center">
            <div
              className="inline-block px-6 sm:px-8 py-4 rounded-2xl"
              style={{ background: 'var(--success)', color: 'white' }}
            >
              <p className="font-body text-sm sm:text-base font-medium">
                You're on the {user.premium_name || 'Premium'} plan! Enjoy all the exclusive benefits.
              </p>
            </div>
          </div>
        )}

        {/* Comparison Note */}
        <div className="mt-12 sm:mt-16 text-center max-w-3xl mx-auto">
          <h3 className="font-heading text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Why Upgrade?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <MessageCircle className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="font-body text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Send Unlimited Messages</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Connect without limits</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <Eye className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="font-body text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>View Contact Details</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>See phone & email directly</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="font-body text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Higher Visibility</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Spotlight & Bold Listing</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Premium;
