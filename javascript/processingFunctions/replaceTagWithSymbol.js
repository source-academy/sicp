const tagsToReplace = {
  APOS: "'",
  SPACE: "~",
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
  CCEDIL_LOWER: "Ç",
  ELLIPSIS: "…",
  AMP: "\\&",
  DOLLAR: "\\$",
  SECT: "§",

  EMDASH: "—",
  ENDASH: "–",

    LaTeX: "\\LaTeX",
    TeX: "\\TeX",
    
  BREAK: "\n"
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
