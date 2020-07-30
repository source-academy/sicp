import { recursiveProcessTextLatex, processTextLatex } from "../parseXmlLatex";
import { processSnippetPdf } from ".";
import { processTablePdf } from ".";

export const processFigurePdf = (node, writeTo) => {
  writeTo.push("\n\\begin{figure}[H]\n\\centering\n");
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }
  if (src) {
    writeTo.push(generateImage(src) + "\n");
  } else {
    // console.log(node.toString());
    const images = node.getElementsByTagName("IMAGE");
    for (let i = 0; i < images.length; i++) {
      writeTo.push(
        "\\subcaptionbox{}{" +
          generateImage(images[i].getAttribute("src")) +
          "}\n"
      );
    }
  }

  const snippet = node.getElementsByTagName("SNIPPET")[0];
  if (snippet) {
    processSnippetPdf(snippet, writeTo);
  }

  const table = node.getElementsByTagName("TABLE")[0];
  if (table) {
    processTablePdf(table, writeTo);
  }

  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    writeTo.push("\\caption{");
    recursiveProcessTextLatex(caption.firstChild, writeTo);
    writeTo.push("}\n");
  }
  const label = node.getElementsByTagName("LABEL")[0];
  if (label) {
    writeTo.push("\\label{" + label.getAttribute("NAME") + "}\n");
  }

  if (node.getAttribute("CONTINUED").toLowerCase() === "yes") {
    writeTo.push("\\addtocounter{figure}{-1}\n");
    console.log("CONTINUED");
  }

  writeTo.push("\\end{figure}\n");
};

export const generateImage = imagePath => {
  return (
    "\n\\maxsizebox{\\linewidth}{0.8\\paperheight}{" +
    "\\includegraphics[scale=0.8]{{" +
    imagePath
      .replace(/\.gif$/, ".png")
      .replace(/\.(?=[^.]*$)/, "}.")
      .replace(/_/g, "\\string_") +
    "}}"
  );
};

export default processFigurePdf;
