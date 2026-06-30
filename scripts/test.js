// Runs the generated example programs and checks them against their
// "<comment> expected: ..." trailers.
//
// Edition selection mirrors javascript/editions.ts: with SICP_EDITION=py this
// tests the Python edition's programs (programs_py, "#" comments) by running
// them through py-slang (the @sourceacademy/py-slang npm package), or through
// CPython (scripts/run_py.py, which uses the `sicp` package) when PY_SLANG=0;
// otherwise it tests the JavaScript edition's programs (programs_js, "//"
// comments) through the js-slang interpreter, exactly as before.

// This file is an ES module (package.json has "type": "module"), so recreate
// `require` for the CommonJS dependencies it uses.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { exit } = require("process");
const { readdirSync, readFileSync, statSync } = require("fs");
const { execFileSync } = require("child_process");
const Path = require("path");

// Minimal ANSI colorizer, so this script does not depend on the `colors`
// package (which need not be installed for the Python edition).
const colors = {
  red: s => `\x1b[31m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`
};

const EDITION = (process.env.SICP_EDITION || "js").trim().toLowerCase();
if (EDITION !== "js" && EDITION !== "py") {
  console.error(
    colors.red(
      `Unknown SICP_EDITION "${process.env.SICP_EDITION}" (expected "js" or "py")`
    )
  );
  exit(-1);
}
const IS_PYTHON = EDITION === "py";

// js-slang is only needed to interpret the JavaScript edition; load it lazily
// so the Python edition does not depend on it.
let createContext, runInContext, parseError, sourceLanguages;
if (!IS_PYTHON) {
  ({ createContext, runInContext, parseError } = require("js-slang"));
  ({ sourceLanguages } = require("js-slang/dist/constants"));
}

const USE_CPYTHON = process.env.PY_SLANG === "0";

// py-slang is only needed for the Python edition when not using the CPython
// fallback. By default it comes from the @sourceacademy/py-slang npm package;
// set PY_SLANG to a path (e.g. ../py-slang/dist/index.cjs) to use a local
// build instead, or PY_SLANG=0 to fall back to CPython.
let pyRunCode;
if (IS_PYTHON && !USE_CPYTHON) {
  const PY_SLANG_SOURCE = process.env.PY_SLANG
    ? Path.resolve(process.env.PY_SLANG)
    : "@sourceacademy/py-slang";
  ({ runCode: pyRunCode } = require(PY_SLANG_SOURCE));
}

const DEFAULT_SOURCE_FOLDER = IS_PYTHON ? "programs_py" : "programs_js";
const DEFAULT_CHAPTER = 4;
const DEFAULT_VARIANT = "default";

// The generator writes the expected output as a trailing comment, using the
// edition's line-comment marker: "// expected: ..." (JS) or "# expected: ..."
// (Python). See javascript/processingFunctions/processSnippetJs.js.
const EXPECTED_RE = IS_PYTHON
  ? /#\s*expected:\s*(.*)/
  : /\/\/\s*expected:\s*(.*)/;

// Keep CPython runner as a fallback. Set PY_SLANG=0 to force CPython.
const PYTHON = process.env.PYTHON || "python3";
const PY_RUNNER = Path.resolve("scripts", "run_py.py");

let count_pass = 0;
let count_fail = 0;

/**
 * Returns true iff the given chapter and variant combination is supported.
 * https://github.com/source-academy/js-slang/blob/master/src/repl/repl.ts#L61-L76
 */
function validChapterVariant(chapter, variant) {
  if (variant === "interpreter") {
    return true;
  }
  if (variant === "substituter" && (chapter === 1 || chapter === 2)) {
    return true;
  }
  for (const lang of sourceLanguages) {
    if (lang.chapter === chapter && lang.variant === variant) return true;
  }
  return false;
}

/**
 * Source Interpreter
 * https://github.com/source-academy/js-slang/blob/master/src/repl/repl.ts#L95-L110
 */
async function interpret(code, chapter, variant) {
  if (!validChapterVariant(chapter, variant)) {
    console.log(
      colors.red(
        `The chapter and variant combination (${chapter}, ${variant}) provided is unsupported.`
      )
    );
  }

  const context = createContext(chapter, variant, undefined, undefined);

  const options = {
    scheduler: "preemptive",
    executionMethod: ["interpreter", "non-det"].includes(variant)
      ? "interpreter"
      : "native",
    variant: variant,
    useSubst: variant === "substituter"
  };

  return runInContext(code, context, options).then(preludeResult => {
    if (["finished", "suspended-non-det"].includes(preludeResult.status)) {
      return preludeResult.value;
    } else {
      throw context.errors;
    }
  });
}

