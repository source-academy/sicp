import {
    recursiveProcessTextHtml
} from "./parseXmlHtml.js";
import {tableOfContent, allFilepath} from "./index.js";
import { testCSS_part1, testCSS_part2, indexPage } from './htmlContent';

const generateChapterIndex = (filename) => {
    let chapterIndex = "";
    if (filename.match(/chapter/)) {
      // match the number after string "chapter"
      chapterIndex += filename.match(/(?<=chapter)\d+/g)[0];
    } 
    if (filename.match(/section/)) {
      // "section"
      chapterIndex += "." + filename.match(/(?<=section)\d+/g)[0];  
    } 
    if (filename.match(/subsection/)) {
      // "subsection"
      chapterIndex += "." + filename.match(/(?<=subsection)\d+/g)[0];
    } 
    /*
    if (filename.match(/others/)) {
        // account for files in others folder
        chapterIndex += filename.match(/[^/]+(?=\.)/g)[0];
    } 
    */
    
    //console.log(chapterNumber);
    return chapterIndex;
}

const truncateTitle = (chapterTitle) => {
    let truncatedTitle = "";
    chapterTitle.forEach(item => (item.match(".*[a-zA-Z]+.*")) 
            ? truncatedTitle += (" " + item.trim()) : null);
    return truncatedTitle;
}
  
const recursiveFindTitle = (node, chapterTitle) => {
    if (!node) return;
    if (node.nodeName == "NAME"){
        // using recursiveProcessText function from parseXML.js
        recursiveProcessTextHtml(node.firstChild, chapterTitle);
    } else {
        recursiveFindTitle(node.firstChild, chapterTitle);
    }
    if (!chapterTitle[0]) return recursiveFindTitle(node.nextSibling, chapterTitle);
    return;
};

export const generateTOC = (doc, tableOfContent, filename) => {

    const index = generateChapterIndex(filename);
    const chapterTitle = [];
    recursiveFindTitle(doc.documentElement, chapterTitle);
    const title = truncateTitle(chapterTitle);
    tableOfContent[filename] = {index, title};
}

export const sortTOC = (allFilepath) => {
    allFilepath = allFilepath.sort();
    let sortedFilepath = [];
    const totalFileCount = allFilepath.length;

    for (var i = 0; i < totalFileCount; i++) {
        const filename = allFilepath[i];
        
        if (filename.match(/foreword/)) {
            sortedFilepath[0] = filename;
        } else if (allFilepath[i].match(/prefaces/)) {
            sortedFilepath[1] = filename;
        } else if (allFilepath[i].match(/acknowledgements/)) {
            sortedFilepath[2] = filename;
        } else if (allFilepath[i].match(/references/)) {
            sortedFilepath[totalFileCount - 3] = filename;
        } else if (allFilepath[i].match(/indexpreface/)) {
            sortedFilepath[totalFileCount - 2] = filename;
        } else if (allFilepath[i].match(/making/)) {
            sortedFilepath[totalFileCount - 1] = filename;
        } else {
            sortedFilepath[i + 3] = filename;
        }
    }

    return sortedFilepath;
}


