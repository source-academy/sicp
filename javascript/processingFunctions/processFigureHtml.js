import {
  recursiveProcessTextHtml,
  processTextHtml,
  processTextFunctionsHtml,
  toIndexFolder
} from "../parseXmlHtml";
import { getChildrenByTagName, ancestorHasTag } from "../utilityFunctions";
import { processSnippetHtml, processSnippetHtmlScheme } from ".";
import { referenceStore } from "./processReferenceHtml";

export const processFigureHtml = (
  node,
  writeTo,
  chapArrIndex,
  snippet_count
) => {
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }

  let scale_factor = "scale_factor_0";
  if (
    !node.getAttribute("scale_factor") &&
    node.getElementsByTagName("FIGURE")[0]
  ) {
    scale_factor =
      "scale_factor_" +
      node.getElementsByTagName("FIGURE")[0].getAttribute("scale_factor");
  } else {
    scale_factor = "scale_factor_" + node.getAttribute("scale_factor");
  }

  const label = node.getElementsByTagName("LABEL")[0];

  if (src && !label) {
    writeTo.push(`
        <img class="${scale_factor}" src="${toIndexFolder}${src}">
      `);
    return;
  } else if (!src) {
    // console.log(node.toString());
    writeTo.push(`<FIGURE>`);
    const images = node.getElementsByTagName("IMAGE");
    for (let i = 0; i < images.length; i++) {
      writeTo.push(`
      <img class="${scale_factor}" src="${toIndexFolder}${images[
        i
      ].getAttribute("src")}">
      `);
    }
  }

  // get href and displayed name from "referenceStore"
  const referenceName = label.getAttribute("NAME");
  // console.log("reference name is " + referenceName);
  const href = referenceStore[referenceName].href;
  // console.log("lookup successful");
  const displayName = referenceStore[referenceName].displayName;

  if (src && label) {
    writeTo.push(`
    <FIGURE>
      <img class="${scale_factor}" id="fig_${displayName}" src="${toIndexFolder}${src}">`);
  }

  const snippet = node.getElementsByTagName("SNIPPET")[0];
  if (snippet) {
    //processSnippetHtml(snippet, writeTo);

    const scheme = node.getElementsByTagName("SCHEME")[0];
    const js = node.getElementsByTagName("JAVASCRIPT")[0];
    if (scheme && js) {
      writeTo.push(`<table width="100%">
          <colgroup><col width="48%"><col width="52%"></colgroup>
          `);
      writeTo.push(`
          <tr>
            <td>`);
      //writeTo.push(`<span style="color:teal">`);
      writeTo.push(
        "<div class='snippet' id='javascript_" +
          chapArrIndex +
          "_" +
          snippet_count +
          "_div'>"
      );
      writeTo.push("<div style='text-align: left;' class='pre-prettyprint'>");
      processSnippetHtmlScheme(node, writeTo);
      writeTo.push("</div></div>");
      //writeTo.push(`</span>`);

      writeTo.push(`    </td>
            <td>`);
      //writeTo.push(`<span style="color:blue">`);
      writeTo.push(
        "<div class='snippet' id='javascript_" +
          chapArrIndex +
          "_" +
          snippet_count +
          "_div'>"
      );
      writeTo.push("<div style='text-align: left;' class='pre-prettyprint'>");
      processSnippetHtml(node, writeTo, true);
      writeTo.push("</div></div>");
      //writeTo.push(`</span>`);

      writeTo.push(`</td></tr>`);
      writeTo.push(`</table>`);
    } else {
      writeTo.push(
        "<div class='snippet' id='javascript_" +
          chapArrIndex +
          "_" +
          snippet_count +
          "_div'>"
      );
      writeTo.push("<div class='pre-prettyprint'>");
      processSnippetHtmlScheme(node, writeTo);
      processSnippetHtml(node, writeTo, true);
      writeTo.push("</div></div>");
    }
  }

  const table = node.getElementsByTagName("TABLE")[0];
  if (table) {
    processTextHtml(table, writeTo);
  }

  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    writeTo.push(`
      <div class="chapter-text-CAPTION">
      <b><a class="caption" href="./${href}">Figure ${displayName} </a></b>`);
    recursiveProcessTextHtml(caption.firstChild, writeTo);
    writeTo.push("</div>");
  }

  writeTo.push(`
    </FIGURE>
  `);
};

export default processFigureHtml;
