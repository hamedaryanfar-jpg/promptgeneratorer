# Promptgeneratorer

Ifyllnadsmallar för promptakronymer och prompttekniker. Fyll i rutorna och få en färdig prompt som visas och kopieras direkt.

**Sidan:** https://marcusjobb.github.io/ai-promptgeneratorer/

## Innehåll

| Del | Vad |
|---|---|
| Etablerade ramverk | RTF, RISEN, CREATE, CO-STAR, PROMPT, MARCUS |
| Lekfulla akronymer | KORV, POOP, SILLY, FART, BANAN, LASAGNE, TACOS, PANDA, KATT, HAMBURGER, SPAGHETTI, YOLO, BÖRK, KÖTTBULLAR, UNICORN, GÖTEBORG (på göteborgska) |
| Tekniker | Zero-Shot, One-Shot, Few-Shot, Chain of Thought, Tree of Thought, ReAct, PAL, DECOMP |
| Bästa praxis | Generell prompt enligt Anthropics råd |
| Jämförelsetabell | Visar att alla akronymer består av samma byggstenar |

## Hur det fungerar

- `docs/assets/frameworks.js` – **all data**: byggstenar, akronymer och tekniker. En akronym är en lista bokstäver som var och en pekar på en byggsten.
- `docs/assets/generator.js` – gemensam motor som ritar formuläret, bygger prompten och kopierar den.
- `docs/generator.html?id=risen` – en sida för alla generatorer; `id` väljer vilken.

### Lägga till en akronym

Lägg till ett objekt i `FRAMEWORKS` i `frameworks.js`:

```js
{
  id: "abc", name: "ABC", group: "lekfull", tagline: "En kort beskrivning.",
  letters: [
    { l: "A", word: "Ask", block: "uppgift" },
    { l: "B", word: "Background", block: "sammanhang" },
    { l: "C", word: "Constraints", block: "krav" }
  ]
}
```

Den dyker upp på startsidan, i jämförelsetabellen och får en egen generator automatiskt.
Saknar akronymen en bokstav för uppgiften läggs ett uppgiftsfält till av sig själv.

## Tester

```powershell
node tests/test_frameworks.js
```

Kontrollerar bland annat att varje akronyms bokstäver stämmer med namnet, att alla mallar ger en hel prompt och att GÖTEBORG pratar göteborgska.

## Källor

- [Teach and Learn AI – Acronyms for AI prompts](https://teachandlearnai.com/uncategorized/acronyms-for-ai-prompts/) (RISEN, CREATE, CO-STAR)
- [Queen's University Library – Prompt](https://guides.library.queensu.ca/ai/prompt) (PROMPT)
- [Anthropic – Best practices for prompt engineering](https://claude.com/resources/articles/best-practices-for-prompt-engineering)
- Forskningsartiklar för teknikerna länkas på teknikersidan.
