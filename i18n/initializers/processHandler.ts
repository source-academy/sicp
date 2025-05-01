import path from "path";
import { saveSummaryLog } from "../controllers/loggers";
import fs from "fs";

export async function setupCleanupHandlers(
    xmlFiles: string[],
    failures: { file: string; error: any }[],
    translateNum: number,
    failureCount: number,
    successCount: number) {
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
        await saveSummaryLog(xmlFiles, failures, translateNum, failureCount, successCount);
        process.exit(1);
    });

    // Handle SIGTERM (kill command)
    process.on("SIGTERM", async () => {
        console.log("\nReceived SIGTERM. Saving summary before exit...");
        await saveSummaryLog(xmlFiles, failures, translateNum, failureCount, successCount);
        process.exit(1);
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", async error => {
        console.error("\nUncaught exception:", error);
        console.log("Saving summary before exit...");
        await saveSummaryLog(xmlFiles, failures, translateNum, failureCount, successCount);
        process.exit(1);
    });
}