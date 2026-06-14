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
    <span className="font-body font-semibold text-sm" style={{ color: 'var(--text-primary)', minWidth: '160px' }}>{label}:</span>
    <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>{value}</span>
  </div>
);

const RefundPolicy = () => {
  const updated = 'June 1, 2026';
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)' }}>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">Return & Refund Policy</h1>
        <p className="font-body text-sm" style={{ color: '#A09890' }}>Last updated: {updated}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="bg-white rounded-2xl p-8 md:p-12" style={{ border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <p className="font-body mb-10 p-4 rounded-xl text-sm" style={{ background: 'rgba(200,75,49,0.06)', color: 'var(--text-secondary)', borderLeft: '4px solid var(--primary)' }}>
            This website is operated by <strong>Roonal Khandelwal</strong>. Please read this Return & Refund Policy carefully before purchasing any premium plan on Satnami Matrimony / Satnami Shaadi (satnamishaadiii.com).
          </p>

          {/* Key Highlights */}
          <div className="grid gap-3 mb-10">
            <Highlight label="General Refund Policy" value="All premium membership payments are strictly non-refundable." />
            <Highlight label="Guarantee Disclaimer" value="We offer no guarantees on matches, responses, or compatibility." />
            <Highlight label="Billing Errors" value="Duplicate payments will be refunded in full." />
            <Highlight label="Processing Time" value="5 to 10 business days for approved billing error corrections." />
          </div>

          <Section title="1. Non-Refundable Subscriptions">
            <p>
              Satnami Matrimony provides digital matrimonial matching subscriptions. Because premium features (including accessing contact details, sending messages, and profile highlights) are activated and accessible immediately upon successful payment confirmation, <strong>all membership fees and subscription plans are strictly non-refundable</strong>.
            </p>
            <p>
              As a matrimonial service platform, we connect profiles within the Satnami community, but we cannot guarantee that any member will find a match, receive interest acceptances, or get responses. Compatibility and match outcomes depend entirely on personal choices, communication, and registration activity.
            </p>
          </Section>

          <Section title="2. Exclusions & Disclaimers">
            <p>We do not issue refunds or pro-rata adjustments under any of the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Change of mind or finding a match outside the website.</li>
              <li>Receiving no responses, low activity, or lack of matching profiles that meet your specific filters.</li>
              <li>Partial use of the premium subscription duration.</li>
              <li>Suspension, blocking, or termination of your account due to a violation of our Terms & Conditions (such as harassment, commercial usage, spam, or creating fake profiles).</li>
            </ul>
          </Section>

          <Section title="3. Duplicate Charges & Billing Discrepancies">
            <p>
              If your bank account was charged twice for a single subscription, or if payment was successful but the premium subscription was not activated, this constitutes a billing error.
            </p>
            <p>
              Please notify us immediately by emailing your transaction receipt and registered account details to <a href="mailto:satnamishaadiii@gmail.com" style={{ color: 'var(--primary)' }} className="underline">satnamishaadiii@gmail.com</a>. We will verify the transaction with our payment gateway (Dodo Payments) and reverse duplicate charges or manually activate your subscription within <strong>48 hours</strong>.
            </p>
          </Section>

          <Section title="4. Refund Modes for Approved Billing Corrections">
            <p>Approved refunds for duplicate payments are processed through our payment gateway and credited back to the original payment source:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Cards (Credit/Debit):</strong> Reverted to the card account within 7 to 10 business days.</li>
              <li><strong>UPI (GPay, PhonePe, Paytm, etc.):</strong> Reverted to the UPI ID within 3 to 5 business days.</li>
              <li><strong>Net Banking:</strong> Reverted to the originating bank account within 5 to 7 business days.</li>
            </ul>
            <p className="italic text-xs">Note: Refund timelines are dependent on bank clearing cycles and may vary. We are not responsible for bank-side delays.</p>
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

export default RefundPolicy;
