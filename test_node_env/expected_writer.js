import { Script } from "vm";
import { createWriteStream } from "fs";

let writer = createWriteStream("test_node_env/expect.txt");
const args = process.argv.slice(2);
const expected = args[0];

writer.once("open", function (fd) {
  let e = new Script(expected);
  let r = e.runInNewContext();
  if (typeof r !== "undefined") {
    writer.write(JSON.stringify(r));
  } else {
    writer.write("undefined");
  }
  writer.end();
});
