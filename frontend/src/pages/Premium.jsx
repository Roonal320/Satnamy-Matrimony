import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { Crown, Check, ArrowLeft, Sparkles, MessageCircle, Eye, TrendingUp, Star, UserCheck, Headphones } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

const Premium = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('1');

  const statusParam = searchParams.get('status');
  const txnidParam = searchParams.get('txnid');

  useEffect(() => {
    const handlePaymentResult = async () => {
      if (!statusParam) return;
      
      if (statusParam === 'success') {
        const toastId = toast.loading('Confirming activation...');
        try {
          await checkAuth();
          toast.success('Premium plan activated successfully!', { id: toastId });
          navigate('/?tab=viewers', { replace: true });
        } catch (error) {
          console.error("Auth update error:", error);
          toast.error('Could not refresh session. Please reload page.', { id: toastId });
        }
      } else {
        toast.error('Payment was unsuccessful or cancelled.');
        navigate('/premium', { replace: true });
      }
    };
    
    handlePaymentResult();
  }, [statusParam, txnidParam]);

  const tiers = [
    {
      id: 'gold',
      name: 'Gold',
      tagline: t('premium.tagline_gold'),
      color: '#D4AF37',
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
      prices: { '1': 499, '3': 999, '6': 1499, '12': 1999 },
      features: [
        { icon: <MessageCircle className="w-4 h-4" />, text: t('premium.feature_unlimited_messaging') },
        { icon: <Eye className="w-4 h-4" />, text: t('premium.feature_view_contact') },
        { icon: <TrendingUp className="w-4 h-4" />, text: t('premium.feature_boost_1') },
        { icon: <Check className="w-4 h-4" />, text: t('premium.feature_who_viewed') },
        { icon: <Check className="w-4 h-4" />, text: t('premium.feature_priority_search') },
      ],
    },
    {
      id: 'diamond',
      name: 'Diamond',
      tagline: t('premium.tagline_diamond'),
      color: '#6C63FF',
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #4B47B3 100%)',
      popular: true,
      prices: { '1': 999, '3': 1999, '6': 2999, '12': 3999 },
      features: [
        { icon: <MessageCircle className="w-4 h-4" />, text: t('premium.feature_unlimited_messaging') },
        { icon: <Eye className="w-4 h-4" />, text: t('premium.feature_view_contact') },
        { icon: <TrendingUp className="w-4 h-4" />, text: t('premium.feature_boost_3') },
        { icon: <Star className="w-4 h-4" />, text: t('premium.feature_bold_listing') },
        { icon: <Sparkles className="w-4 h-4" />, text: t('premium.feature_spotlight') },
        { icon: <Check className="w-4 h-4" />, text: t('premium.feature_advanced_filters') },
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      tagline: t('premium.tagline_platinum'),
      color: '#1F1A17',
      gradient: 'linear-gradient(135deg, #1F1A17 0%, #3D3530 100%)',
      prices: { '1': 1499, '3': 2999, '6': 4499, '12': 5999 },
      features: [
        { icon: <MessageCircle className="w-4 h-4" />, text: t('premium.feature_unlimited_messaging') },
        { icon: <Eye className="w-4 h-4" />, text: t('premium.feature_view_contact') },
        { icon: <TrendingUp className="w-4 h-4" />, text: t('premium.feature_boost_unlimited') },
        { icon: <Star className="w-4 h-4" />, text: t('premium.feature_bold_listing') },
        { icon: <Sparkles className="w-4 h-4" />, text: t('premium.feature_top_spotlight') },
        { icon: <UserCheck className="w-4 h-4" />, text: t('premium.feature_personal_matchmaker') },
        { icon: <Headphones className="w-4 h-4" />, text: t('premium.feature_support_24_7') },
      ],
    },
  ];

  const freeFeatures = [
    t('premium.feature_create_profile'),
    t('premium.feature_upload_photos'),
    t('premium.feature_browse_profiles'),
    t('premium.feature_basic_search'),
    t('premium.feature_view_blurred'),
    t('premium.feature_limited_views'),
  ];

  const handleSubscribe = async (tier) => {
    // Comment out launch promotion block during testing
    // toast.info("All premium features are already unlocked under the 6-month free launch promotion!");
    // return;

    const planKey = `${tier.id}_${selectedDuration}`;
    const price = tier.prices[selectedDuration];

    setLoading(planKey);

    try {
      const { data } = await axios.post(
        `${API}/premium/create-order`,
        { 
          plan: planKey, 
          amount: price * 100,
          frontend_url: window.location.origin
        },
        { withCredentials: true }
      );

      // Redirect to Dodo Payments hosted checkout page
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error('Failed to get checkout URL');
      }
    } catch (error) {
      console.error("Payment error:", error);
      const msg = error.response?.data?.detail || 'Failed to initiate payment';
      toast.error(msg);
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
            {t('premium.title')}
          </h1>
          <p className="font-body text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('premium.subtitle')}
          </p>
        </div>

        {/* Promo Notice */}
        <div 
          className="mb-8 p-6 rounded-2xl text-center max-w-4xl mx-auto border" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(200, 75, 49, 0.1) 100%)',
            borderColor: 'rgba(212, 175, 55, 0.3)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div className="inline-flex items-center gap-2 mb-3 bg-white/80 px-4 py-1.5 rounded-full border border-[var(--secondary)]/40 shadow-sm">
            <Sparkles className="w-4 h-4 text-[var(--secondary)] animate-pulse" />
            <span className="font-body text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              {t('premium.offer_special_launch')}
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold mb-2 text-[var(--text-primary)]">
            {t('premium.offer_duration_6_months')}
          </h2>
          <p className="font-body text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {t('premium.offer_desc')}
          </p>
        </div>

        {/* Duration Selector */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex rounded-full p-1" style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
            {[
              { value: '1', key: 'month' },
              { value: '3', key: 'months' },
              { value: '6', key: 'months' },
              { value: '12', key: 'months' },
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
                {duration.value} {duration.value === '1' ? t('premium.month') : t('premium.months')}
                {duration.value === '12' && (
                  <span className="hidden sm:inline ml-1 text-xs opacity-80">({t('premium.save_30')})</span>
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
                {t('premium.free')}
              </h3>
              <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('premium.start_at_no_cost')}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-heading text-3xl sm:text-4xl font-bold" style={{ color: 'var(--success)' }}>
                &#8377;0
              </span>
              <span className="font-body text-sm block" style={{ color: 'var(--text-secondary)' }}>{t('premium.forever_free')}</span>
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
                  {t('premium.popular').toUpperCase()}
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
                    / {selectedDuration} {selectedDuration === '1' ? t('premium.month').toLowerCase() : t('premium.months').toLowerCase()}
                  </span>
                  <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    &#8377;{Math.round(tier.prices[selectedDuration] / parseInt(selectedDuration)).toLocaleString()} / {t('premium.month').toLowerCase()}
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
                  disabled={loading === `${tier.id}_${selectedDuration}`}
                  onClick={() => handleSubscribe(tier)}
                  className="w-full h-11 sm:h-12 md:h-14 rounded-full font-body font-medium text-sm sm:text-base text-white shadow-md transition-smooth hover:scale-[1.02]"
                  style={{
                    background: 'var(--primary)',
                  }}
                >
                  {loading === `${tier.id}_${selectedDuration}` 
                    ? t('premium.checkout_loading') 
                    : t('premium.subscribe_to', { name: tier.name })}
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
                {t('premium.active_plan_notice', { name: user.premium_name || 'Premium' })}
              </p>
            </div>
          </div>
        )}

        {/* Comparison Note */}
        <div className="mt-12 sm:mt-16 text-center max-w-3xl mx-auto">
          <h3 className="font-heading text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('premium.why_upgrade')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <MessageCircle className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="font-body text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('premium.feature_unlimited_messaging')}</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('premium.connect_without_limits')}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <Eye className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="font-body text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('premium.feature_view_contact')}</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('premium.see_phone_email')}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <Sparkles className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              <p className="font-body text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('premium.higher_visibility')}</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('premium.spotlight_bold')}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Premium;
