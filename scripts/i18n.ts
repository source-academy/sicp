// Translation workflow helper: tracks which XML source files have a
// translation, whether it is still in sync with the source, and whether the
// translated markup is structurally intact.
//
//   yarn i18n status [lang]           per-file state + summary (default lang: uk)
//   yarn i18n next [lang] [count]     next untranslated/stale files, in book order
//   yarn i18n check [lang] [files..]  structural validation (all translated files by default)
//   yarn i18n stamp [lang] <files..>  record the current source hash as "translated against"
//   yarn i18n merge [lang]            build <source>_<lang>/ = source tree + translated overlay
//
// Layout (see i18n/README.md):
//   i18n/<lang>/<source>/...          translated copies of <source>/... (same relative paths)
//   i18n/<lang>/manifest.json         source hash each translation was stamped against
//
// <source> is the XML tree being translated, xml_py by default; override with
// I18N_SOURCE=xml.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

import { DOMParser } from "xmldom";

const repoRoot = path.resolve(import.meta.dirname, "..");
const source = process.env.I18N_SOURCE?.trim() || "xml_py";

// source: hash of the English file the translation was checked against;
// commit: HEAD when stamped, so `git diff <commit> -- <file>` shows what changed since.
type Manifest = Record<string, { source: string; commit?: string | undefined }>;

// ---------------------------------------------------------------- files

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".xml")) out.push(full);
  }
  return out;
}

// "chapter1/section2/subsection10.xml" sorts after "...subsection9.xml"
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}

// book order: contents.ent lists the chapters; front/back matter lives in others/
function sourceFiles(): string[] {
  const dir = path.join(repoRoot, source);
  return walk(dir)
    .map(f => path.relative(dir, f))
    .sort(naturalCompare);
}

const hash = (file: string): string =>
  crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex")
    .slice(0, 16);

const langDir = (lang: string) => path.join(repoRoot, "i18n", lang);
const translatedPath = (lang: string, rel: string) =>
  path.join(langDir(lang), source, rel);
const sourcePath = (rel: string) => path.join(repoRoot, source, rel);
const manifestPath = (lang: string) =>
  path.join(langDir(lang), "manifest.json");
const manifestKey = (rel: string) => `${source}/${rel}`;

function readManifest(lang: string): Manifest {
  try {
    return JSON.parse(fs.readFileSync(manifestPath(lang), "utf8"));
  } catch {
    return {};
  }
}

function writeManifest(lang: string, manifest: Manifest): void {
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => naturalCompare(a, b))
  );
  fs.mkdirSync(langDir(lang), { recursive: true });
  fs.writeFileSync(manifestPath(lang), JSON.stringify(sorted, null, 2) + "\n");
}

type State = "todo" | "draft" | "stale" | "done";

// todo:  no translated file
// draft: translated file exists but was never stamped (translation in progress)
// stale: stamped, but the English source changed since
// done:  stamped and source unchanged
function stateOf(lang: string, rel: string, manifest: Manifest): State {
  if (!fs.existsSync(translatedPath(lang, rel))) return "todo";
  const stamped = manifest[manifestKey(rel)];
  if (!stamped) return "draft";
  return stamped.source === hash(sourcePath(rel)) ? "done" : "stale";
}

// ---------------------------------------------------------------- structural check

// Text under these elements is code, identifiers, cross-reference keys or
// bibliography data: it must survive translation byte for byte.
const PROTECTED = new Set([
  "SNIPPET",
  "SCHEMEINLINE",
  "PYTHONINLINE",
  "JAVASCRIPTINLINE",
  "LATEX",
  "LATEXINLINE",
  "LABEL",
  "REF",
  "REQUIRES",
  "EXAMPLE",
  "EXPECTED",
  "USE",
  "DECLARATION",
  "METAPHRASE",
  "REFERENCE"
]);

type XNode = {
  nodeType: number;
  nodeName: string;
  nodeValue: string | null;
  childNodes: ArrayLike<XNode>;
  attributes?: ArrayLike<{ name: string; value: string }>;
};

