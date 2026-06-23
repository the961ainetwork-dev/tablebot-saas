// api/email/send.js — SendGrid email sender
//
// Handles both:
//   1. Transactional: single email (order confirmation, welcome, etc.)
//   2. Broadcast: send to a list of recipients (customer's own list or our house list)
//
// SETUP REQUIRED (Vercel environment variables):
//   SENDGRID_API_KEY     — from app.sendgrid.com → Settings → API Keys
//   EMAIL_FROM           — verified sender address e.g. hello@yourdomain.com
//   EMAIL_FROM_NAME      — display name e.g. "TableBot"
//
// Request body (transactional):
//   { mode: "single", to: "user@example.com", toName: "Dana", subject: "...", html: "...", text: "..." }
//
// Request body (broadcast):
//   { mode: "broadcast", recipients: [{email,name},...], subject: "...", html: "...", text: "..." }
//   recipients can be up to 1000 per call (SendGrid batch limit)

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

  const { mode, to, toName, recipients, subject, html, text } = req.body || {};

  if (!subject || (!html && !text)) {
    res.status(400).json({ error: "Missing required fields: subject and html or text" });
    return;
  }

  // Build personalizations for SendGrid v3 API
  let personalizations;

  if (mode === "broadcast") {
    // Broadcast mode: send to list
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ error: "Broadcast mode requires a recipients array" });
      return;
    }
    // SendGrid supports up to 1000 personalizations per request
    const batch = recipients.slice(0, 1000);
    personalizations = batch.map(r => ({
      to: [{ email: r.email, name: r.name || r.email }],
    }));
  } else {
    // Single transactional email
    if (!to) {
      res.status(400).json({ error: "Single mode requires a 'to' email address" });
      return;
    }
    personalizations = [{ to: [{ email: to, name: toName || to }] }];
  }

  const payload = {
    personalizations,
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
      res.status(200).json({
        ok: true,
        mode: mode || "single",
        sent: personalizations.length,
        message: `Email${personalizations.length > 1 ? "s" : ""} queued successfully`,
      });
    } else {
      const errorBody = await response.json().catch(() => ({}));
      const errMsg = errorBody?.errors?.[0]?.message || `SendGrid error ${response.status}`;
      console.error("SendGrid error:", errMsg);
      res.status(500).json({ error: errMsg });
    }
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
