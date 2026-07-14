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
              At NeetBand, we strive to ensure our users are fully satisfied with our study materials and platform. However, given the digital nature of our content, we have specific conditions for refunds.
            </p>
            <p>
              Refunds are generally only processed if there is a technical issue preventing you from accessing the platform or content, and our support team is unable to resolve it within 7 business days of your report.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Non-Refundable Items</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Subscriptions that have been actively used (e.g., listening to tracks, taking quizzes)</li>
              <li>Partial months of a subscription period</li>
              <li>Accounts banned for violating our Terms & Conditions</li>
              <li>Change of mind after 48 hours of purchase</li>
            </ul>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. Cancellation Policy</h2>
            <p className="mb-3">
              You may cancel your subscription at any time. Cancellation means your subscription will not renew at the end of the current billing cycle. You will continue to have access to premium features until the cycle ends.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Requesting a Refund</h2>
            <p>
              To request a refund, you must contact our support team at <a href="mailto:support@neetband.com" className="text-primary hover:underline">support@neetband.com</a> within 48 hours of your purchase, explaining the reason for your request. Include your order ID and the email associated with your account.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Processing Time</h2>
            <p>
              If your refund is approved, it will be processed, and a credit will automatically be applied to your original method of payment within 5 to 10 business days. Processing times may vary depending on your bank or payment provider.
            </p>
          </div>

          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">Questions?</h2>
            <p>
              Contact us at{' '}
              <a href="mailto:support@neetband.com" className="text-primary hover:underline">support@neetband.com</a>
              {' '}or call{' '}
              <a href="tel:+918047193393" className="text-primary hover:underline">+91 80 4719 3393</a>.
              We respond to support inquiries within 30 business days.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
