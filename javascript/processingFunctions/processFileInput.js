export const processFileInput = (trimedValue, writeTo) => {
  const len = trimedValue.length;
  const front = trimedValue.substring(1, 4);
  let pathStr = "chapter";
  if (front == "sec") {
    const path = trimedValue.substring(8, len - 1).split(".");
    const fileName = "section" + path[1];
    pathStr += path[0] + "/" + fileName + "/" + fileName + ".tex";
  } else {
    const path = trimedValue.substring(11, len - 1).split(".");
    pathStr +=
      path[0] + "/section" + path[1] + "/subsection" + path[2] + ".tex";
  }
  writeTo.push("\\input{" + pathStr + "}\n");
};

export default processFileInput;
