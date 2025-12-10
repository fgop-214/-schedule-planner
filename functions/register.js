import { hashPassword } from './utils.js';

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  const password_hash = await hashPassword(password);

  try {
    await env.DB.prepare(
      "INSERT INTO users (username, password_hash) VALUES (?1, ?2)"
    ).bind(username, password_hash).run();
  } catch (e) {
    return new Response("ユーザー名が重複しています", { status: 400 });
  }

  return Response.redirect("/index.html");
}
