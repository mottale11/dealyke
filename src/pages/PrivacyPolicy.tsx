import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-8 font-sans">
      <div className="border-b border-[#121212]/10 pb-8">
        <h1 className="text-4xl font-serif font-bold text-[#121212]">Privacy Policy</h1>
        <p className="text-zinc-500 mt-2 italic font-mono text-xs uppercase tracking-widest">Last Updated: June 2026</p>
      </div>

      <div className="space-y-8 text-zinc-700 leading-relaxed text-sm md:text-base">
        <p>
          Welcome to DealHub Kenya ("DealHub", "we", "our", or "us"). This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, WhatsApp ordering services, and related platforms.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">1. Information We Collect</h2>
          <p>We may collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name</li>
            <li>Phone number</li>
            <li>WhatsApp number</li>
            <li>Email address</li>
            <li>Delivery address</li>
            <li>Order details</li>
            <li>Payment transaction references</li>
            <li>Device and browser information</li>
            <li>Website usage analytics</li>
          </ul>
          <p className="font-bold text-[#D9411E]">We do not store your M-Pesa PIN, card details, or banking passwords.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process orders</li>
            <li>Arrange deliveries</li>
            <li>Send order updates</li>
            <li>Verify payments</li>
            <li>Provide customer support</li>
            <li>Improve our services</li>
            <li>Detect fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">3. WhatsApp Communications</h2>
          <p>
            By placing an order through DealHub, you consent to receiving order updates, support messages, and service notifications through WhatsApp.
          </p>
          <p>You may stop promotional communications at any time.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">4. Payments</h2>
          <p>
            Payments may be processed through M-Pesa and other payment providers. Payment providers may collect and process information according to their own privacy policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">5. Affiliate and Partner Products</h2>
          <p>
            Some products displayed on DealHub may be fulfilled by third-party merchants, affiliate networks, or marketplace partners.
          </p>
          <p>
            When you purchase through an external partner, your information may be subject to that partner's policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">6. Data Security</h2>
          <p>
            We implement reasonable technical and organizational measures to protect your information from unauthorized access, misuse, or disclosure.
          </p>
          <p className="italic">However, no online service can guarantee absolute security.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">7. Cookies and Analytics</h2>
          <p>
            We may use cookies and analytics tools to understand website usage, improve performance, and personalize content.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">8. Data Retention</h2>
          <p>
            We retain information only as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">9. Your Rights</h2>
          <p>You may request:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access to your information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of personal information where permitted by law</li>
          </ul>
          <p>Requests may be submitted through our support channels.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Updates become effective when published on our website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">11. Contact</h2>
          <p>
            For privacy-related questions, contact: <a href="mailto:support@dealykenya.shop" className="text-[#D9411E] font-bold underline">support@dealykenya.shop</a>
          </p>
        </section>
      </div>
    </div>
  );
}
