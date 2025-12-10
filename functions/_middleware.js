export const onRequest = async ({ request, env, next }) => {
  const url = new URL(request.url);

  // 認証が必要なパス
  const protectedPaths = ['/dashboard.html', '/auth'];

  const session = request.headers.get("Cookie") || "";
  const user = session.match(/user=([^;]+)/)?.[1];

  // 認証が必要なのに Cookie が無い → ログインへ
  if (protectedPaths.includes(url.pathname) && !user) {
    return Response.redirect("/index.html");
  }

  // OK
  return next();
};
