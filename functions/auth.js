export async function onRequestGet({ request }) {
  const cookie = request.headers.get("Cookie") || "";
  const username = cookie.match(/user=([^;]+)/)?.[1];

  return new Response(JSON.stringify({ username }), {
    headers: { "Content-Type": "application/json" }
  });
}
