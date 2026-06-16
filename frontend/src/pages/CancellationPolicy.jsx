import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SafeEmail } from '../components/SafeContact';

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
  const updated = 'June 1, 2026';
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
            This website is operated by <strong>Roonal Khandelwal</strong>. Please read this Cancellation Policy carefully before purchasing or cancelling any plan on Satnami Matrimony / Satnami Shaadi (satnamishaadiii.com).
          </p>

          {/* Key Highlights */}
          <div className="grid gap-3 mb-10">
            <Highlight label="Renewal System" value="No Auto-Renew. All subscriptions are one-time payments for a fixed duration." />
            <Highlight label="Subscription Cancellation" value="Active subscription continues until plan expiration. No mid-term refunds." />
            <Highlight label="User Profile Deletion" value="Request account deletion at any time. Data permanently purged within 30 days." />
            <Highlight label="Platform-Initiated" value="Immediate cancellation for policy violations, with no refund eligibility." />
          </div>

          <Section title="1. Subscription Term & Non-Renewal">
            <p>
              All premium packages purchased on Satnami Matrimony are <strong>one-time, non-recurring subscriptions</strong> valid for a specified term (e.g., 1 month, 3 months, 6 months, 12 months).
            </p>
            <p>
              We do <strong>not</strong> implement automatic renewal systems. You will never be charged automatically at the end of your billing cycle. Once your package duration concludes, your profile will automatically return to the basic free tier unless you manually select and pay for a new package.
            </p>
          </Section>

          <Section title="2. Mid-Term Subscription Cancellation">
            <p>
              You may request to cancel your active premium subscription at any time. However, since digital features are activated immediately upon payment:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No partial, pro-rata, or mid-term refunds will be issued for unused days or portions of the plan.</li>
              <li>Your profile will retain its premium status and all advanced privileges (messaging, profile highlight, etc.) until the original expiry date of the plan.</li>
              <li>Upon reaching the expiry date, your account status will transition to the free tier.</li>
            </ul>
          </Section>

          <Section title="3. User-Initiated Account Deletion">
            <p>
              If you have finalized your match or decide to leave Satnami Matrimony, you may request permanent deletion of your profile:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Log in to your account, open Account Settings, and follow the DELETE profile prompts. Alternatively, email support at <SafeEmail linkClassName="underline" linkStyle={{ color: 'var(--primary)' }} />.</li>
              <li>Upon initiating deletion, your profile is immediately removed from matching searches.</li>
              <li>Your complete data profile, photos, and messages are permanently deleted from our servers within <strong>30 days</strong>.</li>
              <li>Please note that deleting your account does not make you eligible for a refund of any active premium subscription.</li>
            </ol>
          </Section>

          <Section title="4. Platform-Initiated Profile Cancellation">
            <p>
              Satnami Matrimony reserves the right to suspend, terminate, or cancel a user's account immediately and without notice under the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violation of our Terms & Conditions or community safety standards.</li>
              <li>Providing fake, fraudulent, or inaccurate registration details (e.g., age, marital status, identity).</li>
              <li>Uploading obscene, offensive, or copyrighted materials/photos.</li>
              <li>Harassment, verbal abuse, or fraudulent activity directed at other members.</li>
              <li>Scraping content or using automated bots on our systems.</li>
            </ul>
            <p>In all cases of platform-initiated cancellation due to conduct violations, the user forfeits the remainder of their subscription, and no refund will be issued.</p>
          </Section>

          <Section title="5. Contact Support">
            <p>For any cancellation or account deletion queries, reach out to our helpdesk:</p>
            <div className="p-4 rounded-xl mt-4" style={{ background: 'var(--surface-secondary)' }} data-nosnippet="">
              <p><strong>Roonal Khandelwal</strong></p>
              <p>10/1143 Shivanand Nagar Sec-1, Khamtarai, Raipur, Chhattisgarh – 492008</p>
              <p>Email: <SafeEmail linkStyle={{ color: 'var(--primary)' }} /></p>
            </div>
          </Section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;
