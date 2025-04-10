import { getSource } from "./controllers/gitComm.ts";
import PathGenerator from "./controllers/path.ts";
import translate from "./controllers/recurTranslate.ts";

export default async function fancyName(path: string) {

  const fullPath = PathGenerator(path);
  await translate("Chinese", fullPath);
}

(async () => {
  try {
    await Promise.all([
      // fancyName("2"),
      // fancyName("1.1"),
      fancyName("1.1.2"),
      // fancyName("1.1.3"),
      // fancyName("1.1.4"),
      // fancyName("1.1.5"),
      // fancyName("1.1.6"),
      // fancyName("1.1.7"),
      // fancyName("1.1.8"),
      // translate("Chinese", "1"),
    ]);
  } catch (e) {
    console.error(e);
  }
})();