// Skeleton = flat token list: every element open/close (with attributes) and
// the exact text of protected regions. Prose text is deliberately absent.
function skeleton(node: XNode, protectedCtx: boolean, out: string[]): void {
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i] as XNode;
    if (child.nodeType === 1) {
      const attrs = Array.from(child.attributes ?? [])
        .map(a => `${a.name}=${JSON.stringify(a.value)}`)
        .sort()
        .join(" ");
      out.push(`<${child.nodeName}${attrs ? " " + attrs : ""}>`);
      skeleton(child, protectedCtx || PROTECTED.has(child.nodeName), out);
      out.push(`</${child.nodeName}>`);
    } else if (child.nodeType === 3 || child.nodeType === 4) {
      if (protectedCtx) {
        const text = (child.nodeValue ?? "").trim();
        if (text) out.push(`T:${text}`);
      }
    }
  }
}

// Prose text nodes (outside protected regions) with their math and entity
// noise removed; used for the "did you forget to translate this?" heuristic
// and to make sure $math$ is carried over unchanged.
function proseTexts(node: XNode, protectedCtx: boolean, out: string[]): void {
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i] as XNode;
    if (child.nodeType === 1) {
      // <ORDER> is a sort key, and <NAME NAME=...>-style ids never are prose
      if (child.nodeName === "ORDER") continue;
      proseTexts(child, protectedCtx || PROTECTED.has(child.nodeName), out);
    } else if (
      (child.nodeType === 3 || child.nodeType === 4) &&
      !protectedCtx
    ) {
      out.push(child.nodeValue ?? "");
    }
  }
}

function parse(file: string): { root: XNode | null; errors: string[] } {
  const errors: string[] = [];
  const text = fs.readFileSync(file, "utf8");
  const doc = new DOMParser({
    errorHandler: {
      warning: () => {},
      error: (m: string) => errors.push(String(m).split("\n")[0] ?? m),
      fatalError: (m: string) => errors.push(String(m).split("\n")[0] ?? m)
    }
  }).parseFromString(`<ROOT>${text}</ROOT>`, "text/xml");
  const root = doc?.documentElement as unknown as XNode | null;
  return { root: errors.length ? null : root, errors };
}

const counts = (tokens: string[]): Map<string, number> => {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
};

const preview = (s: string) => (s.length > 90 ? s.slice(0, 90) + "…" : s);

const mathSegments = (texts: string[]): string[] =>
  texts.flatMap(t => t.match(/\$[^$]*\$/g) ?? []);

const CYRILLIC = /[Ѐ-ӿ]/;

type CheckResult = { errors: string[]; warnings: string[] };

