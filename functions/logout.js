export async function onRequestPost({ request, env }) {
  // Cookie を削除する
  const headers = new Headers({
    "Set-Cookie": `user=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  });

  // 302 リダイレクトでトップページに戻す
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/index.html",
      "Set-Cookie": `user=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
    }
  });
}
