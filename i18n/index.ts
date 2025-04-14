import PathGenerator from "./controllers/path.ts";
import translate, { getFileErrors } from "./controllers/recurTranslate.ts";
import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import OpenAI from "openai";
import { permission } from "process";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readdir = util.promisify(fs.readdir);
const getDirectories = async source =>
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

const max_trans_num = Number(process.env.MAX_TRANSLATION_NO) || 5;

// Function to save summary log - can be called from signal handlers
async function saveSummaryLog() {
  try {
    const ai = new OpenAI({
      apiKey: process.env.API_KEY,
      baseURL: process.env.AI_BASEURL
    });

    // list and delete all assistants
    const assistants = await ai.beta.assistants.list({ limit: 100 });
    const failedDel: string[] = [];
    await Promise.all(
      assistants.data.map(async assistant => {
        try {
          await ai.beta.assistants.del(assistant.id);
        } catch (error) {
          failedDel.push(assistant.id);
        }
      })
    ).then(() => console.log("successfully removed all assistants"));

    // list and delete all uploaded files
    const files = await ai.files.list();
    await Promise.all(
      files.data.map(async file => {
        try {
          await ai.files.del(file.id);
        } catch (error) {
          failedDel.push(file.id);
        }
      })
    ).then(() => console.log("successfully deleted all files"));

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let summaryLog = `
Translation Summary (${timestamp})
================================
Total files scanned: ${xmlFiles.length}
Files needing translation: ${filesToTranslate.length}
Successfully translated: ${successCount}
Failed translations: ${failureCount}
Success rate: ${filesToTranslate.length > 0 ? ((successCount / filesToTranslate.length) * 100).toFixed(2) : 0}%
`;

    if (failedDel.length > 0) {
      summaryLog += `\nFailed to remove ${failedDel.length} assistants\n`;
      failedDel.forEach(
        (assistant, index) => (summaryLog += `${index + 1}. ${assistant}\n`)
      );
    }

    // Add failed translations to the log
    if (failures.length > 0) {
      summaryLog += `\nFailed Translations (High-level errors):\n`;
      failures.forEach((failure, index) => {
        summaryLog += `${index + 1}. ${failure.file}\n   Error: ${failure.error}\n\n`;
      });
    }

    // Add detailed errors captured during translation process
    const fileErrors = getFileErrors();
    if (Object.keys(fileErrors).length > 0) {
      failureCount = Object.keys(fileErrors).length;
      summaryLog += `\nDetailed Translation Errors:\n`;
      summaryLog += `============================\n`;

      for (const [filePath, errors] of Object.entries(fileErrors)) {
        summaryLog += `\nFile: ${filePath}\n`;
        errors.forEach((error, index) => {
          summaryLog += `  ${index + 1}. ${error.error}\n`;
          if (error.error) {
            // Format the error object/message for better readability
            const errorStr =
              typeof error.error === "object"
                ? JSON.stringify(error.error, null, 2).substring(0, 500) // Limit very long errors
                : String(error.error);
            summaryLog += `     Details: ${errorStr}\n`;
          }
        });
      }
    }

    const logDir = path.resolve(__dirname, "../logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logPath = path.join(logDir, `translation-summary-${timestamp}.log`);
    fs.writeFileSync(logPath, summaryLog);
    console.log(
      `Summary log saved to logs/translation-summary-${timestamp}.log`
    );
  } catch (logError) {
    console.error("Failed to save log file:", logError);
  }
}

// Register handlers for various termination signals
async function setupCleanupHandlers() {
  // Handle normal exit
  process.on("exit", () => {
    console.log("Process is exiting, saving summary...");
    // Only synchronous operations work in 'exit' handlers
    // We can't await here, as exit handlers must be synchronous
    try {
      // Use synchronous operations for final cleanup if needed
      // Note: This won't actually call the async parts of saveSummaryLog properly
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const summaryContent = `Translation interrupted during exit at ${timestamp}`;
      const logDir = path.resolve(__dirname, "../logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(logDir, `emergency-log-${timestamp}.log`),
        summaryContent
      );
    } catch (error) {
      console.error("Failed to save emergency log during exit:", error);
    }
  });

  // Handle Ctrl+C
  process.on("SIGINT", async () => {
    console.log("\nReceived SIGINT (Ctrl+C). Saving summary before exit...");
    await saveSummaryLog();
    process.exit(1);
  });

  // Handle SIGTERM (kill command)
  process.on("SIGTERM", async () => {
    console.log("\nReceived SIGTERM. Saving summary before exit...");
    await saveSummaryLog();
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", async error => {
    console.error("\nUncaught exception:", error);
    console.log("Saving summary before exit...");
    await saveSummaryLog();
    process.exit(1);
  });
}

// Function to recursively find all XML files in a directory
async function findAllXmlFiles(directory: string): Promise<string[]> {
  const files = await fs.promises.readdir(directory);
  const xmlFiles: string[] = [];

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = await fs.promises.stat(fullPath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      const subDirFiles = await findAllXmlFiles(fullPath);
      xmlFiles.push(...subDirFiles);
    } else if (path.extname(file).toLowerCase() === ".xml") {
      // Add XML files to the list
      xmlFiles.push(fullPath);
    }
  }

  return xmlFiles;
}

// Function to check if a file needs translation
async function needsTranslation(enFilePath: string, lang: string): Promise<boolean> {
  // Generate the corresponding cn file path
  const cnFilePath = enFilePath.replace(
    path.sep + "en" + path.sep,
    path.sep + lang + path.sep
  );

  try {
    // Check if CN file exists
    const cnStats = await fs.promises.stat(cnFilePath);
    if (!cnStats.isFile()) {
      return true; // CN path exists but is not a file (unusual case)
    }

    // Compare modification times
    const enStats = await fs.promises.stat(enFilePath);
    return enStats.mtime > cnStats.mtime; // Return true if EN file is newer
  } catch (error) {
    // If we get an error, it's likely because the CN file doesn't exist
    return true; // Need to translate since CN file doesn't exist
  }
}

export default async function fancyName(path: string, language: string) {
  const fullPath = PathGenerator(path);
  await translate(language, fullPath);
}

// use "all" to translate every xml
// or use a list to specify what needs to be translated
(async () => {
  await setupCleanupHandlers();

  try {
    if ((process.argv[2], process.argv[3])) {
      fancyName(process.argv[2], process.argv[3]);
      return;
    }

    let languages: string[] = [];

    if (process.argv[2] === "all") {
      languages = await getDirectories(path.join(__dirname, "../xml"));
      console.dir(languages);
    } else {
      languages.push(process.argv[2]);
    }

    // Get the absolute path to the xml/en directory using proper path resolution
    const enDirPath = path.resolve(__dirname, "../xml/en");

    console.log(`Scanning directory: ${enDirPath}`);

    // Find all XML files
    if (process.argv[2] == "all") {
      xmlFiles = await findAllXmlFiles(enDirPath);
    }

    console.log(`Found ${xmlFiles.length} XML files to check for translation`);
   
    for (const lang of languages) {
    // Filter files that need translation
    filesToTranslate = [];
    for (const file of xmlFiles) {
      if (await needsTranslation(file, lang)) {
        filesToTranslate.push(file as never);
      }
    }

    console.log(`${filesToTranslate.length} files need translation`);

    if (filesToTranslate.length === 0) {
      console.log(`No files need translation for ${lang}.`);
      return;
    }

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
            failureCount++;
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
          failureCount++;
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
    await saveSummaryLog();
  }
  } catch (e) {
    console.error("Error during translation process:", e);
  }
})();
