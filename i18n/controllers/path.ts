export default function PathGenerator(path: string) {
  const pathArray: string[] = path.split(".");
  let gitPath: string = "";
  const gitPathPrefix: string[] = ["chapter", "section", "subsection"];

  let i = 0;
  const len = pathArray.length;

  while (i <= len && i < 3) {
    if (i === len) {
      gitPath += `/${gitPathPrefix[i - 1]}${pathArray[i - 1]}`;
    } else {
      gitPath += `/${gitPathPrefix[i]}${pathArray[i]}`;
    }
    i++;
  }

  return gitPath + ".xml";
}
