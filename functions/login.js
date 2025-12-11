export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  if (!username || !password) {
    return new Response("Missing fields", { status: 400 });
  }

  // DB 確認
  const user = await env.DB.prepare(
    "SELECT id, password FROM users WHERE username = ?"
  ).bind(username).first();

  if (!user) {
    return new Response("User not found", { status: 401 });
  }

  // パスワードチェック（簡易版）
  if (user.password !== password) {
    return new Response("Invalid password", { status: 401 });
  }

  // セッション cookie を発行
  const token = crypto.randomUUID();

  await env.DB
    .prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)")
    .bind(token, user.id)
    .run();

  // Cookie 付与
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
  );

  // 正しい redirect
  return new Response(null, {
    status: 303,
    headers: {
      ...Object.fromEntries(headers),
      "Location": "/dashboard",
    }
  });
}
