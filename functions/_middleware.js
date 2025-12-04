import { jwt } from "@tsndr/cloudflare-worker-jwt";

/**
 * 全リクエストで実行されるミドルウェア
 * - env.JWT_SECRET を使って token を verify する想定
 * - 除外パス (public) を適宜編集してください
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // -----------------------
  // 1) 除外するパス一覧（公開したいもの）
  // -----------------------
  // 必要に応じてここに除外パターンを追加してください。
  const PUBLIC_PATHS = [
    "/login",
    "/login.html",
    "/register",
    "/register.html",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  // 静的アセット（拡張子で判定）を除外
  const STATIC_EXTENSIONS = [
    ".js", ".css", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".woff", ".woff2", ".map"
  ];

  // API エンドポイント（必要なら除外）
  const PUBLIC_API_PREFIXES = ["/api/public", "/_next"]; // 必要なら変更

  // 早期 return: 明示的な公開パス
  if (PUBLIC_PATHS.includes(path)) {
    return context.next();
  }

  // 早期 return: 拡張子による静的アセット
  for (const ext of STATIC_EXTENSIONS) {
    if (path.endsWith(ext)) return context.next();
  }

  // 早期 return: public API / framework path 等
  for (const pref of PUBLIC_API_PREFIXES) {
    if (path.startsWith(pref)) return context.next();
  }

  // -----------------------
  // 2) Cookie から token を取得
  // -----------------------
  const cookieHeader = request.headers.get("Cookie") || "";
  const token = cookieHeader.match(/token=([^;]+)/)?.[1];

  // トークンがなければ login にリダイレクト
  if (!token) {
    // クエリにリダイレクト先を残しておくと UX が良い
    const dest = encodeURIComponent(request.url);
    return Response.redirect(`/login?redirect=${dest}`, 302);
  }

  // -----------------------
  // 3) トークン検証（JWT の場合）
  // -----------------------
  try {
    // verify が true/false を返すか例外を投げるライブラリもあるのでawaitで扱う
    const ok = await jwt.verify(token, env.JWT_SECRET);
    if (!ok) {
      // 無効なトークン
      return Response.redirect(`/login?expired=1`, 302);
    }

    // オプション: デコードしてユーザ情報を context.data に入れる
    const decoded = await jwt.decode(token);
    context.data.user = decoded?.payload ?? null;

    // 認証OK → 次へ（静的ファイル or 関数）
    return context.next();
  } catch (err) {
    // 検証中にエラーが発生したら login へ
    return Response.redirect(`/login?error=auth`, 302);
  }
}
