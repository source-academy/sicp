export const generateChapterIndex = (filename: string) => {
  let chapterIndex = "";
  const chapterMatch = filename.match(/(?<=chapter)\d+/g);
  if (chapterMatch) {
    chapterIndex += chapterMatch[0];
  }
  const sectionMatch = filename.match(/(?<=section)\d+/g);
  if (sectionMatch) {
    chapterIndex += "." + sectionMatch[0];
  }
  const subsectionMatch = filename.match(/(?<=subsection)\d+/g);
  if (subsectionMatch) {
    chapterIndex += "." + subsectionMatch[0];
  }
  const forewordMatch = filename.match(/foreword\d*/g);
  if (forewordMatch) {
    chapterIndex = forewordMatch[0];
  } else {
    const prefacesMatch = filename.match(/prefaces\d*/g);
    if (prefacesMatch) {
      chapterIndex = prefacesMatch[0];
    }
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
