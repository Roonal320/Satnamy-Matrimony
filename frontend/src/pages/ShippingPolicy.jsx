import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-heading text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    <div className="w-8 h-0.5 rounded-full mb-4" style={{ background: 'var(--primary)' }} />
    <div className="font-body leading-relaxed space-y-3" style={{ color: 'var(--text-secondary)' }}>{children}</div>
  </div>
);

const Highlight = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-4 rounded-xl" style={{ background: 'rgba(200,75,49,0.06)', borderLeft: '4px solid var(--primary)' }}>
    <span className="font-body font-semibold text-sm" style={{ color: 'var(--text-primary)', minWidth: '200px' }}>{label}:</span>
    <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>{value}</span>
  </div>
);

const ShippingPolicy = () => {
  const updated = 'June 1, 2026';
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)' }}>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">Shipping & Delivery Policy</h1>
        <p className="font-body text-sm" style={{ color: '#A09890' }}>Last updated: {updated}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="bg-white rounded-2xl p-8 md:p-12" style={{ border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <p className="font-body mb-10 p-4 rounded-xl text-sm" style={{ background: 'rgba(200,75,49,0.06)', color: 'var(--text-secondary)', borderLeft: '4px solid var(--primary)' }}>
            This website is operated by <strong>Roonal Khandelwal</strong>. Satnami Matrimony / Satnami Shaadi (satnamishaadiii.com) is a <strong>100% digital matchmaking platform</strong>. No physical products are shipped or delivered.
          </p>

          {/* Key Highlights */}
          <div className="grid gap-3 mb-10">
            <Highlight label="Service Delivery Model" value="Purely Online/Digital Matrimonial Subscriptions — no physical goods." />
            <Highlight label="Access Channel" value="Instant activation via your registered account dashboard." />
            <Highlight label="Activation Timeline" value="Immediate (within 1 to 5 minutes of successful payment confirmation)." />
            <Highlight label="Receipt Confirmation" value="Invoice and plan confirmation emailed to registered address within 15 minutes." />
          </div>

          <Section title="1. No Physical Shipping Required">
            <p>
              Satnami Matrimony is a digital matchmaking community platform. We do not design, sell, warehouse, or courier any physical merchandise, booklets, or goods. Accordingly, <strong>no physical shipping takes place</strong> under any transaction or package purchase on our website.
            </p>
          </Section>

          <Section title="2. Activation of Digital Subscriptions">
            <p>Upon successful payment confirmation, premium plans are delivered electronically as follows:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Instant System Upgrade:</strong> Your profile permissions (accessing contact details, unlimited chat, priority filter usage) are automatically upgraded within <strong>1 to 5 minutes</strong> of payment confirmation.</li>
              <li><strong>Email Invoice:</strong> A digital invoice confirming payment and subscription details is dispatched to your registered email ID within <strong>15 minutes</strong>.</li>
              <li><strong>Premium Badge:</strong> A premium badge will instantly appear on your profile card and dashboard header.</li>
            </ul>
          </Section>

          <Section title="3. Delivery Timeline Breakdown">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" style={{ border: '1px solid var(--border)' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-secondary)' }}>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Matrimonial Service</th>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Delivery / Activation Channel</th>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Premium Plan Activation', 'Automatic upgrade on account dashboard', 'Immediate (1–5 mins)'],
                    ['Payment Confirmation Email', 'Registered email inbox', 'Within 15 mins'],
                    ['Profile Verification Verification', 'Review and verification status badge', '1–2 business days'],
                    ['Customer Support Response', 'Email / Phone helplines', 'Within 24–48 hours'],
                  ].map(([service, method, time], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--surface-secondary)' }}>
                      <td className="p-3 font-body" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>{service}</td>
                      <td className="p-3 font-body" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{method}</td>
                      <td className="p-3 font-body font-medium" style={{ border: '1px solid var(--border)', color: 'var(--primary)' }}>{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Troubleshooting Activation Issues">
            <p>In rare situations, premium service delivery may be delayed due to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Delays in payment status callbacks from the Dodo Payments gateway.</li>
              <li>Bank-side transaction clearance processing times.</li>
              <li>Temporary server maintenance windows.</li>
            </ul>
            <p>
              If your account is not upgraded within <strong>30 minutes</strong> of completing your payment, please email us at <a href="mailto:satnamishaadiii@gmail.com" className="underline" style={{ color: 'var(--primary)' }}>satnamishaadiii@gmail.com</a> with your transaction reference. We will manually check the gateway logs and activate your plan within <strong>4 working hours</strong>.
            </p>
          </Section>

          <Section title="5. Contact Us">
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <p><strong>Roonal Khandelwal</strong></p>
              <p>10/1143 Shivanand Nagar Sec-1, Khamtarai, Raipur, Chhattisgarh – 492008</p>
              <p>Email: <a href="mailto:satnamishaadiii@gmail.com" style={{ color: 'var(--primary)' }}>satnamishaadiii@gmail.com</a></p>
              <p>Phone: +91 9131261834</p>
            </div>
          </Section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
