# Ukrainian style guide

## Voice

- Written for students; clear and precise, not chatty. Keep the authors' first-person
  plural ("ми", "нашу програму") and their occasional dry humour where it survives translation.
- Address the reader as "ви" (lowercase).
- Prefer natural Ukrainian syntax over calques. Rework the sentence rather than mirror the
  English word order. Avoid Russianisms and surzhyk.
- Keep the meaning exact; do not add, drop, or "improve" content. If the English seems
  wrong, translate it faithfully and leave a note in your reply, not in the file.

## What stays as it is

- All code: `SNIPPET`, `*INLINE`, identifiers, program output, and the comments inside
  code (code is byte-for-byte protected by `yarn i18n check`).
- Labels, `REF`/`LABEL` names, `REQUIRES`, `EXAMPLE`, `EXPECTED`, attributes.
- `$math$` and `LATEX`/`LATEXINLINE`.
- `REFERENCE` (bibliography) entries. `CITATION` text stays as printed in the bibliography
  ("Stoy 1977").
- Proper names of people in prose are transliterated and declined (Абельсон, Суссман, Алісса П. Гакер, Луїс Різонер,
  Єва Лу Атор, Бен Бітдідл), always the same way; the names of the book's recurring characters are
  fixed here. Authors cited in references keep the original spelling (Sagade 2015). Titles of books and papers stay in the original.

## What gets translated

- Prose in `TEXT`, `NAME`, `CAPTION`, `FOOTNOTE`, `EXERCISE`, `SOLUTION`, `LI`, `TD`, etc.
- Both branches of `SPLITINLINE` and `SPLIT`: the `SCHEME` prose (comparison edition) as
  well as the `PYTHON` prose.
- `INDEX` / `SUBINDEX` / `SEE` / `SEEALSO` terms. Translate the words; keep `USE`,
  `DECLARATION`, `PYTHONINLINE` inside them. Keep `ORDER` as is for now (open decision).

## Terminology

- Use `glossary.md`. Do not invent a second translation for a term that is already
  listed. If you need a new term, pick one, use it consistently, and add it to the
  glossary in the same change.
- When a term is introduced with `<EM>`, give the Ukrainian term in `<EM>` and the
  English in parentheses right after it on that first introduction, e.g.
  `<EM>замикання</EM> (closure)`. Later uses: Ukrainian only.
- Established English words that Ukrainian programmers use as-is (bug, callback, ...) stay
  English only if the glossary says so.

## Typography

- Guillemets «…» for quotation marks in prose. The `<QUOTE>` tag is left in place; do not
  type quote characters yourself where the source uses the tag.
- Dash: use the existing `<EMDASH/>`/`<ENDASH/>` tags where the source does; a spaced
  em dash in text you introduce is not needed.
- Apostrophe in words (м’ясо, п’ять): type U+2019 `’` directly. Do not use `<APOS/>` inside Cyrillic
  words (it renders as a straight `'`), and do not add one to mirror an English possessive: `check`
  ignores `<APOS/>`, so Ukrainian text needs none. (Open decision; see `i18n/README.md`.)
- Non-breaking space before short words at line end is handled by the build, do not add.
- Numbers: keep them as in the source (decimal point) so prose stays consistent with the code
  and outputs shown next to it.

## Mechanics

- Keep the file's structure line for line where possible (same line breaks and
  indentation around tags), so the English and Ukrainian files diff side by side.
- Never wrap, merge, split, reorder or delete elements. Inline markup may move inside a
  sentence when word order demands it; `check` will warn, which is fine.
- Entities stay as entities: `&amp;`, `&lt;`, `&gt;`.
- Do not translate `<SPACE/>`-style empty tags and do not remove them.
