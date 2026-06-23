// api/email/templates.js — HTML email templates
//
// All templates return { subject, html, text } ready to pass into api/email/send.js
// Colors and copy are for TableBot — swap brand variables for TableBot.

export const templates = {

  // ── Welcome email sent after demo request approved ─────────────────────────
  welcome({ name, storeName, sandboxUrl, expiresHours = 24 }) {
    const subject = `Your TableBot sandbox is ready, ${name.split(" ")[0]}`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>body{font-family:'Inter',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
.wrap{max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
.header{background:#0a0a0a;padding:24px 32px;display:flex;align-items:center;gap:10px}
.logo{color:#fff;font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:-0.5px}
.logo span{color:#ff0000}
.body{padding:32px}
h1{font-size:22px;font-weight:800;margin:0 0 12px;color:#0a0a0a}
p{font-size:14px;line-height:1.7;color:#374151;margin:0 0 16px}
.btn{display:inline-block;background:#ff0000;color:#fff;padding:14px 32px;text-decoration:none;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-radius:6px;margin:8px 0 24px}
.detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
.detail-row:last-child{border-bottom:none}
.detail-label{color:#6b7280}
.detail-val{color:#0a0a0a;font-weight:600}
.footer{background:#f9fafb;padding:20px 32px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrap">
  <div class="header"><div class="logo">Table<span>·</span>Bot</div></div>
  <div class="body">
    <h1>Your sandbox is live, ${name.split(" ")[0]}. 🎉</h1>
    <p>We've configured your <strong>${expiresHours}-hour TableBot demo</strong> around <strong>${storeName}</strong>. Your AI agent is ready to answer customer questions, browse your catalog, and recover abandoned carts — right now.</p>
    <a href="${sandboxUrl}" class="btn">Open Your Sandbox →</a>
    <div>
      <div class="detail-row"><span class="detail-label">Store</span><span class="detail-val">${storeName}</span></div>
      <div class="detail-row"><span class="detail-label">Access expires</span><span class="detail-val">In ${expiresHours} hours</span></div>
      <div class="detail-row"><span class="detail-label">No credit card needed</span><span class="detail-val">✓ Confirmed</span></div>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#9ca3af">If you have questions, reply to this email — a real person will respond. This is TableBot, not a ticket system.</p>
  </div>
  <div class="footer">TableBot · Built with Claude AI · Unsubscribe</div>
</div>
</body></html>`;
    const text = `Your TableBot sandbox is live, ${name.split(" ")[0]}.\n\nStore: ${storeName}\nAccess expires in ${expiresHours} hours.\n\nOpen your sandbox: ${sandboxUrl}\n\n— TableBot Team`;
    return { subject, html, text };
  },

  // ── Order/plan confirmation ────────────────────────────────────────────────
  orderConfirmation({ name, plan, price, paymentMethod, reference }) {
    const subject = `TableBot ${plan} Plan — Payment received`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:'Inter',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
.wrap{max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
.header{background:#0a0a0a;padding:24px 32px}.logo{color:#fff;font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:-0.5px}.logo span{color:#ff0000}
.body{padding:32px}
h1{font-size:22px;font-weight:800;margin:0 0 12px;color:#0a0a0a}
p{font-size:14px;line-height:1.7;color:#374151;margin:0 0 16px}
.summary{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:13px}
.row:last-child{border-bottom:none}
.lbl{color:#6b7280}.val{color:#0a0a0a;font-weight:600}
.total{font-size:16px;font-weight:900;color:#ff0000}
.footer{background:#f9fafb;padding:20px 32px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrap">
  <div class="header"><div class="logo">Table<span>·</span>Bot</div></div>
  <div class="body">
    <h1>You're on the ${plan} Plan ✓</h1>
    <p>Hi ${name.split(" ")[0]}, your payment has been received and your account is now active.</p>
    <div class="summary">
      <div class="row"><span class="lbl">Plan</span><span class="val">${plan}</span></div>
      <div class="row"><span class="lbl">Payment method</span><span class="val">${paymentMethod}</span></div>
      ${reference ? `<div class="row"><span class="lbl">Reference</span><span class="val">${reference}</span></div>` : ""}
      <div class="row"><span class="lbl total">Amount</span><span class="val total">$${price}/mo</span></div>
    </div>
    <p>Your AI agent is fully active. Log into your dashboard to configure your store, test the agent, and start recovering carts.</p>
  </div>
  <div class="footer">TableBot · Built with Claude AI</div>
</div>
</body></html>`;
    const text = `TableBot ${plan} Plan confirmed.\n\nAmount: $${price}/mo\nPayment: ${paymentMethod}${reference ? `\nReference: ${reference}` : ""}\n\n— TableBot Team`;
    return { subject, html, text };
  },

  // ── Broadcast email order confirmation (sent to admin) ────────────────────
  broadcastOrderAdmin({ customerName, customerEmail, listName, recipientCount, message, channel }) {
    const subject = `New Email Broadcast Order — ${customerName}`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:'Inter',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
.wrap{max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
.header{background:#0a0a0a;padding:24px 32px;display:flex;justify-content:space-between;align-items:center}
.logo{color:#fff;font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:-0.5px}.logo span{color:#ff0000}
.badge{background:#ff0000;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 12px;border-radius:99px}
.body{padding:32px}
h1{font-size:20px;font-weight:800;margin:0 0 20px;color:#0a0a0a}
.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
.row:last-child{border-bottom:none}
.lbl{color:#6b7280}.val{color:#0a0a0a;font-weight:600}
.msg-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap}
.footer{background:#f9fafb;padding:20px 32px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrap">
  <div class="header"><div class="logo">Table<span>·</span>Bot</div><div class="badge">Admin Alert</div></div>
  <div class="body">
    <h1>New Broadcast Order</h1>
    <div class="row"><span class="lbl">From</span><span class="val">${customerName} &lt;${customerEmail}&gt;</span></div>
    <div class="row"><span class="lbl">Channel</span><span class="val">${channel || "Email"}</span></div>
    <div class="row"><span class="lbl">List</span><span class="val">${listName}</span></div>
    <div class="row"><span class="lbl">Recipients</span><span class="val">${recipientCount} contacts</span></div>
    <div>Message preview:</div>
    <div class="msg-box">${message}</div>
    <p style="font-size:12px;color:#9ca3af">Log into the admin panel to approve or reject this order.</p>
  </div>
  <div class="footer">TableBot Admin Notification</div>
</div>
</body></html>`;
    const text = `New email broadcast order from ${customerName} (${customerEmail}).\nList: ${listName} — ${recipientCount} contacts.\n\nMessage:\n${message}`;
    return { subject, html, text };
  },

  // ── Broadcast approved — notify customer ──────────────────────────────────
  broadcastApproved({ customerName, listName, recipientCount, scheduledNote }) {
    const subject = `Your email broadcast has been approved`;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:'Inter',Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
.wrap{max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
.header{background:#0a0a0a;padding:24px 32px}.logo{color:#fff;font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:-0.5px}.logo span{color:#ff0000}
.body{padding:32px}
h1{font-size:22px;font-weight:800;margin:0 0 12px;color:#0a0a0a}
p{font-size:14px;line-height:1.7;color:#374151;margin:0 0 14px}
.check{font-size:32px;margin-bottom:16px}
.footer{background:#f9fafb;padding:20px 32px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrap">
  <div class="header"><div class="logo">Table<span>·</span>Bot</div></div>
  <div class="body">
    <div class="check">✅</div>
    <h1>Broadcast approved.</h1>
    <p>Hi ${customerName.split(" ")[0]}, your email campaign to <strong>${listName}</strong> (${recipientCount} contacts) has been reviewed and approved by our team.</p>
    <p>${scheduledNote || "We will send your campaign within the next few hours and notify you once it's complete."}</p>
    <p style="font-size:12px;color:#9ca3af">Pricing: $29 for your first broadcast, 10% off each additional send.</p>
  </div>
  <div class="footer">TableBot · Broadcast Service</div>
</div>
</body></html>`;
    const text = `Your TableBot email broadcast to ${listName} (${recipientCount} contacts) has been approved.\n\n${scheduledNote || "We'll send it within a few hours."}\n\n— TableBot Team`;
    return { subject, html, text };
  },

};
