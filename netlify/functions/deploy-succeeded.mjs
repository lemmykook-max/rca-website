// Kører automatisk efter hver vellykket udgivelse på Netlify.
// Fortæller Bing og andre IndexNow-søgemaskiner, hvilke sider der er nye eller ændrede,
// så de bliver indekseret hurtigt (Bing leverer også resultater til ChatGPT og Copilot).
const KEY = "0d0ea7217b4dfdd7f0c2653fb0580614";
const HOST = "rcfa.dk";
const SITE = "https://" + HOST;
const DAGE = 3; // sider ændret inden for de seneste dage sendes ind

export default async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.payload?.context && body.payload.context !== "production") return new Response("ikke produktion");
    const xml = await (await fetch(SITE + "/sitemap.xml")).text();
    const graense = Date.now() - DAGE * 864e5;
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
      .filter(([, , lastmod]) => new Date(lastmod).getTime() >= graense)
      .map(([, loc]) => loc);
    if (!urls.includes(SITE + "/")) urls.unshift(SITE + "/");
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: SITE + "/" + KEY + ".txt", urlList: urls }),
    });
    console.log("IndexNow:", res.status, urls.length, "sider", urls);
    return new Response("ok " + res.status);
  } catch (e) {
    console.error("IndexNow fejlede:", e);
    return new Response("fejl", { status: 200 });
  }
};
