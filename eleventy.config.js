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

  cfg.addCollection("nyheder", (api) =>
    api.getFilteredByGlob("src/nyheder/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
