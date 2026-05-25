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

const PrivacyPolicy = () => {
  const updated = 'May 25, 2025';
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)' }}>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="font-body text-sm" style={{ color: '#A09890' }}>Last updated: {updated}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="bg-white rounded-2xl p-8 md:p-12" style={{ border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <p className="font-body mb-10 p-4 rounded-xl text-sm" style={{ background: 'rgba(200,75,49,0.06)', color: 'var(--text-secondary)', borderLeft: '4px solid var(--primary)' }}>
            This website is operated by <strong>Roonal Khandelwal</strong>. By using Satnami Shaadi (satnamishaadiii.com), you consent to the practices described in this Privacy Policy.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following types of information when you register and use our platform:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Information:</strong> Name, date of birth, gender, religion, caste, and community details.</li>
              <li><strong>Contact Information:</strong> Email address and mobile phone number.</li>
              <li><strong>Profile Information:</strong> Photos, educational qualifications, occupation, income, family details, and preferences.</li>
              <li><strong>Payment Information:</strong> Transaction IDs and payment method details processed securely via PayU gateway. We do not store card or UPI credentials.</li>
              <li><strong>Usage Data:</strong> Log data, IP address, browser type, pages visited, and activity timestamps.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To create, maintain and manage your matrimonial profile.</li>
              <li>To match you with compatible profiles within the Satnami community.</li>
              <li>To process payments and maintain billing records as required by law.</li>
              <li>To send transactional communications (registration confirmation, match alerts, etc.).</li>
              <li>To improve platform functionality and user experience.</li>
              <li>To comply with applicable laws and regulations.</li>
            </ul>
          </Section>

          <Section title="3. Information Sharing">
            <p>We do <strong>not</strong> sell, rent, or trade your personal information to any third party. We may share limited information in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>With other members:</strong> Your profile information (excluding contact details for free accounts) is visible to other registered members.</li>
              <li><strong>With service providers:</strong> We share minimal necessary information with payment processors (PayU), cloud storage (AWS S3), and database providers (MongoDB Atlas) solely for service delivery.</li>
              <li><strong>Legal compliance:</strong> When required by Indian law, court orders, or regulatory authorities.</li>
            </ul>
          </Section>

          <Section title="4. Data Security">
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All data is transmitted over HTTPS (TLS/SSL encryption).</li>
              <li>Passwords are hashed using bcrypt and never stored in plaintext.</li>
              <li>Profile photos are stored securely on Amazon Web Services (AWS S3) in the ap-south-1 (Mumbai) region.</li>
              <li>Access to user data is restricted to authorised personnel only.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>We retain your personal data for as long as your account is active. Upon account deletion, your data is removed from our active systems within <strong>30 days</strong>. Anonymised analytics data may be retained for service improvement.</p>
          </Section>

          <Section title="6. Your Rights">
            <ul className="list-disc pl-5 space-y-1">
              <li>Right to access, correct, or update your personal information via your profile settings.</li>
              <li>Right to request deletion of your account and personal data.</li>
              <li>Right to withdraw consent for marketing communications at any time.</li>
            </ul>
            <p>To exercise these rights, write to us at <a href="mailto:satnamishaadiii@gmail.com" className="underline" style={{ color: 'var(--primary)' }}>satnamishaadiii@gmail.com</a>.</p>
          </Section>

          <Section title="7. Cookies">
            <p>We use authentication cookies to maintain your login session securely. We do not use advertising or third-party tracking cookies.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>Our services are intended for individuals aged 18 years and above. We do not knowingly collect information from minors.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. Significant changes will be communicated via email or a prominent notice on our website. Continued use of our platform constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>For privacy-related queries, contact us at:</p>
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

export default PrivacyPolicy;