function checkFile(lang: string, rel: string): CheckResult {
  const result: CheckResult = { errors: [], warnings: [] };
  const src = parse(sourcePath(rel));
  const dst = parse(translatedPath(lang, rel));
  if (!src.root) {
    result.errors.push(`source does not parse: ${src.errors[0]}`);
    return result;
  }
  if (!dst.root) {
    result.errors.push(`not well-formed XML: ${dst.errors[0]}`);
    return result;
  }

  const a0: string[] = [];
  const b0: string[] = [];
  skeleton(src.root, false, a0);
  skeleton(dst.root, false, b0);

  // <APOS/> is a typographic apostrophe, not structure: English uses it for
  // possessives ('s) that Ukrainian does not have, and in Cyrillic words a
  // typed U+2019 is preferred (see the style guide). So it is ignored here.
  const isApos = (t: string) => t === "<APOS>" || t === "</APOS>";
  const a = a0.filter(t => !isApos(t));
  const b = b0.filter(t => !isApos(t));

  // 1. exact skeleton match?
  const firstDiff = a.findIndex((t, i) => t !== b[i]);
  if (firstDiff !== -1 || a.length !== b.length) {
    // 2. same tokens in a different order is tolerable (Ukrainian word order
    //    can force inline markup to move); a changed multiset is not
    const ca = counts(a);
    const cb = counts(b);
    const problems: string[] = [];
    for (const [t, n] of ca) {
      const m = cb.get(t) ?? 0;
      if (m < n) problems.push(`missing ${n - m}× ${preview(t)}`);
    }
    for (const [t, n] of cb) {
      const m = ca.get(t) ?? 0;
      if (m < n) problems.push(`extra ${n - m}× ${preview(t)}`);
    }
    if (problems.length) {
      result.errors.push(
        `markup/protected text differs from source (${problems.length} token kinds):\n      ` +
          problems.slice(0, 8).join("\n      ") +
          (problems.length > 8 ? `\n      … +${problems.length - 8} more` : "")
      );
    } else {
      const i = firstDiff === -1 ? Math.min(a.length, b.length) : firstDiff;
      result.warnings.push(
        `markup order differs from source at token ${i} (source ${preview(a[i] ?? "end")} / translation ${preview(b[i] ?? "end")}); fine if inline markup moved for word order`
      );
    }
  }

  // 3. math must be carried over verbatim
  const ta: string[] = [];
  const tb: string[] = [];
  proseTexts(src.root, false, ta);
  proseTexts(dst.root, false, tb);
  const ma = counts(mathSegments(ta));
  const mb = counts(mathSegments(tb));
  const mathProblems: string[] = [];
  for (const [t, n] of ma)
    if ((mb.get(t) ?? 0) < n) mathProblems.push(`missing ${preview(t)}`);
  for (const [t, n] of mb)
    if ((ma.get(t) ?? 0) < n) mathProblems.push(`extra ${preview(t)}`);
  if (mathProblems.length)
    result.errors.push(`math differs: ${mathProblems.slice(0, 5).join("; ")}`);

  // 4. untranslated prose: several Latin words, no Cyrillic at all
  const untranslated = tb.filter(t => {
    const bare = t.replace(/\$[^$]*\$/g, " ");
    const words = bare.match(/[A-Za-z]{2,}/g) ?? [];
    return words.length >= 4 && !CYRILLIC.test(bare);
  });
  if (untranslated.length)
    result.warnings.push(
      `${untranslated.length} prose text node(s) look untranslated, e.g. "${preview(untranslated[0]!.replace(/\s+/g, " ").trim())}"`
    );

  return result;
}

// ---------------------------------------------------------------- commands

function cmdStatus(lang: string): void {
  const manifest = readManifest(lang);
  const tally: Record<State, number> = { todo: 0, draft: 0, stale: 0, done: 0 };
  const lines: Record<State, string[]> = {
    todo: [],
    draft: [],
    stale: [],
    done: []
  };
  const rels = sourceFiles();
  for (const rel of rels) {
    const s = stateOf(lang, rel, manifest);
    tally[s]++;
    lines[s].push(rel);
  }
  for (const s of ["stale", "draft"] as const)
    if (lines[s].length) {
      console.log(`${s.toUpperCase()}:`);
      for (const rel of lines[s]) {
        const commit = manifest[manifestKey(rel)]?.commit;
        const how =
          s === "stale" && commit
            ? `   git diff ${commit} -- ${source}/${rel}`
            : "";
        console.log(`  ${rel}${how}`);
      }
    }
  const known = new Set(rels);
  const orphans = walk(path.join(langDir(lang), source))
    .map(f => path.relative(path.join(langDir(lang), source), f))
    .filter(rel => !known.has(rel));
  if (orphans.length) {
    console.log("ORPHANS (translated file whose source no longer exists):");
    for (const rel of orphans) console.log(`  ${rel}`);
  }
  const total = rels.length;
  const pct = ((100 * tally.done) / total).toFixed(1);
  console.log(
    `\n${lang} / ${source}: ${tally.done}/${total} done (${pct}%), ` +
      `${tally.stale} stale, ${tally.draft} draft, ${tally.todo} todo`
  );
}

function cmdNext(lang: string, count: number): void {
  const manifest = readManifest(lang);
  const pending = sourceFiles()
    .map(rel => ({ rel, state: stateOf(lang, rel, manifest) }))
    .filter(x => x.state !== "done")
    // stale first: cheapest to bring back in sync and otherwise they rot
    .sort((x, y) => Number(y.state === "stale") - Number(x.state === "stale"));
  for (const { rel, state } of pending.slice(0, count)) {
    const lines = fs.readFileSync(sourcePath(rel), "utf8").split("\n").length;
    console.log(
      `${state.padEnd(6)} ${String(lines).padStart(5)} lines  ${rel}`
    );
  }
  if (!pending.length) console.log("everything is translated and in sync");
}

