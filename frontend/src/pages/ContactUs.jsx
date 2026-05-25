import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Clock, Send, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Your message has been sent. We will respond within 2 business days.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  const info = [
    {
      icon: <Building2 className="w-6 h-6" style={{ color: 'var(--primary)' }} />,
      title: 'Legal Entity',
      lines: ['Roonal Khandelwal', 'This website is operated by Roonal Khandelwal'],
    },
    {
      icon: <MapPin className="w-6 h-6" style={{ color: 'var(--primary)' }} />,
      title: 'Registered Address',
      lines: ['10/1143 Shivanand Nagar Sec-1,', 'Khamtarai, Raipur,', 'Chhattisgarh – 492008, India'],
    },
    {
      icon: <Phone className="w-6 h-6" style={{ color: 'var(--primary)' }} />,
      title: 'Phone / WhatsApp',
      lines: ['+91 9131261834'],
    },
    {
      icon: <Mail className="w-6 h-6" style={{ color: 'var(--primary)' }} />,
      title: 'Email Support',
      lines: ['satnamishaadiii@gmail.com'],
    },
    {
      icon: <Clock className="w-6 h-6" style={{ color: 'var(--primary)' }} />,
      title: 'Support Hours',
      lines: ['Monday – Saturday', '10:00 AM – 6:00 PM IST'],
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />

      {/* Hero Banner */}
      <div className="py-16 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)' }}>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
        <p className="font-body text-lg max-w-xl mx-auto" style={{ color: '#A09890' }}>
          We're here to help. Reach out to us for any queries, support or feedback.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left – Contact Information */}
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Get in Touch
            </h2>
            <div className="w-12 h-1 rounded-full mb-8" style={{ background: 'var(--primary)' }} />

            <div className="space-y-6">
              {info.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white" style={{ border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,75,49,0.08)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-body font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                    {item.lines.map((line, j) => (
                      <p key={j} className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Contact Form */}
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Send a Message
            </h2>
            <div className="w-12 h-1 rounded-full mb-8" style={{ background: 'var(--primary)' }} />

            <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl bg-white" style={{ border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-body text-sm font-medium block mb-1.5" style={{ color: 'var(--text-primary)' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full h-11 px-4 rounded-xl font-body text-sm outline-none transition-all"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium block mb-1.5" style={{ color: 'var(--text-primary)' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-xl font-body text-sm outline-none transition-all"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5" style={{ color: 'var(--text-primary)' }}>Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full h-11 px-4 rounded-xl font-body text-sm outline-none transition-all"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5" style={{ color: 'var(--text-primary)' }}>Message *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your query in detail..."
                  className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all resize-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full h-12 rounded-full font-body font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: sending ? 'var(--text-secondary)' : 'var(--primary)', cursor: sending ? 'not-allowed' : 'pointer' }}
              >
                {sending ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
              <p className="font-body text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                We typically respond within 2 business days.
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
