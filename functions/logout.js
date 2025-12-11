export async function onRequestGet() {
  const headers = new Headers({
    "Set-Cookie":
      "user=; Path=/; HttpOnly; Secure; Max-Age=0; SameSite=Strict"
  });

  return Response.redirect("/public/index.html", { headers });
}
