// /functions/login.js
export async function onRequestPost(context) {
  const { request, env } = context;

  // --- JSON 取得 ---
  const { username, password } = await request.json();

  // --- DB でユーザー検索 ---
  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE username = ? AND password = ?"
  ).bind(username, password).first();

  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid login" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // --- ログイン成功 → セッションクッキー発行 ---
  const sessionValue = crypto.randomUUID();
  
  // ここでは簡単のため、session=<uuid> を Cookie にセットするだけ
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Lax`
    }
  });
}
