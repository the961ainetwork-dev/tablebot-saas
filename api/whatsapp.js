// api/whatsapp.js — Real WhatsApp Business API webhook
// Receives messages, calls Claude, sends reply back via WhatsApp Cloud API

export const config = { runtime: "edge" };

export default async function handler(req) {
  // ── Webhook Verification (GET from Meta) ──────────────────────────────────
  if (req.method === "GET") {
    const url       = new URL(req.url);
    const mode      = url.searchParams.get("hub.mode");
    const token     = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // ── Incoming Messages (POST from Meta) ────────────────────────────────────
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }

  const entry   = body?.entry?.[0];
  const change  = entry?.changes?.[0]?.value;
  const message = change?.messages?.[0];

  // Only handle incoming text messages
  if (!message || message.type !== "text") return new Response("OK", { status: 200 });

  const userText = message.text.body;
  const from     = message.from; // customer's phone number
  const phoneNumberId = change?.metadata?.phone_number_id || process.env.WA_PHONE_NUMBER_ID;

  // Build system prompt (in production: load from DB per restaurant)
  const systemPrompt = process.env.AGENT_SYSTEM_PROMPT || `You are TableBot, a friendly AI WhatsApp assistant for a restaurant. 
You handle reservations, answer menu questions, and help with customer inquiries.
Be warm, concise (2-3 sentences), and use emojis naturally.
Respond in the same language the customer uses (Arabic or English).`;

  // ── Call Claude ───────────────────────────────────────────────────────────
  let aiReply = "Thank you for your message! We'll get back to you shortly. 🙏";
  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userText }],
      }),
    });
    const aiData = await aiRes.json();
    if (aiData.content?.[0]?.text) aiReply = aiData.content[0].text;
  } catch (err) {
    console.error("Claude error:", err.message);
  }

  // ── Send Reply via WhatsApp Cloud API ─────────────────────────────────────
  try {
    await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: aiReply },
      }),
    });
  } catch (err) {
    console.error("WhatsApp send error:", err.message);
  }

  return new Response("OK", { status: 200 });
}
