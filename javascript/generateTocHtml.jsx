import { recursiveProcessTextHtml } from "./parseXmlHtml.js";
import { tableOfContent, allFilepath } from "./index.js";
import {
  html_links_part1,
  html_links_part2,
  indexPage
} from "./htmlContent.js";
import LinksHead from "./html/LinksHead.js";
import Licences from "./html/Licences.js";
import { generateChapterIndex } from "./tocUtils.js";
import { IndexHeaderCard, SidebarHeaderCard } from "./TocCards.js";
import { html } from "hono/html";

const truncateTitle = chapterTitle => {
  let truncatedTitle = "";
  chapterTitle.forEach(item => (truncatedTitle += item));
  return truncatedTitle;
};

const recursiveFindTitle = (node, chapterTitle) => {
  if (!node) return;
  if (node.nodeName == "NAME") {
    // using recursiveProcessText function from parseXML.js
    recursiveProcessTextHtml(node.firstChild, chapterTitle);
  } else {
    recursiveFindTitle(node.firstChild, chapterTitle);
  }
  if (!chapterTitle[0])
    return recursiveFindTitle(node.nextSibling, chapterTitle);
  return;
};

export const generateTOC = (doc, tableOfContent, filename) => {
  const index = generateChapterIndex(filename);
  const chapterTitle = [];
  recursiveFindTitle(doc.documentElement, chapterTitle);
  const title = truncateTitle(chapterTitle);
  let relativePathToMain = "";
  for (let i = 1; i < filename.split("/").length; i++) {
    relativePathToMain += "../";
  }
  tableOfContent[filename] = { index, title, relativePathToMain };
};

export const sortTOC = allFilepath => {
  allFilepath = allFilepath.sort();

  let head = [];
  let mid = [];
  let tail = [];

  for (const filename of allFilepath) {
    if (
      filename.match(/foreword/) ||
      filename.match(/prefaces/) ||
      filename.match(/acknowledgements/) ||
      filename.match(/see/)
    ) {
      head.push(filename);
    } else if (filename.match(/references/) || filename.match(/making/)) {
      tail.push(filename);
    } else {
      mid.push(filename);
    }
  }

  return head.concat(mid, tail);
};

export const recursiveProcessTOC = (index, writeTo, option, toIndexFolder) => {
  if (index >= allFilepath.length) {
    return;
  }

  let next = index + 1;
  const filename = allFilepath[index];
  const chapterIndex = tableOfContent[filename].index;
  const chapterTitle = tableOfContent[filename].title;
  const displayTitle = chapterIndex.match(/[a-z]+/)
    ? chapterTitle
    : `${chapterIndex} ${chapterTitle}`;

  const nextOption = option;

  if (index == 0 && option == "sidebar") {
    writeTo.push(`
        <div class="collapse" id="nav-sidebar" role="tablist" aria-multiselectable="true">
        <!-- insert a dummy entry, to give one extra line of space -->
        <a class="navbar-brand" href="index.html">&nbsp;</a>
    `);
  }

  if (filename.match(/others/) || filename.match(/subsection/)) {
    if (option == "index") {
      writeTo.push(html`
        <div class="card card-inverse">
          <div class="card-header" role="tab" id="index-${index + 1}">
            <h5 class="mb-0">
              <span
                class="collapsed"
                data-toggle="collapse"
                href="#index-collapse-${index + 1}"
                aria-expanded="false"
                aria-controls="index-collapse-${index + 1}"
              >
                <a href="${toIndexFolder}${chapterIndex}.html">
                  ${displayTitle}</a
                >
              </span>
            </h5>
          </div>
        </div>
      `);
    } else if (option == "sidebar") {
      writeTo.push(html`
        <div class="card card-inverse">
          <div class="card-header" role="tab" id="sidebar-${index + 1}">
            <h5 class="mb-0">
              <span
                class="collapsed"
                data-toggle="collapse"
                href="#sidebar-collapse-${index + 1}"
                aria-expanded="false"
                aria-controls="sidebar-collapse-${index + 1}"
              >
                <a href="${toIndexFolder}${chapterIndex}.html">
                  ${displayTitle}</a
                >
              </span>
            </h5>
          </div>
        </div>
      `);
    }

    if (filename.match(/others/)) {
      return recursiveProcessTOC(next, writeTo, nextOption, toIndexFolder);
    } else if (allFilepath[next].match(/subsection/)) {
      return recursiveProcessTOC(next, writeTo, nextOption, toIndexFolder);
    } else {
      return;
    }
  } else {
    if (option == "index") {
      writeTo.push(`
        <div class="card card-inverse">
          ${(
            <IndexHeaderCard
              index={index}
              chapterIndex={chapterIndex}
              displayTitle={displayTitle}
              toIndexFolder={toIndexFolder}
            />
          )}

          <div id="index-collapse-${
            index + 1
          }" class="collapse" role="tabpanel" aria-labelledby="headingOne">
            <div class="card-block">
        `);
    } else if (option == "sidebar") {
      writeTo.push(`
            <div class="card card-inverse">
            ${(
              <SidebarHeaderCard
                index={index}
                chapterIndex={chapterIndex}
                displayTitle={displayTitle}
                toIndexFolder={toIndexFolder}
              />
            )}

              <div id="sidebar-collapse-${
                index + 1
              }" class="collapse" role="tabpanel" aria-labelledby="headingOne">
                <div class="card-block">
            `);
    }

    recursiveProcessTOC(next, writeTo, nextOption, toIndexFolder);
    writeTo.push(`
                </div>
              </div>
            </div>
        `);

    if (filename.match(/section/)) {
      while (allFilepath[next].match(/subsection/)) {
        next++;
      }
      if (allFilepath[next].match(/section/)) {
        return recursiveProcessTOC(next, writeTo, nextOption, toIndexFolder);
      } else {
        return;
      }
    } else {
      while (allFilepath[next].match(/section/)) {
        next++;
      }
      return recursiveProcessTOC(next, writeTo, nextOption, toIndexFolder);
    }
  }
};

export const indexHtml = writeToIndex => {
  //let chapArrIndex = 0;

  //console.log(tableOfContent);
  writeToIndex.push(html_links_part1);
  writeToIndex.push(
    <LinksHead toIndexFolder="" version="js">
      <meta name="description" content="" />
      <title>
        Structure and Interpretation of Computer Programs, Comparison Edition
      </title>
    </LinksHead>
  );
  html_links_part2(writeToIndex, "", "js");

  // TOC at the sidebar
  recursiveProcessTOC(0, writeToIndex, "sidebar", "./chapters/");
  writeToIndex.push("</div>\n"); // <div class='collapse'>

  // index page content
  writeToIndex.push(`
    <div class="chapter-content">
    <div class="chapter-text" >`);
  indexPage(writeToIndex);

  // TOC at index page
  writeToIndex.push("<h2>Content</h2>");
  writeToIndex.push("\n<div class='nav-index'>");
  recursiveProcessTOC(0, writeToIndex, "index", "./chapters/");
  writeToIndex.push("</div>\n"); // <div class='nav-index'>
  writeToIndex.push("</div>\n"); // <div class="chapter-content">
  writeToIndex.push(<Licences />);
  writeToIndex.push("</div>\n"); // <div class="container scroll">
  writeToIndex.push("</body></html>");
};
