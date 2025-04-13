import { Octokit } from "octokit";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

if (
  process.env.GITHUB_OWNER === undefined ||
  process.env.GITHUB_REPO === undefined
) {
  throw Error("Please specify GITHUB_OWNER, GITHUB_REPO to pull EN XML from!");
}

// initialize GitHub API
const octokit = new Octokit();

async function getSource(filePath: string): Promise<string> {
  let toTranslate;

  try {
    const result = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: filePath,
        headers: {
          accept: "application/vnd.github.raw+json"
        }
      }
    );

    toTranslate = result.data;
    const output_dir = path.join(import.meta.dirname, "../../ori");

    // Ensure directory exists
    const dir = path.dirname(path.join(output_dir, filePath));
    fs.mkdirSync(dir, { recursive: true });

    const fullPath = path.resolve(path.join(output_dir, filePath));
    fs.writeFileSync(fullPath, toTranslate);

    console.log(
      `Successfully retrieved ${filePath} from GitHub, retrieval status: ${result.status}`
    );
  } catch (error) {
    console.log(
      `Error retrieving ${filePath} from GitHub.\n    Status: ${error.status}.\n    Rate limit remaining: ${error.response.headers["x-ratelimit-remaining"]}.\n    Message: ${error.response.data.message}`
    );
  }

  return toTranslate as string;
}

async function commitTranslated() {}

export { getSource, commitTranslated };
