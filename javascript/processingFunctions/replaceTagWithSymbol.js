const tagsToReplace = {
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
  SECT: "§",

  ALLOW_BREAK: "###", // will be replaced in processSnippet depending on rendering target (PDF, HTML, etc.)

  EMDASH: "—",
  ENDASH: "–",

  BREAK: "\n",

  SPACE: "~",
  FIXED_SPACE: "{\\tt~}"
};

export const replaceTagWithSymbol = (node, writeTo) => {
  const name = node.nodeName;
  if (tagsToReplace[name]) {
    writeTo.push(tagsToReplace[name]);
    return true;
  } else {
    return false;
  }
};

export default replaceTagWithSymbol;
