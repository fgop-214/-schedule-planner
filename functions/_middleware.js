// --- JWT Utility (sign / verify) ---
const encoder = new TextEncoder();

async function signJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${base64Header}.${base64Payload}`)
  );

  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${base64Header}.${base64Payload}.${base64Signature}`;
}

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
  if (!isValid) return null;

  try {
    return JSON.parse(atob(payloadB64));
  } catch (e) {
    return null;
  }
}


// --- Middleware ---
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 認証不要ページ
    const publicPaths = ["/login", "/signup", "/styles.css"];
    if (publicPaths.includes(url.pathname)) {
      return ctx.next();
    }

    // Cookie から token 取得
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.match(/token=([^;]+)/)?.[1];

    if (!token) {
      return Response.redirect("/login", 302);
    }

    // JWT 検証
    const decoded = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return Response.redirect("/login", 302);
    }

    // OK → 通過
    return ctx.next();
  },
};
