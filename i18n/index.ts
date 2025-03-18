import { getSource } from "./controllers/gitComm.ts";
import PathGenerator from "./controllers/path.ts";
import translate from "./controllers/recurTranslate.ts";

export default async function fancyName(path: string) {
  const startTime = new Date().getTime();

  const fullPath = PathGenerator(path);
  console.log("Translating: " + fullPath);
  await translate("Chinese", fullPath);

  const elapsed = new Date().getTime() - startTime;
  console.log(fullPath + " took " + elapsed / 1000.0 + " seconds");
}



await Promise.all([
  fancyName("2")
  // fancyName("1.1"),
  // fancyName("1.1.2"),
  // fancyName("1.1.3"),
  // fancyName("1.1.4"),
  // fancyName("1.1.5"),
  // fancyName("1.1.6"),
  // fancyName("1.1.7"),
  // fancyName("1.1.8"),
  // translate("Chinese", "1"),
]);
