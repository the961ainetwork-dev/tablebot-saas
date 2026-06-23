// api/email/status.js — Reports email configuration status (no values exposed)

export const config = { runtime: "edge" };

export default async function handler(req) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "GET, OPTIONS" } });

  const sgSet = !!process.env.SENDGRID_API_KEY;
  const fromSet = !!process.env.EMAIL_FROM;

  return new Response(JSON.stringify({
    sgSet,
    fromSet,
    configured: sgSet && fromSet,
    provider: "SendGrid (Twilio)",
  }), { status: 200, headers: cors });
}