async function test(test_name, chapter, variant, source_code, expected_output) {
  console.log(`${test_name}, expecting: ${expected_output}`);

  try {
    const test_output = await interpret(source_code, chapter, variant);

    let pass = false;
    if (typeof test_output != "string") {
      try {
        const expected = JSON.stringify(eval(expected_output));
        const output = JSON.stringify(test_output);
        pass = expected == output;
      } catch (error) {
        pass = false;
      }
    } else {
      pass =
        expected_output == test_output || expected_output == `'${test_output}'`;
    }

    if (pass) {
      console.log(colors.green("PASS"));
      count_pass++;
    } else {
      console.log(colors.red(`FAIL:`));
      console.log(typeof test_output);
      for (let line of `${test_output}`.split("\n")) {
        console.log(colors.red(`> ${line}`));
      }
      console.log(colors.red(`---`));
      for (let line of expected_output.split("\n")) {
        console.log(colors.red(`< ${line}`));
      }
      count_fail++;
    }
  } catch (error) {
    try {
      console.log(colors.red(parseError(error)));
      count_fail++;
    } catch {
      console.error(colors.red(error));
      exit(-1);
    }
  }
}

/**
 * Normalise a result/expected string for structural comparison.
 * Accepts JS literals (true/false/null/undefined) as well as Python ones.
 */
function toStruct(text) {
  const jsTokens = { true: "true", false: "false", null: "null", undefined: "null" };
  const pyNorm = text.replace(/\b(True|False|None)\b/g, m =>
    ({ True: "true", False: "false", None: "null" }[m])
  );
  for (const candidate of [text, pyNorm]) {
    try { return JSON.parse(candidate); } catch {}
  }
  return text;
}

function structEq(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => structEq(v, b[i]));
  }
  if (typeof a === "number" && typeof b === "number") {
    return a === b || Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b), 1);
  }
  return a === b;
}

/**
 * Runs a Python-edition program through py-slang and checks it against the
 * expected output. Falls back to CPython (run_py.py) when USE_CPYTHON is set.
 */
async function test_python(file_path, expected_output) {
  console.log(`${file_path}, expecting: ${expected_output}`);

  if (USE_CPYTHON) {
    // Original CPython path.
    try {
      execFileSync(PYTHON, [PY_RUNNER, file_path, expected_output], {
        stdio: "pipe", encoding: "utf-8"
      });
      console.log(colors.green("PASS"));
      count_pass++;
    } catch (error) {
      console.log(colors.red("FAIL:"));
      const detail = `${error.stdout || ""}${error.stderr || ""}`.trimEnd();
      for (const line of detail.split("\n")) {
        if (line.length) console.log(colors.red(`> ${line}`));
      }
      count_fail++;
    }
    return;
  }

  // py-slang path.
  try {
    const source_code = readFileSync(file_path, { encoding: "utf-8" });
    const raw = await pyRunCode(source_code, 4);

    // Take the last non-empty line of stdout (mirrors run_py.py's behaviour).
    const lastLine = raw.trimEnd().split("\n").at(-1)?.trim() ?? "";

    const ok =
      structEq(toStruct(lastLine), toStruct(expected_output)) ||
      lastLine === expected_output.trim() ||
      `'${lastLine}'` === expected_output.trim();

    if (ok) {
      console.log(colors.green("PASS"));
      count_pass++;
    } else {
      console.log(colors.red("FAIL:"));
      console.log(colors.red(`> got:      ${lastLine}`));
      console.log(colors.red(`> expected: ${expected_output}`));
      count_fail++;
    }
  } catch (error) {
    console.log(colors.red("FAIL (error):"));
    console.log(colors.red(`> ${error.message ?? error}`));
    count_fail++;
  }
}

async function test_source(file_path) {
  const source_code = readFileSync(file_path, { encoding: "utf-8" }).trim();

  const lines = source_code.split("\n");

  // find the expected output (trailing "<comment> expected: ..." line)
  let mobj = EXPECTED_RE.exec(lines[lines.length - 1]);
  if (!mobj) {
    return;
  }
  const expected_output = mobj[1];

  if (IS_PYTHON) {
    return test_python(file_path, expected_output);
  }

  // handle chapter and variant
  let chapter = DEFAULT_CHAPTER;
  let variant = DEFAULT_VARIANT;
  if ((mobj = /chapter=\s*(\d+)/.exec(lines[0]))) {
    chapter = parseInt(mobj[1]);
  }
  if ((mobj = /variant=\s*(\S+)/.exec(lines[0]))) {
    variant = mobj[1];
  }

  return await test(file_path, chapter, variant, source_code, expected_output);
}

async function test_root(path) {
  const stat = statSync(path);
  if (stat.isDirectory(path)) {
    for (let sub of readdirSync(path)) {
      await test_root(Path.resolve(path, sub));
    }
  } else if (stat.isFile()) {
    await test_source(Path.relative(".", path));
  }
}

(async () => {
  // Usage: yarn test [source folder]
  const args = process.argv.slice(2);
  let source_folder = DEFAULT_SOURCE_FOLDER;
  if (args.length > 0) {
    source_folder = Path.resolve(...args);
  }

  await test_root(source_folder);

  console.log(`${count_pass + count_fail} test cases completed.`);
  console.log(`${count_pass} passed, ${count_fail} failed`);
})();
