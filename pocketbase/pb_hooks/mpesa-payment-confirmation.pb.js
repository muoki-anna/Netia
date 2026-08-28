/// <reference path="../pb_data/types.d.ts" />

// Sends a payment confirmation email the moment an mpesa_orders record
// transitions into the "paid" status (set by the Express M-Pesa callback
// route after Safaricom confirms the STK push).
onRecordAfterUpdateSuccess((e) => {
  try {
    const status = e.record.get("status");
    const alreadyNotified = e.record.get("confirmation_sent");

    if (status !== "paid" || alreadyNotified) {
      e.next();
      return;
    }

    const email = e.record.get("customer_email");
    if (!email) {
      e.next();
      return;
    }

    const receipt = e.record.get("mpesa_receipt") || "N/A";
    const amount = e.record.get("amount");
    const currency = e.record.get("currency") || "KES";
    const orderType = e.record.get("order_type");
    const name = e.record.get("customer_name") || "there";

    const message = new MailerMessage({
      from: { name: "NetiaX Limited" },
      to: [{ address: email }],
      subject: "Payment Confirmed - NetiaX Limited",
      html: `
        <p>Hi ${name},</p>
        <p>We have received your M-Pesa payment of <strong>${currency} ${amount}</strong> for your ${orderType === "subscription" ? "Kitchen Garden Farmer subscription" : "NetiaX order"}.</p>
        <p><strong>M-Pesa Receipt:</strong> ${receipt}</p>
        <p>Thank you for choosing NetiaX Limited. Our team will process your order shortly.</p>
        <p>NetiaX Limited<br/>0725000250 | netiaxke@gmail.com</p>
      `,
    });

    $app.newMailClient().send(message);

    e.record.set("confirmation_sent", true);
    $app.save(e.record);
  } catch (err) {
    $app.logger().error("mpesa confirmation email failed", "err", String(err));
  }

  e.next();
}, "mpesa_orders");
