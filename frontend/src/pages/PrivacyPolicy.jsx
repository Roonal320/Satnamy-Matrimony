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
  const updated = 'June 1, 2026';
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
            This website is operated by <strong>Roonal Khandelwal</strong>. By using Satnami Matrimony / Satnami Shaadi (satnamishaadiii.com), you consent to the collection, processing, and security practices described in this Privacy Policy.
          </p>

          <Section title="1. Information We Collect">
            <p>To provide high-quality matrimonial matchmaking within the Satnami community, we collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Registration Information:</strong> Your full name, gender, date of birth, and email address.</li>
              <li><strong>Matrimonial Profile Details:</strong> Mobile number, height, weight, marital status, caste/sub-caste, mother tongue, education, occupation, income, family type, and details of parents/siblings.</li>
              <li><strong>Photos & Media:</strong> Profile photos uploaded by you. These are stored securely to prevent unauthorized downloads.</li>
              <li><strong>Verification Data:</strong> Voluntary uploads of government-issued identification documents or selfies for account verification badge status.</li>
              <li><strong>Communication Records:</strong> Chats, messages, and interaction logs exchanged with other members on our platform.</li>
              <li><strong>Payment Records:</strong> Secure transaction references and payment status from the Dodo Payments gateway. We do not collect or store card numbers or banking PINs.</li>
              <li><strong>Usage & System Logs:</strong> Device type, IP addresses, browser info, pages viewed, and access timestamps.</li>
            </ul>
          </Section>

          <Section title="2. Purpose & Use of Data">
            <p>We use your information solely to deliver secure matchmaking services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To build and display your matrimonial profile to eligible registered members.</li>
              <li>To suggest highly compatible matches matching your partner preferences.</li>
              <li>To verify user identity and maintain a safe, spam-free matrimonial environment.</li>
              <li>To facilitate secure messages and notifications between matched members.</li>
              <li>To process premium membership payments securely via Dodo Payments and manage subscriptions.</li>
              <li>To send service confirmations, verification codes, match alerts, and support responses.</li>
            </ul>
          </Section>

          <Section title="3. Information Sharing & Disclosure">
            <p>Your privacy is our priority. We do <strong>not</strong> sell, rent, or trade your personal data. Sharing only occurs under these conditions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>With Other Members:</strong> Registered users can view your profile data (excluding contact details for free tier accounts) to assess compatibility. You can adjust visibility settings in your dashboard.</li>
              <li><strong>With Essential Service Providers:</strong> Minimal necessary data is shared with cloud infrastructure (AWS S3 for secure photos), database (MongoDB Atlas), and payment processor (Dodo Payments) exclusively to run the service.</li>
              <li><strong>Legal Compliance:</strong> When required by Indian law, court orders, or law enforcement authorities.</li>
            </ul>
          </Section>

          <Section title="4. Data Security Protocols">
            <p>We apply robust technical security controls to protect your data from unauthorized access or alteration:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All web traffic is encrypted end-to-end via secure HTTPS (TLS/SSL protocols).</li>
              <li>Passwords are hashed using advanced bcrypt algorithms and are never stored in plain text.</li>
              <li>Profile photos are stored on Amazon Web Services (AWS S3) in the ap-south-1 (Mumbai, India) region with restricted, secure URLs.</li>
              <li>Access to user backend databases is strictly restricted to authorized developers and support staff.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention & Deletion">
            <p>
              We retain your information as long as your account remains active. If you request account deletion, all your personal information, profile photo, messages, and views will be permanently purged from our active databases within <strong>30 days</strong>. Backups may retain encrypted logs for compliance purposes for up to 90 days before final overwrite.
            </p>
          </Section>

          <Section title="6. Your Rights & Privacy Controls">
            <p>You have full control over your personal data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Edit/Update:</strong> Modify any profile field at any time from your Edit Profile dashboard.</li>
              <li><strong>Account Deletion:</strong> Permanently delete your profile by writing to support.</li>
              <li><strong>Communications:</strong> Opt-out of non-transactional match alerts and emails.</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:satnamishaadiii@gmail.com" className="underline" style={{ color: 'var(--primary)' }}>satnamishaadiii@gmail.com</a>.</p>
          </Section>

          <Section title="7. Cookies & Session Storage">
            <p>We use authentication cookies and localStorage keys to keep you securely signed in to your account. We do not run third-party advertising trackers or behavioral targeting pixels.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>Our platform is strictly restricted to individuals of legal marriageable age (18 years and above). We do not knowingly collect, verify, or retain information of minors.</p>
          </Section>

          <Section title="9. Updates to this Policy">
            <p>We may modify this Privacy Policy periodically as features expand. Any significant policy changes will be highlighted via site notices or emailed to you directly. Continued use of our site indicates agreement to updated policy versions.</p>
          </Section>

          <Section title="10. Grievance Officer & Contact Info">
            <p>If you have questions about our data practices or seek redressal for privacy concerns, please contact our Grievance Officer:</p>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <p><strong>Grievance Officer: Roonal Khandelwal</strong></p>
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
