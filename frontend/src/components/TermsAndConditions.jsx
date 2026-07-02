import React from 'react';

export default function TermsAndConditions() {
  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant/60">
            Effective from July 1, 2026
          </p>
        </header>

        <div className="prose-legal flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NeetBand, you agree to these Terms and Conditions. If you disagree with any part, you may not use the platform. We may update these terms from time to time — continued use after changes means you accept them.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Account Registration</h2>
            <p>
              You need an account to access most features. Keep your login credentials private — you're responsible for everything that happens under your account. We can suspend or terminate accounts that violate these terms.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. Intellectual Property</h2>
            <p>
              All content on NeetBand — study songs, lyrics, compositions, quizzes, course materials, graphics, logos, and software — belongs to NeetBand or its licensors. It's protected under Indian and international IP laws. You may not copy, redistribute, modify, or commercially use any of it without written permission.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Subscriptions & Payments</h2>
            <p>
              NeetBand offers both free and premium tiers. Premium subscriptions are billed in advance (monthly or annually). Payments are processed via secure third-party gateways. All prices are in INR and include applicable taxes unless noted otherwise. We reserve the right to adjust pricing with prior notice.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Cancellation</h2>
            <p>
              Cancel your premium subscription anytime from your account settings. You'll retain access until the end of your current billing cycle. No refunds are issued for partial periods. Promotional or discounted subscriptions may carry different terms.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Prohibited Conduct</h2>
            <p className="mb-3">You may not:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Share, redistribute, or resell NeetBand content</li>
              <li>Use bots, scrapers, or automated tools to access the platform</li>
              <li>Reverse-engineer or tamper with the platform's software</li>
              <li>Post harmful, offensive, or illegal content on forums</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Use the platform for any unlawful purpose</li>
            </ul>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. Limitation of Liability</h2>
            <p>
              NeetBand is an educational supplement — we don't guarantee specific exam scores or admission outcomes. The platform is provided "as is." To the extent permitted by law, NeetBand shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the platform.
            </p>
          </div>

          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Noida, Uttar Pradesh.
            </p>
          </div>

          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">Questions?</h2>
            <p>
              Reach us at{' '}
              <a href="mailto:support@neetband.com" className="text-primary hover:underline">support@neetband.com</a>
              {' '}or call{' '}
              <a href="tel:+918047193393" className="text-primary hover:underline">+91 80 4719 3393</a>.
              We're available Monday–Saturday, 9 AM – 6 PM IST.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
