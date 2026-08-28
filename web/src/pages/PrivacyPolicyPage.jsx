import React from 'react';

const PrivacyPolicyPage = () => (
  <div className="mx-auto max-w-[56rem] px-4 sm:px-6 py-16">
    <p className="text-sm font-medium text-accent uppercase tracking-wide mb-3">Legal</p>
    <h1 className="font-display text-4xl sm:text-5xl font-700 text-foreground mb-4">Privacy Policy</h1>
    <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

    <div className="prose-legal space-y-8 text-foreground/90 leading-relaxed">
      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">1. Overview</h2>
        <p>
          NetiaX Limited ("NetiaX", "we", "us", "our") respects your privacy and is committed to
          protecting the personal information you share with us when you visit our website or
          purchase our agrotech products and services. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">2. Information We Collect</h2>
        <p>When you browse our store or place an order, we may collect:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Contact details:</strong> name, email address, phone number, and delivery address;</li>
          <li><strong>Order information:</strong> products purchased, order value, and delivery preferences;</li>
          <li><strong>Payment information:</strong> processed securely by our checkout provider — NetiaX does not store your full card or payment credentials;</li>
          <li><strong>Technical data:</strong> IP address, browser type, and device information collected automatically for site performance and security;</li>
          <li><strong>Communications:</strong> messages you send us via WhatsApp, email, or social media for support or inquiries.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Process and fulfil your orders, including delivery and installation scheduling;</li>
          <li>Communicate with you about your order status, inquiries, or support requests;</li>
          <li>Improve our website, products, and customer experience;</li>
          <li>Send you updates about our products or promotions, where you have opted in;</li>
          <li>Comply with legal obligations and prevent fraud.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">4. How We Protect Your Information</h2>
        <p>
          We take reasonable technical and organizational measures to safeguard your personal
          information against unauthorized access, alteration, disclosure, or destruction. Payment
          transactions are handled by our checkout provider using industry-standard security
          practices. We limit access to customer data to personnel who need it to fulfil orders
          and provide support.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">5. Sharing of Information</h2>
        <p>
          We do not sell your personal information. We may share necessary details with trusted
          third parties strictly to fulfil our services, including:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Payment and checkout processors to complete your transaction;</li>
          <li>Delivery and courier partners to fulfil shipping within Kenya;</li>
          <li>Service providers who support our website hosting and operations.</li>
        </ul>
        <p className="mt-3">We may also disclose information where required by law or to protect our legal rights.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">6. Your Rights and Choices</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information held
          by us, and may opt out of promotional communications at any time by contacting us
          directly. We will respond to reasonable requests within a reasonable timeframe.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">7. Cookies</h2>
        <p>
          Our website may use cookies and similar technologies to remember your cart contents and
          improve browsing performance. You can control cookies through your browser settings,
          though disabling them may affect certain site features such as the shopping cart.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically to reflect changes in our practices. Any
          updates will be posted on this page with a revised "Last updated" date.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">9. Contact Us</h2>
        <p>
          For any questions about this Privacy Policy or how your data is handled, contact us at{' '}
          <a href="mailto:netiaxke@gmail.com" className="text-primary underline underline-offset-2">netiaxke@gmail.com</a>{' '}
          or call 0725000250.
        </p>
      </section>
    </div>
  </div>
);

export default PrivacyPolicyPage;
