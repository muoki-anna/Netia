import React from 'react';

const ReturnRefundPolicyPage = () => (
  <div className="mx-auto max-w-[56rem] px-4 sm:px-6 py-16">
    <p className="text-sm font-medium text-accent uppercase tracking-wide mb-3">Legal</p>
    <h1 className="font-display text-4xl sm:text-5xl font-700 text-foreground mb-4">Return &amp; Refund Policy</h1>
    <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

    <div className="prose-legal space-y-8 text-foreground/90 leading-relaxed">
      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">1. Our Commitment</h2>
        <p>
          At NetiaX Limited, we want every customer to be satisfied with our seedlings, Netia Grow
          propagation media, and installation services. This policy explains how returns, refunds,
          and warranties work for the products and services we offer.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">2. Seedlings and Perishable Products</h2>
        <p>
          Because seedlings and other living plant material are perishable and time-sensitive, we
          cannot accept returns once they have left our facility. If your seedlings arrive damaged,
          diseased, or significantly different from what was ordered, you must notify us within
          <strong> 24 hours of delivery</strong> with clear photos, and we will offer a replacement
          or store credit at no additional cost, subject to verification.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">3. Growing Media and Substrate Products</h2>
        <p>
          Netia Treated Coco Peat, Vermiculite, Custom Substrate, and Netia Grow Superior may be
          returned within <strong>7 days of delivery</strong> if unopened, unused, and in their
          original packaging. Opened bags can only be returned if the product is defective or does
          not match its description. Contact us before sending anything back so we can confirm
          eligibility and arrange collection or drop-off.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">4. Greenhouse &amp; Drip Irrigation Installation Services</h2>
        <p>
          Installation services are scheduled and quoted individually. If you need to cancel or
          reschedule, please contact us at least 48 hours before the scheduled appointment for a
          full refund of any deposit paid. Cancellations within 48 hours of the appointment may be
          subject to a partial deduction to cover site-visit and material preparation costs already
          incurred.
        </p>
        <p className="mt-3">
          All installation workmanship is covered by a <strong>90-day workmanship warranty</strong>{' '}
          from the completion date. If an installed system develops a fault due to workmanship
          within this period, we will repair it at no charge. This warranty does not cover damage
          from misuse, unauthorized modification, extreme weather events, or normal wear and tear.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">5. How to Request a Return or Refund</h2>
        <p>To start a return, refund, or warranty claim, please:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Contact us at <a href="mailto:netiaxke@gmail.com" className="text-primary underline underline-offset-2">netiaxke@gmail.com</a> or 0725000250 with your order number;</li>
          <li>Include clear photos of the issue where applicable;</li>
          <li>Allow us up to 3 business days to review and respond to your request.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">6. Refund Method and Timeline</h2>
        <p>
          Approved refunds are issued to the original payment method used at checkout, or as store
          credit where agreed with the customer. Refunds are typically processed within 5–10
          business days after approval, though your bank or payment provider may take additional
          time to reflect the transaction.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">7. Non-Returnable Situations</h2>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Seedlings or plants damaged due to improper handling, planting, or care after delivery;</li>
          <li>Change-of-mind requests on perishable seedlings once delivered;</li>
          <li>Growing media that has been opened, mixed, or partially used, unless defective;</li>
          <li>Requests made outside the applicable return windows stated above.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-600 text-foreground mb-3">8. Contact Us</h2>
        <p>
          For any return, refund, or warranty questions, reach out to us at{' '}
          <a href="mailto:netiaxke@gmail.com" className="text-primary underline underline-offset-2">netiaxke@gmail.com</a>{' '}
          or call 0725000250. We're here to help.
        </p>
      </section>
    </div>
  </div>
);

export default ReturnRefundPolicyPage;
