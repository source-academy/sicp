import PathGenerator from "./controllers/path.ts";
import translate, { getFileErrors } from "./controllers/translator.ts";
import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { max_trans_num } from "./config.ts";
import { saveSummaryLog } from "./controllers/loggers.ts";
import { setupCleanupHandlers } from "./initializers/processHandler.ts";
import { findAllXmlFiles, needsTranslation } from "./controllers/fileUtilities.ts";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readdir = util.promisify(fs.readdir);
const getDirectories = async (source: fs.PathLike) =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Global variables for tracking translation state
// These need to be accessible by signal handlers
let xmlFiles: string[] = [];
let filesToTranslate: string[] = [];
let successCount = 0;
let failureCount = 0;
let processedCount = 0;
let failures: { file: string; error: any }[] = [];


export default async function translateSingle(path: string, language: string) {
  const fullPath = PathGenerator(path);
  await translate(language, fullPath);
}

(async () => {
  await setupCleanupHandlers(xmlFiles, failures, filesToTranslate.length, failureCount, successCount);

  try {
    const languages: string[] = await getDirectories(
      path.join(__dirname, "ai_files")
    );
    console.dir(languages);

    // Get the absolute path to the xml/en directory using proper path resolution
    const enDirPath = path.resolve(__dirname, "../xml/en");
    let absent: boolean = false;

    if (process.argv[2] === "test") {
      if (process.argv.length !== 5) {
        console.log("syntax: yarn trans test <section> <lang>");
        return;
      }
      try {
        console.log("start translating, may take a while ...");
        const fullPath = PathGenerator(process.argv[3]);
        await translate(process.argv[4], fullPath);
      } catch (e) {
        console.error("test error: ", e);
      }
      return;
    }
    if (
      process.argv[2] === "all" ||
      process.argv.length <= 2 ||
      process.argv[2] === "abs"
    ) {
      if (process.argv[2] === "abs") {
        absent = true;
      }
      // Find all XML files
      console.log(`Scanning directory: ${enDirPath}`);
      filesToTranslate = await findAllXmlFiles(enDirPath);
    } else {
      const [, , ...xmlFiles] = process.argv;
      filesToTranslate = xmlFiles.map(file => path.join(__dirname, "..", file));
    }

    if (filesToTranslate.length === 0) {
      console.log(`No files to translate.`);
      return;
    }
    console.log(`${filesToTranslate.length} files need translation`);

    for (const lang of languages) {
      // Process files in batches to avoid overwhelming the system
      const batchSize: number = max_trans_num;

      // Track all failed translations with their errors
      failures = [];

      for (let i = 0; i < filesToTranslate.length; i += batchSize) {
        const batch = filesToTranslate.slice(i, i + batchSize);
        console.log(
          `Starting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(filesToTranslate.length / batchSize)}`
        );

        // Process each file in the batch, but handle errors individually
        const results = await Promise.allSettled(
          batch.map(async file => {
            if (absent) {
              if (!(await needsTranslation(file, lang))) {
                console.log(
                  `Skipped translation for ${file} to language ${lang} (yarn trans abs)`
                );
                return { file, success: true };
              }
            }
            try {
              console.log(`Starting translation for ${file}`);
              await translate(lang, file);
              return { file, success: true };
            } catch (error) {
              // Return failure with error but don't log yet
              return { file, success: false, error };
            }
          })
        );

        // Count successes and failures
        for (const result of results) {
          processedCount++;

          if (result.status === "fulfilled") {
            if (result.value.success) {
              successCount++;
            } else {
              failures.push({
                file: result.value.file,
                error: result.value.error
              });
              console.error(
                `Translation failed for ${result.value.file}: ${result.value.error}`
              );
            }
          } else {
            // This is for Promise rejections (should be rare with our error handling)
            failures.push({
              file: "Unknown file in batch",
              error: result.reason
            });
            console.error(`Promise rejected for file: ${result.reason}`);
          }
        }

        console.log(
          `Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(filesToTranslate.length / batchSize)}`
        );
        console.log(
          `Progress: ${successCount} successful, ${failureCount} failed, ${processedCount} processed out of ${filesToTranslate.length} files`
        );
      }

      console.log("All translations completed!");
      console.log(
        `Final results: ${successCount} successful, ${failureCount} failed out of ${filesToTranslate.length} files`
      );

      // If there are failures, report them all at the end
      if (failures.length > 0) {
        console.log("\n===== FAILED TRANSLATIONS =====");
        failures.forEach((failure, index) => {
          console.log(`${index + 1}. Failed file: ${failure.file}`);
          console.log(`   Error: ${failure.error}`);
        });
        console.log("==============================\n");
      }

      // Save a detailed summary to a log file
      await saveSummaryLog(xmlFiles, failures, filesToTranslate.length, failureCount, successCount);
    }
  } catch (e) {
    console.error("Error during translation process:", e);
  }
})();
