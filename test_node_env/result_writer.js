import { Script } from "vm";
import "sicp";
import { readFileSync, createWriteStream } from "fs";
import { resolve, dirname } from "path";
("use strict");

let writer = createWriteStream("test_node_env/result.txt");
const args = process.argv.slice(2);
const programPath = args[0];
const allowedDir = resolve(dirname(process.argv[1]), "test_node_env");
const resolvedPath = resolve(programPath);
if (!resolvedPath.startsWith(allowedDir)) {
  throw new Error("Invalid program path: must be within test_node_env directory");
}

writer.once("open", function (fd) {
  let s = new Script(readFileSync(resolvedPath));
  let r = s.runInThisContext();
  if (typeof r !== "undefined") {
    writer.write(JSON.stringify(r));
  } else {
    writer.write("undefined");
  }
  writer.end();
});