export const recursiveProcessTOC = (index, writeTo, option) => {
    if (index >= allFilepath.length) { 
        return; 
    }

    let next = index + 1;
    const filename = allFilepath[index];
    const chapterIndex = tableOfContent[filename].index;
    const chapterTitle = tableOfContent[filename].title;
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
            writeTo.push(`
        <div class="card card-inverse">
          <div class="card-header" role="tab" id="index-${index}">
            <h5 class="mb-0">
              <span class="collapsed" data-toggle="collapse" href="#index-collapse-${index}" aria-expanded="false" aria-controls="index-collapse-${index}">
                <a href="/${filename}"> ${chapterIndex + " " + chapterTitle}</a>
              </span>
            </h5>
          </div>
        </div>
        `);
        } else if (option == "sidebar"){
            writeTo.push(`
        <div class="card card-inverse">
          <div class="card-header" role="tab" id="sidebar-${index}">
            <h5 class="mb-0">
              <span class="collapsed" data-toggle="collapse" href="#sidebar-collapse-${index}" aria-expanded="false" aria-controls="sidebar-collapse-${index}">
                <a href="/${filename}"> ${chapterIndex + " " + chapterTitle}</a>
              </span>
            </h5>
          </div>
        </div>
        `); 
        }

        if (filename.match(/others/)) {
            return recursiveProcessTOC(next, writeTo, nextOption); 
        } else if (allFilepath[next].match(/subsection/)) {
            return recursiveProcessTOC(next, writeTo, nextOption); 
        } else {
            return;
        }
            
    } else {
        if (option == "index") {
        writeTo.push(`
        <div class="card card-inverse">
          <div class="card-header" role="tab" id="index-${index}">
            <h5 class="mb-0">
              <a class="index-show collapsed" data-toggle="collapse" href="#index-collapse-${index}" aria-expanded="true" aria-controls="index-collapse-${index}">
              &#10148;   <!-- ➤ (because this one is rendered blue on mobile: ▶  -->
              </a>
              <a class="index-hide collapsed" data-toggle="collapse" href="#index-collapse-${index}" aria-expanded="true" aria-controls="index-collapse-${index}">
              &#x25BC;    <!-- ▼ (because the corresponding one is not rendered) -->
              </a>
              <a href="/${filename}">${chapterIndex + " " + chapterTitle}</a>
            </h5>
          </div>

          <div id="index-collapse-${index}" class="collapse" role="tabpanel" aria-labelledby="headingOne">
            <div class="card-block">
        `);
        } else if (option == "sidebar") {
            writeTo.push(`
            <div class="card card-inverse">
              <div class="card-header" role="tab" id="sidebar-${index}">
                <h5 class="mb-0">
                  <a class="sidebar-show collapsed" data-toggle="collapse" href="#sidebar-collapse-${index}" aria-expanded="true" aria-controls="sidebar-collapse-${index}">
                  &#10148;   <!-- ➤ (because this one is rendered blue on mobile: ▶  -->
                  </a>
                  <a class="sidebar-hide collapsed" data-toggle="collapse" href="#sidebar-collapse-${index}" aria-expanded="true" aria-controls="sidebar-collapse-${index}">
                  &#x25BC;    <!-- ▼ (because the corresponding one is not rendered) -->
                  </a>
                  <a href="/${filename}">${chapterIndex + " " + chapterTitle}</a>
                </h5>
              </div>
    
              <div id="sidebar-collapse-${index}" class="collapse" role="tabpanel" aria-labelledby="headingOne">
                <div class="card-block">
            `);   
        }

        recursiveProcessTOC(next, writeTo, nextOption);
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
                return recursiveProcessTOC(next, writeTo, nextOption); 
            } else {
                return;
            }
        } else {
            while (allFilepath[next].match(/section/)) {
                next++;
            }
            return recursiveProcessTOC(next, writeTo, nextOption); 
        }
    }
}

export const indexHtml = (writeToIndex) => {
    //let chapArrIndex = 0;

    //console.log(tableOfContent);
    writeToIndex.push(testCSS_part1);
    writeToIndex.push(`
    <meta name="description" content="" />
        <title>
        Structure and Interpretation of Computer Programs, JavaScript Adaptation
        </title>
    `);
    writeToIndex.push(testCSS_part2);

    // TOC at the sidebar
    recursiveProcessTOC(0, writeToIndex, "sidebar");
    writeToIndex.push("</div>\n"); // <div class='collapse'>

    // index page content
    writeToIndex.push(`
    <div class="chapter-content">
    <div class="chapter-text" >`);
    writeToIndex.push(indexPage);

    // TOC at index page
    writeToIndex.push("<h2>Content</h2>");
    writeToIndex.push("\n<div class='nav-index'>");
    recursiveProcessTOC(0, writeToIndex, "index");
    writeToIndex.push("</div>\n"); // <div class='nav-index'>
    writeToIndex.push("</div>\n");// <div class="chapter-content">

    writeToIndex.push("</div>\n"); // <div class="container scroll">
    writeToIndex.push("</body></html>");
   
}