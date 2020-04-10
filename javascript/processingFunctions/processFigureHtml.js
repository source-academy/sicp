import { recursiveProcessTextHtml, processTextHtml, toIndexFolder } from '../parseXmlHtml';
import { processSnippetHtml } from '.';
import { referenceStore } from './processReferenceHtml';

export const processFigureHtml = (node, writeTo) => {
  
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }
  const label = node.getElementsByTagName("LABEL")[0];

  if (src && !label) {
      writeTo.push(`
        <img src="${toIndexFolder}${src}">
      `);
      return;
  } else if (!src) {
    // console.log(node.toString());
    writeTo.push(`<FIGURE>`);
    const images = node.getElementsByTagName("IMAGE");
    for (let i = 0; i < images.length; i++) {
      writeTo.push(`
      <img src="${toIndexFolder}${images[i].getAttribute("src")}">
      `);
    }
  }

  // get href and displayed name from "referenceStore"
  const referenceName = label.getAttribute("NAME");
  const href = referenceStore[referenceName].href;
  const displayName = referenceStore[referenceName].displayName;
  //console.log("reference name is " + referenceName);

  if (src && label) { 
    writeTo.push(`
    <FIGURE>
      <img id="fig_${displayName}" src="${toIndexFolder}${src}">`
    ); 
  } 
    
  const snippet = node.getElementsByTagName("SNIPPET")[0];
  if (snippet) {
      processSnippetHtml(snippet, writeTo);
  }

  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    writeTo.push(`
      <div class="chapter-text-CAPTION">
      <b><a class="caption" href="${href}">Figure ${displayName} </a></b>`);
    recursiveProcessTextHtml(caption.firstChild, writeTo);
    writeTo.push("</div>");
  }

  writeTo.push(`
    </FIGURE>
  `);
};

export default processFigureHtml;
