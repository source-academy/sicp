const { createContext, runInContext, parseError } = require("js-slang");
const { exit } = require("process");
const { readdirSync, readFileSync, statSync } = require("fs");
const { sourceLanguages } = require("js-slang/dist/constants");
const colors = require("colors/safe");
const Path = require("path");

const DEFAULT_SOURCE_FOLDER = "js_programs";
const DEFAULT_CHAPTER = 4;
const DEFAULT_VARIANT = "default";
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

async function test_source(file_path) {
  const source_code = readFileSync(file_path, { encoding: "utf-8" }).trim();

  const lines = source_code.split("\n");

  // find the expected output
  let mobj = /\/\/ expected:\s*(.*)/.exec(lines[lines.length - 1]);
  if (!mobj) {
    return;
  }
  const expected_output = mobj[1];

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
  const opt = require("node-getopt")
    .create([])
    .setHelp("Usage: yarn test [source folder]")
    .parseSystem();

  let source_folder = DEFAULT_SOURCE_FOLDER;
  if (opt.argv.length > 0) {
    source_folder = Path.resolve(...opt.argv);
  }

  await test_root(source_folder);

  console.log(`${count_pass + count_fail} test cases completed.`);
  console.log(`${count_pass} passed, ${count_fail} failed`);
})();
