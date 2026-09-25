import { getEdition } from "./editions.js";

// Fixed labels the generators add around the book text (the text itself comes
// from the translated XML). English is the default; a translated edition
// (SICP_LOCALE) overrides per key. The LaTeX headings are separate, see
// latexContent.js.
export type UiKey = "exercise" | "figure" | "solution" | "chapter";

const english: Record<UiKey, string> = {
  exercise: "Exercise",
  figure: "Figure",
  solution: "Solution",
  chapter: "Chapter"
};

const translations: Record<string, Record<UiKey, string>> = {
  uk: {
    exercise: "Вправа",
    figure: "Рисунок",
    solution: "Розв’язок",
    chapter: "Розділ"
  }
};

export function ui(key: UiKey): string {
  const locale = getEdition().locale;
  return (locale && translations[locale]?.[key]) || english[key];
}
