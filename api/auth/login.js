// api/auth/login.js  — Vercel Edge Function
// In production: use a real database (Supabase, PlanetScale, etc.)
// This demo uses a hardcoded user store — replace with your DB calls

export const config = { runtime: "edge" };

// Simple JWT-like token (use a real JWT library in production)
function makeToken(userId) {
  const payload = btoa(JSON.stringify({ userId, exp: Date.now() + 86400000 * 7 }));
  return `tb_${payload}`;
}

// Demo user store — replace with real DB lookup
const DEMO_USERS = [
  { id: "demo", email: "demo@tablebot.ai", password: "demo1234", name: "Demo User", restaurant: "La Piazza Demo", plan: "growth", phone: "+961 1 234 567" },
];

export default async function handler(req) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });

  try {
    const { email, password } = await req.json();
    if (!email || !password) return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400, headers: cors });

    const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401, headers: cors });

    const { password: _, ...safeUser } = user;
    return new Response(JSON.stringify({ token: makeToken(user.id), user: safeUser }), { status: 200, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
}
