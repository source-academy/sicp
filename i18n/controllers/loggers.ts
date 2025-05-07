import OpenAI from "openai";
import path from "path";
import fs from "fs";
import { getFileErrors } from "./translator";
import { translationSummaryPrefix } from "../config";

// Function to save summary log - can be called from signal handlers
export async function saveSummaryLog(
    xmlFiles: string[],
    failures: { file: string; error: any }[],
    translateNum: number,
    failureCount: number,
    successCount: number
) {
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
Files needing translation: ${translateNum}
Successfully translated: ${successCount}
Failed translations: ${failureCount}
Success rate: ${translateNum > 0 ? ((successCount / translateNum) * 100).toFixed(2) : 0}%
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

        const logPath = path.join(
            logDir,
            `${translationSummaryPrefix}-${timestamp}.log`
        );
        fs.writeFileSync(logPath, summaryLog);
        console.log(
            `Summary log saved to logs/translation-summary-${timestamp}.log`
        );
    } catch (logError) {
        console.error("Failed to save log file:", logError);
    }
}
