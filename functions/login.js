export async function onRequestPost(context) {
  const { request, env } = context;

  const { username, password } = await request.json();

  // ユーザー検索
  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE username = ? AND password = ?"
  ).bind(username, password).first();

  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid login" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // ---- JWT 作成 ----
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ username: user.username }));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const data = new TextEncoder().encode(`${header}.${payload}`);
  const signatureArray = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
  const signature = btoa(String.fromCharCode(...signatureArray));

  const token = `${header}.${payload}.${signature}`;

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    }
  });
}
