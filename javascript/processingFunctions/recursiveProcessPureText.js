import replaceTagWithSymbol from "./replaceTagWithSymbol";

const recursiveProcessPureTextDefault = { removeNewline: false };

const recursiveProcessPureText = (
  node,
  writeTo,
  options = recursiveProcessPureTextDefault
) => {
  if (!node) return;
  if (!replaceTagWithSymbol(node, writeTo) && node.nodeName === "#text") {
    let value = node.nodeValue;
    if (options.removeNewline == "beginning&end") {
      value = value.replace(/^[\r\n]+/g, "");
      value = value.replace(/[\r\n\s]+$/g, "");
    }
    if (options.removeNewline == "all") {
      value = value.replace(/[\r\n]+/g, " ");
    }
    if (options.escapeCurlyBracket) {
      value = value.replace(/\{/g, "\\{");
      value = value.replace(/\}/g, "\\}");
    }
    /// \OptionalPar[n]{...} ===> \langle\textit{...}_{n}\rangle
    value = value.replace(
      /\\OptionalPar\[(.)\]{(.*?)}/g,
      "\\langle\\textit{$2}_{$1}\\rangle"
    );
    /// \OptionalPar{...} ===> \langle\textit{...}\rangle
    value = value.replace(
      /\\OptionalPar{(.*?)}/g,
      "\\langle\\textit{$1}\\rangle"
    );
    writeTo.push(value);
  }
  return recursiveProcessPureText(node.nextSibling, writeTo, options);
};

export default recursiveProcessPureText;
