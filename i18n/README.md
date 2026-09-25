# Translations

Translations of the book's XML sources. Today: Ukrainian (`uk`), translated from the
SICPy sources (`xml_py/`). The same layout works for other languages and for `xml/`
(`I18N_SOURCE=xml`).

## Layout

```
i18n/uk/style-guide.md      how to translate (tone, what stays English, markup rules)
i18n/uk/glossary.md         agreed terminology; extend it as you go
i18n/uk/manifest.json       per file: hash of the English source it was translated against
i18n/uk/xml_py/...          translated files, same relative paths as xml_py/
```

A translated file is a full copy of its English source with the prose translated and
everything else untouched. Files without a translation simply don't exist yet;
`yarn i18n merge` fills the gaps from English.

## Workflow

```bash
yarn i18n status          # todo / draft / stale / done per file, plus a summary
yarn i18n next 5          # what to translate next (stale files first, then book order)
# ... translate a file into i18n/uk/xml_py/<same path> ...
yarn i18n check uk <path> # structural validation (also runs inside stamp)
yarn i18n stamp uk <path> # mark it done against the current English source
yarn i18n merge           # build xml_py_uk/ = xml_py + translations (gitignored)
```

With Claude Code, `/translate-uk` (or "translate the next file") does the translate →
check → stamp loop following the style guide and glossary.

States: **todo** no file; **draft** file exists, not stamped; **done** stamped and the
English source is unchanged; **stale** the English changed after stamping. `status` prints
the `git diff <commit> -- <file>` that shows exactly what changed; update the translation
(usually a few paragraphs), then stamp again.

## What `check` enforces

Errors (block `stamp`):

- Same XML elements and attributes as the source (a dropped `<EM>` or `<INDEX>` is caught).
- Code and keys unchanged: text inside `SNIPPET`, `*INLINE`, `LATEX*`, `LABEL`, `REF`,
  `REQUIRES`, `EXAMPLE`, `EXPECTED`, `USE`, `DECLARATION`, `METAPHRASE`, `REFERENCE`.
- `$math$` carried over verbatim.

Warnings: markup in a different order (fine if inline tags moved for Ukrainian word
order) and prose that has no Cyrillic at all (probably forgotten).

`check` proves the markup is intact, not that the translation is good. Review the
prose, especially against the glossary.

## Building the Ukrainian edition

```bash
yarn i18n merge                                   # xml_py_uk/ = English + translations (rerun after every change)
export SICP_EDITION=py SICP_LOCALE=uk
yarn json                                         # json_py_uk/   (what the frontend fetches)
yarn split                                        # html_split_py_uk/ (comparison edition)
yarn md                                           # md_py_uk/sicpy_uk.md
yarn programs                                     # programs_py_uk/
yarn do pdf                                       # latex_pdf_py_uk/sicpy_uk.pdf
```

`SICP_LOCALE=uk` (with `SICP_EDITION=py`) makes `javascript/editions.ts` read `xml_py_uk/`
and write `*_py_uk` directories and `sicpy_uk.*` artifacts; English builds are unchanged.
Files without a translation appear in English. Fixed labels the generators add (Вправа,
Рисунок, Розв’язок, Розділ) live in `javascript/uiStrings.ts`. The PDF preamble for
Cyrillic (T2A, `tempora`, babel `ukrainian`) is in `javascript/latexContent.js`.

## Not done yet

- Publishing: `.github/workflows/deploy-uk.yml` builds the web comparison edition and the PDF
  and deploys them, with the landing page `i18n/uk/site/index.html`, to this repository's own
  GitHub Pages site. It is independent of upstream's `deploy-pages.yml`, which is skipped on
  forks. Setup: Settings > Pages > Source "GitHub Actions" (plus a custom domain if wanted);
  the repo variable `UK_PUBLISHED_CHAPTERS` (default 3) limits the published chapters. Not
  published: the JSON for the interactive frontend (`json_py_uk/`; ids and links are prefixed
  `/sicpy_uk/`), the Markdown and the programs zip.
- PDF: running heads other than "Розділ" (contents, foreword, preface, ...) are still
  English; Cyrillic `і` is extracted as Latin `i` from the PDF text layer (search/copy);
  back-of-book index sorting assumes Latin collation (`<ORDER>` keys, `scripts/makeindex.ist`).
- Apostrophe and quote handling (`<APOS/>`, `<QUOTE>`) for Ukrainian typography.
