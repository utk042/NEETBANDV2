import React from 'react';

export default function PrivacyPolicy() {
  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant/60">
            Effective from July 1, 2026
          </p>
        </header>

        <div className="flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. Information We Collect</h2>
            <p className="mb-4">
              When you sign up and use NeetBand, we collect information you provide directly — your name, email, phone number (optional), payment details, and profile preferences like class and subjects.
            </p>
            <p>
              We also collect usage data automatically: listening history, quiz scores, course progress, device and browser info, IP address, and how you navigate the platform.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. How We Use It</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Running the platform and keeping it working</li>
              <li>Personalizing recommendations and study plans</li>
              <li>Processing payments and sending receipts</li>
              <li>Sending newsletters and study tips (only with your consent)</li>
              <li>Analyzing trends to improve content and UX</li>
              <li>Preventing fraud and enforcing our terms</li>
            </ul>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. Sharing</h2>
            <p className="mb-3">
              We don't sell your data. We share information only when necessary:
            </p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Payment processors (e.g. Razorpay) to complete transactions</li>
              <li>Analytics tools using aggregated, anonymized data</li>
              <li>Legal authorities when required by law or court order</li>
              <li>In the event of a merger, acquisition, or asset sale</li>
            </ul>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Cookies</h2>
            <p>
              We use essential cookies (login sessions, preferences), analytics cookies (understanding usage patterns), and preference cookies (theme, playback settings). You can manage these through your browser. Disabling essential cookies may break things.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Security</h2>
            <p>
              We use SSL/TLS encryption, encrypted storage for passwords and payment data, regular security audits, and restricted internal access. That said, no system is 100% secure — we can't make absolute guarantees.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Your Rights</h2>
            <p className="mb-3">You can:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Request a copy of your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data (subject to legal obligations)</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing emails at any time</li>
            </ul>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. Data Retention</h2>
            <p>
              We keep your data as long as your account is active. After deletion, anonymized analytics data may be retained for up to 3 years. Payment records are kept as required by Indian tax regulations.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">8. Children's Privacy</h2>
            <p>
              NeetBand is designed for exam-prep students. For users under 18, we recommend parental supervision. We don't knowingly collect data from children under 13 without parental consent — if we discover we have, we'll delete it.
            </p>
          </div>

          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">Questions?</h2>
            <p>
              Contact us at{' '}
              <a href="mailto:support@neetband.com" className="text-primary hover:underline">support@neetband.com</a>
              {' '}or call{' '}
              <a href="tel:+918047193393" className="text-primary hover:underline">+91 80 4719 3393</a>.
              We respond to privacy inquiries within 30 business days.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
