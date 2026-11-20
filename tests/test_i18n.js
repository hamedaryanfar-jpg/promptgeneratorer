// Testar fullständig översättning till alla 3 språk (sv, en, fa)
// Kör: node tests/test_i18n.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const i18nCode = fs.readFileSync(path.join(__dirname, "../docs/assets/i18n.js"), "utf8");
const i18nCtx = { module: { exports: {} } };
vm.createContext(i18nCtx);
vm.runInContext(i18nCode, i18nCtx);
const I18N = i18nCtx.module.exports;

const ctx = {
  I18N: I18N,
  module: { exports: {} }
};
vm.createContext(ctx);

for (const file of ["generator.js", "frameworks.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../docs/assets", file), "utf8"), ctx);
}

const F = ctx.module.exports;

let failures = 0;
function check(condition, message) {
  if (!condition) {
    failures++;
    console.log("  FEL: " + message);
  }
}

const tidy = (s) => s.replace(/\n{3,}/g, "\n\n").trim();

console.log("Validerar fullständig lokalisering (inga hårdkodade svenska texter i en/fa)...");

for (const lang of ["sv", "en", "fa"]) {
  console.log(`\n=== Testar språk: ${lang} ===`);

  // 1. Akronymer (22 st)
  for (const fw of F.FRAMEWORKS) {
    const config = F.generatorConfig(fw.id, lang);
    check(config !== null, `${fw.name} (${lang}): config är null`);
    const values = { ...config.example };
    const prompt = tidy(config.build(values));

    for (const bad of ["undefined", "null", "[object"]) {
      check(!prompt.includes(bad), `${fw.name} (${lang}): prompten innehåller "${bad}"`);
    }

    if (lang === "en") {
      check(!prompt.includes("Uppgift:"), `${fw.name} (en): innehåller svenska 'Uppgift:'`);
      check(!prompt.includes("Agera som"), `${fw.name} (en): innehåller svenska 'Agera som'`);
      check(!prompt.includes("Om du saknar information"), `${fw.name} (en): innehåller svensk osäkerhetstext`);
    }

    if (lang === "fa") {
      check(!prompt.includes("Uppgift:"), `${fw.name} (fa): innehåller svenska 'Uppgift:'`);
      check(!prompt.includes("Agera som"), `${fw.name} (fa): innehåller svenska 'Agera som'`);
      check(!prompt.includes("Om du saknar information"), `${fw.name} (fa): innehåller svensk osäkerhetstext`);
    }
  }

  // 2. Modeller (4 st)
  for (const m of F.MODELS) {
    const config = F.generatorConfig(m.id, lang);
    check(config !== null, `${m.name} (${lang}): config är null`);
    check(config.fields && config.fields.length > 0, `${m.name} (${lang}): saknar fält`);
    const prompt = tidy(config.build({ ...config.example }));

    for (const bad of ["undefined", "null", "[object"]) {
      check(!prompt.includes(bad), `${m.name} (${lang}): prompten innehåller "${bad}"`);
    }

    if (lang === "en") {
      check(!prompt.includes("Uppgift"), `${m.name} (en): innehåller 'Uppgift'`);
      check(!prompt.includes("Klart när"), `${m.name} (en): innehåller 'Klart när'`);
      check(!config.fields.some((f) => f.label.includes("Uppgift")), `${m.name} (en): fältetikett innehåller 'Uppgift'`);
    }

    if (lang === "fa") {
      check(!prompt.includes("Uppgift"), `${m.name} (fa): innehåller 'Uppgift'`);
      check(!prompt.includes("Klart när"), `${m.name} (fa): innehåller 'Klart när'`);
      check(!config.fields.some((f) => f.label.includes("Uppgift")), `${m.name} (fa): fältetikett innehåller 'Uppgift'`);
    }
  }

  // 3. Tekniker (9 st)
  for (const t of F.TECHNIQUES) {
    const config = F.generatorConfig(t.id, lang);
    check(config !== null, `${t.name} (${lang}): config är null`);
    check(config.fields && config.fields.length > 0, `${t.name} (${lang}): saknar fält`);
    const prompt = tidy(config.build({ ...config.example }));

    for (const bad of ["undefined", "null", "[object"]) {
      check(!prompt.includes(bad), `${t.name} (${lang}): prompten innehåller "${bad}"`);
    }

    if (lang === "en") {
      check(!prompt.includes("Tänk steg för steg"), `${t.name} (en): innehåller 'Tänk steg för steg'`);
      check(!config.fields.some((f) => f.label.includes("Uppgift")), `${t.name} (en): fältetikett innehåller 'Uppgift'`);
    }

    if (lang === "fa") {
      check(!prompt.includes("Tänk steg för steg"), `${t.name} (fa): innehåller 'Tänk steg för steg'`);
      check(!config.fields.some((f) => f.label.includes("Uppgift")), `${t.name} (fa): fältetikett innehåller 'Uppgift'`);
    }
  }
}

console.log("\n----- Exempel Claude (English) -----");
console.log(tidy(F.generatorConfig("claude", "en").build(F.generatorConfig("claude", "en").example)));

console.log("\n----- Exempel Claude (فارسی / Persian) -----");
console.log(tidy(F.generatorConfig("claude", "fa").build(F.generatorConfig("claude", "fa").example)));

console.log("\n----- Exempel Few-Shot (فارسی / Persian) -----");
console.log(tidy(F.generatorConfig("fs", "fa").build(F.generatorConfig("fs", "fa").example)));

console.log("\n----- Exempel SPP Expertpanel (فارسی / Persian) -----");
console.log(tidy(F.generatorConfig("spp", "fa").build(F.generatorConfig("spp", "fa").example)));

console.log(failures ? `\n${failures} FEL` : "\nALLA TESTER GODKÄNDA! INGA HÅRDKODADE SVENSKA TEXTER KVAR.");
process.exit(failures ? 1 : 0);
