// Testar all data och alla mallar utan webbläsare.
// Kör: node tests/test_frameworks.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Ladda generator.js (hjälpfunktioner som lines/bullets) och frameworks.js i samma sandlåda.
const ctx = { module: { exports: {} } };
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

// 1. Unika id:n
const ids = [...F.FRAMEWORKS, ...F.TECHNIQUES, ...F.MODELS].map((x) => x.id);
check(new Set(ids).size === ids.length, "id:n är inte unika: " + ids);

// 2. Akronymerna
for (const fw of F.FRAMEWORKS) {
  const expected = fw.name.replace(/[^A-ZÅÄÖ]/gi, "").toUpperCase();
  const actual = fw.letters.map((x) => x.l).join("").toUpperCase();
  check(expected === actual, `${fw.name}: bokstäverna blir "${actual}"`);

  for (const x of fw.letters) {
    check(x.note || F.BLOCKS[x.block], `${fw.name}/${x.l}: okänd byggsten "${x.block}"`);
  }

  const config = F.generatorConfig(fw.id);
  const values = { ...config.example };
  const prompt = tidy(config.build(values));

  for (const field of config.fields.filter((f) => f.required)) {
    check(values[field.id], `${fw.name}: exemplet saknar obligatoriskt fält ${field.id}`);
  }
  for (const bad of ["undefined", "null", "[object"]) {
    check(!prompt.includes(bad), `${fw.name}: prompten innehåller "${bad}"`);
  }
  check(prompt.length > 80, `${fw.name}: prompten är misstänkt kort`);

  // Bara uppgiften ifylld ska också fungera
  const minimal = {};
  config.fields.forEach((f) => (minimal[f.id] = f.required ? "X" : f.default ?? (f.type === "checkbox" ? false : "")));
  const minimalPrompt = tidy(config.build(minimal));
  check(minimalPrompt.startsWith("Uppgift: X") || minimalPrompt.includes(": X"), `${fw.name}: minimal prompt saknar uppgiften`);
}

// 3. Teknikerna
for (const t of F.TECHNIQUES) {
  const prompt = tidy(t.build({ ...t.example }));
  for (const field of t.fields.filter((f) => f.required)) {
    check(t.example[field.id], `${t.name}: exemplet saknar obligatoriskt fält ${field.id}`);
  }
  for (const bad of ["undefined", "null", "[object"]) {
    check(!prompt.includes(bad), `${t.name}: prompten innehåller "${bad}"`);
  }
  for (const key of Object.keys(t.example)) {
    check(t.fields.some((f) => f.id === key), `${t.name}: exemplet har okänt fält ${key}`);
  }
}

// 3b. Modellprompterna
for (const m of F.MODELS) {
  const config = F.generatorConfig(m.id);
  check(config.kind === "modell", `${m.name}: fel typ ${config.kind}`);
  check(config.sources.length > 0 && config.sources.every(Boolean), `${m.name}: saknar eller har okänd källa`);
  check(config.tips.length >= 3, `${m.name}: för få tips`);
  const prompt = tidy(m.build({ ...m.example }));
  for (const bad of ["undefined", "null", "[object"]) {
    check(!prompt.includes(bad), `${m.name}: prompten innehåller "${bad}"`);
  }
  for (const field of m.fields.filter((f) => f.required)) {
    check(m.example[field.id], `${m.name}: exemplet saknar obligatoriskt fält ${field.id}`);
  }
  for (const key of Object.keys(m.example)) {
    check(m.fields.some((f) => f.id === key), `${m.name}: exemplet har okänt fält ${key}`);
  }
}
const claude = F.findById("claude");
const withDocs = claude.build({ ...claude.example, docs: "LÅNGT UNDERLAG", pasted: true });
check(withDocs.indexOf("LÅNGT UNDERLAG") < withDocs.indexOf("<uppgift>"), "Claude: underlaget ska stå före uppgiften");
check(!/tänk steg för steg/i.test(withDocs), "Claude: ska inte be om steg-för-steg-tänkande");
const gpt = F.findById("gpt");
const gptLong = gpt.build({ ...gpt.example, context: "KONTEXT" });
check(gptLong.indexOf(gpt.example.task) < gptLong.indexOf("KONTEXT") && gptLong.lastIndexOf(gpt.example.task) > gptLong.indexOf("KONTEXT"), "GPT: uppgiften ska stå både före och efter kontexten");
check(!/steg för steg/.test(gpt.build({ ...gpt.example, modelType: "reasoning" })), "GPT resonerande: ska inte be om steg för steg");
check(/steg för steg/.test(gpt.build({ ...gpt.example, modelType: "classic" })), "GPT-4.1: ska be om steg för steg");
const gem = F.findById("gemini");
const gemPrompt = gem.build({ ...gem.example, context: "UNDERLAG", prefix: "Svar:" });
check(gemPrompt.indexOf("UNDERLAG") < gemPrompt.indexOf("<uppgift>") && gemPrompt.trim().endsWith("Svar:"), "Gemini: underlag före uppgift, prefix sist");
const cot = F.findById("cot");
check(!/<tankar>/.test(cot.build({ ...cot.example, tags: true })), "CoT: nya modeller ska inte få <tankar>-taggar");
const prompt = F.generatorConfig("prompt");
check(!F.lacksTask(F.findById("prompt")), "PROMPT: Purpose ska bära uppgiften");
check(prompt.build(prompt.example).includes("Minska bias:"), "PROMPT: R ska vara Reduce bias");

// 4. Specialfall
const gbg = F.generatorConfig("goteborg");
const gbgPrompt = gbg.build({ ...gbg.example, "t-osaker": true });
check(gbgPrompt.includes("Ditta ska du göra:"), "GÖTEBORG: rubrikerna är inte på göteborgska");
check(gbgPrompt.includes("Vet du inte? Säj't då"), "GÖTEBORG: tekniktexten är inte på göteborgska");

const marcus = F.generatorConfig("marcus");
const marcusPrompt = marcus.build({ ...marcus.example, "t-fragor": true });
check(marcusPrompt.split("Ställ frågor om något är oklart").length === 2, "MARCUS: frågeraden dubbleras");
check(marcus.fields[0].id === "extra-uppgift", "MARCUS: saknar uppgift men får inget extra fält");

const risen = F.generatorConfig("risen");
check(risen.build(risen.example).startsWith("Agera som "), "RISEN: rollen formateras inte som 'Agera som …'");

// Rapport
const missing = F.FRAMEWORKS.filter(F.lacksTask).map((f) => f.name);
console.log(`Akronymer: ${F.FRAMEWORKS.length}, tekniker: ${F.TECHNIQUES.length}, modeller: ${F.MODELS.length}`);
console.log(`Saknar uppgift (får extra fält): ${missing.join(", ")}`);
console.log("\n----- Exempel: RISEN -----\n" + tidy(risen.build(risen.example)));
console.log("\n----- Exempel: GÖTEBORG -----\n" + tidy(gbg.build(gbg.example)));
console.log(failures ? `\n${failures} FEL` : "\nALLA TESTER OK");
process.exit(failures ? 1 : 0);