function cmdCheck(lang: string, files: string[]): boolean {
  const known = new Set(sourceFiles());
  const targets = files.length
    ? files.map(f => normalize(f, lang))
    : sourceFiles().filter(rel => fs.existsSync(translatedPath(lang, rel)));
  let failed = 0;
  for (const rel of targets) {
    if (!known.has(rel)) {
      console.log(`✗ ${rel}\n    not a ${source} source file`);
      failed++;
      continue;
    }
    if (!fs.existsSync(translatedPath(lang, rel))) {
      console.log(
        `✗ ${rel}\n    no translation at ${path.relative(repoRoot, translatedPath(lang, rel))}`
      );
      failed++;
      continue;
    }
    const { errors, warnings } = checkFile(lang, rel);
    const mark = errors.length ? "✗" : warnings.length ? "!" : "✓";
    if (errors.length || warnings.length) console.log(`${mark} ${rel}`);
    for (const e of errors) console.log(`    error: ${e}`);
    for (const w of warnings) console.log(`    warning: ${w}`);
    if (errors.length) failed++;
  }
  console.log(`\nchecked ${targets.length} file(s), ${failed} with errors`);
  return failed === 0;
}

// Accept "xml_py/chapter1/section1/subsection1.xml", the i18n path, or the bare relative path.
function normalize(arg: string, lang: string): string {
  const rel = path.relative(repoRoot, path.resolve(arg));
  for (const prefix of [`i18n/${lang}/${source}/`, `${source}/`]) {
    if (rel.startsWith(prefix)) return rel.slice(prefix.length);
  }
  return arg;
}

function cmdStamp(lang: string, files: string[]): boolean {
  if (!files.length) {
    console.error("stamp: give at least one file");
    return false;
  }
  const manifest = readManifest(lang);
  let ok = true;
  for (const arg of files) {
    const rel = normalize(arg, lang);
    if (
      !fs.existsSync(sourcePath(rel)) ||
      !fs.existsSync(translatedPath(lang, rel))
    ) {
      console.error(`stamp: ${rel}: source or translation missing`);
      ok = false;
      continue;
    }
    const { errors } = checkFile(lang, rel);
    if (errors.length) {
      console.error(
        `stamp: ${rel}: refusing, check has errors (run \`yarn i18n check ${rel}\`)`
      );
      ok = false;
      continue;
    }
    manifest[manifestKey(rel)] = {
      source: hash(sourcePath(rel)),
      commit: headCommit()
    };
    console.log(`stamped ${rel}`);
  }
  writeManifest(lang, manifest);
  return ok;
}

function headCommit(): string | undefined {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: repoRoot
    })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

function cmdMerge(lang: string): void {
  const out = path.join(repoRoot, `${source}_${lang}`);
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(path.join(repoRoot, source), out, { recursive: true });
  let n = 0;
  for (const f of walk(path.join(langDir(lang), source))) {
    const rel = path.relative(path.join(langDir(lang), source), f);
    fs.mkdirSync(path.dirname(path.join(out, rel)), { recursive: true });
    fs.copyFileSync(f, path.join(out, rel));
    n++;
  }
  console.log(
    `${path.relative(repoRoot, out)}/: ${source} with ${n} translated file(s) overlaid`
  );
}

// ---------------------------------------------------------------- main

function main(): number {
  const [cmd] = process.argv.slice(2);
  const rest = process.argv.slice(3);
  const hasLang =
    rest[0] !== undefined && /^[a-z]{2}(-[A-Za-z]+)?$/.test(rest[0]);
  const lang = hasLang ? rest[0]! : "uk";
  const args = hasLang ? rest.slice(1) : rest;
  switch (cmd) {
    case "status":
      cmdStatus(lang);
      return 0;
    case "next":
      cmdNext(lang, Number(args[0]) || 10);
      return 0;
    case "check":
      return cmdCheck(lang, args) ? 0 : 1;
    case "stamp":
      return cmdStamp(lang, args) ? 0 : 1;
    case "merge":
      cmdMerge(lang);
      return 0;
    default:
      console.error(
        "usage: yarn i18n <status|next|check|stamp|merge> [lang] [args]"
      );
      return 2;
  }
}

process.exit(main());
