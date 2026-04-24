import { useNavigate } from 'react-router-dom';
import { T, FONT_IMPORT } from '../theme';
import KCTMark from '../components/KCTMark';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly to us when you create an account, log workouts, track nutrition, or contact us for support. This includes:

• Account information: name, email address, and password (stored as a secure hash).
• Fitness data: workout logs, duration, calories burned, body weight entries, and goal settings you enter manually.
• Nutrition data: food items, macronutrient totals, and water intake you log within the app.
• Device and usage data: device type, operating system version, app version, and usage patterns to improve app performance.
• Health platform data (optional): if you connect Apple Health or Google Health Connect, we may read step counts, heart rate, and workout data with your explicit permission. This data is processed on-device and is never sold.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use the information we collect to:

• Provide, maintain, and improve the King's Combat Training app and its features.
• Personalize your training experience, including workout recommendations.
• Track your progress over time and display statistics within the app.
• Send you important service-related communications (e.g., password resets).
• Respond to your support requests and feedback.
• Analyze aggregate, anonymized usage trends to improve the app.

We do not use your personal data for advertising purposes, and we do not sell your data to third parties.`,
  },
  {
    title: '3. Data Storage and Security',
    body: `Your account data is stored on secure servers hosted by Railway (railway.app). We use industry-standard encryption (HTTPS/TLS) for all data transmitted between your device and our servers.

Sensitive data such as nutrition logs and body weight entries are also stored locally on your device using your browser's localStorage, which allows the app to function offline.

Your Anthropic API key (if used for AI Workout Builder) is stored only on your device and is never transmitted to our servers.

While we take reasonable steps to protect your information, no security system is impenetrable and we cannot guarantee absolute security.`,
  },
  {
    title: '4. Health and Fitness Data',
    body: `King's Combat Training may request access to health data through Apple HealthKit (iOS) or Google Health Connect (Android) if you choose to connect these platforms.

• We only request the minimum permissions necessary to display your health stats within the app.
• Health platform data is read-only — we do not write data back to Apple Health or Google Health Connect unless you explicitly initiate a workout sync.
• This data is displayed in the app for your personal benefit and is not shared with third parties.
• You can revoke health platform permissions at any time through your device's Privacy or Health app settings.

In compliance with Apple's guidelines, data obtained from HealthKit will not be used for advertising, will not be shared with third parties, and will not be sold.`,
  },
  {
    title: '5. Data Sharing',
    body: `We do not sell, trade, or rent your personal information to third parties.

We may share your information in the following limited circumstances:

• Service providers: We use trusted third-party services (e.g., Railway for hosting, Anthropic for AI features) solely to operate the app. These providers are bound by confidentiality agreements.
• Legal requirements: We may disclose your information if required by law, subpoena, or other legal process, or if we believe in good faith that disclosure is necessary to protect our rights or the safety of others.
• Business transfer: If King's Combat Training is acquired or merged, your information may be transferred to the acquiring entity, subject to the same privacy protections.`,
  },
  {
    title: '6. Your Rights and Choices',
    body: `You have the following rights regarding your personal data:

• Access: You may request a copy of the personal data we hold about you.
• Correction: You may update or correct inaccurate information through the app settings.
• Deletion: You may request deletion of your account and associated data by contacting us at the email below. We will delete your data within 30 days.
• Data portability: You may request an export of your workout and progress data in a machine-readable format.
• Opt-out: You may opt out of non-essential communications at any time.

To exercise any of these rights, contact us at: bso26king@gmail.com`,
  },
  {
    title: '7. Children\'s Privacy',
    body: `King's Combat Training is not directed to children under the age of 13 (or 16 in the European Union). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information promptly.

If you believe your child has provided personal information to us, please contact us immediately.`,
  },
  {
    title: '8. Third-Party Links and Services',
    body: `The app may contain links to third-party websites or services (e.g., Garmin Connect, Fitbit, Strava). This Privacy Policy does not apply to those services. We encourage you to review the privacy policies of any third-party services you connect to.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy within the app and updating the "Last updated" date below. Your continued use of the app after changes are posted constitutes your acceptance of the revised policy.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

King's Combat Training
Email: bso26king@gmail.com

We aim to respond to all privacy-related inquiries within 5 business days.`,
  },
];

export default function PrivacyPolicy() {
  const nav = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: T.black, color: T.white, fontFamily: "'Barlow Condensed', Barlow, sans-serif", maxWidth: 480, margin: '0 auto' }}>
      <style>{`${FONT_IMPORT}*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* Header */}
      <div style={{ background: T.panel, borderBottom: `1px solid ${T.line}`, padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: T.whiteDim, fontFamily: 'inherit', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 0 }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase' }}>Privacy Policy</div>
          <div style={{ fontSize: 9, color: T.whiteDim, letterSpacing: 2, marginTop: 2 }}>KING'S COMBAT TRAINING</div>
        </div>
        <KCTMark size={36} />
      </div>

      <div style={{ padding: '18px 18px 80px' }}>
        {/* Effective date */}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 2, padding: '10px 14px', marginBottom: 20, fontSize: 10, color: T.whiteDim, letterSpacing: 0.5 }}>
          <span style={{ color: T.white, fontWeight: 700 }}>Last updated:</span> April 18, 2026 &nbsp;·&nbsp; Effective date: April 18, 2026
        </div>

        {/* Intro */}
        <div style={{ fontSize: 12, color: T.whiteDim, lineHeight: 1.7, marginBottom: 20 }}>
          King's Combat Training ("KCT", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share information when you use the King's Combat Training mobile and web application.
        </div>

        {/* Sections */}
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 0.5, color: T.red, marginBottom: 8, textTransform: 'uppercase' }}>{s.title}</div>
            <div style={{ fontSize: 11, color: T.whiteDim, lineHeight: 1.8, whiteSpace: 'pre-line', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 2, padding: '14px 16px' }}>
              {s.body}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 10, padding: '14px 0', borderTop: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 9, color: T.whiteDim, letterSpacing: 2 }}>KING'S COMBAT TRAINING · PRIVACY POLICY · v1.0</div>
        </div>
      </div>
    </div>
  );
}
