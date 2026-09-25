---
name: translate-uk
description: Translate SICPy XML source files into Ukrainian (i18n/uk/xml_py/...), following the style guide and glossary, validating and stamping each file. Use when asked to translate the book/a chapter/a section/the next file to Ukrainian, or to bring a stale translation back in sync with changed English.
---

# Translate SICPy into Ukrainian

Tooling: `yarn i18n ...` (`scripts/i18n.ts`). Overview: `i18n/README.md`.
If `yarn` is missing, `npx tsx scripts/i18n.ts ...` is equivalent.

## Before the first file of a session

Read `i18n/uk/style-guide.md` and `i18n/uk/glossary.md`. Do not skip: terminology
consistency across ~130 files depends on it.

## Per file

1. **Pick the file.** The one(s) the user named, else `yarn i18n next 5` and take the first.
   Paths are relative to `xml_py/`, e.g. `chapter3/section2/subsection1.xml`.
2. **Read the whole English source** (`xml_py/<path>`). For a stale file, run the
   `git diff <commit> -- xml_py/<path>` that `yarn i18n status` prints, read the existing
   translation, and edit only the changed parts instead of retranslating.
3. **Write the translation** to `i18n/uk/xml_py/<path>` (same relative path, create
   directories as needed). It is the full file: same elements, attributes, code, labels,
   math and line structure; only the prose is in Ukrainian. Both `SCHEME` and `PYTHON`
   prose branches are translated. Details in the style guide.
   - Long files (≳400 lines): write it in consecutive parts (first `Write`, then append
     with `cat >> file <<'EOF'`), translating strictly in order; do not summarize or skip.
4. **Validate:** `yarn i18n check uk <path>`. Fix every error. Look at each warning:
   "looks untranslated" usually means a forgotten paragraph; "markup order" is fine only
   if inline tags really had to move.
5. **Glossary:** add any new term you had to choose to `i18n/uk/glossary.md`, and check the
   file against existing entries.
6. **Stamp:** `yarn i18n stamp uk <path>` (refuses if check has errors).
7. Report briefly: file, anything doubtful in the English or in term choices. Do not
   commit unless asked.

## Rules that matter most

- Never change code, `LABEL`/`REF` names, `REQUIRES`, `EXAMPLE`/`EXPECTED`, `$math$`.
  `check` enforces it; do not work around a failing check by editing the tool or the source.
- Never edit `xml_py/`. If the English has a typo, tell the user.
- Translate faithfully: no additions, omissions, or rewrites of the argument.
- Several files: do them one at a time (translate → check → stamp), so a failure never
  leaves many unchecked drafts.

## Seeing the result

`yarn i18n merge`, then build with `SICP_EDITION=py SICP_LOCALE=uk` (see `i18n/README.md`).

## Many files at once

For a whole chapter, parallel subagents (one per file, all given the style guide and
glossary paths) are appropriate only if the user asks for that; parallel runs
must not edit `glossary.md` concurrently, so have them report new terms and merge them
afterwards.
