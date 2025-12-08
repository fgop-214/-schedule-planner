const encoder = new TextEncoder();

// ---- JWT サイン・検証 ----
async function verifyJWT(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
  const isValid = await crypto.subtle.verify("HMAC", key, signature, data);

  return isValid ? JSON.parse(atob(payloadB64)) : null;
}

// ---- Middleware ----
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 認証不要ページ
    const publicPaths = ["/login", "/login-style.css"];
    if (publicPaths.includes(url.pathname)) {
      return ctx.next();
    }

    // Cookie から token を取得
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.match(/token=([^;]+)/)?.[1];

    if (!token) {
      return Response.redirect("/login", 302);
    }

    // JWT を検証
    const user = await verifyJWT(token, env.JWT_SECRET);
    if (!user) {
      return Response.redirect("/login", 302);
    }

    return ctx.next();
  },
};

console.log("middleware: path=", url.pathname);
console.log("cookie=", cookie);
console.log("token=", token);
