import { verifyPassword } from './utils.js';

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE username = ?1"
  ).bind(username).first();

  if (!user) {
    return new Response("ユーザー名またはパスワードが違います", { status: 401 });
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return new Response("ユーザー名またはパスワードが違います", { status: 401 });
  }

  // Cookie 設定
  const headers = new Headers({
    "Set-Cookie": `user=${username}; Path=/; HttpOnly; Secure; SameSite=Strict`
  });

  return Response.redirect("/dashboard.html", { headers });
}
