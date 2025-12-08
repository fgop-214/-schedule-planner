import { jwt } from "@tsndr/cloudflare-worker-jwt";

export async function onRequestPost(context) {
  const { request } = context;

  // クライアントから送られた JSON を読む
  const body = await request.json();
  const user = body.username;
  const pass = body.password;

  // ★★ 本来は D1 でチェックするが、今はテスト用 ★★
  if (user === "test" && pass === "pass") {
    // トークン作成
    const token = await jwt.sign({ user }, context.env.JWT_SECRET);

    // Cookie に保存して返す
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Path=/ → 全ページで有効
        // HttpOnly → JSから読み取れない（安全）
        // Secure → https のみ
        // SameSite=None → Cookie が fetch でも送られる
        "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=3600`
      }
    });
  }

  // ログイン失敗
  return new Response(JSON.stringify({ ok: false }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}
