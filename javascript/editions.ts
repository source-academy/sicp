// Edition / language descriptors.
//
// SICP JS is generated from XML sources in which the non-Scheme language is
// tagged with <JAVASCRIPT...>. To support a parallel edition that uses a
// different language (e.g. Python, tagged <PYTHON...> in xml_py/), the parts
// of the build that are specific to that language are collected here behind a
// descriptor, instead of being hardcoded throughout the pipeline.
//
// This module currently defines only the JavaScript edition, and the build
// selects it by default, so existing output is unchanged. The Python edition
// descriptor will be added here once the parsers consume the `language` tags.

// The XML tag names that carry the non-Scheme language's code.
export type LanguageDescriptor = {
  readonly key: string; // short identifier, also used in output naming, e.g. "js"
  readonly blockTag: string; // code block, e.g. "JAVASCRIPT"
  readonly inlineTag: string; // inline code, e.g. "JAVASCRIPTINLINE"
  readonly runTag: string; // "JAVASCRIPT_RUN"
  readonly testTag: string; // "JAVASCRIPT_TEST"
  readonly outputTag: string; // "JAVASCRIPT_OUTPUT"
  readonly promptTag: string; // "JAVASCRIPT_PROMPT"
};

export const javascriptLanguage: LanguageDescriptor = {
  key: "js",
  blockTag: "JAVASCRIPT",
  inlineTag: "JAVASCRIPTINLINE",
  runTag: "JAVASCRIPT_RUN",
  testTag: "JAVASCRIPT_TEST",
  outputTag: "JAVASCRIPT_OUTPUT",
  promptTag: "JAVASCRIPT_PROMPT"
};

// An edition ties a language to its source tree and output naming.
export type Edition = {
  readonly language: LanguageDescriptor;
  readonly inputDirName: string; // source tree relative to repo root, e.g. "xml"
  readonly outputSuffix: string; // appended to output dir names, e.g. "" or "_py"
};

export const javascriptEdition: Edition = {
  language: javascriptLanguage,
  inputDirName: "xml",
  outputSuffix: ""
};

// Selects the edition to build. Defaults to the JavaScript edition so that
// existing builds are byte-for-byte unchanged. A Python edition will be
// selectable here (e.g. via an environment variable) in a later step.
export function getEdition(): Edition {
  return javascriptEdition;
}
