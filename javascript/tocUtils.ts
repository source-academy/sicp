export const generateChapterIndex = (filename: string) => {
  let chapterIndex = "";
  if (filename.match(/chapter/)) {
    // match the number after string "chapter"
    chapterIndex += filename.match(/(?<=chapter)\d+/g)![0];
  }
  if (filename.match(/section/)) {
    // "section"
    chapterIndex += "." + filename.match(/(?<=section)\d+/g)![0];
  }
  if (filename.match(/subsection/)) {
    // "subsection"
    chapterIndex += "." + filename.match(/(?<=subsection)\d+/g)![0];
  }
  if (filename.match(/foreword/)) {
    chapterIndex = filename.match(/foreword\d*/g)![0];
  } else if (filename.match(/prefaces/)) {
    chapterIndex = filename.match(/prefaces\d*/g)![0];
  } else if (filename.match(/acknowledgements/)) {
    chapterIndex = "acknowledgements";
  } else if (filename.match(/references/)) {
    chapterIndex = "references";
  } else if (filename.match(/see/)) {
    chapterIndex = "see";
  } else if (filename.match(/indexpreface/)) {
    chapterIndex = "index";
  } else if (filename.match(/making/)) {
    chapterIndex = "making-of";
  }
  //console.log(chapterNumber);
  return chapterIndex;
};
