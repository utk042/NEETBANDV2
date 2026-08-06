import React from 'react';

export default function RefundPolicy() {
  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant/60">
            Effective from July 1, 2026
          </p>
        </header>

        <div className="flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. Refund Eligibility</h2>
            <p className="mb-4">
              At NEET BAND, we strive to ensure our users are fully satisfied with our audio learning platform. However, given the digital nature of our study songs and immediate content access upon subscription, specific refund rules apply.
            </p>
            <p>
              Subscription fees already paid are generally non-refundable once access to premium content has been activated. Refunds are only processed if a technical issue prevents account access or activation and our team is unable to resolve it upon verification.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Non-Refundable Scenarios</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Subscriptions that have been activated and accessed</li>
              <li>Partial unused periods of an active billing cycle</li>
              <li>Failure to cancel automatic renewal before the renewal date</li>
              <li>Accounts suspended or banned for violating our Terms & Conditions</li>
            </ul>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. Cancellation Policy</h2>
            <p className="mb-3">
              You may cancel your subscription at any time through your account dashboard or by emailing Contact@neetband.com. Cancellation stops future recurring charges. You will retain access to premium features until the end of your active billing period.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Requesting Technical Refund Resolution</h2>
            <p>
              If a payment is deducted but access is not activated due to a technical error, contact our support team at <a href="mailto:Contact@neetband.com" className="text-blue-500 hover:underline">Contact@neetband.com</a> with your Transaction ID, registered email, and payment date for manual activation or refund processing.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Processing Time</h2>
            <p>
              If a refund is approved, it will be credited back to your original payment method within 5 to 10 business days through our secure payment gateway providers.
            </p>
          </div>

          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">Questions?</h2>
            <p>
              Contact us at{' '}
              <a href="mailto:Contact@neetband.com" className="text-blue-500 hover:underline">Contact@neetband.com</a>
              {' '}or call{' '}
              <a href="tel:+919143240488" className="text-blue-500 hover:underline">+91 9143240488</a>.
              <br />Address: NEET BAND, Dr Biresh Guha Street, Kolkata-700017.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
