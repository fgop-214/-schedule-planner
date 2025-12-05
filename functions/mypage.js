export async function onRequestGet({ env }) {
  // middleware が先に発動する
  return env.ASSETS.fetch("https://<your-domain>/mypage.html");
}
