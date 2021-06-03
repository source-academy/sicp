import fs from "fs";
import path from "path";

import { tableOfContent, allFilepath } from "./index.js";

const recursiveProcessTOC = (index, toc, tocNavigation) => {
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

  if (filename.match(/others/) || filename.match(/subsection/)) {
    if (!filename.match(/see/)) {
      toc.push({
        id: index,
        hasCaret: false,
        label: displayTitle,
        nodeData: chapterIndex
      });

      tocNavigation.push(chapterIndex);
    }

    if (filename.match(/others/) || allFilepath[next].match(/subsection/)) {
      return recursiveProcessTOC(next, toc, tocNavigation);
    } else {
      return;
    }
  } else {
    const child = [];
    toc.push({
      id: index,
      hasCaret: true,
      label: displayTitle,
      nodeData: chapterIndex,
      childNodes: child
    });

    tocNavigation.push(chapterIndex);

    recursiveProcessTOC(next, child, tocNavigation);

    if (filename.match(/section/)) {
      while (allFilepath[next].match(/subsection/)) {
        next++;
      }
      if (allFilepath[next].match(/section/)) {
        return recursiveProcessTOC(next, toc, tocNavigation);
      }

      return;
    } else {
      while (allFilepath[next].match(/section/)) {
        next++;
      }
      return recursiveProcessTOC(next, toc, tocNavigation);
    }
  }
};

export const createTocJson = outputDir => {
  const toc = [];
  const tocNavigation = [];
  recursiveProcessTOC(0, toc, tocNavigation);

  const tocNavigationOutput = {};

  tocNavigation.forEach(x => (tocNavigationOutput[x] = {}));

  for (let i = 0; i < tocNavigation.length - 1; i++) {
    const curr = tocNavigation[i];
    const next = tocNavigation[i + 1];
    tocNavigationOutput[curr]["next"] = next;
  }

  for (let i = 1; i < tocNavigation.length; i++) {
    const curr = tocNavigation[i];
    const prev = tocNavigation[i - 1];
    tocNavigationOutput[curr]["prev"] = prev;
  }

  tocNavigationOutput[tocNavigation[0]]["prev"] = "index";
  tocNavigationOutput["index"] = { next: tocNavigation[0] };

  const tocFilepath = path.join(outputDir, "toc.json");
  const tocStream = fs.createWriteStream(tocFilepath);
  tocStream.once("open", fd => {
    tocStream.write(JSON.stringify(toc));
    tocStream.end();
  });

  const tocNavigationFilepath = path.join(outputDir, "toc-navigation.json");
  const tocNavigationStream = fs.createWriteStream(tocNavigationFilepath);
  tocNavigationStream.once("open", fd => {
    tocNavigationStream.write(JSON.stringify(tocNavigationOutput));
    tocNavigationStream.end();
  });
};
