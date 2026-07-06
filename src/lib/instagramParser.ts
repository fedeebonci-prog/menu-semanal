import { Ingredient } from "./types";

const BULLET_PATTERN = /^[-•*▪◦]\s*/;
const NUMBERED_PATTERN = /^\d+[.)]\s*/;
const QUANTITY_PATTERN =
  /^(\d+[\d./,]*\s*(g|gr|grs|kg|ml|l|cc|cda|cdas|cdta|cdtas|taza|tazas|unidad|unidades|u|diente|dientes|fetas|latas?|pizca)\b\.?)\s*(de\s+)?/i;

export function parseIngredientsFromCaption(text: string): Ingredient[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidateLines = lines.filter(
    (l) => BULLET_PATTERN.test(l) || NUMBERED_PATTERN.test(l) || QUANTITY_PATTERN.test(l)
  );

  const source = candidateLines.length > 0 ? candidateLines : lines;

  return source
    .map((line) => {
      const clean = line.replace(BULLET_PATTERN, "").replace(NUMBERED_PATTERN, "");
      const match = clean.match(QUANTITY_PATTERN);
      if (match) {
        return {
          quantity: match[1].trim(),
          name: clean.slice(match[0].length).trim(),
        };
      }
      return { quantity: "", name: clean };
    })
    .filter((i) => i.name.length > 0);
}
