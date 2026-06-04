import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-8 font-sans">
      <div className="border-b border-[#121212]/10 pb-8">
        <h1 className="text-4xl font-serif font-bold text-[#121212]">Terms & Conditions</h1>
        <p className="text-zinc-500 mt-2 italic font-mono text-xs uppercase tracking-widest">Last Updated: June 2026</p>
      </div>

      <div className="space-y-8 text-zinc-700 leading-relaxed text-sm md:text-base">
        <p>
          These Terms of Service govern your use of DealHub Kenya ("DealHub", "we", "our", or "us"). By using DealHub, you agree to these terms.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">1. Our Services</h2>
          <p>DealHub is a commerce discovery and ordering platform that:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Displays products from various sources</li>
            <li>Facilitates WhatsApp-assisted ordering</li>
            <li>Processes customer payments</li>
            <li>Connects customers with marketplace and affiliate products</li>
            <li>Provides product recommendations and shopping assistance</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">2. Eligibility</h2>
          <p>
            You must be at least 18 years old or have permission from a parent or legal guardian to use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">3. Product Information</h2>
          <p>
            We strive to ensure product descriptions, prices, and availability are accurate. However, errors may occasionally occur. We reserve the right to correct errors and cancel orders resulting from inaccurate information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">4. Orders</h2>
          <p>Submitting an order request does not guarantee acceptance. DealHub may decline, cancel, or refund orders due to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Product unavailability</li>
            <li>Pricing errors</li>
            <li>Fraud concerns</li>
            <li>Delivery limitations</li>
            <li>Supplier issues</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">5. Payments</h2>
          <p>
            Customers are responsible for providing accurate payment information. Orders may not be processed until payment is successfully confirmed.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">6. Deliveries</h2>
          <p>Delivery times are estimates only and may vary due to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Supplier delays</li>
            <li>Logistics issues</li>
            <li>Weather conditions</li>
            <li>Events outside our control</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">7. Third-Party Products</h2>
          <p>
            Some products may be fulfilled or sold by third-party merchants, marketplaces, or affiliate partners. DealHub is not responsible for the operations, policies, or actions of third-party providers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">8. Returns and Refunds</h2>
          <p>Return and refund eligibility depends on:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Product category</li>
            <li>Supplier policies</li>
            <li>Product condition</li>
            <li>Applicable laws</li>
          </ul>
          <p>Approved refunds will be processed using available payment methods. </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">9. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the platform unlawfully</li>
            <li>Provide false information</li>
            <li>Interfere with platform operations</li>
            <li>Attempt unauthorized access</li>
            <li>Engage in fraudulent transactions</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">10. Intellectual Property</h2>
          <p>
            All DealHub branding, content, logos, designs, and software remain the property of DealHub or its licensors. You may not copy, reproduce, or distribute our content without permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">11. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, DealHub shall not be liable for indirect, incidental, special, or consequential damages arising from use of the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">12. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the platform constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#121212]">13. Contact</h2>
          <p>For support and legal inquiries:</p>
          <div className="space-y-1">
            <p><a href="mailto:hello@dealykenya.shop" className="text-[#D9411E] font-bold underline">hello@dealykenya.shop</a></p>
            <p><a href="mailto:support@dealykenya.shop" className="text-[#D9411E] font-bold underline">support@dealykenya.shop</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
