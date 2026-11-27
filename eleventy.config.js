export default function (cfg) {
  cfg.addPassthroughCopy({
    "src/files": "files",
    "src/admin": "admin",
    "src/styles.css": "styles.css",
    "src/main.js": "main.js",
    "src/generalforsamling.js": "generalforsamling.js",
    "src/referat.js": "referat.js",
  });
  cfg.ignores.add("src/admin/**");

  const months = ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"];
  cfg.addFilter("dato", (d) => {
    const x = new Date(d);
    return `${x.getDate()}. ${months[x.getMonth()]} ${x.getFullYear()}`;
  });
  cfg.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  cfg.addFilter("mail_links", (s) => String(s || "").replace(/[\w.+-]+@[\w-]+\.[\w.]+[a-z]/gi, (m) => `<a href="mailto:${m}">${m}</a>`));
  cfg.addFilter("isodato", (d) => new Date(d).toISOString().slice(0, 10));
  // Finder "Sidst opdateret: 24. november 2026" i en sides indhold og giver ISO-dato til strukturerede data
  cfg.addFilter("opdateret_iso", (html) => {
    const m = String(html || "").match(/Sidst opdateret:?(?:<\/strong>|\*\*)?:?\s*(\d{1,2})\.\s*([a-zæøå]+)\s+(\d{4})/i);
    if (!m) return "";
    const mi = months.indexOf(m[2].toLowerCase());
    return mi < 0 ? "" : `${m[3]}-${String(mi + 1).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  });
  cfg.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  cfg.addFilter("striptags", (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

  cfg.addGlobalData("byggedato", () => new Date());
  cfg.addCollection("vidensider", (api) =>
    api.getFilteredByGlob("src/sider/*.md").filter((p) => String(p.data.permalink || "").startsWith("/viden/"))
  );

  cfg.addCollection("nyheder", (api) =>
    api.getFilteredByGlob("src/nyheder/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
