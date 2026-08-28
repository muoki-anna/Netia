import React from 'react';

const TermsOfServicePage = () => (
  <div className="mx-auto max-w-[56rem] px-4 sm:px-6 py-16">
    <p className="text-sm font-medium text-accent uppercase tracking-wide mb-3">Legal</p>
    <h1 className="font-display text-4xl sm:text-5xl font-700 text-foreground mb-4">Terms of Service</h1>
    <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

    <div className="prose-legal space-y-8 text-foreground/90 leading-relaxed">
      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">1. Introduction</h2>
        <p>
          These Terms of Service ("Terms") govern your use of the NetiaX Limited website and the
          purchase of any products or services offered by NetiaX Limited ("NetiaX", "we", "us",
          "our"), a company registered in Kenya, located at 283-01001, Juja. By browsing our store
          or placing an order, you agree to be bound by these Terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">2. Products and Services</h2>
        <p>
          We sell vegetable and fruit seedlings, Netia Grow propagation media and growing
          substrates, and provide greenhouse and drip irrigation installation services. Product
          images, descriptions, and prices are provided in good faith for illustrative purposes.
          Seedlings and other living or agricultural materials are natural products, and slight
          variations in appearance, size, or growth performance from images shown are normal and
          do not constitute a defect.
        </p>
        <p className="mt-3">
          All prices are listed in Kenyan Shillings (KES) and are subject to change without prior
          notice. We reserve the right to limit quantities, refuse orders, or discontinue any
          product or service at our discretion.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">3. Orders and Payment</h2>
        <p>
          When you place an order through our store, you are making an offer to purchase the
          selected products or services at the listed price. Orders are processed through our
          secure checkout provider. Payment must be completed in full before an order is
          dispatched or an installation service is scheduled. We reserve the right to cancel or
          refuse any order in cases of suspected fraud, pricing errors, or stock unavailability.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">4. Shipping and Delivery</h2>
        <p>
          Delivery timelines and rates vary by region within Kenya, as detailed on our Shipping
          Rates page. Delivery estimates are approximate and NetiaX is not liable for delays
          caused by third-party couriers, weather conditions, or circumstances beyond our
          reasonable control. Installation services (greenhouse and drip irrigation) are scheduled
          directly with the customer after order confirmation.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">5. Customer Obligations</h2>
        <p>By using our website and purchasing our products, you agree to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Provide accurate, current, and complete information when placing an order;</li>
          <li>Use products and growing media in accordance with any provided care instructions;</li>
          <li>Provide safe and reasonable site access for installation service appointments;</li>
          <li>Make payment in full for any products or services ordered;</li>
          <li>Not misuse, resell without authorization, or misrepresent our products or services.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">6. Limitation of Liability</h2>
        <p>
          NetiaX provides products and services as described to the best of our knowledge and
          experience in agrotech solutions. To the fullest extent permitted by law, NetiaX shall
          not be liable for indirect, incidental, or consequential losses, including crop yield or
          harvest outcomes, arising from the use of seedlings, growing media, or installed
          irrigation and greenhouse systems, except where such loss results from our proven
          negligence.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">7. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time to reflect changes in our practices or for
          legal reasons. Continued use of our website after changes are posted constitutes your
          acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">8. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at{' '}
          <a href="mailto:netiaxke@gmail.com" className="text-primary underline underline-offset-2">netiaxke@gmail.com</a>{' '}
          or call 0725000250.
        </p>
      </section>
    </div>
  </div>
);

export default TermsOfServicePage;
