import { recursiveProcessText, processText } from '../parseXML';

export const processFigureEpub = (node, writeTo) => {
  writeTo.push("\n\\begin{figure}[H]\n\\centering\n");
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }
  if (src) {
    writeTo.push(
      generateImage(src) + "\n"
    );
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
  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    writeTo.push("\\caption{");
    recursiveProcessText(caption.firstChild, writeTo);
    writeTo.push("}\n");
  }
  const label = node.getElementsByTagName("LABEL")[0];
  if (label) {
    writeTo.push("\\label{" + label.getAttribute("NAME") + "}\n");
  }
  writeTo.push("\\end{figure}\n");
};

export const generateImage = (imagePath) => {
  return (
  "\\includegraphics{"
    + imagePath.replace(/\.gif$/, ".png")
    + "}"
  );
}

export default processFigureEpub;
