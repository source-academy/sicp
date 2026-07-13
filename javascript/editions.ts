// Edition / language descriptors.
//
// SICP JS is generated from XML sources in which the non-Scheme language is
// tagged with <JAVASCRIPT...>. To support a parallel edition that uses a
// different language (e.g. Python, tagged <PYTHON...> in xml_py/), the parts
// of the build that are specific to that language are collected here behind a
// descriptor, instead of being hardcoded throughout the pipeline.
//
// This module defines the JavaScript edition (the default), the Python
// edition, and the Scheme edition. The build selects JavaScript unless the
// SICP_EDITION environment variable requests another edition, so existing
// output is unchanged.
//
// Each XML source tree pairs Scheme with one non-Scheme language inside
// <SPLIT>/<SPLITINLINE> (so the prose is correct for both). An edition keeps
// its own language and strips the companion (see getCompanionLanguage). The
// JavaScript and Scheme editions both read from xml/ (the Scheme content lives
// in the JS source tree); only the Python-style editions use xml_<lang>/.

// Language-specific details of the edition's non-Scheme language.
export type LanguageDescriptor = {
  readonly key: string; // short identifier, also used in output naming and as the footnote "version" marker, e.g. "js"
  // XML tag names that carry the language's code.
  readonly blockTag: string; // code block, e.g. "JAVASCRIPT"
  readonly inlineTag: string; // inline code, e.g. "JAVASCRIPTINLINE"
  readonly runTag: string; // "JAVASCRIPT_RUN"
  readonly testTag: string; // "JAVASCRIPT_TEST"
  readonly outputTag: string; // "JAVASCRIPT_OUTPUT"
  readonly promptTag: string; // "JAVASCRIPT_PROMPT"
  // Surface strings emitted into generated output.
  readonly commentPrefix: string; // line-comment marker, e.g. "//" (Python: "#")
  readonly displayName: string; // edition name in headers, e.g. "SICP JS" (Python: "SICPy")
  readonly languageName: string; // language name in the comparison-edition column header, e.g. "JavaScript" (Python: "Python")
  readonly fileExtension: string; // extracted-program extension, e.g. ".js" (Python: ".py")
};

export const javascriptLanguage: LanguageDescriptor = {
  key: "js",
  blockTag: "JAVASCRIPT",
  inlineTag: "JAVASCRIPTINLINE",
  runTag: "JAVASCRIPT_RUN",
  testTag: "JAVASCRIPT_TEST",
  outputTag: "JAVASCRIPT_OUTPUT",
  promptTag: "JAVASCRIPT_PROMPT",
  commentPrefix: "//",
  displayName: "SICP JS",
  languageName: "JavaScript",
  fileExtension: ".js"
};

export const pythonLanguage: LanguageDescriptor = {
  key: "py",
  blockTag: "PYTHON",
  inlineTag: "PYTHONINLINE",
  runTag: "PYTHON_RUN",
  testTag: "PYTHON_TEST",
  outputTag: "PYTHON_OUTPUT",
  promptTag: "PYTHON_PROMPT",
  commentPrefix: "#",
  displayName: "SICPy",
  languageName: "Python",
  fileExtension: ".py"
};

// Scheme is the comparison anchor in the XML; the Scheme edition makes it the
// primary language. There are no SCHEME_RUN / SCHEME_TEST tags (those are
// execution concepts for the playground languages); the names below simply
// don't match anything, which is harmless.
export const schemeLanguage: LanguageDescriptor = {
  key: "scm",
  blockTag: "SCHEME",
  inlineTag: "SCHEMEINLINE",
  runTag: "SCHEME_RUN",
  testTag: "SCHEME_TEST",
  outputTag: "SCHEMEOUTPUT",
  promptTag: "SCHEMEPROMPT",
  commentPrefix: ";",
  displayName: "SICP", // the original
  languageName: "Scheme",
  fileExtension: ".scm"
};

// An edition ties a language to its source tree and output naming. Every
// source tree pairs Scheme with exactly one non-Scheme language inside
// <SPLIT>/<SPLITINLINE>; companionLanguage is the other language present in
// *this* edition's own tree (so its build can strip that side). It's a
// property of the edition, not derived from the language, since whichever
// tree an edition draws from is decided once, when the edition itself is
// declared — e.g. the Scheme edition reuses xml/ (the JS tree) rather than
// having its own, so its companion is JavaScript, not itself.
// Output dirs are named `<base>_<language.key>` (e.g. json_js / json_py),
// so the key carries the edition marker for every dir.
export type Edition = {
  readonly language: LanguageDescriptor;
  readonly companionLanguage: LanguageDescriptor;
  readonly inputDirName: string; // source tree relative to repo root, e.g. "xml"
  readonly outputBaseName: string; // base name of the PDF/deploy artifacts, e.g. "sicpjs" (Python: "sicpy")
};

export const javascriptEdition: Edition = {
  language: javascriptLanguage,
  companionLanguage: schemeLanguage,
  inputDirName: "xml",
  outputBaseName: "sicpjs"
};

export const pythonEdition: Edition = {
  language: pythonLanguage,
  companionLanguage: schemeLanguage,
  inputDirName: "xml_py",
  outputBaseName: "sicpy"
};

// The Scheme edition reuses the JavaScript source tree (xml/), extracting the
// Scheme side of every split instead of the JavaScript side.
export const schemeEdition: Edition = {
  language: schemeLanguage,
  companionLanguage: javascriptLanguage,
  inputDirName: "xml",
  outputBaseName: "sicp" // the original SICP
};

export function getCompanionLanguage(
  edition: Edition = getEdition()
): LanguageDescriptor {
  return edition.companionLanguage;
}

// Selects the edition to build, via the SICP_EDITION environment variable.
// Defaults to the JavaScript edition when unset, so existing builds are
// byte-for-byte unchanged. An unrecognized value is rejected rather than
// silently falling back, to catch typos (e.g. SICP_EDITION=pyton).
export function getEdition(): Edition {
  const requested = process.env.SICP_EDITION?.trim().toLowerCase();
  switch (requested) {
    case undefined:
    case "":
    case "js":
      return javascriptEdition;
    case "py":
      return pythonEdition;
    case "scm":
      return schemeEdition;
    default:
      throw new Error(
        `Unknown SICP_EDITION "${process.env.SICP_EDITION}" (expected "js", "py", or "scm")`
      );
  }
}
