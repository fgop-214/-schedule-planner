const encoder = new TextEncoder();

// ---- JWT 生成（HMAC-SHA256） ----
async function signJWT(payload, secret) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign("HMAC", key, data);

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// ---- login handler ----
export async function onRequestPost(context) {
  const { request, env } = context;

  // JSON を受け取る
  const { username, password } = await request.json();

  // ★ D1 でユーザー確認（あなたのコードを利用）
  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE username = ? AND password = ?"
  ).bind(username, password).first();

  if (!user) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // --- JWT 作成 ---
  const token = await signJWT(
    { username, iat: Date.now() / 1000 },
    env.JWT_SECRET
  );

  // Cookie に保存
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
    }
  });
}

