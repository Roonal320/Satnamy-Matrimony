import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { Crown, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Premium = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 999,
      duration: '1 Month',
      features: [
        'Unlimited profile views',
        'Priority listing in search results',
        'See who viewed your profile',
        'Direct contact details',
        'Advanced matching algorithm',
        'Premium badge on profile',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: 9999,
      duration: '12 Months',
      popular: true,
      features: [
        'All monthly features',
        'Save 17% compared to monthly',
        'Profile verification badge',
        'Dedicated relationship manager',
        'Exclusive premium events access',
        'Priority customer support',
      ],
    },
  ];

  const handleSubscribe = async (plan) => {
    setLoading(plan.id);

    try {
      // Create Razorpay order
      const { data: order } = await axios.post(
        `${API}/premium/create-order`,
        { plan: plan.id, amount: plan.price * 100 },
        { withCredentials: true }
      );

      // Load Razorpay script
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
          description: `${plan.name} Subscription`,
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
              toast.success('Premium activated successfully!');
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
          theme: {
            color: '#C84B31',
          },
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
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1683140426885-6c0ce899409c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzaWxrJTIwdGV4dHVyZXxlbnwwfHx8fDE3NzU0ODkyNjl8MA&ixlib=rb-4.1.0&q=85)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(253, 251, 247, 0.95)' }}></div>

      <div className="relative max-w-7xl mx-auto">
        <Button
          data-testid="back-button"
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4" style={{ color: 'var(--secondary)' }}>
            <Sparkles className="w-8 h-8" />
            <Crown className="w-12 h-12" />
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Upgrade to Premium
          </h1>
          <p className="font-body text-lg" style={{ color: 'var(--text-secondary)' }}>
            Get noticed by more matches and find your perfect partner faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              data-testid={`plan-${plan.id}`}
              className="bg-white rounded-2xl overflow-hidden transition-smooth hover:-translate-y-2 relative"
              style={{ border: plan.popular ? '3px solid var(--secondary)' : '1px solid var(--border)' }}
            >
              {plan.popular && (
                <div
                  className="absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-body font-bold text-white"
                  style={{ background: 'var(--secondary)' }}
                >
                  MOST POPULAR
                </div>
              )}

              <div
                className="p-8"
                style={{
                  background: plan.popular
                    ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
                    : 'var(--surface-secondary)',
                }}
              >
                <Crown className="w-12 h-12 mb-4" style={{ color: plan.popular ? 'white' : 'var(--primary)' }} />
                <h3
                  className="font-heading text-3xl font-bold mb-2"
                  style={{ color: plan.popular ? 'white' : 'var(--text-primary)' }}
                >
                  {plan.name}
                </h3>
                <p className="font-body" style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}>
                  {plan.duration}
                </p>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <span className="font-heading text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ₹{plan.price}
                  </span>
                  <span className="font-body" style={{ color: 'var(--text-secondary)' }}>
                    / {plan.id === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                      <span className="font-body" style={{ color: 'var(--text-secondary)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  data-testid={`subscribe-${plan.id}-button`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id || user?.is_premium}
                  className="w-full h-14 rounded-full font-body font-medium text-lg text-white transition-smooth"
                  style={{
                    background:
                      loading === plan.id || user?.is_premium
                        ? 'var(--text-secondary)'
                        : plan.popular
                        ? 'var(--secondary)'
                        : 'var(--primary)',
                  }}
                >
                  {loading === plan.id
                    ? 'Processing...'
                    : user?.is_premium
                    ? 'Already Premium'
                    : `Get ${plan.name}`}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {user?.is_premium && (
          <div className="mt-12 text-center">
            <div
              className="inline-block px-8 py-4 rounded-2xl"
              style={{ background: 'var(--success)', color: 'white' }}
            >
              <p className="font-body text-lg font-medium">
                You're already a Premium member! Enjoy all the exclusive benefits.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium;