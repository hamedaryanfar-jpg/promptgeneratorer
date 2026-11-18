/*
 * Promptakronymer och prompttekniker – all data på ett ställe.
 *
 * Grundidén: alla akronymer består av samma BYGGSTENAR (uppgift, sammanhang,
 * roll, målgrupp, ton, format …). En akronym är bara ett urval och en ordning.
 * Därför beskrivs varje bokstav som { l: bokstav, word: ordet, block: byggsten }.
 *
 * Filen innehåller bara data och rena funktioner (ingen DOM),
 * så att den kan testas med Node – se tests/test_frameworks.js.
 */

// ---------------------------------------------------------------------------
//  BYGGSTENAR
//  label   = namn på byggstenen        heading = rubrik i den färdiga prompten
//  list    = "bullets" / "numbered" – gör om rader till en lista
//  render  = egen formatering (används för roll)
//  after   = rad som läggs till efter innehållet
// ---------------------------------------------------------------------------
const BLOCKS = {
  uppgift: {
    label: "Uppgift", heading: "Uppgift", rows: 2,
    hint: "Vad ska AI:n göra? Börja med ett verb.",
    placeholder: "t.ex. Förklara vad ett API är och ge ett vardagligt exempel."
  },
  syfte: {
    label: "Syfte", heading: "Syfte",
    hint: "Varför behöver du svaret? Vad ska det användas till?",
    placeholder: "t.ex. Studenterna ska förstå begreppet inför första labben."
  },
  sammanhang: {
    label: "Sammanhang", heading: "Bakgrund", rows: 3,
    hint: "Bakgrund och situation som AI:n behöver känna till.",
    placeholder: "t.ex. Kursen är en introduktion till AI-verktyg för vuxna studenter."
  },
  underlag: {
    label: "Underlag", heading: "Underlag", rows: 5,
    hint: "Fakta, data, text eller kod som AI:n ska utgå från.",
    placeholder: "Klistra in text, data eller kod här."
  },
  scenario: {
    label: "Scenario", heading: "Scenario",
    hint: "Placera uppgiften i en situation.",
    placeholder: "t.ex. Det är första lektionen och studenterna är nervösa."
  },
  roll: {
    label: "Roll", heading: "Roll",
    hint: "Vem ska AI:n agera som? Håll det enkelt – skriv t.ex. ”en pedagogisk lärare”.",
    placeholder: "t.ex. en pedagogisk lärare",
    render: (v) => `Agera som ${v.replace(/\.$/, "")}.`
  },
  malgrupp: {
    label: "Målgrupp", heading: "Målgrupp",
    hint: "Vem är svaret till?",
    placeholder: "t.ex. Vuxna studenter utan programmeringsbakgrund"
  },
  niva: {
    label: "Nivå", heading: "Nivå",
    hint: "Nybörjare, expert, barn, professor …",
    placeholder: "t.ex. Nybörjare"
  },
  ton: {
    label: "Ton och stil", heading: "Ton och stil",
    hint: "Formell, avslappnad, rolig, saklig …",
    placeholder: "t.ex. Varm, enkel och lite lekfull"
  },
  format: {
    label: "Format", heading: "Format",
    hint: "Tabell, lista, löpande text, kod … Beskriv vad du vill ha, inte vad du vill slippa.",
    placeholder: "t.ex. Löpande text följd av en punktlista"
  },
  struktur: {
    label: "Struktur", heading: "Följ den här strukturen", rows: 3, list: "numbered",
    hint: "Rubriker eller disposition som svaret ska följa. En per rad.",
    placeholder: "t.ex.\nVad är ett API?\nEn liknelse\nExempel från vardagen"
  },
  leverans: {
    label: "Leverans", heading: "Svaret ska innehålla", rows: 3, list: "bullets",
    hint: "Vad ska resultatet innehålla? En sak per rad.",
    placeholder: "t.ex.\nEn förklaring på max 150 ord\nTre vardagsexempel"
  },
  omfang: {
    label: "Omfång", heading: "Omfång",
    hint: "Hur långt, brett eller djupt ska svaret vara?",
    placeholder: "t.ex. Kort – max 200 ord"
  },
  krav: {
    label: "Krav", heading: "Krav", rows: 3, list: "bullets",
    hint: "Ordantal, regler, perspektiv … En per rad.",
    placeholder: "t.ex.\nMax 150 ord\nSkriv på svenska"
  },
  begransningar: {
    label: "Begränsningar", heading: "Undvik", rows: 3, list: "bullets",
    hint: "Vad ska AI:n inte göra eller undvika? En per rad.",
    placeholder: "t.ex.\nIngen kod\nInga förkortningar utan förklaring"
  },
  exempel: {
    label: "Exempel", heading: "Exempel på det jag vill ha", rows: 4,
    hint: "Visa hur det ska se ut. Ett exempel säger mer än en lång beskrivning.",
    placeholder: "Klistra in eller skriv ett exempel."
  },
  steg: {
    label: "Arbetssteg", heading: "Arbeta i de här stegen", rows: 3, list: "numbered",
    hint: "I vilka steg ska AI:n arbeta? Ett per rad.",
    placeholder: "t.ex.\nFörklara begreppet\nGe en liknelse\nGe tre exempel"
  },
  tankesatt: {
    label: "Tänkesätt", heading: "Tänk så här",
    hint: "Steg för steg, kreativt, analytiskt, kritiskt …",
    placeholder: "t.ex. Steg för steg, och utgå från vad en nybörjare redan kan"
  },
  granskning: {
    label: "Granskning", heading: "Granska innan du svarar",
    hint: "Vad ska AI:n dubbelkolla innan den svarar?",
    placeholder: "t.ex. Att en person utan teknisk bakgrund förstår varje mening"
  },
  forstaelse: {
    label: "Förståelse", heading: "Det här är viktigt att du förstår",
    hint: "Vad måste AI:n ha förstått för att lyckas? Den uppmanas också fråga om något är oklart.",
    placeholder: "t.ex. Studenterna är nybörjare – förklaringen får inte förutsätta förkunskaper.",
    after: "Ställ frågor om något är oklart innan du börjar."
  }
};

// Byggstenarna grupperade i de kolumner som visas i jämförelsetabellen.
const CORE = [
  { name: "Uppgift",        blocks: ["uppgift"] },
  { name: "Syfte",          blocks: ["syfte"] },
  { name: "Sammanhang",     blocks: ["sammanhang", "underlag", "scenario", "forstaelse"] },
  { name: "Roll",           blocks: ["roll"] },
  { name: "Målgrupp",       blocks: ["malgrupp", "niva"] },
  { name: "Ton",            blocks: ["ton"] },
  { name: "Format",         blocks: ["format", "struktur", "leverans"] },
  { name: "Omfång & krav",  blocks: ["omfang", "krav"] },
  { name: "Begränsningar",  blocks: ["begransningar"] },
  { name: "Exempel",        blocks: ["exempel"] },
  { name: "Tänkesätt",      blocks: ["tankesatt", "steg"] },
  { name: "Granskning",     blocks: ["granskning"] }
];

// Samma exempelscenario för alla akronymer – då syns det tydligt att de bygger samma prompt.
const EXAMPLE = {
  uppgift: "Förklara vad ett API är och ge ett vardagligt exempel.",
  syfte: "Studenterna ska förstå begreppet inför första labben, där de hämtar väderdata från ett öppet API.",
  sammanhang: "Kursen är en introduktion till AI-verktyg. Studenterna är vuxna och har aldrig programmerat.",
  underlag: "Labben: hämta dagens temperatur för Göteborg från SMHI:s öppna API och visa den.",
  scenario: "Det är första lektionen och studenterna är lite nervösa inför tekniska begrepp.",
  roll: "en pedagogisk lärare som gillar liknelser",
  malgrupp: "Vuxna studenter utan programmeringsbakgrund",
  niva: "Nybörjare",
  ton: "Varm, enkel och lite lekfull",
  format: "Löpande text med en liknelse, följd av en punktlista med tre exempel",
  struktur: "Vad är ett API?\nEn liknelse\nTre exempel från vardagen",
  leverans: "En förklaring på max 150 ord\nEn liknelse\nTre vardagsexempel",
  omfang: "Kort – max 200 ord",
  krav: "Inga tekniska termer utan förklaring\nSkriv på svenska",
  begransningar: "Ingen kod\nInga förkortningar utan förklaring",
  exempel: "Ett API är som en servitör på en restaurang: du beställer, servitören går till köket och kommer tillbaka med maten.",
  steg: "Förklara begreppet\nGe en liknelse\nGe tre vardagsexempel",
  tankesatt: "Steg för steg, och utgå från vad en nybörjare redan kan",
  granskning: "Att en person utan teknisk bakgrund förstår varje mening",
  forstaelse: "Studenterna är nybörjare – förklaringen får inte förutsätta några förkunskaper."
};

// Tekniker som kan läggas till i alla akronymgeneratorer (kryssrutor längst ner).
const ADDONS = [
  { id: "t-cot",    label: "Tänk steg för steg innan du svarar (Chain of Thought)",
    line: "Tänk steg för steg innan du svarar." },
  { id: "t-tot",    label: "Utforska flera lösningar och välj den bästa (Tree of Thought)",
    line: "Utforska minst tre olika lösningar, jämför dem och välj den bästa. Förklara kort varför." },
  { id: "t-fragor", label: "Ställ frågor om något är oklart innan du börjar",
    line: "Ställ frågor om något är oklart innan du börjar." },
  { id: "t-osaker", label: "Säg till om du är osäker i stället för att gissa", default: true,
    line: "Om du saknar information eller är osäker, säg det i stället för att gissa." }
];

const SOURCES = {
  teachandlearn: { name: "Teach and Learn AI", url: "https://teachandlearnai.com/uncategorized/acronyms-for-ai-prompts/" },
  queens: { name: "Queen's University Library", url: "https://guides.library.queensu.ca/ai/prompt" },
  anthropic: { name: "Anthropic: Prompt engineering", url: "https://claude.com/resources/articles/best-practices-for-prompt-engineering" }
};

// ---------------------------------------------------------------------------
//  AKRONYMER
//  Bokstäver med `note` i stället för `block` är arbetssätt, inte en del av
//  prompten. De visas som tips på generatorsidan.
// ---------------------------------------------------------------------------
const FRAMEWORKS = [
  // ---------------- Etablerade ----------------
  {
    id: "rtf", name: "RTF", group: "etablerad",
    tagline: "Det enklaste ramverket. Bra att börja med.",
    letters: [
      { l: "R", word: "Role", block: "roll" },
      { l: "T", word: "Task", block: "uppgift" },
      { l: "F", word: "Format", block: "format" }
    ]
  },
  {
    id: "risen", name: "RISEN", group: "etablerad", source: "teachandlearn",
    tagline: "Roll, instruktioner och tydliga steg mot ett mål.",
    letters: [
      { l: "R", word: "Role", block: "roll" },
      { l: "I", word: "Instructions", block: "uppgift", hint: "Beskriv handlingen – vad ska AI:n göra?" },
      { l: "S", word: "Steps", block: "steg", hint: "De exakta stegen, som du skulle förklara dem för en människa. Ett per rad." },
      { l: "E", word: "End goal", block: "syfte", heading: "Mål", hint: "Vad är målet med uppgiften?" },
      { l: "N", word: "Narrowing", block: "omfang", heading: "Avgränsning", hint: "Begränsningar, t.ex. längd eller antal stycken." }
    ]
  },
  {
    id: "create", name: "CREATE", group: "etablerad", source: "teachandlearn",
    tagline: "Med exempel – och med uppföljning i samtalet.",
    letters: [
      { l: "C", word: "Character", block: "roll" },
      { l: "R", word: "Request", block: "uppgift" },
      { l: "E", word: "Examples", block: "exempel" },
      { l: "A", word: "Adjustments", block: "krav", heading: "Justeringar", hint: "Justeringar eller tillägg – en per rad." },
      { l: "T", word: "Type of output", block: "format" },
      { l: "E", word: "Extras", note: "Fortsätt samtalet: följ upp svaret, ställ följdfrågor och be om justeringar." }
    ]
  },
  {
    id: "co-star", name: "CO-STAR", group: "etablerad", source: "teachandlearn",
    tagline: "Skiljer på stil och ton. Populärt för texter.",
    letters: [
      { l: "C", word: "Context", block: "sammanhang" },
      { l: "O", word: "Objective", block: "uppgift" },
      { l: "S", word: "Style", block: "ton", heading: "Stil", hint: "Skrivstil, t.ex. som en populärvetenskaplig artikel.", ex: "Som en kort, populärvetenskaplig text" },
      { l: "T", word: "Tone", block: "ton", heading: "Ton", hint: "Attityd, t.ex. uppmuntrande, saklig, entusiastisk." },
      { l: "A", word: "Audience", block: "malgrupp" },
      { l: "R", word: "Response", block: "format" }
    ]
  },
  {
    id: "prompt", name: "PROMPT", group: "etablerad", source: "queens",
    tagline: "Från ett universitetsbibliotek – med fokus på källor och bias.",
    letters: [
      { l: "P", word: "Persona", block: "roll" },
      { l: "R", word: "Requirements", block: "krav", hint: "Vad ska tas med eller utelämnas, t.ex. vilka typer av källor. Minskar bias. En per rad." },
      { l: "O", word: "Output", block: "format" },
      { l: "M", word: "Model", block: "exempel", hint: "Ett exempel som visar vad du vill ha." },
      { l: "P", word: "Purpose", block: "sammanhang", hint: "Dina behov, bakgrund och sammanhang." },
      { l: "T", word: "Test", note: "Testa och förfina: läs svaret, justera prompten och kör igen." }
    ]
  },
  {
    id: "marcus", name: "MARCUS", group: "etablerad", source: "egen",
    tagline: "Kursens egen. Börjar i motivet och slutar i omfånget.",
    letters: [
      { l: "M", word: "Motive", block: "syfte", heading: "Motiv", hint: "Varför behövs svaret?" },
      { l: "A", word: "Audience", block: "malgrupp" },
      { l: "R", word: "Rules", block: "krav", heading: "Regler" },
      { l: "C", word: "Context", block: "sammanhang" },
      { l: "U", word: "Understanding", block: "forstaelse" },
      { l: "S", word: "Scope", block: "omfang" }
    ]
  },

  // ---------------- Lekfulla ----------------
  {
    id: "korv", name: "KORV", emoji: "🌭", group: "lekfull",
    tagline: "Ett smakrikt ramverk.",
    letters: [
      { l: "K", word: "Klarhet", block: "uppgift", hint: "Säg exakt vad du vill ha, utan fluff." },
      { l: "O", word: "Omfång", block: "omfang", hint: "Hur långt, djupt eller detaljerat?" },
      { l: "R", word: "Roll", block: "roll", hint: "Expert, komiker, lärare, robot …" },
      { l: "V", word: "Villkor", block: "krav", heading: "Villkor", hint: "Format, regler, stil, begränsningar. En per rad." }
    ]
  },
  {
    id: "poop", name: "POOP", emoji: "💩", group: "lekfull",
    tagline: "A Surprisingly Useful Prompt Method.",
    letters: [
      { l: "P", word: "Purpose", block: "syfte" },
      { l: "O", word: "Outline", block: "struktur" },
      { l: "O", word: "Output-Style", block: "ton", hint: "Ton, stil, nivå, humor, formell eller avslappnad." },
      { l: "P", word: "Parameters", block: "krav", hint: "Ordantal, exempel, format, perspektiv. En per rad." }
    ]
  },
  {
    id: "silly", name: "SILLY", emoji: "🤪", group: "lekfull",
    tagline: "A Creative Prompt Booster.",
    letters: [
      { l: "S", word: "Scenario", block: "scenario" },
      { l: "I", word: "Instructions", block: "uppgift", hint: "Tydliga instruktioner – vad ska göras?" },
      { l: "L", word: "Limits", block: "begransningar" },
      { l: "L", word: "Level", block: "niva" },
      { l: "Y", word: "Yield", block: "leverans" }
    ]
  },
  {
    id: "fart", name: "FART", emoji: "🚀", group: "lekfull",
    tagline: "Fast And Reliable Thinking.",
    letters: [
      { l: "F", word: "Frame the task", block: "uppgift" },
      { l: "A", word: "Add constraints", block: "krav", hint: "Regler, format, stil, längd, ton. En per rad." },
      { l: "R", word: "Reasoning mode", block: "tankesatt" },
      { l: "T", word: "Target output", block: "leverans" }
    ]
  },
  {
    id: "banan", name: "BANAN", emoji: "🍌", group: "lekfull",
    tagline: "Because A Nice AI Needs …",
    letters: [
      { l: "B", word: "Background", block: "sammanhang" },
      { l: "A", word: "Aim", block: "syfte", heading: "Mål" },
      { l: "N", word: "Nuance", block: "ton" },
      { l: "A", word: "Actions", block: "uppgift", hint: "Vad ska AI:n göra, exakt?" },
      { l: "N", word: "Narrowing", block: "omfang" }
    ]
  },
  {
    id: "lasagne", name: "LASAGNE", emoji: "🧀", group: "lekfull",
    tagline: "Layered AI Structure And Guidance, Nicely Executed.",
    letters: [
      { l: "L", word: "Layers", block: "steg", hint: "Dela upp uppgiften i steg eller sektioner. Ett per rad." },
      { l: "A", word: "Audience", block: "malgrupp" },
      { l: "S", word: "Style", block: "ton" },
      { l: "A", word: "Add examples", block: "exempel" },
      { l: "G", word: "Guardrails", block: "begransningar" },
      { l: "N", word: "Needed details", block: "underlag" },
      { l: "E", word: "Expected output", block: "leverans" }
    ]
  },
  {
    id: "tacos", name: "TACOS", emoji: "🌮", group: "lekfull",
    tagline: "Totally Awesome Commands for Optimal Synthesis.",
    letters: [
      { l: "T", word: "Target", block: "uppgift", hint: "Vad vill du ha? Säg det kristallklart." },
      { l: "A", word: "Angle", block: "ton", hint: "Vinkel, ton eller stil." },
      { l: "C", word: "Context", block: "sammanhang" },
      { l: "O", word: "Output format", block: "format" },
      { l: "S", word: "Steps", block: "steg" }
    ]
  },
  {
    id: "panda", name: "PANDA", emoji: "🐼", group: "lekfull",
    tagline: "Prompting AI Nicely Delivers Awesomeness.",
    letters: [
      { l: "P", word: "Purpose", block: "syfte" },
      { l: "A", word: "Assets", block: "underlag", hint: "All info, data och alla exempel du ger AI:n." },
      { l: "N", word: "Nuance", block: "ton" },
      { l: "D", word: "Directions", block: "krav", heading: "Instruktioner", hint: "Instruktioner, regler, begränsningar. En per rad." },
      { l: "A", word: "Answer type", block: "leverans" }
    ]
  },
  {
    id: "katt", name: "KATT", emoji: "🐱", group: "lekfull",
    tagline: "Klarhet, Anvisningar, Ton, Tydliga krav.",
    letters: [
      { l: "K", word: "Klarhet", block: "uppgift", hint: "Säg exakt vad du vill ha." },
      { l: "A", word: "Anvisningar", block: "steg", heading: "Anvisningar", hint: "Tydliga instruktioner, en per rad." },
      { l: "T", word: "Ton", block: "ton", hint: "Rolig, formell, episk, barnslig …" },
      { l: "T", word: "Tydliga krav", block: "krav", hint: "Ordantal, format, exempel, nivå. En per rad." }
    ]
  },
  {
    id: "hamburger", name: "HAMBURGER", emoji: "🍔", group: "lekfull",
    tagline: "Highly Accurate Model Behavior Using Really Good Explicit Rules.",
    letters: [
      { l: "H", word: "How-to", block: "uppgift" },
      { l: "A", word: "Audience", block: "malgrupp" },
      { l: "M", word: "Mode", block: "ton" },
      { l: "B", word: "Boundaries", block: "begransningar" },
      { l: "U", word: "Useful context", block: "sammanhang" },
      { l: "R", word: "Requirements", block: "krav" },
      { l: "G", word: "Guidance", block: "steg" },
      { l: "E", word: "Expected output", block: "leverans" },
      { l: "R", word: "Review", block: "granskning" }
    ]
  },
  {
    id: "spaghetti", name: "SPAGHETTI", emoji: "🍝", group: "lekfull",
    tagline: "Structured Prompting Approach Generating Helpful, Engaging, Thorough, Tasty Instructions.",
    letters: [
      { l: "S", word: "Scope", block: "omfang" },
      { l: "P", word: "Purpose", block: "syfte" },
      { l: "A", word: "Angle", block: "ton", hint: "Ton och perspektiv." },
      { l: "G", word: "Given info", block: "sammanhang" },
      { l: "H", word: "How to think", block: "tankesatt" },
      { l: "E", word: "Examples", block: "exempel" },
      { l: "T", word: "Terms", block: "krav" },
      { l: "T", word: "Target output", block: "leverans" },
      { l: "I", word: "Intent", block: "syfte", heading: "Det här vill jag uppnå", hint: "Vad vill du uppnå med svaret? (Ja, det liknar Purpose …)", ex: "Att studenterna känner sig trygga inför labben" }
    ]
  },
  {
    id: "yolo", name: "YOLO", emoji: "🕶️", group: "lekfull",
    tagline: "Your Output, Logical & Organized.",
    letters: [
      { l: "Y", word: "Your goal", block: "uppgift" },
      { l: "O", word: "Outline", block: "struktur" },
      { l: "L", word: "Limits", block: "krav", hint: "Regler, format, begränsningar. En per rad." },
      { l: "O", word: "Output style", block: "ton" }
    ]
  },
  {
    id: "bork", name: "BÖRK", emoji: "🐶", group: "lekfull",
    tagline: "Begränsningar, Önskemål, Ramar, Kontext.",
    letters: [
      { l: "B", word: "Begränsningar", block: "begransningar" },
      { l: "Ö", word: "Önskemål", block: "ton", heading: "Önskemål", hint: "Ton, stil, känsla." },
      { l: "R", word: "Ramar", block: "format", heading: "Ramar", hint: "Format, struktur, ordantal." },
      { l: "K", word: "Kontext", block: "sammanhang" }
    ]
  },
  {
    id: "kottbullar", name: "KÖTTBULLAR", emoji: "🧆", group: "lekfull",
    tagline: "Klarhet, Översikt, Tydlighet, Ton, Begränsningar, Underlag, Längd, Leverans, Arbetssteg, Resultat.",
    letters: [
      { l: "K", word: "Klarhet", block: "uppgift", hint: "Säg exakt vad du vill." },
      { l: "Ö", word: "Översikt", block: "sammanhang", heading: "Översikt", hint: "En snabb bakgrund." },
      { l: "T", word: "Tydlighet", block: "krav", heading: "Var specifik", hint: "Detaljer som gör uppgiften specifik. En per rad." },
      { l: "T", word: "Ton", block: "ton" },
      { l: "B", word: "Begränsningar", block: "begransningar", hint: "Regler och sådant som ska undvikas. En per rad." },
      { l: "U", word: "Underlag", block: "underlag" },
      { l: "L", word: "Längd", block: "omfang", heading: "Längd" },
      { l: "L", word: "Leverans", block: "leverans" },
      { l: "A", word: "Arbetssteg", block: "tankesatt", hint: "Hur ska AI:n tänka?" },
      { l: "R", word: "Resultat", block: "format", heading: "Resultatets form" }
    ]
  },
  {
    id: "unicorn", name: "UNICORN", emoji: "🦄", group: "lekfull",
    tagline: "Useful, Nuanced Instructions Creating Outstanding, Reliable Narratives.",
    letters: [
      { l: "U", word: "Useful context", block: "sammanhang" },
      { l: "N", word: "Nuance", block: "ton" },
      { l: "I", word: "Instructions", block: "steg" },
      { l: "C", word: "Constraints", block: "krav" },
      { l: "O", word: "Output type", block: "leverans" },
      { l: "R", word: "Reasoning", block: "tankesatt" },
      { l: "N", word: "Needed details", block: "underlag" }
    ]
  },
  {
    // Hela den här sidan är på göteborgska – även den färdiga prompten.
    id: "goteborg", name: "GÖTEBORG", emoji: "🌧️", group: "lekfull",
    tagline: "Guidade Önskemål, Tydliga Exempel, Begränsningar, Output, Ramar, Gôtt.",
    lead: "Nämen tjena! Fyll i rutorna så fixar vi en prompt som ä gô å glad. Kalasbra, asså.",
    texts: {
      submit: "Fixa prompten, dä!",
      example: "Visa ett exempel, va",
      reset: "Börja om",
      back: "← Tebax till alla",
      result: "Din prompt, varsågo",
      missing: "Du glömde: ",
      copied: "✓ Kopierat! Klistra in'et i din AI nu.",
      copyFailed: "Kunde inte kopiera – texten ä markerad, tryck Ctrl+C."
    },
    addons: {
      "t-cot":    { label: "Tänk steg för steg innan du svarar – ta't lugnt",
                    line: "Tänk steg för steg innan du svarar, ta't lugnt." },
      "t-tot":    { label: "Kläm fram några olika lösningar å välj den gôttaste",
                    line: "Kom på minst tre olika lösningar, jämför dom å välj den gôttaste. Säj kort varför." },
      "t-fragor": { label: "Fråga om nått ä oklart",
                    line: "Ä nått oklart? Fråga innan du sätter igång." },
      "t-osaker": { label: "Säj till om'u inte vet, istället för å hitta på",
                    line: "Vet du inte? Säj't då – hitta inte på nått." }
    },
    letters: [
      { l: "G", word: "Guidade instruktioner", block: "uppgift", heading: "Ditta ska du göra",
        hint: "Säg va AI:n ska göra. Kort å gôtt, inget mög.",
        ph: "t.ex. Förklara va ett API ä å ge ett exempel från vardagen." },
      { l: "Ö", word: "Önskad ton", block: "ton", heading: "Tonen, lissom",
        hint: "Ska'e låta som en gubbe på Feskekôrka, en torr professor eller nått helt annat?",
        ph: "t.ex. Gôtt å glatt, med lite göteborgsvits" },
      { l: "T", word: "Tydliga exempel", block: "exempel", heading: "Så här ska'e se ut",
        hint: "Visa hur'e ska se ut. Ett exempel säger mer än tusen ord, dä.",
        ph: "Klistra in ett exempel här, va." },
      { l: "E", word: "Exakta krav", block: "krav", heading: "Kraven, asså",
        hint: "Hur många ord? Vilken nivå? Rabbla upp, en grej per rad.",
        ph: "t.ex.\nMax 150 ord\nSkriv på svenska, inte på stockholmska" },
      { l: "B", word: "Begränsningar", block: "begransningar", heading: "Det här gör'u inte",
        hint: "Va ska AI:n hålla tassarna borta från? En grej per rad.",
        ph: "t.ex.\nIngen kod\nInget krångel" },
      { l: "O", word: "Outputformat", block: "format", heading: "Formatet",
        hint: "Lista, tabell eller löpande text? Säj som'e ä.",
        ph: "t.ex. Kort text å sen en lista" },
      { l: "R", word: "Relevanta detaljer", block: "sammanhang", heading: "Bra å veta",
        hint: "Bakgrund å fakta som AI:n behöver – annars blir'e bara gissningar.",
        ph: "t.ex. Studenterna ä nybörjare å har aldrig programmerat." },
      { l: "G", word: "Gôtt slutresultat", block: "granskning", heading: "Svaret ä gôtt när",
        hint: "När ä svaret riktigt gôtt? Beskriv'et!",
        ph: "t.ex. När en nybörjare fattar allt å drar på smilbanden" }
    ],
    example: {
      uppgift: "Förklara va ett API ä å ge ett exempel från vardagen.",
      ton: "Gôtt å glatt, med lite göteborgsvits",
      exempel: "Ett API ä som en servitör: du beställer, han springer ut i köket å kommer tebax med käket.",
      krav: "Max 150 ord\nInga konstiga ord utan förklaring",
      begransningar: "Ingen kod\nInga förkortningar utan förklaring",
      format: "Kort text å sen en lista med tre exempel",
      sammanhang: "Studenterna ä nybörjare å har aldrig programmerat förut.",
      granskning: "En nybörjare fattar varenda mening å drar på smilbanden minst en gång"
    }
  }
];

// ---------------------------------------------------------------------------
//  TEKNIKER – har egna fält och egna mallar
// ---------------------------------------------------------------------------
const TECHNIQUES = [
  {
    id: "zs", name: "ZS", full: "Zero-Shot",
    tagline: "Bara uppgiften – inga exempel.",
    when: "Enkla, vanliga uppgifter som AI:n redan kan: sammanfatta, översätta, förklara.",
    paper: null,
    fields: [
      { id: "task", type: "textarea", rows: 3, required: true, label: "Uppgift", placeholder: "t.ex. Sammanfatta texten nedan i tre meningar." },
      { id: "input", type: "textarea", rows: 4, label: "Indata (valfritt)", placeholder: "Texten eller frågan som uppgiften gäller." }
    ],
    build: (v) => lines(v.task, v.input ? "\n" + v.input : null),
    example: { task: "Klassificera recensionen nedan som positiv, negativ eller neutral. Svara med ett ord.", input: "Leveransen tog två veckor, men produkten är fantastisk." }
  },
  {
    id: "os", name: "OS", full: "One-Shot",
    tagline: "Ett exempel visar mönstret.",
    when: "När formatet är viktigt och lättare att visa än att beskriva.",
    paper: null,
    fields: [
      { id: "task", type: "textarea", rows: 2, required: true, label: "Uppgift", placeholder: "t.ex. Gör om meningen till en kort rubrik." },
      { id: "exIn", type: "textarea", rows: 2, required: true, label: "Exempel – indata" },
      { id: "exOut", type: "textarea", rows: 2, required: true, label: "Exempel – önskat svar" },
      { id: "input", type: "textarea", rows: 2, required: true, label: "Ny indata som ska lösas" }
    ],
    build: (v) => lines(v.task, "", "Exempel:", `Indata: ${v.exIn}`, `Svar: ${v.exOut}`, "", "Gör nu likadant med:", `Indata: ${v.input}`, "Svar:"),
    example: {
      task: "Gör om meningen till en kort, slagkraftig rubrik.",
      exIn: "Skolan inför ett nytt system där elever kan låna datorer över helgen.",
      exOut: "Nu kan du låna datorn hem",
      input: "Biblioteket förlänger sina öppettider under tentaperioden."
    }
  },
  {
    id: "fs", name: "FS", full: "Few-Shot",
    tagline: "2–5 exempel lär ut mönstret.",
    when: "När ett exempel inte räcker, eller när svaren ska vara väldigt konsekventa.",
    paper: { name: "Brown m.fl. 2020 – Language Models are Few-Shot Learners", url: "https://arxiv.org/abs/2005.14165" },
    fields: [
      { id: "task", type: "textarea", rows: 2, required: true, label: "Uppgift" },
      { id: "examples", type: "textarea", rows: 8, required: true, label: "Exempel",
        hint: "Skriv indata och svar på varsin rad: Indata: … / Svar: … Lämna en tom rad mellan exemplen.",
        placeholder: "Indata: Det var den bästa filmen i år!\nSvar: positiv\n\nIndata: Tråkig och för lång.\nSvar: negativ" },
      { id: "input", type: "textarea", rows: 2, required: true, label: "Ny indata som ska lösas" }
    ],
    build: (v) => {
      const examples = v.examples.split(/\n\s*\n/).map((ex, i) => `Exempel ${i + 1}:\n${ex.trim()}`).join("\n\n");
      return lines(v.task, "", examples, "", "Gör nu likadant med:", `Indata: ${v.input}`, "Svar:");
    },
    example: {
      task: "Klassificera recensionen som positiv, negativ eller neutral.",
      examples: "Indata: Det var den bästa filmen i år!\nSvar: positiv\n\nIndata: Tråkig och alldeles för lång.\nSvar: negativ\n\nIndata: Den var okej, inget speciellt.\nSvar: neutral",
      input: "Skådespelarna var bra men slutet var en besvikelse."
    }
  },
  {
    id: "cot", name: "CoT", full: "Chain of Thought",
    tagline: "Låt AI:n tänka steg för steg innan den svarar.",
    when: "Matte, logik, analys och beslut – allt där ett snabbt svar ofta blir fel.",
    paper: { name: "Wei m.fl. 2022 – Chain-of-Thought Prompting", url: "https://arxiv.org/abs/2201.11903" },
    fields: [
      { id: "problem", type: "textarea", rows: 4, required: true, label: "Problem" },
      { id: "steps", type: "textarea", rows: 3, label: "Guidade steg (valfritt)", hint: "Vill du styra hur AI:n tänker? Ett steg per rad." },
      { id: "tags", type: "checkbox", label: "Skilj tankarna från svaret med <tankar> och <svar>", default: true }
    ],
    build: (v) => lines(
      v.problem, "",
      v.steps ? "Tänk igenom problemet i de här stegen:\n" + v.steps.split("\n").filter(Boolean).map((s, i) => `${i + 1}. ${s.trim()}`).join("\n") : "Tänk steg för steg innan du svarar.",
      v.tags ? "\nSkriv dina tankar inom <tankar></tankar> och det slutliga svaret inom <svar></svar>." : null
    ),
    example: {
      problem: "En klass har 28 elever. 3/7 av dem cyklar till skolan, och hälften av resten åker buss. Hur många går?",
      steps: "Räkna ut hur många som cyklar\nRäkna ut hur många som är kvar\nRäkna ut hur många av dem som åker buss\nRäkna ut hur många som går",
      tags: true
    }
  },
  {
    id: "tot", name: "ToT", full: "Tree of Thought",
    tagline: "Utforska flera tankespår, utvärdera och välj det bästa.",
    when: "Öppna problem med flera möjliga lösningar: planering, design, kreativa idéer.",
    paper: { name: "Yao m.fl. 2023 – Tree of Thoughts", url: "https://arxiv.org/abs/2305.10601" },
    fields: [
      { id: "problem", type: "textarea", rows: 3, required: true, label: "Problem" },
      { id: "branches", type: "select", label: "Antal tankespår", default: "3",
        options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }] },
      { id: "criteria", type: "textarea", rows: 2, label: "Bedöm spåren utifrån", placeholder: "t.ex. kostnad, tid, hur roligt det blir" }
    ],
    build: (v) => lines(
      v.problem, "",
      `Utforska ${v.branches} olika tankespår:`,
      "1. Beskriv varje spår kort.",
      "2. Tänk vidare två steg i varje spår och notera styrkor och svagheter.",
      `3. Utvärdera spåren${v.criteria ? ` utifrån: ${v.criteria}` : ""}.`,
      "4. Välj det bästa spåret, förklara varför och ge ett färdigt förslag."
    ),
    example: { problem: "Planera en temadag om AI för en gymnasieklass med en budget på 2 000 kr.", branches: "3", criteria: "engagemang, kostnad och vad eleverna lär sig" }
  },
  {
    id: "react", name: "ReAct", full: "Reason + Act",
    tagline: "Växla mellan att tänka och att använda verktyg.",
    when: "Uppgifter som kräver fakta utifrån eller beräkningar – bäst med en AI som har verktyg (webbsökning, kod).",
    paper: { name: "Yao m.fl. 2022 – ReAct", url: "https://arxiv.org/abs/2210.03629" },
    fields: [
      { id: "question", type: "textarea", rows: 3, required: true, label: "Fråga eller uppgift" },
      { id: "tools", type: "textarea", rows: 3, label: "Verktyg som får användas", hint: "Ett per rad.", default: "webbsökning\nkalkylator" }
    ],
    build: (v) => lines(
      v.question, "",
      "Lös uppgiften genom att växla mellan:",
      "Tanke: vad behöver jag veta eller göra härnäst?",
      "Handling: använd ett verktyg.",
      "Observation: vad gav verktyget?",
      "Upprepa tills du kan svara, och avsluta med Svar: …",
      v.tools ? "\nVerktyg du får använda:\n" + bullets(v.tools) : null
    ),
    example: { question: "Hur många år är det mellan det år Göteborg grundades och det år Liseberg öppnade?", tools: "webbsökning\nkalkylator" }
  },
  {
    id: "pal", name: "PAL", full: "Program-Aided Language Models",
    tagline: "AI:n skriver kod som räknar ut svaret.",
    when: "Beräkningar, datum, statistik – sådant där språkmodeller räknar fel men kod räknar rätt.",
    paper: { name: "Gao m.fl. 2022 – PAL", url: "https://arxiv.org/abs/2211.10435" },
    fields: [
      { id: "problem", type: "textarea", rows: 4, required: true, label: "Problem" },
      { id: "language", type: "text", label: "Programspråk", default: "Python" }
    ],
    build: (v) => lines(
      v.problem, "",
      `Lös problemet genom att skriva ett ${v.language || "Python"}-program som räknar ut svaret.`,
      "Kommentera koden så att stegen syns. Kör koden om du kan, och skriv sedan svaret."
    ),
    example: { problem: "Om jag sparar 350 kr i månaden med 4 % årlig ränta, ränta på ränta varje månad – hur mycket har jag efter 10 år?", language: "Python" }
  },
  {
    id: "decomp", name: "DECOMP", full: "Decomposed Prompting",
    tagline: "Dela upp en stor uppgift i mindre delar.",
    when: "Stora eller sammansatta uppgifter där en enda prompt blir rörig.",
    paper: { name: "Khot m.fl. 2022 – Decomposed Prompting", url: "https://arxiv.org/abs/2210.02406" },
    fields: [
      { id: "task", type: "textarea", rows: 3, required: true, label: "Stor uppgift" },
      { id: "maxSteps", type: "select", label: "Högst antal delsteg", default: "5",
        options: [{ value: "3", label: "3" }, { value: "5", label: "5" }, { value: "7", label: "7" }] },
      { id: "pause", type: "checkbox", label: "Vänta på mitt OK efter att delstegen är listade", default: true }
    ],
    build: (v) => lines(
      v.task, "",
      `Dela först upp uppgiften i högst ${v.maxSteps} delsteg och lista dem.`,
      v.pause ? "Vänta sedan på mitt OK innan du börjar." : null,
      "Lös ett delsteg i taget och sätt till sist ihop resultatet till en helhet."
    ),
    example: { task: "Skriv en studiehandledning för en kurs om AI-verktyg på 5 veckor.", maxSteps: "5", pause: true }
  }
];

