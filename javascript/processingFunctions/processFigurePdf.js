import { recursiveProcessTextLatex } from "../parseXmlLatex";
import { processSnippetPdf } from ".";
import { processTablePdf } from ".";

export const processFigurePdf = (node, writeTo) => {
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }

  // =================== Process scale parameter of includegraphics ========================
  let scale = "0.65";
  if (node.getAttribute("scale")) {
    scale = node.getAttribute("scale");
  } else if (
    node.getElementsByTagName("FIGURE")[0] &&
    node.getElementsByTagName("FIGURE")[0].getAttribute("scale")
  ) {
    scale = node.getElementsByTagName("FIGURE")[0].getAttribute("scale");
  } else {
    // Keep default scale at 0.65
  }
  // =================== Process scale parameter of includegraphics ========================
  // =================== Process alignment ========================
  let center = true;
  if (node.getAttribute("CENTER")) {
    center = node.getAttribute("CENTER") === "yes";
  } else if (
    node.getElementsByTagName("FIGURE")[0] &&
    node.getElementsByTagName("FIGURE")[0].getAttribute("CENTER")
  ) {
    center =
      node.getElementsByTagName("FIGURE")[0].getAttribute("CENTER") === "yes";
  } else {
    // Keep default centering === true
  }
  // =================== Process alignment ========================

  writeTo.push(
    "\\begin{figure}" +
    "[tp]" + // (ancestorHasTag(node, "EXERCISE") ? "[H]" : "[tp]") +
      "\n" +
      (center ? "\\centering " : "")
  );

  if (src) {
    writeTo.push(generateImage2(src, scale) + "\n");
  } else {
    // console.log(node.toString());
    const images = node.getElementsByTagName("IMAGE");
    for (let i = 0; i < images.length; i++) {
      writeTo.push(
        "\\subcaptionbox{}{" +
          generateImage2(images[i].getAttribute("src"), scale) +
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
    writeTo.push(
      "\\caption{\\def\\inlinecodesize{\\protect\\inlineexercisecodesize}"
    );
    recursiveProcessTextLatex(caption.firstChild, writeTo);
    writeTo.push("}\n");
  }
  const label = node.getElementsByTagName("LABEL")[0];
  if (label) {
    writeTo.push("\\label{" + label.getAttribute("NAME") + "}\n");
  }

  if (node.getAttribute("CONTINUED").toLowerCase() === "yes") {
    writeTo.push("\\addtocounter{figure}{-1}\n");
  }

  writeTo.push("\\end{figure}");
};

export const generateImage2 = (imagePath, scale) => {
  return (
    "\n\\adjustbox{max width=32pc}{" +
    "\\includegraphics[scale=" +
    scale +
    "]{{" +
    imagePath
      .replace(/\.gif$/, ".png")
      .replace(/\.svg$/, ".svg.pdf")
      .replace(/\.(?=[^.]*$)/, "}.")
      .replace(/_/g, "\\string_") +
    "}}"
  );
};

//export const generateImage = (imagePath) => generateImage(imagePath, "0.65");
export const generateImage = imagePath => {
  return (
    "\n\\adjustbox{max width=32pc}{" +
    "\\includegraphics[scale=0.65]{{" +
    imagePath
      .replace(/\.gif$/, ".png")
      .replace(/\.svg$/, ".svg.pdf")
      .replace(/\.(?=[^.]*$)/, "}.")
      .replace(/_/g, "\\string_") +
    "}}"
  );
};

export default processFigurePdf;
