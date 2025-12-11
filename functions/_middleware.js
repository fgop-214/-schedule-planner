export const onRequest = async ({ request, next }) => {
  const url = new URL(request.url);

  const protectedPaths = ['/dashboard.html', '/auth'];

  const cookie = request.headers.get("Cookie") || "";
  const username = cookie.match(/user=([^;]+)/)?.[1];

  // 保護されたページにアクセスしているのに Cookie 無し → ログインへ
  if (protectedPaths.includes(url.pathname) && !username) {
    return Response.redirect("/public/index.html");
  }

  return next();
};
