import React from 'react';

export default function TermsAndConditions() {
  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
            Welcome to NEET BAND. These Terms of Service govern your access to and use of our website, services, audio content, study songs, lyrics, subscription features, free ad-supported access, and related services available through{' '}
            <a href="https://neetband.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://neetband.com/
            </a>.
          </p>
          <p className="font-body-md text-sm text-on-surface-variant/70 mt-2 font-medium">
            By using NEET BAND, creating an account, listening to our content, purchasing a subscription, or accessing any part of the website, you agree to these Terms. If you do not agree, please do not use the website or services.
          </p>
        </header>

        <div className="prose-legal flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          {/* Section 1 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. About NEET BAND</h2>
            <p className="mb-3">
              NEET BAND is an educational audio-learning platform that converts study topics and important academic concepts into simple, memorable study songs. Our aim is to help students revise, memorise, and recall concepts more effectively through rhythm, repetition, lyrics, and audio-based learning.
            </p>
            <p>
              NEET BAND is a supplementary learning tool. It does not replace textbooks, school teaching, coaching, self-study, problem-solving practice, or professional academic guidance.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Eligibility</h2>
            <p>
              You may use NEET BAND if you are legally capable of entering into a binding agreement. If you are below 18 years of age, you may use the website only with the consent and supervision of a parent or legal guardian. Parents and guardians are responsible for monitoring the use of NEET BAND by minors.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. Account Registration</h2>
            <p className="mb-3">
              To access certain features, you may need to create an account. You agree to provide accurate, complete, and updated information during registration.
            </p>
            <p className="mb-3">
              You are responsible for maintaining the confidentiality of your login details and for all activities that occur under your account. If you suspect unauthorised access to your account, you should contact us immediately.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that contain false information, misuse the service, violate these Terms, or attempt to bypass payment, access, or security controls.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Free Access, Advertisements, and Paid Subscriptions</h2>
            <p className="mb-3">
              NEET BAND may offer free access to study songs with advertisements. We may also offer paid subscription plans that provide ad-free listening and/or additional benefits.
            </p>
            <p className="mb-3">
              The availability, features, pricing, and benefits of free and paid plans may change from time to time.
            </p>
            <p>
              Paid plans may include monthly, yearly, or other subscription options. By purchasing a subscription, you agree to pay the applicable fees displayed at checkout.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Payments</h2>
            <p className="mb-3">
              Payments on NEET BAND may be processed through third-party payment gateways. By making a payment, you agree to the terms and policies of the relevant payment provider.
            </p>
            <p className="mb-3">
              We do not store your complete card, UPI, net banking, or payment credentials on our servers unless specifically stated by the payment provider.
            </p>
            <p>
              You are responsible for ensuring that your payment details are accurate and that you are authorised to use the selected payment method.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Subscription Renewal and Cancellation</h2>
            <p className="mb-3">
              If a subscription is recurring, it may renew automatically unless cancelled before the renewal date. The renewal terms, billing cycle, and cancellation options will be shown during purchase or inside your account area.
            </p>
            <p className="mb-3">
              You may cancel your subscription through your account dashboard or by contacting us.
            </p>
            <p>
              Cancellation stops future billing but does not automatically guarantee a refund for the current billing period unless our refund policy specifically allows it.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. Refund Policy</h2>
            <p className="mb-3">
              Refunds, if applicable, will be governed by our Refund Policy or the refund terms displayed at the time of purchase.
            </p>
            <p className="mb-3">
              Unless clearly stated otherwise, subscription fees already paid may be non-refundable after access to premium content has been activated.
            </p>
            <p>
              If a payment is deducted but access is not activated due to a technical issue, please contact us with the payment details so we can verify and resolve the issue.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">8. Educational Disclaimer</h2>
            <p className="mb-3">NEET BAND is designed to support revision and memorisation. We do not guarantee:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>improvement in exam marks</li>
              <li>success in NEET, JEE, school exams, board exams, or any competitive examination</li>
              <li>complete coverage of every textbook, syllabus, or chapter</li>
              <li>that listening alone is sufficient for academic success</li>
            </ul>
            <p className="mt-3">
              Students should use NEET BAND along with proper reading, classroom learning, practice questions, mock tests, revision, and guidance from teachers or mentors.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">9. Accuracy of Content</h2>
            <p className="mb-3">
              We aim to make our educational content accurate, useful, and student-friendly. However, academic content may occasionally contain omissions, simplifications, interpretation differences, or errors.
            </p>
            <p className="mb-3">
              You should verify important concepts from your official textbooks, teachers, school material, coaching notes, or other reliable academic sources.
            </p>
            <p>
              If you find any error in our content, you may contact us so we can review and correct it.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">10. Intellectual Property</h2>
            <p className="mb-3">
              All content available on NEET BAND, including songs, audio files, lyrics, text, graphics, logos, designs, website layout, educational material, branding, and other materials, is owned by NEET BAND or licensed to us.
            </p>
            <p className="mb-3">
              You may use the content only for personal, non-commercial educational purposes.
            </p>
            <p>
              You may not copy, download, record, distribute, sell, upload, modify, reproduce, republish, publicly perform, share, or commercially exploit NEET BAND content without our written permission.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">11. Restrictions on Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>share your account login with others</li>
              <li>resell or redistribute NEET BAND content</li>
              <li>record, rip, download, or extract audio from the website without permission</li>
              <li>bypass advertisements, payment restrictions, subscription controls, or access limitations</li>
              <li>use bots, scrapers, crawlers, automated tools, or reverse engineering methods</li>
              <li>upload malicious code, viruses, or harmful files</li>
              <li>interfere with the security or normal operation of the website</li>
              <li>use NEET BAND for any unlawful, abusive, misleading, or harmful purpose</li>
            </ul>
            <p className="mt-3">Violation of these restrictions may result in suspension or termination of your account without refund.</p>
          </div>

          {/* Section 12 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">12. User Content and Feedback</h2>
            <p className="mb-3">
              If you submit feedback, suggestions, corrections, testimonials, comments, reviews, or other content to NEET BAND, you grant us permission to use, edit, display, and improve the service based on that feedback.
            </p>
            <p>
              You are responsible for ensuring that any content you submit does not violate the rights of others and does not contain unlawful, abusive, defamatory, offensive, or misleading material.
            </p>
          </div>

          {/* Section 13 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">13. Advertisements and Sponsored Content</h2>
            <p className="mb-3">
              Free access to NEET BAND may include audio ads, display ads, sponsor messages, or promotional content. We may work with advertisers, sponsors, schools, educational institutions, coaching centres, or other relevant brands.
            </p>
            <p>
              Advertisements do not mean that NEET BAND guarantees or endorses every claim made by third-party advertisers. Users should independently evaluate any product, service, or offer promoted through advertisements.
            </p>
          </div>

          {/* Section 14 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">14. Third-Party Services</h2>
            <p className="mb-3">
              NEET BAND may use third-party services such as hosting providers, payment gateways, analytics tools, email services, advertising partners, streaming tools, or login providers.
            </p>
            <p>
              We are not responsible for the actions, policies, downtime, errors, or security practices of third-party services. Your use of third-party services may be governed by their separate terms and privacy policies.
            </p>
          </div>

          {/* Section 15 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">15. Google Login and Social Login</h2>
            <p className="mb-3">
              If you use Google Login or any other social login feature, you allow us to receive basic account information required for login, such as your name, email address, and profile information, depending on the permissions granted.
            </p>
            <p>You are responsible for maintaining access to the email or social account used for login.</p>
          </div>

          {/* Section 16 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">16. Privacy</h2>
            <p>
              Your use of NEET BAND is also governed by our Privacy Policy. The Privacy Policy explains how we collect, use, store, and protect personal information. Please review our Privacy Policy at: Privacy Policy.
            </p>
          </div>

          {/* Section 17 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">17. Service Availability</h2>
            <p className="mb-3">
              We aim to keep NEET BAND available and functioning properly. However, we do not guarantee uninterrupted access.
            </p>
            <p>
              The website may be unavailable due to maintenance, technical issues, hosting problems, internet failures, cyberattacks, payment gateway issues, updates, or circumstances beyond our control. We may modify, suspend, or discontinue any part of the service at any time.
            </p>
          </div>

          {/* Section 18 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">18. Changes to Content and Features</h2>
            <p className="mb-3">
              We may add, remove, update, reorganise, or modify songs, lyrics, chapters, subjects, plans, advertisements, pricing, and features at any time.
            </p>
            <p>Purchasing a subscription does not guarantee that every song, chapter, subject, or feature will remain permanently available.</p>
          </div>

          {/* Section 19 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">19. Limitation of Liability</h2>
            <p className="mb-3">
              To the maximum extent permitted by law, NEET BAND, its owners, team members, partners, service providers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
            <p className="mb-3">
              This includes loss of marks, exam failure, loss of data, loss of access, payment issues, business loss, emotional distress, or reliance on educational content.
            </p>
            <p>Our total liability, if any, shall not exceed the amount paid by you to NEET BAND during the previous three months before the claim arose.</p>
          </div>

          {/* Section 20 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">20. No Professional Advice</h2>
            <p className="mb-3">
              NEET BAND provides educational content for general learning and revision. It does not provide personalised academic counselling, medical advice, psychological advice, legal advice, financial advice, or professional examination strategy.
            </p>
            <p>Any decisions related to study planning, exam preparation, coaching, school performance, or academic choices should be made with appropriate guidance from parents, teachers, mentors, or qualified professionals.</p>
          </div>

          {/* Section 21 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">21. Termination</h2>
            <p className="mb-3">
              We may suspend or terminate your account if you violate these Terms, misuse the service, attempt unauthorised access, share paid content illegally, abuse the platform, or engage in any activity that harms NEET BAND or other users.
            </p>
            <p>Upon termination, your right to access paid or free services may stop immediately.</p>
          </div>

          {/* Section 22 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">22. Indemnity</h2>
            <p>
              You agree to indemnify and hold NEET BAND harmless from any claims, losses, damages, liabilities, costs, or expenses arising from your use of the website, violation of these Terms, misuse of content, or infringement of any rights of another person or entity.
            </p>
          </div>

          {/* Section 23 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">23. Governing Law and Jurisdiction</h2>
            <p className="mb-3">These Terms shall be governed by the laws of India.</p>
            <p>
              Subject to applicable law, any disputes arising from or relating to these Terms or your use of NEET BAND shall be subject to the jurisdiction of the courts located in <strong className="text-on-surface">Kolkata, West Bengal, India</strong>.
            </p>
          </div>

          {/* Section 24 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">24. Changes to These Terms</h2>
            <p className="mb-3">
              We may update these Terms from time to time. The updated version will be posted on this page with a revised “Last updated” date.
            </p>
            <p>By continuing to use NEET BAND after changes are posted, you agree to the updated Terms.</p>
          </div>

          {/* Section 25 */}
          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">25. Contact Us</h2>
            <p className="mb-2">For questions, support, complaints, corrections, or legal notices, you may contact us at:</p>
            <p>
              <strong className="text-on-surface">NEET BAND</strong>
              <br />Address: Dr Biresh Guha Street, Kolkata-700017
              <br />Phone: +91 9143240488
              <br />Email: <a href="mailto:Contact@neetband.com" className="text-primary hover:underline">Contact@neetband.com</a>
              <br />Website: <a href="https://neetband.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://neetband.com/</a>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
