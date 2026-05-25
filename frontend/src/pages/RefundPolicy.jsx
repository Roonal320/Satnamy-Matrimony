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
  const updated = 'May 25, 2025';
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
            This website is operated by <strong>Roonal Khandelwal</strong>. Please read this policy carefully before purchasing any premium plan on Satnami Shaadi (satnamishaadiii.com).
          </p>

          {/* Key Highlights */}
          <div className="grid gap-3 mb-10">
            <Highlight label="Refund Window" value="7 (seven) calendar days from the date of purchase" />
            <Highlight label="Refund Mode" value="Original payment method (Credit/Debit Card, UPI, Net Banking, Wallet)" />
            <Highlight label="Processing Time" value="5–10 business days after approval" />
            <Highlight label="Eligibility" value="Unused premium features; account not found in violation of Terms" />
          </div>

          <Section title="1. Nature of Service">
            <p>Satnami Shaadi is a <strong>digital matrimonial services platform</strong>. All premium plans are subscription-based digital services. Since digital services are consumed immediately upon activation, our refund policy is carefully defined to ensure fairness to both users and the platform.</p>
          </Section>

          <Section title="2. Eligibility for Refund">
            <p>You may be eligible for a refund if:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You request a refund within <strong>7 calendar days</strong> of the purchase date.</li>
              <li>You have not extensively used the premium features (e.g., viewed fewer than 5 premium profiles or sent fewer than 5 messages).</li>
              <li>Your account is in good standing and has not been found in violation of our Terms & Conditions.</li>
              <li>The refund request is due to a technical error on our platform (e.g., double charge, payment deducted but plan not activated).</li>
            </ul>
          </Section>

          <Section title="3. Non-Refundable Situations">
            <p>Refunds will <strong>not</strong> be issued in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Refund requested after 7 calendar days from purchase.</li>
              <li>You have extensively used premium features (messaging, contact views, priority listing).</li>
              <li>Account suspended or terminated for violation of our Terms & Conditions.</li>
              <li>Dissatisfaction with match quality or quantity, as matches depend on community data and personal preferences.</li>
              <li>Change of mind after making significant use of the subscription.</li>
              <li>Partial use of subscription period — no pro-rata refunds are provided.</li>
            </ul>
          </Section>

          <Section title="4. Refund Mode">
            <p>Approved refunds will be credited back to the <strong>original payment method</strong> used at the time of purchase:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Credit/Debit Card:</strong> Refunded to the same card within 5–10 business days.</li>
              <li><strong>UPI:</strong> Refunded to the same UPI ID within 3–7 business days.</li>
              <li><strong>Net Banking:</strong> Refunded to the originating bank account within 5–10 business days.</li>
              <li><strong>Wallets (Paytm, PhonePe, etc.):</strong> Refunded to the same wallet within 2–5 business days.</li>
            </ul>
            <p className="text-sm italic">Note: Actual timelines may vary depending on your bank or payment provider. We are not responsible for delays caused by third-party payment processors.</p>
          </Section>

          <Section title="5. How to Request a Refund">
            <p>To request a refund, please contact us within the eligible window:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Email us at <a href="mailto:satnamishaadiii@gmail.com" style={{ color: 'var(--primary)' }} className="underline">satnamishaadiii@gmail.com</a> with subject line: <em>"Refund Request – [Your Registered Email]"</em></li>
              <li>Include your full name, registered email, transaction ID, date of purchase, and reason for the refund request.</li>
              <li>Our team will review your request within <strong>3 business days</strong> and respond with a decision.</li>
              <li>If approved, the refund will be initiated within <strong>2 business days</strong> of approval.</li>
            </ol>
          </Section>

          <Section title="6. Technical Issues & Billing Errors">
            <p>If you experience a double charge, failed transaction with money deducted, or a plan not activated despite successful payment, please contact us immediately with your payment screenshot and transaction ID. We will resolve billing errors on a priority basis within <strong>48 hours</strong>.</p>
          </Section>

          <Section title="7. Contact">
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
