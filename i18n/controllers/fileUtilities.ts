import path from "path";
import fs from "fs";

export async function needsTranslation(
  enFilePath: string,
  lang: string
): Promise<boolean> {
  const cnFilePath = enFilePath.replace(
    path.sep + "en" + path.sep,
    path.sep + lang + path.sep
  );
  try {
    const cnStats = await fs.promises.stat(cnFilePath);
    if (!cnStats.isFile()) {
      return true;
    }

    const enStats = await fs.promises.stat(enFilePath);
    return enStats.mtime > cnStats.mtime;
  } catch (error) {
    throw error;
  }
}

// Function to recursively find all XML files in a directory
export async function findAllXmlFiles(directory: string): Promise<string[]> {
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
