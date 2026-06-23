// api/email/broadcast.js — Email broadcast sender
//
// Called by the Admin panel when approving an email broadcast order.
// Sends the campaign to all recipients in the list via SendGrid.
// Handles batching automatically for large lists (SendGrid max 1000/call).
//
// Request body:
// {
//   subject: "...",
//   html: "...",          // full email HTML body
//   text: "...",          // plain text fallback
//   recipients: [         // array of { email, name } — from customer's own list OR our house list
//     { email: "a@b.com", name: "Dana" },
//     ...
//   ],
//   orderId: "ord_xxx",   // for logging
// }

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "noreply@tablebot.ai";
  const fromName = process.env.EMAIL_FROM_NAME || "TableBot";

  if (!apiKey) {
    res.status(500).json({ error: "SENDGRID_API_KEY not configured" });
    return;
  }

  const { subject, html, text, recipients, orderId } = req.body || {};

  if (!subject || !recipients?.length || (!html && !text)) {
    res.status(400).json({ error: "Missing required fields: subject, html/text, recipients" });
    return;
  }

  // SendGrid supports up to 1000 personalizations per request — batch if needed
  const BATCH_SIZE = 1000;
  const batches = [];
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  let totalSent = 0;
  const errors = [];

  for (const batch of batches) {
    const payload = {
      personalizations: batch.map(r => ({
        to: [{ email: r.email, name: r.name || r.email }],
      })),
      from: { email: fromEmail, name: fromName },
      subject,
      content: [
        ...(text ? [{ type: "text/plain", value: text }] : []),
        ...(html ? [{ type: "text/html", value: html }] : []),
      ],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true },
      },
    };

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 202) {
        totalSent += batch.length;
      } else {
        const errBody = await response.json().catch(() => ({}));
        errors.push(errBody?.errors?.[0]?.message || `Batch error ${response.status}`);
      }
    } catch (err) {
      errors.push(err.message);
    }
  }

  if (errors.length > 0 && totalSent === 0) {
    res.status(500).json({ error: errors[0], allErrors: errors });
    return;
  }

  res.status(200).json({
    ok: true,
    orderId: orderId || null,
    totalRecipients: recipients.length,
    totalSent,
    batches: batches.length,
    errors: errors.length > 0 ? errors : undefined,
    message: `Broadcast sent to ${totalSent} of ${recipients.length} recipients`,
  });
}
