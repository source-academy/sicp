// Temporary i18n translation linter (delete before commit).
//   tsx i18n-lint.ts <src> <dst>            report protected-token diffs
//   tsx i18n-lint.ts --fix-apos <src> <dst> rewrite <APOS/> to match the source count
import fs from "node:fs";
import { DOMParser } from "xmldom";

const PROTECTED = new Set([
  "SNIPPET","SCHEMEINLINE","PYTHONINLINE","JAVASCRIPTINLINE","LATEX","LATEXINLINE",
  "LABEL","REF","REQUIRES","EXAMPLE","EXPECTED","USE","DECLARATION","METAPHRASE","REFERENCE"
]);
type XNode = any;

function skel(node: XNode, protectedCtx: boolean, out: string[]): void {
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i] as XNode;
    if (child.nodeType === 1) {
      const attrs = Array.from(child.attributes ?? [])
        .map((a: any) => `${a.name}=${JSON.stringify(a.value)}`).sort().join(" ");
      out.push(`<${child.nodeName}${attrs ? " " + attrs : ""}>`);
      skel(child, protectedCtx || PROTECTED.has(child.nodeName), out);
      out.push(`</${child.nodeName}>`);
    } else if (child.nodeType === 3 || child.nodeType === 4) {
      if (protectedCtx) {
        const text = (child.nodeValue ?? "").trim();
        if (text) out.push(`T:${text}`);
      }
    }
  }
}

function load(file: string): XNode | null {
  const doc = new DOMParser({
    errorHandler: { warning: () => {}, error: () => {}, fatalError: () => {} }
  }).parseFromString(`<ROOT>${fs.readFileSync(file, "utf8")}</ROOT>`, "text/xml");
  return doc?.documentElement as unknown as XNode;
}

function tokens(file: string): string[] {
  const root = load(file);
  const out: string[] = [];
  if (root) skel(root, false, out);
  return out;
}

function multiset(t: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of t) m.set(x, (m.get(x) ?? 0) + 1);
  return m;
}

const APOS = "’";

function fixApos(src: string, dstPath: string): void {
  const srcText = fs.readFileSync(src, "utf8");
  const want = (srcText.match(/<APOS\/>/g) ?? []).length;
  let s = fs.readFileSync(dstPath, "utf8");
  // normalise every form back to a plain typographic apostrophe first
  s = s.replace(/<APOS\/>/g, APOS).replace(/<APOS><\/APOS>/g, APOS);
  let have = (s.match(new RegExp(APOS, "g")) ?? []).length;
  if (have < want) {
    console.log(`  ! translation has ${have} apostrophes, source needs ${want} — add ${want - have} in prose`);
    return;
  }
  if (have === want) {
    // promote every apostrophe so the tag count matches
    s = s.replace(new RegExp(APOS, "g"), "<APOS/>");
  } else {
    // promote exactly `want` of them, preferring apostrophes inside words
    const lines = s.split("\n");
    let promoted = 0;
    const inWord = /[А-Яа-яЇїІіЄєҐґ]’[А-Яа-яЇїІіЄєҐґ]/;
    // pass 1: in-word apostrophes outside SNIPPET blocks
    for (let i = 0; i < lines.length && promoted < want; i++) {
      if (inWord.test(lines[i]) && !/<SNIPPET|<\/PYTHON>|<SCHEME>/.test(lines[i])) {
        let line = lines[i];
        while (promoted < want && inWord.test(line)) {
          line = line.replace(inWord, m => m[0] + "<APOS/>" + m[2]);
          promoted++;
        }
        lines[i] = line;
      }
    }
    // pass 2: any remaining apostrophe outside SNIPPET
    for (let i = 0; i < lines.length && promoted < want; i++) {
      if (lines[i].includes(APOS) && !/<SNIPPET/.test(lines[i])) {
        lines[i] = lines[i].replace(APOS, "<APOS/>");
        promoted++;
      }
    }
    s = lines.join("\n");
  }
  fs.writeFileSync(dstPath, s);
  const now = (s.match(/<APOS\/>/g) ?? []).length;
  console.log(`  APOS: source ${want}, written ${now}`);
}

const args = process.argv.slice(2);
if (args[0] === "--fix-apos") {
  fixApos(args[1]!, args[2]!);
  process.exit(0);
}
const [src, dst] = args;
const a = multiset(tokens(src!)), b = multiset(tokens(dst!));
const keys = [...new Set([...a.keys(), ...b.keys()])].sort();
let bad = 0;
for (const k of keys) {
  const x = a.get(k) ?? 0, y = b.get(k) ?? 0;
  if (x !== y) {
    bad++;
    console.log(`  SRC=${x} UK=${y}  ${k.length > 100 ? k.slice(0, 100) + "…" : k}`);
  }
}
console.log(bad ? `  ${bad} token kind(s) differ` : "  protected tokens match");
