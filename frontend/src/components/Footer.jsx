import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer style={{ background: '#1F1A17', color: '#E6E2D8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <img
                    src="/guru.png"
                    alt="Guru Ghasidas Ji"
                    className="w-10 h-10 rounded-full object-cover border-2 cursor-pointer transition-transform hover:scale-105"
                    style={{ borderColor: 'var(--primary)', objectPosition: 'center 30%' }}
                  />
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] md:max-w-2xl bg-transparent border-0 shadow-none p-0 flex justify-center items-center">
                  <DialogTitle className="sr-only">Guru Ghasidas Ji</DialogTitle>
                  <DialogDescription className="sr-only">Full size photo of Guru Ghasidas Ji</DialogDescription>
                  <img
                    src="/guru.png"
                    alt="Guru Ghasidas Ji"
                    className="w-auto h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  />
                </DialogContent>
              </Dialog>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">{t('header.brand_name')}</h3>
                <p className="font-body text-xs" style={{ color: '#A09890' }}>{t('header.brand_slogan')}</p>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#A09890' }}>
              {t('footer.brand_description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">{t('footer.quick_links')}</h4>
            <ul className="space-y-3">
              {[
                { label: t('header.home'), path: '/' },
                { label: t('footer.search_profiles'), path: '/?tab=discover' },
                { label: t('footer.premium_plans'), path: '/premium' },
                { label: t('header.register'), path: '/register' },
                { label: t('header.sign_in'), path: '/login' },
              ].map((link) => (
                <li key={link.path}>
                  <span
                    onClick={() => navigate(link.path)}
                    className="font-body text-sm cursor-pointer transition-all duration-200 hover:text-white"
                    style={{ color: '#A09890' }}
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">{t('footer.contact_us')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <span className="font-body text-sm" style={{ color: '#A09890' }}>
                  support@satnamimatrimony.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <span className="font-body text-sm" style={{ color: '#A09890' }}>
                  +91 9131261834
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <span className="font-body text-sm" style={{ color: '#A09890' }}>
                  Raipur, Chhattisgarh, India
                </span>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">{t('footer.about')}</h4>
            <ul className="space-y-3">
              {[
                t('footer.about_us'),
                t('footer.privacy_policy'),
                t('footer.terms'),
                t('footer.help'),
                t('footer.faq')
              ].map((item) => (
                <li key={item}>
                  <span
                    className="font-body text-sm cursor-pointer transition-all duration-200 hover:text-white"
                    style={{ color: '#A09890' }}
                    data-testid={`footer-link-${item.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8" style={{ borderTop: '1px solid #3A3530' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs sm:text-sm text-center sm:text-left" style={{ color: '#A09890' }}>
              &copy; {new Date().getFullYear()} {t('footer.rights_reserved')}
            </p>
            <div className="flex items-center gap-1 font-body text-xs sm:text-sm" style={{ color: '#A09890' }}>
              {t('footer.made_with')} <Heart className="w-3 h-3 mx-1" style={{ color: 'var(--primary)' }} fill="var(--primary)" /> {t('footer.for_community')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
