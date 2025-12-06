export async function onRequestGet({ env }) {
  // middleware が先に発動する
  return env.ASSETS.fetch("https://schedule-planner-8dn.pages.dev/public/mypage.html");
}
