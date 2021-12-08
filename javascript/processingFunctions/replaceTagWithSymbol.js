const tagsToReplaceDefault = {
  APOS: "'",
  WJ: "&#8288;",
  AACUTE_LOWER: "á",
  AACUTE_UPPER: "Á",
  AGRAVE_LOWER: "à",
  AGRAVE_UPPER: "À",
  ACIRC_LOWER: "â",
  EACUTE_LOWER: "é",
  EACUTE_UPPER: "É",
  EGRAVE_LOWER: "è",
  EGRAVE_UPPER: "È",
  ECIRC_LOWER: "ê",
  OUML_LOWER: "ö",
  OUML_UPPER: "Ö",
  UUML_LOWER: "ü",
  UUML_UPPER: "Ü",
  CCEDIL_LOWER: "ç",
  ELLIPSIS: "…",
  AMP: "\\&",
  DOLLAR: "\\$",
  SHARP: "\\#",
  SECT: "§",

  SHORT_SPACE: "",
  SHORT_SPACE_AND_ALLOW_BREAK: "",
  ALLOW_BREAK: "",

  EMDASH: "—",
  ENDASH: "–",

  BREAK: "\n",

  SPACE: "~",
    FIXED_SPACE: "{\\tt~}",

  BREAKINGNONSPACE: "{\\hspace{0pt}}"
};

const tagsToReplacePdf = {
  SHORT_SPACE: "@xxx", // will be replaced in processSnippet
  SHORT_SPACE_AND_ALLOW_BREAK: "@yyy", // will be replaced in processSnippet
  ALLOW_BREAK: "@yyy" // ok to alias short_space_and_allow_break because the short space is implicit in the splitting of code boxes for now
};

export const replaceTagWithSymbol = (node, writeTo, type = "default") => {
  const name = node.nodeName;
  let tagsToReplace;

  switch (type) {
    case "pdf":
      tagsToReplace = { ...tagsToReplaceDefault, ...tagsToReplacePdf };
      break;
    default:
      tagsToReplace = tagsToReplaceDefault;
  }

  if (tagsToReplace[name]) {
    writeTo.push(tagsToReplace[name]);
    return true;
  } else {
    return false;
  }
};

export default replaceTagWithSymbol;
