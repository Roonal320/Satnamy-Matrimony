import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ background: '#1F1A17', color: '#E6E2D8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://customer-assets.emergentagent.com/job_satnami-unions/artifacts/kszwmy3l_ChatGPT%20Image%20Apr%206%2C%202026%2C%2010_53_26%20PM.png"
                alt="Guru Ghasidas Ji"
                className="w-10 h-10 rounded-full object-cover border-2"
                style={{ borderColor: 'var(--primary)', objectPosition: 'center 30%' }}
              />
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Satnami Matrimony</h3>
                <p className="font-body text-xs" style={{ color: '#A09890' }}>जय सतनाम</p>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#A09890' }}>
              Trusted matrimony platform for the Satnami community. Find your perfect life partner with Guru Ghasidas Ji's blessings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', path: '/' },
                { label: 'Search Profiles', path: '/discover' },
                { label: 'Premium Plans', path: '/premium' },
                { label: 'Register', path: '/register' },
                { label: 'Login', path: '/login' },
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
            <h4 className="font-heading text-lg font-semibold text-white mb-4">Contact Us</h4>
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
                  +91 99999 99999
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
            <h4 className="font-heading text-lg font-semibold text-white mb-4">About</h4>
            <ul className="space-y-3">
              {['About Us', 'Privacy Policy', 'Terms of Service', 'Help & Support', 'FAQ'].map((item) => (
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
              &copy; {new Date().getFullYear()} Satnami Matrimony. All rights reserved.
            </p>
            <div className="flex items-center gap-1 font-body text-xs sm:text-sm" style={{ color: '#A09890' }}>
              Made with <Heart className="w-3 h-3 mx-1" style={{ color: 'var(--primary)' }} fill="var(--primary)" /> for the Satnami Community
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
