import React from 'react';

export default function PrivacyPolicy() {
  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
            NEET BAND respects your privacy. This Privacy Policy explains how we collect, use, store, protect, and share your information when you use our website, services, study songs, memberships, login features, payment features, advertisements, and related services.
          </p>
          <p className="font-body-md text-sm text-on-surface-variant/70 mt-2 font-medium">
            By using NEET BAND, you agree to the practices described in this Privacy Policy.
          </p>
        </header>

        <div className="flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          {/* Section 1 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. About NEET BAND</h2>
            <p className="mb-3">
              NEET BAND is an educational audio-learning platform that converts study topics into simple study songs to help students revise on the go.
            </p>
            <p className="mb-2 font-medium text-on-surface">For any privacy-related question, you may contact us at:</p>
            <div className="bg-surface-container/60 p-4 rounded-xl text-sm space-y-1 border border-[var(--border-floating-card)]">
              <p><strong className="text-on-surface">NEET BAND</strong></p>
              <p>Address: Dr Biresh Guha Street, Kolkata-700017</p>
              <p>Phone: +91 9143240488</p>
              <p>Email: <a href="mailto:Contact@neetband.com" className="text-blue-500 hover:underline">Contact@neetband.com</a></p>
              <p>Website: <a href="https://neetband.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://neetband.com/</a></p>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Information We Collect</h2>
            <p className="mb-4">We may collect the following types of information:</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-on-surface text-base mb-2">A. Account Information</h3>
                <p className="mb-2">When you create an account, register, subscribe, or log in, we may collect:</p>
                <ul className="flex flex-col gap-1.5 pl-5 list-disc marker:text-on-surface-variant/40">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Username</li>
                  <li>Password or login credentials</li>
                  <li>Phone number, if provided</li>
                  <li>Account status</li>
                  <li>Membership plan</li>
                  <li>Subscription details</li>
                  <li>Login history</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-on-surface text-base mb-2">B. Google Social Login Information</h3>
                <p className="mb-2">If you choose to sign in using Google, we may receive limited information from your Google account, such as: Name, Email address, Google account ID, Profile picture (if provided by Google).</p>
                <p>We use this information only to create your account, help you log in, identify your account, and provide access to NEET BAND services. We do not access your Gmail, Google Drive, Google Calendar, YouTube account, contacts, or other Google data unless you separately give explicit permission for such access.</p>
              </div>

              <div>
                <h3 className="font-bold text-on-surface text-base mb-2">C. Payment and Subscription Information</h3>
                <p className="mb-2">When you purchase a membership or paid service, payment may be processed through third-party payment providers. We may collect and store: Order details, Payment status, Subscription plan, Transaction ID, Invoice or billing record, Coupon code used (if any).</p>
                <p className="text-xs text-on-surface-variant/70 italic">We do not store your full debit card, credit card, UPI PIN, net banking password, or sensitive payment credentials. These are handled by the payment gateway or payment processor.</p>
              </div>

              <div>
                <h3 className="font-bold text-on-surface text-base mb-2">D. Usage Information</h3>
                <p className="mb-2">When you use our website, we may collect: Pages visited, Songs played, Preview activity, Login time, Device type, Browser type, IP address, Approximate location based on IP address, Referral source, Time spent on the website, Clicks and navigation activity. This helps us improve website performance, user experience, content quality, and security.</p>
              </div>

              <div>
                <h3 className="font-bold text-on-surface text-base mb-2">E. Cookies and Tracking Technologies</h3>
                <p className="mb-2">We may use cookies, pixels, analytics tools, and similar technologies to: Keep users logged in, Remember preferences, Improve website performance, Understand website traffic, Prevent fraud and abuse, Measure marketing performance, Show relevant advertisements or audio ads.</p>
                <p>You can control cookies through your browser settings. However, disabling cookies may affect login, membership access, payment flow, and website functionality.</p>
              </div>

              <div>
                <h3 className="font-bold text-on-surface text-base mb-2">F. Communication Information</h3>
                <p>If you contact us by email, form, phone, WhatsApp, or any other method, we may collect: Your name, Contact details, Message content, Support request details, Feedback or complaint details.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information for the following purposes:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>To create and manage your account</li>
              <li>To allow login through email or Google</li>
              <li>To provide access to free or paid study songs</li>
              <li>To manage memberships and subscriptions</li>
              <li>To process payments and invoices</li>
              <li>To provide customer support</li>
              <li>To improve NEET BAND content and website experience</li>
              <li>To personalize learning and revision experience</li>
              <li>To detect and prevent fraud, abuse, or unauthorized access</li>
              <li>To send important service updates</li>
              <li>To send promotional messages, only where permitted</li>
              <li>To comply with legal obligations</li>
              <li>To measure website and advertisement performance</li>
              <li>To provide ad-supported access where applicable</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Children and Student Users</h2>
            <p className="mb-3">
              NEET BAND is designed for students, including school-going students. Because some users may be minors, we take children’s privacy seriously.
            </p>
            <p className="mb-3">
              If a user is below 18 years of age, the account should be created, purchased, or managed with the consent and supervision of a parent or legal guardian.
            </p>
            <p className="mb-3">
              We do not knowingly collect personal data from children without appropriate parent or guardian consent. If a parent or guardian believes that a child has provided personal information without consent, they may contact us at Contact@neetband.com, and we will take appropriate steps to review, restrict, correct, or delete such information where required.
            </p>
            <p className="mb-3">We do not knowingly sell children’s personal data.</p>
            <p>We do not knowingly use children’s personal data for behavioural advertising. Advertisements, if shown, may be contextual, general, or based on non-personal aggregated usage information.</p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Google User Data</h2>
            <p className="mb-3">
              When you use Google Login, NEET BAND may access basic profile information from your Google account only for authentication and account creation. We use Google user data only for: Logging you into NEET BAND, Creating or linking your NEET BAND account, Identifying your account, Preventing duplicate accounts, Providing access to website features.
            </p>
            <p className="mb-3">We do not sell Google user data. We do not use Google user data for unrelated advertising. We do not transfer Google user data to third parties except where necessary to operate our service, comply with law, protect security, or with your explicit consent.</p>
            <p>You may revoke NEET BAND’s access to your Google account from your Google Account permissions page at any time.</p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Advertisements and Sponsored Content</h2>
            <p className="mb-3">
              NEET BAND may offer free access supported by advertisements, including audio ads, display ads, sponsor messages, or educational partner messages.
            </p>
            <p className="mb-3">Advertisers or sponsors may receive limited aggregated reports such as: Number of ad plays, Number of impressions, General campaign performance, Non-personal usage statistics.</p>
            <p>We do not provide advertisers with your personal account details such as your name, email, phone number, or individual learning activity unless you explicitly consent or submit your details directly to that advertiser.</p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. Sharing of Information</h2>
            <p className="mb-3">We may share limited information with trusted third parties who help us operate NEET BAND, including:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Website hosting providers</li>
              <li>Payment gateways</li>
              <li>Email service providers</li>
              <li>Analytics providers</li>
              <li>Security and fraud-prevention tools</li>
              <li>Customer support tools</li>
              <li>Advertising or sponsorship partners, in aggregated or limited form</li>
              <li>Legal or regulatory authorities, if required by law</li>
            </ul>
            <p className="mt-3">These third parties are expected to use the information only for the purpose of providing their services to us.</p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">8. Payment Providers</h2>
            <p>
              Payments are processed by third-party payment gateways or payment service providers. Their privacy policies and terms may apply when you make a payment. We recommend that you review the privacy policy of the relevant payment provider before completing a transaction.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">9. Data Retention</h2>
            <p>
              We retain personal information only as long as necessary for the purposes described in this Privacy Policy, including maintaining your account, providing membership access, keeping payment and invoice records, resolving disputes, preventing fraud, and complying with legal, tax, accounting, or regulatory requirements. When information is no longer required, we may delete, anonymize, or securely archive it.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">10. Data Security</h2>
            <p className="mb-3">
              We use reasonable technical and organizational measures to protect your information from unauthorized access, misuse, loss, alteration, or disclosure.
            </p>
            <p>
              However, no website, internet transmission, payment system, or storage system is 100% secure. You are responsible for keeping your login details confidential and for using a strong password. If you suspect unauthorized access to your account, contact us immediately at Contact@neetband.com.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">11. Your Rights</h2>
            <p className="mb-3">Subject to applicable law, you may request to:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Update your account details</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Request deletion of your account or personal data</li>
              <li>Opt out of promotional communication</li>
              <li>Raise a privacy-related complaint</li>
            </ul>
            <p className="mt-3">To make a privacy request, contact us at Email: Contact@neetband.com. We may ask for verification before processing your request.</p>
          </div>

          {/* Section 12 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">12. Promotional Emails and Messages</h2>
            <p className="mb-3">
              We may send service-related messages such as login alerts, payment confirmations, subscription updates, and important account notices.
            </p>
            <p>
              We may also send promotional messages about NEET BAND features, offers, study content, or educational updates. You may opt out of promotional emails by using the unsubscribe option or contacting us. Even after opting out of promotional messages, you may still receive important account, payment, security, or service-related messages.
            </p>
          </div>

          {/* Section 13 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">13. Cookies and Analytics</h2>
            <p>
              We may use analytics tools to understand how users interact with NEET BAND. This helps us improve content, website speed, user experience, and marketing. Analytics may collect information such as device type, browser, pages visited, session duration, and general location. You may disable cookies through your browser settings, but some features may not work properly.
            </p>
          </div>

          {/* Section 14 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">14. Third-Party Links</h2>
            <p>
              NEET BAND may contain links to third-party websites, payment pages, videos, tools, or services. We are not responsible for the privacy practices, content, or security of third-party websites. You should read their privacy policies before sharing any personal information.
            </p>
          </div>

          {/* Section 15 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">15. Data Transfer</h2>
            <p>
              Your information may be processed or stored in India or in other countries where our service providers operate. By using NEET BAND, you understand that your information may be transferred, stored, or processed outside your state, region, or country, subject to applicable law.
            </p>
          </div>

          {/* Section 16 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">16. Account Deletion</h2>
            <p>
              You may request deletion of your NEET BAND account by contacting us at Email: Contact@neetband.com. After receiving your request, we may delete or anonymize your personal information, unless we are required to retain certain information for legal, payment, tax, fraud-prevention, security, or dispute-resolution purposes.
            </p>
          </div>

          {/* Section 17 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">17. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we update it, we may revise the “Effective Date” at the top of this page. Continued use of NEET BAND after changes means you accept the updated Privacy Policy. For major changes, we may provide additional notice through the website, email, or account notification.
            </p>
          </div>

          {/* Section 18 / Questions Footer */}
          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">18. Contact Us</h2>
            <p className="mb-2">For privacy questions, account deletion requests, data correction requests, or complaints, contact us at:</p>
            <p>
              <strong className="text-on-surface">NEET BAND</strong>
              <br />Address: Dr Biresh Guha Street, Kolkata-700017
              <br />Phone: +91 9143240488
              <br />Email: <a href="mailto:Contact@neetband.com" className="text-blue-500 hover:underline">Contact@neetband.com</a>
              <br />Website: <a href="https://neetband.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://neetband.com/</a>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
