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
  const updated = 'May 25, 2025';
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)' }}>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">Shipping Policy</h1>
        <p className="font-body text-sm" style={{ color: '#A09890' }}>Last updated: {updated}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="bg-white rounded-2xl p-8 md:p-12" style={{ border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <p className="font-body mb-10 p-4 rounded-xl text-sm" style={{ background: 'rgba(200,75,49,0.06)', color: 'var(--text-secondary)', borderLeft: '4px solid var(--primary)' }}>
            This website is operated by <strong>Roonal Khandelwal</strong>. Satnami Shaadi (satnamishaadiii.com) is a <strong>100% digital service platform</strong>. No physical goods are sold or shipped.
          </p>

          {/* Key Highlights */}
          <div className="grid gap-3 mb-10">
            <Highlight label="Service Type" value="Digital / Online Matrimonial Services — no physical shipping" />
            <Highlight label="Delivery Method" value="Instant activation via your registered email and account dashboard" />
            <Highlight label="Delivery Time" value="Immediate (within 5 minutes of successful payment)" />
            <Highlight label="Delivery Confirmation" value="Email confirmation sent to registered email address" />
          </div>

          <Section title="1. No Physical Shipping">
            <p>Satnami Shaadi is a purely digital matrimonial services platform. We do not sell, manufacture, or deliver any physical products. Therefore, <strong>no physical shipping takes place</strong> in connection with any transaction on our platform.</p>
            <p>All purchases made on Satnami Shaadi are for <strong>digital subscription plans</strong> that grant access to enhanced features on our platform (profile visibility, messaging, contact views, etc.).</p>
          </Section>

          <Section title="2. Digital Service Delivery">
            <p>Upon successful payment, your premium plan is activated as follows:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Activation Time:</strong> Your premium features are activated <strong>immediately</strong> (typically within 1–5 minutes) after payment confirmation from our payment gateway (PayU).</li>
              <li><strong>Confirmation Email:</strong> A payment confirmation and plan activation email is sent to your registered email address within <strong>15 minutes</strong> of successful payment.</li>
              <li><strong>Dashboard Access:</strong> Premium features become visible in your account dashboard upon activation.</li>
            </ul>
          </Section>

          <Section title="3. Delivery Timelines">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" style={{ border: '1px solid var(--border)' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-secondary)' }}>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Service</th>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Delivery Method</th>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Delivery Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Premium Plan Activation', 'Account dashboard', 'Immediate (1–5 minutes)'],
                    ['Payment Confirmation Email', 'Registered email address', 'Within 15 minutes'],
                    ['Support Response', 'Email / Phone', '2 business days'],
                    ['Profile Verification', 'Account status update', '1–2 business days'],
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

          <Section title="4. Delayed Activation">
            <p>In rare cases, service activation may be delayed due to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment gateway (PayU) processing delays during peak hours or bank server issues.</li>
              <li>Bank-side transaction processing times for Net Banking payments.</li>
              <li>Technical maintenance on our platform.</li>
            </ul>
            <p>If your premium plan is not activated within <strong>30 minutes</strong> of successful payment, please contact us immediately with your transaction ID and payment screenshot. We will manually activate your plan within <strong>4 working hours</strong>.</p>
          </Section>

          <Section title="5. Non-Delivery / Failed Activation">
            <p>If payment was deducted from your account but your premium plan was not activated, this constitutes a failed delivery. Please:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Wait 30 minutes as processing delays occasionally occur.</li>
              <li>Check your registered email for a confirmation message.</li>
              <li>If still unresolved, contact us with your transaction ID and registered email at <a href="mailto:satnamishaadiii@gmail.com" style={{ color: 'var(--primary)' }} className="underline">satnamishaadiii@gmail.com</a>.</li>
              <li>We guarantee resolution (activation or full refund) within <strong>2 business days</strong>.</li>
            </ol>
          </Section>

          <Section title="6. Contact">
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
