import { verifyPassword } from './utils.js';

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  const user = await env.DB.prepare(
    "SELECT id, username, password_hash FROM users WHERE username = ?1"
  ).bind(username).first();

  if (!user) {
    return new Response("ユーザー名またはパスワードが間違っています", { status: 401 });
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return new Response("ユーザー名またはパスワードが間違っています", { status: 401 });
  }

  // Cookie 発行
  const headers = new Headers({
    "Set-Cookie": `user=${username}; Path=/; HttpOnly; Secure; SameSite=Strict`
  });

  // 🔥 Cloudflare Pages Functions では Response.redirect はこう書く
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/dashboard.html",
      "Set-Cookie": `user=${username}; Path=/; HttpOnly; Secure; SameSite=Strict`
    }
  });
}
