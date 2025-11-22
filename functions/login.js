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

  // セッションクッキー発行
  const sessionValue = crypto.randomUUID();

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Lax`
    }
  });
}
