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
    <span className="font-body font-semibold text-sm" style={{ color: 'var(--text-primary)', minWidth: '180px' }}>{label}:</span>
    <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>{value}</span>
  </div>
);

const CancellationPolicy = () => {
  const updated = 'May 25, 2025';
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)' }}>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">Cancellation Policy</h1>
        <p className="font-body text-sm" style={{ color: '#A09890' }}>Last updated: {updated}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="bg-white rounded-2xl p-8 md:p-12" style={{ border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <p className="font-body mb-10 p-4 rounded-xl text-sm" style={{ background: 'rgba(200,75,49,0.06)', color: 'var(--text-secondary)', borderLeft: '4px solid var(--primary)' }}>
            This website is operated by <strong>Roonal Khandelwal</strong>. Please read this Cancellation Policy carefully before purchasing or cancelling any plan on Satnami Shaadi (satnamishaadiii.com).
          </p>

          {/* Key Highlights */}
          <div className="grid gap-3 mb-10">
            <Highlight label="Cancellation Window" value="Within 24 hours of purchase for a full refund consideration" />
            <Highlight label="Subscription End" value="Access continues until the end of the current billing period" />
            <Highlight label="Auto-Renewal" value="Plans do not auto-renew — manual renewal required" />
            <Highlight label="Account Deletion" value="Can be requested anytime; data removed within 30 days" />
          </div>

          <Section title="1. Subscription Cancellation">
            <p>All premium plans on Satnami Shaadi are <strong>one-time, non-recurring subscriptions</strong> valid for a specified duration (e.g., 1 month, 3 months, 6 months, or 1 year). There is no automatic renewal.</p>
            <p>If you wish to cancel your subscription:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact us at <a href="mailto:satnamishaadiii@gmail.com" style={{ color: 'var(--primary)' }} className="underline">satnamishaadiii@gmail.com</a> within <strong>24 hours</strong> of purchase for refund consideration under our Refund Policy.</li>
              <li>After 24 hours, your subscription remains active until the end of the paid period.</li>
              <li>You will not be charged again automatically when your plan expires.</li>
            </ul>
          </Section>

          <Section title="2. Cancellation Timeline">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" style={{ border: '1px solid var(--border)' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-secondary)' }}>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>When Cancelled</th>
                    <th className="text-left p-3 font-body font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Within 24 hours of purchase', 'Eligible for refund consideration (see Refund Policy)'],
                    ['24 hours – 7 days after purchase', 'Partial refund consideration per Refund Policy'],
                    ['After 7 days of purchase', 'No refund; access continues until plan expiry'],
                    ['After plan expiry', 'Account reverts to free tier automatically'],
                  ].map(([when, outcome], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--surface-secondary)' }}>
                      <td className="p-3 font-body" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>{when}</td>
                      <td className="p-3 font-body" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="3. Account Cancellation / Deletion">
            <p>You may request permanent deletion of your Satnami Shaadi account at any time by:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Emailing <a href="mailto:satnamishaadiii@gmail.com" style={{ color: 'var(--primary)' }} className="underline">satnamishaadiii@gmail.com</a> with subject line: <em>"Account Deletion Request – [Your Registered Email]"</em></li>
              <li>Our team will confirm your identity and process the deletion within <strong>30 days</strong>.</li>
              <li>Deleting your account does not entitle you to a refund of any active subscription.</li>
            </ol>
          </Section>

          <Section title="4. Platform-Initiated Cancellation">
            <p>Satnami Shaadi reserves the right to cancel or suspend a user's account without prior notice in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violation of our Terms & Conditions or Community Guidelines.</li>
              <li>Uploading fraudulent, obscene, or misleading profile information.</li>
              <li>Engaging in harassment, fraud, or abuse of other members.</li>
              <li>Any activity that harms the integrity of the platform or the community.</li>
            </ul>
            <p>In cases of platform-initiated cancellation due to policy violations, no refund will be issued.</p>
          </Section>

          <Section title="5. How to Cancel">
            <p>To initiate a cancellation or account deletion, contact us:</p>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <p><strong>Roonal Khandelwal</strong></p>
              <p>10/1143 Shivanand Nagar Sec-1, Khamtarai, Raipur, Chhattisgarh – 492008</p>
              <p>Email: <a href="mailto:satnamishaadiii@gmail.com" style={{ color: 'var(--primary)' }}>satnamishaadiii@gmail.com</a></p>
              <p>Phone: +91 9131261834</p>
              <p className="mt-2 text-sm italic">Response time: Within 2 business days.</p>
            </div>
          </Section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;
