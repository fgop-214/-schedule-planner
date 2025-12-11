export const onRequest = async ({ request, next }) => {
  const url = new URL(request.url);

  const protectedPaths = ['/dashboard.html', '/dashboard', '/auth']; // 保護するページ

  const cookie = request.headers.get("Cookie") || "";
  const username = cookie.match(/user=([^;]+)/)?.[1];

  // 保護されたページにアクセスしているのにログインしていない場合
  if (protectedPaths.includes(url.pathname) && !username) {
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/index.html"
      }
    });
  }

  // ログイン済みまたは保護対象外
  return next();
};
