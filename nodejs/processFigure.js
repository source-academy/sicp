import {recursiveProcessText} from './parseText';

export const processFigure = (node, writeTo) => {
  writeTo.push("\n\\begin{figure}[H]\n")
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  } 
  if (src) {
    writeTo.push("\\includegraphics[width=\\linewidth]{" 
      + src.replace(/\.gif$/, ".png").replace(/_/g, "\\string_")
      + "}\n");
  } else {
    // console.log(node.toString());
    const images = node.getElementsByTagName("IMAGE");
    for (let i = 0; i < images.length; i++) {
      writeTo.push("\\subcaptionbox{}{"
      + "\\includegraphics{" 
      + images[i].getAttribute("src").replace(/\.gif$/, ".png").replace(/_/g, "\\string_")
      + "}}\n");
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
    writeTo.push("\\label{"
      + label.getAttribute("NAME")
      + "}\n");
  }
  writeTo.push("\\end{figure}\n");
}

export default processFigure;