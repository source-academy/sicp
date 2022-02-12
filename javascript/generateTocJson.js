import fs from "fs";
import path from "path";

import { tableOfContent, allFilepath } from "./index.js";

// this should come from constants.js, but that
// doesn't work, probably due to circular dependencies
const sourceAcademyURL = "https://sourceacademy.org";

const recursiveProcessTOC = (index, toc, tocNavigation, sitemap) => {
  if (index >= allFilepath.length) {
    return;
  }

  let next = index + 1;
  const filename = allFilepath[index];
  const chapterIndex = tableOfContent[filename].index;
  const chapterTitle = tableOfContent[filename].title;
  let displayTitle = chapterIndex.match(/[a-z]+/)
    ? chapterTitle
    : `${chapterIndex} ${chapterTitle}`;

  displayTitle = displayTitle.replace(/\s\s+/g, " ");

  if (filename.match(/others/) || filename.match(/subsection/)) {
    if (!filename.match(/see/)) {
      toc.push({
        id: index,
        hasCaret: false,
        label: displayTitle.trim(),
        nodeData: chapterIndex.trim()
      });

      tocNavigation.push(chapterIndex);

      sitemap.push(chapterIndex);
    }

    if (filename.match(/others/) || allFilepath[next].match(/subsection/)) {
      return recursiveProcessTOC(next, toc, tocNavigation, sitemap);
    } else {
      return;
    }
  } else {
    const child = [];
    toc.push({
      id: index,
      hasCaret: true,
      label: displayTitle.trim(),
      nodeData: chapterIndex.trim(),
      childNodes: child
    });

    tocNavigation.push(chapterIndex);

    sitemap.push(chapterIndex);

    recursiveProcessTOC(next, child, tocNavigation, sitemap);

    if (filename.match(/section/)) {
      while (allFilepath[next].match(/subsection/)) {
        next++;
      }
      if (allFilepath[next].match(/section/)) {
        return recursiveProcessTOC(next, toc, tocNavigation, sitemap);
      }

      return;
    } else {
      while (allFilepath[next].match(/section/)) {
        next++;
      }
      return recursiveProcessTOC(next, toc, tocNavigation, sitemap);
    }
  }
};

export const createTocJson = outputDir => {
  const toc = [];
  const tocNavigation = [];
  const sitemap = [];
  recursiveProcessTOC(0, toc, tocNavigation, sitemap);

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

  const sitemapFilepath = path.join(outputDir, "sitemap.xml");
  const sitemapStream = fs.createWriteStream(sitemapFilepath);
  sitemapStream.once("open", fd => {
    const today = new Date();

    sitemapStream.write(
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    );

    for (const s in sitemap) {
      sitemapStream.write("  <url>\n    <loc>");
      sitemapStream.write(sourceAcademyURL + "/sicpjs/");
      sitemapStream.write(sitemap[s]);
      const month = today.getMonth() + 1;
      const date = today.getDate();
      sitemapStream.write(
        "</loc>\n    <lastmod>" +
          today.getFullYear() +
          "-" +
          (month < 10 ? "0" : "") +
          month +
          "-" +
          (date < 10 ? "0" : "") +
          date +
          "</lastmod>\n"
      );
      sitemapStream.write("  </url>\n");
    }

    sitemapStream.write("</urlset>\n");

    sitemapStream.end();
  });
};