// ---------------------------------------------------------------------------
//  FUNKTIONER
// ---------------------------------------------------------------------------

/** Hämtar en akronym eller teknik med sitt id. */
function findById(id) {
  return FRAMEWORKS.find((f) => f.id === id) ?? TECHNIQUES.find((t) => t.id === id) ?? null;
}

/** Saknar akronymen en bokstav för själva uppgiften? */
function lacksTask(fw) {
  return !fw.letters.some((x) => x.block === "uppgift");
}

/** Vilka kolumner i jämförelsetabellen som akronymen täcker. */
function coverage(fw) {
  const used = new Set(fw.letters.map((x) => x.block).filter(Boolean));
  return CORE.map((c) => c.blocks.some((b) => used.has(b)));
}

/** Gör ett formulär av en akronym: en ruta per bokstav + kryssrutor för tekniker. */
function fieldsFor(fw) {
  const fields = [];

  if (lacksTask(fw)) {
    fields.push({
      id: "extra-uppgift", type: "textarea", rows: 2, required: true,
      label: `+ Uppgift (saknas i ${fw.name})`,
      hint: `${fw.name} har ingen bokstav för själva uppgiften – men AI:n behöver veta vad den ska göra.`,
      placeholder: BLOCKS.uppgift.placeholder
    });
  }

  fw.letters.forEach((x, i) => {
    if (!x.block) return;
    const block = BLOCKS[x.block];
    fields.push({
      id: `l${i}`, type: "textarea", rows: block.rows ?? 2,
      required: x.block === "uppgift" && !fields.some((f) => f.required),
      label: `${x.l} – ${x.word}`,
      hint: `Byggsten: ${block.label}. ${x.hint ?? block.hint}`,
      placeholder: x.ph ?? block.placeholder // x.ph = egen platshållartext, t.ex. på göteborgska
    });
  });

  for (const addon of ADDONS) {
    const own = fw.addons?.[addon.id];
    fields.push({ id: addon.id, type: "checkbox", label: own?.label ?? addon.label, default: addon.default ?? false });
  }
  return fields;
}

