import lzString from "lz-string";
import {
  checkLongLineWarning,
  missingRequireWarning
} from "./warnings.js";
import recursiveProcessPureText from "./recursiveProcessPureText";

const snippetStore = {};

export const setupSnippets = (node) => {
	const snippets = node.getElementsByTagName("SNIPPET");
	for (let i = 0; snippets[i]; i++) {
		const snippet = snippets[i];
		const jsSnippet = snippet.getElementsByTagName("JAVASCRIPT")[0];
		const snippetName = snippet.getElementsByTagName("NAME")[0];
		if (snippetName && jsSnippet) {
      const nameStr = snippetName.firstChild.nodeValue;
      const codeArr = [];
	    recursiveProcessPureText(jsSnippet.firstChild, codeArr);
	    const codeStr = codeArr.join("").trim();
	    snippetStore[nameStr] = codeStr;
    }
	}
}

const sourceAcademyURL = "https://sourceacademy.nus.edu.sg";
// to change to localhost if required
// http://localhost:8075 

export const processSnippet = (node, writeTo) => {
  if (node.getAttribute("HIDE") == "yes") {
    return;
  }

  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0];
  if (jsSnippet) {
    const codeArr = [];
    recursiveProcessPureText(jsSnippet.firstChild, codeArr);
    const codeStr = codeArr.join("").trim();

    // Do warning for very long lines if no latex
    if (node.getAttribute("LATEX") !== "yes") {
      checkLongLineWarning(codeStr);
    }

    if (node.getAttribute("EVAL") === "no") {
      writeTo.push("\n\\begin{lstlisting}[mathescape=true]\n");
      writeTo.push(codeStr);
      writeTo.push("\n\\end{lstlisting}\n");
    } else {

	    const requirements = node.getElementsByTagName("REQUIRE");
	    const reqArr = [];
	    for (let i = 0; requirements[i]; i++) {
	      const required = requirements[i].firstChild.nodeValue;
	      console.log("REQ: " + required);
	      if (snippetStore[required]) {
	        reqArr.push(snippetStore[required]);
	        reqArr.push("\n");
	      } else {
	        missingRequireWarning();
	      }
	    }
	    const reqStr = reqArr.join("");

      const examples = node.getElementsByTagName("EXAMPLE");
      const exampleArr = [];
      for (let i = 0; examples[i]; i++) {
      	const example = examples[i].firstChild.nodeValue;
	      if (snippetStore[example]) {
	        reqArr.push(snippetStore[example]);
	        reqArr.push("\n");
	      } else {
	        console.log("Missing Example: " + example);;
	      }
      }
      const exampleStr = exampleArr.join("");

      // make url for source academy link
      const compressed = lzString.compressToEncodedURIComponent(
        reqStr + codeStr + exampleStr
      );
      const chap = "4";
      const ext = "";
      const url =
        sourceAcademyURL +
        "/playground#chap=" +
        chap +
        ext +
        "&prgrm=" +
        compressed;

      const chunks = (codeStr + "\n").match(/^((?:.*?[\r\n]+){1,6})((?:.|\n|\r)*)$/);
      // 6 lines plus rest
      writeTo.push(
        "\n\\begin{lrbox}{\\lstbox}\\begin{lstlisting}[mathescape=true]\n"
      );
      writeTo.push(chunks[1]);
      writeTo.push(
        "\\end{lstlisting}\\end{lrbox}"
      );

      if (chunks[2]) {
        writeTo.push("\n\\begin{lstlisting}[mathescape=true]\n");
        writeTo.push("/*!\\href{" + url + "}{\\usebox\\lstbox}!*/\n")
        writeTo.push(chunks[2]);
        writeTo.push("\\end{lstlisting}");
      } else {
        writeTo.push("\n\n\\href{" + url + "}{\\usebox\\lstbox}")
      }
      writeTo.push("\n\n");
    }
  }
};

export default processSnippet;