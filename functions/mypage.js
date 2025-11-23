export async function onRequest(context) {
  const { request } = context;

  // Cookie 取得
  const cookie = request.headers.get("Cookie") || "";
  const session = cookie.match(/session=([^;]+)/)?.[1];

  if (!session) {
    return new Response("ログインしてください", { status: 401 });
  }
  return env.ASSETS.fetch("https://schedule-planner-8dn.pages.dev/afterlogin.html");
}