/** Bygger den färdiga prompten i akronymens ordning. */
function buildPrompt(fw, v) {
  const parts = [];
  if (v["extra-uppgift"]) parts.push(section(BLOCKS.uppgift, null, v["extra-uppgift"]));

  fw.letters.forEach((x, i) => {
    const value = v[`l${i}`];
    if (x.block && value) parts.push(section(BLOCKS[x.block], x.heading, value));
  });

  const body = parts.join("\n\n");
  const extras = ADDONS
    .filter((a) => v[a.id])
    .map((a) => fw.addons?.[a.id]?.line ?? a.line)
    .filter((line) => !body.includes(line)); // undvik dubbletter (t.ex. MARCUS Understanding)

  return [body, extras.join("\n")].filter(Boolean).join("\n\n");
}

/** Formaterar en byggsten: "Rubrik: värde" eller rubrik + lista på egna rader. */
function section(block, heading, value) {
  if (block.render && !heading) return block.render(value);

  let body = value;
  if (block.list) {
    const rows = value.split("\n").map((r) => r.trim().replace(/^(-|\d+\.)\s*/, "")).filter(Boolean);
    body = rows.map((r, i) => (block.list === "numbered" ? `${i + 1}. ${r}` : `- ${r}`)).join("\n");
  }

  const title = heading ?? block.heading;
  let text = body.includes("\n") ? `${title}:\n${body}` : `${title}: ${body}`;
  if (block.after) text += "\n" + block.after;
  return text;
}

