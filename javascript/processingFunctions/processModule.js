// rune module imports used in sicp js
const runeModuleImports = [
  "square",
  "corner",
  "heart",
  "stack",
  "quarter_turn_left",
  "quarter_turn_right",
  "turn_upside_down",
  "beside",
  "flip_vert",
  "flip_horiz",
  "show"
];

const used = [];

const processRuneModule = snippet => {
  let imports = [];

  for (let i = 0; i < runeModuleImports.length; i++) {
    const keyword = runeModuleImports[i];
    if (new RegExp(`[^\\w]*${keyword}[^\\w]`).test(snippet)) {
      imports.push(keyword);
      used.push(keyword);
    }
  }

  if (imports.length) {
    return `import {${imports.join(", ")}} from 'rune';`;
  } else {
    return "";
  }
};

export { processRuneModule };