/** Exempelvärden för formuläret – samma scenario i alla akronymer. */
function exampleFor(fw) {
  const source = { ...EXAMPLE, ...fw.example };
  const values = {};
  if (lacksTask(fw)) values["extra-uppgift"] = source.uppgift;
  fw.letters.forEach((x, i) => {
    if (x.block) values[`l${i}`] = x.ex ?? source[x.block]; // x.ex = eget exempel för just den bokstaven
  });
  for (const addon of ADDONS) values[addon.id] = addon.default ?? false;
  return values;
}

/** Allt generatorsidan behöver, oavsett om det är en akronym eller en teknik. */
function generatorConfig(id) {
  const fw = findById(id);
  if (!fw) return null;

  if (fw.fields) {
    return { item: fw, kind: "teknik", fields: fw.fields, build: fw.build, example: fw.example, notes: [] };
  }
  return {
    item: fw, kind: "akronym",
    fields: fieldsFor(fw),
    build: (v) => buildPrompt(fw, v),
    example: exampleFor(fw),
    notes: fw.letters.filter((x) => x.note)
  };
}

// Gör funktionerna tillgängliga för testerna i Node.
if (typeof module !== "undefined") {
  module.exports = { BLOCKS, CORE, EXAMPLE, ADDONS, FRAMEWORKS, TECHNIQUES, SOURCES,
    findById, lacksTask, coverage, fieldsFor, buildPrompt, exampleFor, generatorConfig };
}
